/**
 * Billing Portal Frontend
 *
 * Self-service billing management for Formula Nebula users
 */

// Configuration
const API_BASE = '/api';
const STRIPE_PUBLISHABLE_KEY = 'pk_test_your_key_here'; // Replace with actual key

// State
let currentUser = null;
let currentSubscription = null;
let paymentMethods = [];
let invoices = [];

/**
 * Initialize the billing portal
 */
async function initPortal() {
  // Setup tab switching
  setupTabs();

  // Load user data
  await loadUserData();

  // Load subscription data
  await loadSubscriptionData();

  // Load invoices
  await loadInvoices();

  // Load payment methods
  await loadPaymentMethods();
}

/**
 * Setup tab switching
 */
function setupTabs() {
  const tabs = document.querySelectorAll('.tab');
  const tabContents = document.querySelectorAll('.tab-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabName = tab.dataset.tab;

      // Remove active class from all tabs and contents
      tabs.forEach(t => t.classList.remove('active'));
      tabContents.forEach(tc => tc.classList.remove('active'));

      // Add active class to clicked tab and corresponding content
      tab.classList.add('active');
      document.getElementById(tabName).classList.add('active');
    });
  });
}

/**
 * Load user data
 */
async function loadUserData() {
  try {
    const response = await fetch(`${API_BASE}/user/me`);
    if (!response.ok) throw new Error('Failed to load user data');

    currentUser = await response.json();
  } catch (error) {
    console.error('Error loading user data:', error);
    showError('Failed to load user information');
  }
}

/**
 * Load subscription data
 */
async function loadSubscriptionData() {
  try {
    const response = await fetch(`${API_BASE}/billing/subscription`);
    if (!response.ok) throw new Error('Failed to load subscription');

    const data = await response.json();
    currentSubscription = data.subscription;

    // Update UI
    updateSubscriptionUI();
    renderPlans();
  } catch (error) {
    console.error('Error loading subscription:', error);
    showError('Failed to load subscription data');
  }
}

/**
 * Update subscription UI
 */
function updateSubscriptionUI() {
  if (!currentSubscription) {
    document.getElementById('current-plan-name').textContent = 'Free Plan';
    document.getElementById('current-plan-price').textContent = '$0.00/month';
    document.getElementById('plan-status').textContent = 'Active';
    document.getElementById('plan-status').className = 'badge badge-success';
    document.getElementById('next-billing-date').textContent = 'N/A';
    document.getElementById('current-period').textContent = 'N/A';
    return;
  }

  const { plan, status, currentPeriodEnd, currentPeriodStart, cancelAtPeriodEnd } = currentSubscription;

  document.getElementById('current-plan-name').textContent = plan.name;
  document.getElementById('current-plan-price').textContent = `$${plan.price}/month`;

  // Update status badge
  const statusBadge = document.getElementById('plan-status');
  if (cancelAtPeriodEnd) {
    statusBadge.textContent = 'Cancelling';
    statusBadge.className = 'badge badge-warning';
  } else if (status === 'active') {
    statusBadge.textContent = 'Active';
    statusBadge.className = 'badge badge-success';
  } else if (status === 'past_due') {
    statusBadge.textContent = 'Past Due';
    statusBadge.className = 'badge badge-danger';
  } else {
    statusBadge.textContent = status;
    statusBadge.className = 'badge badge-info';
  }

  document.getElementById('next-billing-date').textContent = new Date(currentPeriodEnd).toLocaleDateString();
  document.getElementById('current-period').textContent =
    `${new Date(currentPeriodStart).toLocaleDateString()} - ${new Date(currentPeriodEnd).toLocaleDateString()}`;
}

/**
 * Render available plans
 */
function renderPlans() {
  const plansGrid = document.getElementById('plans-grid');

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      interval: 'forever',
      features: [
        'Basic graph visualization',
        'Up to 100 nodes',
        'Community support'
      ]
    },
    {
      id: 'basic',
      name: 'Basic',
      price: 9.99,
      interval: 'month',
      features: [
        'Unlimited nodes',
        'Export capabilities',
        'Email support'
      ]
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 29.99,
      interval: 'month',
      features: [
        'All Basic features',
        'Real-time collaboration',
        'Advanced analytics',
        'Priority support',
        'Custom branding'
      ]
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 99.99,
      interval: 'month',
      features: [
        'All Pro features',
        'Unlimited collaborators',
        'SSO integration',
        'Dedicated support',
        'Custom integrations',
        'SLA guarantee'
      ]
    }
  ];

  plansGrid.innerHTML = plans.map(plan => {
    const isCurrent = currentSubscription && currentSubscription.plan.id === plan.id;
    const isDowngrade = currentSubscription && plan.price < currentSubscription.plan.price;

    return `
      <div class="plan-card ${isCurrent ? 'current' : ''}" onclick="selectPlan('${plan.id}', ${plan.price})">
        <div class="plan-name">${plan.name}</div>
        <div class="plan-price">$${plan.price}</div>
        <div class="plan-interval">per ${plan.interval}</div>
        <ul class="plan-features">
          ${plan.features.map(feature => `<li>${feature}</li>`).join('')}
        </ul>
        ${isCurrent
          ? '<button class="btn btn-secondary" disabled>Current Plan</button>'
          : isDowngrade
            ? `<button class="btn btn-secondary">Downgrade</button>`
            : `<button class="btn btn-primary">${currentSubscription ? 'Upgrade' : 'Select Plan'}</button>`
        }
      </div>
    `;
  }).join('');
}

/**
 * Select a plan
 */
async function selectPlan(planId, price) {
  if (!currentUser) {
    showError('Please log in to select a plan');
    return;
  }

  // If free plan, cancel current subscription
  if (planId === 'free') {
    const confirmed = confirm('Downgrade to free plan? Your subscription will be cancelled.');
    if (confirmed) {
      await cancelSubscription(false);
    }
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/billing/subscription/change`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId })
    });

    if (!response.ok) throw new Error('Failed to change plan');

    const data = await response.json();

    if (data.success) {
      showSuccess('Plan changed successfully!');
      await loadSubscriptionData();
    }
  } catch (error) {
    console.error('Error changing plan:', error);
    showError('Failed to change plan');
  }
}

/**
 * Load invoices
 */
async function loadInvoices() {
  try {
    const response = await fetch(`${API_BASE}/billing/invoices`);
    if (!response.ok) throw new Error('Failed to load invoices');

    const data = await response.json();
    invoices = data.invoices;

    renderInvoices();
  } catch (error) {
    console.error('Error loading invoices:', error);
    document.getElementById('invoices-list').innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; color: #dc3545;">
          Failed to load invoices
        </td>
      </tr>
    `;
  }
}

/**
 * Render invoices table
 */
function renderInvoices() {
  const invoicesList = document.getElementById('invoices-list');

  if (invoices.length === 0) {
    invoicesList.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; color: #666;">
          No invoices yet
        </td>
      </tr>
    `;
    return;
  }

  invoicesList.innerHTML = invoices.map(invoice => {
    const statusClass = invoice.status === 'paid' ? 'badge-success'
      : invoice.status === 'open' ? 'badge-warning'
      : 'badge-info';

    return `
      <tr>
        <td><strong>${invoice.number}</strong></td>
        <td>${new Date(invoice.date).toLocaleDateString()}</td>
        <td>$${invoice.total.toFixed(2)} ${invoice.currency}</td>
        <td><span class="badge ${statusClass}">${invoice.status}</span></td>
        <td>
          <a href="${invoice.pdfUrl}" target="_blank" style="color: #667eea; text-decoration: none;">
            Download PDF
          </a>
        </td>
      </tr>
    `;
  }).join('');
}

/**
 * Load payment methods
 */
async function loadPaymentMethods() {
  try {
    const response = await fetch(`${API_BASE}/billing/payment-methods`);
    if (!response.ok) throw new Error('Failed to load payment methods');

    const data = await response.json();
    paymentMethods = data.paymentMethods;

    renderPaymentMethods();
  } catch (error) {
    console.error('Error loading payment methods:', error);
    document.getElementById('payment-methods-list').innerHTML = `
      <div style="text-align: center; color: #dc3545;">
        Failed to load payment methods
      </div>
    `;
  }
}

/**
 * Render payment methods
 */
function renderPaymentMethods() {
  const methodsList = document.getElementById('payment-methods-list');

  if (paymentMethods.length === 0) {
    methodsList.innerHTML = `
      <div style="text-align: center; color: #666; padding: 40px;">
        No payment methods on file
      </div>
    `;
    return;
  }

  methodsList.innerHTML = paymentMethods.map(method => {
    const isDefault = method.isDefault;

    return `
      <div class="payment-method-card">
        <div class="payment-method-info">
          <div class="card-icon">💳</div>
          <div>
            <div style="font-weight: 600;">${method.brand} •••• ${method.last4}</div>
            <div style="color: #666; font-size: 14px;">
              Expires ${method.expMonth}/${method.expYear}
              ${isDefault ? '<span class="badge badge-info" style="margin-left: 8px;">Default</span>' : ''}
            </div>
          </div>
        </div>
        <div>
          ${!isDefault ? `<button class="btn btn-secondary" onclick="setDefaultPaymentMethod('${method.id}')">Set as Default</button>` : ''}
          <button class="btn btn-danger" onclick="removePaymentMethod('${method.id}')">Remove</button>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Add payment method
 */
async function addPaymentMethod() {
  // In production, use Stripe Elements to collect payment details securely
  alert('Redirect to Stripe payment method collection form');

  // Example implementation:
  /*
  const stripe = Stripe(STRIPE_PUBLISHABLE_KEY);
  const elements = stripe.elements();
  const cardElement = elements.create('card');
  cardElement.mount('#card-element');

  const {error, paymentMethod} = await stripe.createPaymentMethod({
    type: 'card',
    card: cardElement,
  });

  if (error) {
    showError(error.message);
  } else {
    const response = await fetch(`${API_BASE}/billing/payment-methods`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({paymentMethodId: paymentMethod.id})
    });

    if (response.ok) {
      showSuccess('Payment method added successfully');
      await loadPaymentMethods();
    }
  }
  */
}

/**
 * Set default payment method
 */
async function setDefaultPaymentMethod(methodId) {
  try {
    const response = await fetch(`${API_BASE}/billing/payment-methods/default`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentMethodId: methodId })
    });

    if (!response.ok) throw new Error('Failed to set default');

    showSuccess('Default payment method updated');
    await loadPaymentMethods();
  } catch (error) {
    console.error('Error setting default payment method:', error);
    showError('Failed to update default payment method');
  }
}

/**
 * Remove payment method
 */
async function removePaymentMethod(methodId) {
  const confirmed = confirm('Are you sure you want to remove this payment method?');
  if (!confirmed) return;

  try {
    const response = await fetch(`${API_BASE}/billing/payment-methods/${methodId}`, {
      method: 'DELETE'
    });

    if (!response.ok) throw new Error('Failed to remove payment method');

    showSuccess('Payment method removed');
    await loadPaymentMethods();
  } catch (error) {
    console.error('Error removing payment method:', error);
    showError('Failed to remove payment method');
  }
}

/**
 * Show upgrade plans
 */
function showUpgradePlans() {
  // Switch to subscription tab and scroll to plans
  document.querySelector('.tab[data-tab="subscription"]').click();
  document.getElementById('plans-grid').scrollIntoView({ behavior: 'smooth' });
}

/**
 * Manage billing with Stripe Portal
 */
async function manageBilling() {
  try {
    const response = await fetch(`${API_BASE}/billing/portal-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ returnUrl: window.location.href })
    });

    if (!response.ok) throw new Error('Failed to create portal session');

    const data = await response.json();
    window.location.href = data.url;
  } catch (error) {
    console.error('Error creating portal session:', error);
    showError('Failed to open billing portal');
  }
}

/**
 * Show cancel modal
 */
function showCancelModal() {
  document.getElementById('cancel-modal').classList.add('active');
}

/**
 * Close cancel modal
 */
function closeCancelModal() {
  document.getElementById('cancel-modal').classList.remove('active');
}

/**
 * Confirm cancellation
 */
async function confirmCancel() {
  const immediately = document.getElementById('cancel-immediately').checked;

  await cancelSubscription(immediately);
  closeCancelModal();
}

/**
 * Cancel subscription
 */
async function cancelSubscription(immediately = false) {
  try {
    const response = await fetch(`${API_BASE}/billing/subscription/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ immediately })
    });

    if (!response.ok) throw new Error('Failed to cancel subscription');

    showSuccess(immediately
      ? 'Subscription cancelled immediately'
      : 'Subscription will be cancelled at the end of the billing period'
    );

    await loadSubscriptionData();
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    showError('Failed to cancel subscription');
  }
}

/**
 * Show success message
 */
function showSuccess(message) {
  alert(`✓ ${message}`);
  // In production, use a toast notification library
}

/**
 * Show error message
 */
function showError(message) {
  alert(`✗ ${message}`);
  // In production, use a toast notification library
}

// Initialize portal on page load
document.addEventListener('DOMContentLoaded', initPortal);
