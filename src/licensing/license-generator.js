/**
 * license-generator.js
 * Server-side license generation utility
 *
 * Usage:
 *   node license-generator.js --customer "Acme Corp" --seats 100 --type enterprise
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

class LicenseGenerator {
    constructor(privateKeyPath) {
        this.privateKey = null;
        this.publicKey = null;

        if (privateKeyPath) {
            this.loadKeys(privateKeyPath);
        }
    }

    /**
     * Load RSA key pair
     * @param {string} privateKeyPath - Path to private key file
     */
    loadKeys(privateKeyPath) {
        try {
            this.privateKey = fs.readFileSync(privateKeyPath, 'utf8');

            // Try to load corresponding public key
            const publicKeyPath = privateKeyPath.replace('private', 'public');
            if (fs.existsSync(publicKeyPath)) {
                this.publicKey = fs.readFileSync(publicKeyPath, 'utf8');
            }

            console.log('✓ Loaded RSA keys');
        } catch (error) {
            console.error('Failed to load keys:', error.message);
        }
    }

    /**
     * Generate RSA key pair
     * @returns {object} Key pair
     */
    static generateKeyPair() {
        const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
            modulusLength: 2048,
            publicKeyEncoding: {
                type: 'spki',
                format: 'pem'
            },
            privateKeyEncoding: {
                type: 'pkcs8',
                format: 'pem'
            }
        });

        return { publicKey, privateKey };
    }

    /**
     * Generate license
     * @param {object} options - License options
     * @returns {string} Encoded license key
     */
    generateLicense(options) {
        if (!this.privateKey) {
            throw new Error('Private key not loaded');
        }

        // Create license object
        const license = {
            licenseId: options.licenseId || this.generateLicenseId(),
            customerId: options.customerId || this.generateCustomerId(),
            customerName: options.customerName,
            type: options.type || 'standard',
            seats: options.seats || 10,
            features: options.features || this.getDefaultFeatures(options.type),
            activatedAt: options.activatedAt || new Date().toISOString(),
            expiresAt: options.expiresAt || this.calculateExpiry(options.type, options.duration),
            metadata: options.metadata || {}
        };

        // Validate license
        this.validateLicenseData(license);

        // Serialize license
        const licenseJson = JSON.stringify(license, null, 0);

        // Sign license
        const signature = this.signLicense(licenseJson);

        // Encode: BASE64(JSON).BASE64(SIGNATURE)
        const encodedLicense = Buffer.from(licenseJson).toString('base64');
        const encodedSignature = signature.toString('base64');

        return `${encodedLicense}.${encodedSignature}`;
    }

    /**
     * Sign license with private key
     * @param {string} licenseJson - License JSON string
     * @returns {Buffer} Signature
     */
    signLicense(licenseJson) {
        const sign = crypto.createSign('SHA256');
        sign.update(licenseJson);
        sign.end();

        return sign.sign(this.privateKey);
    }

    /**
     * Verify license signature
     * @param {string} encodedLicense - Encoded license key
     * @returns {boolean} Verification result
     */
    verifyLicense(encodedLicense) {
        if (!this.publicKey) {
            throw new Error('Public key not loaded');
        }

        try {
            const [encodedData, encodedSignature] = encodedLicense.split('.');

            const licenseJson = Buffer.from(encodedData, 'base64').toString('utf8');
            const signature = Buffer.from(encodedSignature, 'base64');

            const verify = crypto.createVerify('SHA256');
            verify.update(licenseJson);
            verify.end();

            return verify.verify(this.publicKey, signature);
        } catch (error) {
            console.error('Verification error:', error);
            return false;
        }
    }

    /**
     * Decode license (without verification)
     * @param {string} encodedLicense - Encoded license key
     * @returns {object} License data
     */
    decodeLicense(encodedLicense) {
        const [encodedData] = encodedLicense.split('.');
        const licenseJson = Buffer.from(encodedData, 'base64').toString('utf8');
        return JSON.parse(licenseJson);
    }

    /**
     * Generate unique license ID
     * @returns {string} License ID
     */
    generateLicenseId() {
        return `lic_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    }

    /**
     * Generate unique customer ID
     * @returns {string} Customer ID
     */
    generateCustomerId() {
        return `cust_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    }

    /**
     * Get default features for license type
     * @param {string} type - License type
     * @returns {Array} Features
     */
    getDefaultFeatures(type) {
        const featureSets = {
            trial: ['basic_visualization'],
            standard: ['basic_visualization', 'export'],
            professional: ['basic_visualization', 'advanced_visualization', 'export', 'collaboration'],
            enterprise: [
                'basic_visualization',
                'advanced_visualization',
                'export',
                'collaboration',
                'offline_mode',
                'sso_integration',
                'usage_analytics',
                'api_access',
                'custom_branding',
                'priority_support'
            ]
        };

        return featureSets[type] || featureSets.standard;
    }

    /**
     * Calculate license expiry date
     * @param {string} type - License type
     * @param {number} durationDays - Duration in days (optional)
     * @returns {string} ISO date string
     */
    calculateExpiry(type, durationDays) {
        const durations = {
            trial: 30,
            standard: 365,
            professional: 365,
            enterprise: 365
        };

        const days = durationDays || durations[type] || 365;
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + days);

        return expiry.toISOString();
    }

    /**
     * Validate license data
     * @param {object} license - License object
     * @throws {Error} If validation fails
     */
    validateLicenseData(license) {
        const required = ['licenseId', 'customerId', 'customerName', 'type', 'seats'];

        for (const field of required) {
            if (!license[field]) {
                throw new Error(`Missing required field: ${field}`);
            }
        }

        if (typeof license.seats !== 'number' || license.seats < 1) {
            throw new Error('Seats must be a positive number');
        }

        const validTypes = ['trial', 'standard', 'professional', 'enterprise'];
        if (!validTypes.includes(license.type)) {
            throw new Error(`Invalid license type: ${license.type}`);
        }
    }

    /**
     * Pretty print license
     * @param {object} license - License object
     */
    static printLicense(license) {
        console.log('\n╔════════════════════════════════════════════════════════════╗');
        console.log('║                    LICENSE INFORMATION                     ║');
        console.log('╠════════════════════════════════════════════════════════════╣');
        console.log(`║ License ID:    ${license.licenseId.padEnd(42)} ║`);
        console.log(`║ Customer ID:   ${license.customerId.padEnd(42)} ║`);
        console.log(`║ Customer:      ${license.customerName.padEnd(42)} ║`);
        console.log(`║ Type:          ${license.type.toUpperCase().padEnd(42)} ║`);
        console.log(`║ Seats:         ${String(license.seats).padEnd(42)} ║`);
        console.log(`║ Activated:     ${license.activatedAt.substring(0, 10).padEnd(42)} ║`);
        console.log(`║ Expires:       ${license.expiresAt.substring(0, 10).padEnd(42)} ║`);
        console.log('╠════════════════════════════════════════════════════════════╣');
        console.log('║ Features:                                                  ║');
        license.features.forEach(feature => {
            console.log(`║   • ${feature.padEnd(53)} ║`);
        });
        console.log('╚════════════════════════════════════════════════════════════╝\n');
    }

    /**
     * Save license to file
     * @param {string} encodedLicense - Encoded license
     * @param {string} filename - Output filename
     */
    static saveLicense(encodedLicense, filename) {
        const license = this.prototype.decodeLicense.call({ decodeLicense: LicenseGenerator.prototype.decodeLicense }, encodedLicense);

        const output = {
            license: encodedLicense,
            decoded: license,
            generatedAt: new Date().toISOString()
        };

        fs.writeFileSync(filename, JSON.stringify(output, null, 2));
        console.log(`✓ License saved to ${filename}`);
    }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
    const args = process.argv.slice(2);

    // Parse arguments
    const options = {};
    for (let i = 0; i < args.length; i += 2) {
        const key = args[i].replace(/^--/, '');
        const value = args[i + 1];
        options[key] = value;
    }

    // Check for key generation
    if (options.generateKeys) {
        console.log('Generating RSA key pair...');
        const { publicKey, privateKey } = LicenseGenerator.generateKeyPair();

        fs.writeFileSync('private.pem', privateKey);
        fs.writeFileSync('public.pem', publicKey);

        console.log('✓ Generated private.pem and public.pem');
        process.exit(0);
    }

    // Check for required options
    if (!options.customer) {
        console.error(`
Usage:
  Generate keys:
    node license-generator.js --generateKeys true

  Generate license:
    node license-generator.js --customer "Company Name" --seats 100 --type enterprise [options]

Options:
  --customer        Customer name (required)
  --seats           Number of seats (default: 10)
  --type            License type: trial|standard|professional|enterprise (default: standard)
  --duration        Duration in days (optional, uses type default)
  --privateKey      Path to private key file (default: private.pem)
  --output          Output filename (default: license.json)
  --verify          Verify generated license (default: true)

Examples:
  node license-generator.js --customer "Acme Corp" --seats 100 --type enterprise
  node license-generator.js --customer "Startup Inc" --seats 5 --type standard --duration 90
        `);
        process.exit(1);
    }

    try {
        // Initialize generator
        const privateKeyPath = options.privateKey || 'private.pem';
        const generator = new LicenseGenerator(privateKeyPath);

        // Generate license
        const licenseOptions = {
            customerName: options.customer,
            type: options.type || 'standard',
            seats: parseInt(options.seats) || 10,
            duration: options.duration ? parseInt(options.duration) : undefined
        };

        console.log('Generating license...');
        const encodedLicense = generator.generateLicense(licenseOptions);
        const license = generator.decodeLicense(encodedLicense);

        // Print license
        LicenseGenerator.printLicense(license);

        // Verify if requested
        if (options.verify !== 'false') {
            console.log('Verifying signature...');
            const valid = generator.verifyLicense(encodedLicense);
            console.log(valid ? '✓ Signature valid' : '✗ Signature invalid');
        }

        // Save to file
        const outputFile = options.output || 'license.json';
        LicenseGenerator.saveLicense(encodedLicense, outputFile);

        console.log('\nLicense Key:');
        console.log(encodedLicense);
        console.log('\nCopy this key to use in your application.');

    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

export default LicenseGenerator;
