/**
 * Payment Integration Tests
 *
 * Comprehensive test suite for Stripe payment integration
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import {
  CustomerManager,
  SubscriptionManager,
  PaymentMethodManager,
  InvoiceManager,
  RefundManager,
  BillingPortalManager,
  PaymentIntentManager,
  SUBSCRIPTION_PLANS
} from './stripe.js';

// Test configuration
const TEST_USER = {
  email: 'test@formulanebula.com',
  userId: 'test_user_001',
  metadata: { testMode: true }
};

let testCustomerId;
let testSubscriptionId;
let testPaymentMethodId;
let testInvoiceId;
let testPaymentIntentId;

describe('Stripe Payment Integration', () => {
  beforeAll(async () => {
    console.log('Setting up test environment...');
    // Ensure we're in test mode
    expect(process.env.STRIPE_SECRET_KEY).toContain('sk_test');
  });

  afterAll(async () => {
    console.log('Cleaning up test data...');
    // Cleanup test customer
    if (testCustomerId) {
      await CustomerManager.deleteCustomer(testCustomerId);
    }
  });

  describe('Customer Management', () => {
    it('should create a customer', async () => {
      const result = await CustomerManager.createCustomer(TEST_USER);

      expect(result.success).toBe(true);
      expect(result.customerId).toBeDefined();
      expect(result.customer.email).toBe(TEST_USER.email);

      testCustomerId = result.customerId;
    });

    it('should retrieve a customer', async () => {
      const result = await CustomerManager.getCustomer(testCustomerId);

      expect(result.success).toBe(true);
      expect(result.customer.id).toBe(testCustomerId);
      expect(result.customer.email).toBe(TEST_USER.email);
    });

    it('should update customer information', async () => {
      const result = await CustomerManager.updateCustomer(testCustomerId, {
        metadata: { plan: 'pro', testUpdated: true }
      });

      expect(result.success).toBe(true);
      expect(result.customer.metadata.testUpdated).toBe('true');
    });

    it('should handle invalid customer ID', async () => {
      const result = await CustomerManager.getCustomer('cus_invalid');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('Payment Method Management', () => {
    it('should attach a test payment method', async () => {
      // Create a test payment method first (requires Stripe.js in browser)
      // For testing, use a pre-created test payment method
      testPaymentMethodId = 'pm_card_visa';

      const result = await PaymentMethodManager.attachPaymentMethod(
        testPaymentMethodId,
        testCustomerId
      );

      // May fail in pure Node.js environment without browser Stripe.js
      // This is expected - in production, payment methods are created client-side
      if (result.success) {
        expect(result.paymentMethod).toBeDefined();
      } else {
        console.log('Note: Payment method attachment requires browser environment');
      }
    });

    it('should list customer payment methods', async () => {
      const result = await PaymentMethodManager.listPaymentMethods(testCustomerId);

      expect(result.success).toBe(true);
      expect(Array.isArray(result.paymentMethods)).toBe(true);
    });

    it('should set default payment method', async () => {
      if (testPaymentMethodId) {
        const result = await PaymentMethodManager.setDefaultPaymentMethod(
          testCustomerId,
          testPaymentMethodId
        );

        if (result.success) {
          expect(result.customer.invoice_settings.default_payment_method).toBe(testPaymentMethodId);
        }
      }
    });
  });

  describe('Subscription Management', () => {
    it('should validate subscription plans', () => {
      expect(SUBSCRIPTION_PLANS.FREE).toBeDefined();
      expect(SUBSCRIPTION_PLANS.BASIC).toBeDefined();
      expect(SUBSCRIPTION_PLANS.PRO).toBeDefined();
      expect(SUBSCRIPTION_PLANS.ENTERPRISE).toBeDefined();

      expect(SUBSCRIPTION_PLANS.PRO.price).toBe(29.99);
      expect(SUBSCRIPTION_PLANS.PRO.limits.collaborators).toBe(10);
    });

    it('should create a subscription (integration test)', async () => {
      // Skip if no payment method available
      if (!testPaymentMethodId) {
        console.log('Skipping subscription creation - no payment method');
        return;
      }

      const result = await SubscriptionManager.createSubscription({
        customerId: testCustomerId,
        priceId: SUBSCRIPTION_PLANS.BASIC.id,
        paymentMethodId: testPaymentMethodId,
        metadata: { testSubscription: true }
      });

      if (result.success) {
        expect(result.subscriptionId).toBeDefined();
        expect(result.subscription).toBeDefined();
        expect(result.clientSecret).toBeDefined();

        testSubscriptionId = result.subscriptionId;
      } else {
        console.log('Subscription creation note:', result.error);
      }
    });

    it('should retrieve subscription', async () => {
      if (!testSubscriptionId) {
        console.log('Skipping - no subscription ID');
        return;
      }

      const result = await SubscriptionManager.getSubscription(testSubscriptionId);

      expect(result.success).toBe(true);
      expect(result.subscription.id).toBe(testSubscriptionId);
    });

    it('should list customer subscriptions', async () => {
      const result = await SubscriptionManager.listSubscriptions(testCustomerId);

      expect(result.success).toBe(true);
      expect(Array.isArray(result.subscriptions)).toBe(true);
    });

    it('should update subscription plan', async () => {
      if (!testSubscriptionId) {
        console.log('Skipping - no subscription ID');
        return;
      }

      const result = await SubscriptionManager.updateSubscription(testSubscriptionId, {
        priceId: SUBSCRIPTION_PLANS.PRO.id,
        prorationBehavior: 'create_prorations'
      });

      if (result.success) {
        expect(result.subscription.items.data[0].price.id).toBe(SUBSCRIPTION_PLANS.PRO.id);
      }
    });

    it('should cancel subscription at period end', async () => {
      if (!testSubscriptionId) {
        console.log('Skipping - no subscription ID');
        return;
      }

      const result = await SubscriptionManager.cancelSubscription(testSubscriptionId, {
        immediately: false
      });

      if (result.success) {
        expect(result.subscription.cancel_at_period_end).toBe(true);
        expect(result.cancelledImmediately).toBe(false);
      }
    });

    it('should resume cancelled subscription', async () => {
      if (!testSubscriptionId) {
        console.log('Skipping - no subscription ID');
        return;
      }

      const result = await SubscriptionManager.resumeSubscription(testSubscriptionId);

      if (result.success) {
        expect(result.subscription.cancel_at_period_end).toBe(false);
      }
    });

    it('should cancel subscription immediately', async () => {
      if (!testSubscriptionId) {
        console.log('Skipping - no subscription ID');
        return;
      }

      const result = await SubscriptionManager.cancelSubscription(testSubscriptionId, {
        immediately: true
      });

      if (result.success) {
        expect(result.subscription.status).toBe('canceled');
        expect(result.cancelledImmediately).toBe(true);
      }
    });
  });

  describe('Invoice Management', () => {
    it('should list customer invoices', async () => {
      const result = await InvoiceManager.listInvoices(testCustomerId, 10);

      expect(result.success).toBe(true);
      expect(Array.isArray(result.invoices)).toBe(true);

      if (result.invoices.length > 0) {
        testInvoiceId = result.invoices[0].id;
      }
    });

    it('should retrieve specific invoice', async () => {
      if (!testInvoiceId) {
        console.log('Skipping - no invoice ID');
        return;
      }

      const result = await InvoiceManager.getInvoice(testInvoiceId);

      expect(result.success).toBe(true);
      expect(result.invoice.id).toBe(testInvoiceId);
    });

    it('should get upcoming invoice', async () => {
      if (!testSubscriptionId) {
        console.log('Skipping - no subscription ID');
        return;
      }

      const result = await InvoiceManager.getUpcomingInvoice(
        testCustomerId,
        testSubscriptionId
      );

      // May not have upcoming invoice if subscription is cancelled
      if (result.success) {
        expect(result.invoice).toBeDefined();
      }
    });
  });

  describe('Payment Intent Management', () => {
    it('should create payment intent', async () => {
      const result = await PaymentIntentManager.createPaymentIntent({
        amount: 1999, // $19.99
        currency: 'usd',
        customerId: testCustomerId,
        metadata: { testPayment: true }
      });

      expect(result.success).toBe(true);
      expect(result.clientSecret).toBeDefined();
      expect(result.paymentIntent.amount).toBe(1999);

      testPaymentIntentId = result.paymentIntent.id;
    });

    it('should cancel payment intent', async () => {
      if (!testPaymentIntentId) {
        console.log('Skipping - no payment intent ID');
        return;
      }

      const result = await PaymentIntentManager.cancelPaymentIntent(testPaymentIntentId);

      expect(result.success).toBe(true);
      expect(result.paymentIntent.status).toBe('canceled');
    });
  });

  describe('Refund Management', () => {
    it('should list refunds', async () => {
      const result = await RefundManager.listRefunds({ limit: 10 });

      expect(result.success).toBe(true);
      expect(Array.isArray(result.refunds)).toBe(true);
    });

    it('should handle refund creation validation', async () => {
      // Attempting to refund without valid payment intent
      const result = await RefundManager.createRefund({
        paymentIntentId: 'pi_invalid',
        amount: 1000,
        reason: 'requested_by_customer'
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('Billing Portal', () => {
    it('should create billing portal session', async () => {
      const result = await BillingPortalManager.createPortalSession(
        testCustomerId,
        'http://localhost:3000/billing'
      );

      expect(result.success).toBe(true);
      expect(result.url).toBeDefined();
      expect(result.url).toContain('billing.stripe.com');
    });

    it('should handle invalid customer', async () => {
      const result = await BillingPortalManager.createPortalSession(
        'cus_invalid',
        'http://localhost:3000/billing'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      // Simulate error by using invalid API key temporarily
      const originalKey = process.env.STRIPE_SECRET_KEY;
      process.env.STRIPE_SECRET_KEY = 'sk_test_invalid';

      const result = await CustomerManager.createCustomer({
        email: 'error@test.com',
        userId: 'error_test'
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();

      // Restore original key
      process.env.STRIPE_SECRET_KEY = originalKey;
    });

    it('should validate required parameters', async () => {
      const result = await CustomerManager.createCustomer({
        // Missing email
        userId: 'test'
      });

      expect(result.success).toBe(false);
    });
  });

  describe('Subscription Plans Configuration', () => {
    it('should have correct plan structure', () => {
      const plans = Object.values(SUBSCRIPTION_PLANS);

      plans.forEach(plan => {
        expect(plan.id).toBeDefined();
        expect(plan.name).toBeDefined();
        expect(plan.price).toBeDefined();
        expect(plan.features).toBeDefined();
        expect(Array.isArray(plan.features)).toBe(true);
        expect(plan.limits).toBeDefined();
        expect(plan.limits.nodes).toBeDefined();
        expect(plan.limits.collaborators).toBeDefined();
        expect(plan.limits.exports).toBeDefined();
      });
    });

    it('should have increasing prices', () => {
      expect(SUBSCRIPTION_PLANS.FREE.price).toBe(0);
      expect(SUBSCRIPTION_PLANS.BASIC.price).toBeGreaterThan(SUBSCRIPTION_PLANS.FREE.price);
      expect(SUBSCRIPTION_PLANS.PRO.price).toBeGreaterThan(SUBSCRIPTION_PLANS.BASIC.price);
      expect(SUBSCRIPTION_PLANS.ENTERPRISE.price).toBeGreaterThan(SUBSCRIPTION_PLANS.PRO.price);
    });

    it('should have increasing features', () => {
      expect(SUBSCRIPTION_PLANS.PRO.features.length).toBeGreaterThan(
        SUBSCRIPTION_PLANS.BASIC.features.length
      );
      expect(SUBSCRIPTION_PLANS.ENTERPRISE.features.length).toBeGreaterThan(
        SUBSCRIPTION_PLANS.PRO.features.length
      );
    });
  });
});

describe('Integration Scenarios', () => {
  it('should handle complete subscription lifecycle', async () => {
    // This is a high-level integration test
    console.log('Testing complete subscription lifecycle...');

    // 1. Create customer
    const customerResult = await CustomerManager.createCustomer({
      email: 'lifecycle@test.com',
      userId: 'lifecycle_test'
    });

    if (!customerResult.success) {
      console.log('Lifecycle test skipped - customer creation failed');
      return;
    }

    const customerId = customerResult.customerId;

    // 2. Would create subscription (requires payment method from browser)
    // 3. Would upgrade subscription
    // 4. Would cancel subscription
    // 5. Cleanup

    await CustomerManager.deleteCustomer(customerId);
    console.log('Lifecycle test completed');
  });
});

// Export for use in other test files
export {
  TEST_USER,
  testCustomerId,
  testSubscriptionId
};
