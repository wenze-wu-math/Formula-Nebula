/**
 * SSOIntegration.js
 * Single Sign-On and SAML 2.0 integration
 *
 * Features:
 * - SAML 2.0 authentication flow
 * - OAuth 2.0 / OpenID Connect support
 * - JWT token management
 * - Role-based access control (RBAC)
 * - Multi-tenant support
 */

export class SSOIntegration {
    constructor(config = {}) {
        this.config = {
            samlEndpoint: config.samlEndpoint || '/api/auth/saml',
            oauthEndpoint: config.oauthEndpoint || '/api/auth/oauth',
            tokenEndpoint: config.tokenEndpoint || '/api/auth/token',
            logoutEndpoint: config.logoutEndpoint || '/api/auth/logout',
            redirectUri: config.redirectUri || window.location.origin + '/auth/callback',
            clientId: config.clientId || null,
            tokenRefreshInterval: config.tokenRefreshInterval || 300000, // 5 minutes
            ...config
        };

        this.currentUser = null;
        this.accessToken = null;
        this.refreshToken = null;
        this.tokenExpiry = null;
        this.refreshTimer = null;

        this.loadStoredSession();
    }

    /**
     * Initialize SAML SSO flow
     * @param {string} tenantId - Tenant identifier
     * @returns {Promise<void>}
     */
    async initiateSAMLLogin(tenantId) {
        try {
            // Request SAML redirect URL from backend
            const response = await fetch(this.config.samlEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    tenantId,
                    redirectUri: this.config.redirectUri,
                    timestamp: new Date().toISOString()
                })
            });

            if (!response.ok) {
                throw new Error(`SAML initiation failed: ${response.statusText}`);
            }

            const data = await response.json();

            // Store state for callback verification
            sessionStorage.setItem('fn_sso_state', JSON.stringify({
                state: data.state,
                tenantId,
                initiatedAt: new Date().toISOString()
            }));

            // Redirect to IdP
            window.location.href = data.redirectUrl;
        } catch (error) {
            console.error('SAML login error:', error);
            throw error;
        }
    }

    /**
     * Handle SAML callback
     * @param {string} samlResponse - SAML response from IdP
     * @param {string} relayState - Relay state parameter
     * @returns {Promise<object>} Authentication result
     */
    async handleSAMLCallback(samlResponse, relayState) {
        try {
            // Verify state
            const storedState = JSON.parse(sessionStorage.getItem('fn_sso_state') || '{}');
            if (storedState.state !== relayState) {
                throw new Error('Invalid relay state');
            }

            // Validate SAML response with backend
            const response = await fetch(`${this.config.samlEndpoint}/callback`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    samlResponse,
                    relayState
                })
            });

            if (!response.ok) {
                throw new Error(`SAML validation failed: ${response.statusText}`);
            }

            const authResult = await response.json();

            // Store authentication tokens
            await this.storeAuthResult(authResult);

            // Clear SSO state
            sessionStorage.removeItem('fn_sso_state');

            return authResult;
        } catch (error) {
            console.error('SAML callback error:', error);
            throw error;
        }
    }

    /**
     * Initialize OAuth 2.0 / OpenID Connect flow
     * @param {string} provider - OAuth provider (google, azure, okta, etc.)
     * @returns {Promise<void>}
     */
    async initiateOAuthLogin(provider) {
        try {
            // Generate state and nonce for CSRF protection
            const state = this.generateRandomString(32);
            const nonce = this.generateRandomString(32);

            // Store state for callback verification
            sessionStorage.setItem('fn_oauth_state', JSON.stringify({
                state,
                nonce,
                provider,
                initiatedAt: new Date().toISOString()
            }));

            // Build authorization URL
            const authUrl = this.buildOAuthUrl(provider, state, nonce);

            // Redirect to OAuth provider
            window.location.href = authUrl;
        } catch (error) {
            console.error('OAuth login error:', error);
            throw error;
        }
    }

    /**
     * Build OAuth authorization URL
     * @param {string} provider - OAuth provider
     * @param {string} state - CSRF token
     * @param {string} nonce - OIDC nonce
     * @returns {string} Authorization URL
     */
    buildOAuthUrl(provider, state, nonce) {
        const params = new URLSearchParams({
            client_id: this.config.clientId,
            redirect_uri: this.config.redirectUri,
            response_type: 'code',
            scope: 'openid profile email',
            state,
            nonce
        });

        return `${this.config.oauthEndpoint}/${provider}?${params.toString()}`;
    }

    /**
     * Handle OAuth callback
     * @param {string} code - Authorization code
     * @param {string} state - State parameter
     * @returns {Promise<object>} Authentication result
     */
    async handleOAuthCallback(code, state) {
        try {
            // Verify state
            const storedState = JSON.parse(sessionStorage.getItem('fn_oauth_state') || '{}');
            if (storedState.state !== state) {
                throw new Error('Invalid OAuth state');
            }

            // Exchange code for tokens
            const response = await fetch(this.config.tokenEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    code,
                    redirectUri: this.config.redirectUri,
                    provider: storedState.provider
                })
            });

            if (!response.ok) {
                throw new Error(`Token exchange failed: ${response.statusText}`);
            }

            const authResult = await response.json();

            // Store authentication tokens
            await this.storeAuthResult(authResult);

            // Clear OAuth state
            sessionStorage.removeItem('fn_oauth_state');

            return authResult;
        } catch (error) {
            console.error('OAuth callback error:', error);
            throw error;
        }
    }

    /**
     * Store authentication result
     * @param {object} authResult - Authentication result
     */
    async storeAuthResult(authResult) {
        this.accessToken = authResult.accessToken;
        this.refreshToken = authResult.refreshToken;
        this.tokenExpiry = new Date(authResult.expiresAt);
        this.currentUser = authResult.user;

        // Store in sessionStorage
        sessionStorage.setItem('fn_access_token', this.accessToken);
        sessionStorage.setItem('fn_refresh_token', this.refreshToken);
        sessionStorage.setItem('fn_token_expiry', this.tokenExpiry.toISOString());
        sessionStorage.setItem('fn_user', JSON.stringify(this.currentUser));

        // Start token refresh timer
        this.startTokenRefresh();
    }

    /**
     * Start automatic token refresh
     */
    startTokenRefresh() {
        this.stopTokenRefresh();

        this.refreshTimer = setInterval(async () => {
            if (this.shouldRefreshToken()) {
                await this.refreshAccessToken();
            }
        }, this.config.tokenRefreshInterval);
    }

    /**
     * Stop token refresh timer
     */
    stopTokenRefresh() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
            this.refreshTimer = null;
        }
    }

    /**
     * Check if token should be refreshed
     * @returns {boolean} Whether refresh is needed
     */
    shouldRefreshToken() {
        if (!this.tokenExpiry) return false;

        // Refresh if token expires in less than 5 minutes
        const fiveMinutes = 5 * 60 * 1000;
        return this.tokenExpiry.getTime() - Date.now() < fiveMinutes;
    }

    /**
     * Refresh access token
     * @returns {Promise<void>}
     */
    async refreshAccessToken() {
        if (!this.refreshToken) {
            throw new Error('No refresh token available');
        }

        try {
            const response = await fetch(`${this.config.tokenEndpoint}/refresh`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    refreshToken: this.refreshToken
                })
            });

            if (!response.ok) {
                throw new Error(`Token refresh failed: ${response.statusText}`);
            }

            const result = await response.json();
            await this.storeAuthResult(result);

            console.log('Access token refreshed successfully');
        } catch (error) {
            console.error('Token refresh error:', error);
            // If refresh fails, logout user
            await this.logout();
            throw error;
        }
    }

    /**
     * Get current access token
     * @returns {string|null} Access token
     */
    getAccessToken() {
        return this.accessToken;
    }

    /**
     * Get current user
     * @returns {object|null} User object
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * Check if user is authenticated
     * @returns {boolean} Authentication status
     */
    isAuthenticated() {
        return !!(this.accessToken && this.tokenExpiry && this.tokenExpiry > new Date());
    }

    /**
     * Check if user has role
     * @param {string} role - Role to check
     * @returns {boolean} Whether user has role
     */
    hasRole(role) {
        if (!this.currentUser || !this.currentUser.roles) {
            return false;
        }

        return this.currentUser.roles.includes(role);
    }

    /**
     * Check if user has permission
     * @param {string} permission - Permission to check
     * @returns {boolean} Whether user has permission
     */
    hasPermission(permission) {
        if (!this.currentUser || !this.currentUser.permissions) {
            return false;
        }

        return this.currentUser.permissions.includes(permission);
    }

    /**
     * Logout user
     * @returns {Promise<void>}
     */
    async logout() {
        try {
            // Call logout endpoint
            if (this.accessToken) {
                await fetch(this.config.logoutEndpoint, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`
                    }
                });
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Clear local state
            this.clearSession();
        }
    }

    /**
     * Clear session data
     */
    clearSession() {
        this.currentUser = null;
        this.accessToken = null;
        this.refreshToken = null;
        this.tokenExpiry = null;

        this.stopTokenRefresh();

        sessionStorage.removeItem('fn_access_token');
        sessionStorage.removeItem('fn_refresh_token');
        sessionStorage.removeItem('fn_token_expiry');
        sessionStorage.removeItem('fn_user');
    }

    /**
     * Load stored session
     */
    loadStoredSession() {
        try {
            this.accessToken = sessionStorage.getItem('fn_access_token');
            this.refreshToken = sessionStorage.getItem('fn_refresh_token');

            const expiryStr = sessionStorage.getItem('fn_token_expiry');
            if (expiryStr) {
                this.tokenExpiry = new Date(expiryStr);
            }

            const userStr = sessionStorage.getItem('fn_user');
            if (userStr) {
                this.currentUser = JSON.parse(userStr);
            }

            // Start refresh if session is valid
            if (this.isAuthenticated()) {
                this.startTokenRefresh();
            } else {
                this.clearSession();
            }
        } catch (error) {
            console.error('Failed to load stored session:', error);
            this.clearSession();
        }
    }

    /**
     * Generate random string
     * @param {number} length - String length
     * @returns {string} Random string
     */
    generateRandomString(length) {
        const array = new Uint8Array(length);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    /**
     * Destroy SSO integration
     */
    destroy() {
        this.stopTokenRefresh();
        this.clearSession();
    }
}

// Singleton instance
export const ssoManager = new SSOIntegration();
