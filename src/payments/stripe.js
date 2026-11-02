/**
 * Stripe Payment Integration
 *
 * Comprehensive Stripe API wrapper for Formula Nebula
 * Handles subscriptions, invoices, payments, and refunds
 */

import Stripe from 'stripe';

// Initialize Stripe with API key from environment
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
  maxNetworkRetries: 3,
  timeout: 10000,
  telemetry: false
});

/**
 * Subscription Plans Configuration
 */
export const SUBSCRIPTION_PLANS = {
  FREE: {
    id: 'free',
    name: 'Free',
    price: 0,
    features: ['Basic graph visualization', 'Up to 100 nodes', 'Community support'],
    limits: {
      nodes: 100,
      collaborators: 0,
      exports: 5
    }
  },
  BASIC: {
    id: 'price_basic_monthly',
    name: 'Basic',
    price: 9.99,
    interval: 'month',
    features: ['Unlimited nodes', 'Export capabilities', 'Email support'],
    limits: {
      nodes: Infinity,
      collaborators: 3,
      exports: Infinity
    }
  },
  PRO: {
    id: 'price_pro_monthly',
    name: 'Pro',
    price: 29.99,
    interval: 'month',
    features: [
      'All Basic features',
      'Real-time collaboration',
      'Advanced analytics',
      'Priority support',
      'Custom branding'
    ],
    limits: {
      nodes: Infinity,
      collaborators: 10,
      exports: Infinity
    }
  },
  ENTERPRISE: {
    id: 'price_enterprise_monthly',
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
    ],
    limits: {
      nodes: Infinity,
      collaborators: Infinity,
      exports: Infinity
    }
  }
};

/**
 * Customer Management
 */
export class CustomerManager {
  /**
   * Create or retrieve a Stripe customer
   * @param {Object} params - Customer parameters
   * @param {string} params.email - Customer email
   * @param {string} params.userId - Internal user ID
   * @param {Object} params.metadata - Additional metadata
   * @returns {Promise<Object>} Stripe customer object
   */
  static async createCustomer({ email, userId, metadata = {} }) {
    try {
      const customer = await stripe.customers.create({
        email,
        metadata: {
          userId,
          ...metadata
        }
      });

      return {
        success: true,
        customerId: customer.id,
        customer
      };
    } catch (error) {
      console.error('Error creating customer:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get customer by ID
   * @param {string} customerId - Stripe customer ID
   * @returns {Promise<Object>} Customer details
   */
  static async getCustomer(customerId) {
    try {
      const customer = await stripe.customers.retrieve(customerId);
      return {
        success: true,
        customer
      };
    } catch (error) {
      console.error('Error retrieving customer:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Update customer information
   * @param {string} customerId - Stripe customer ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated customer
   */
  static async updateCustomer(customerId, updates) {
    try {
      const customer = await stripe.customers.update(customerId, updates);
      return {
        success: true,
        customer
      };
    } catch (error) {
      console.error('Error updating customer:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Delete customer
   * @param {string} customerId - Stripe customer ID
   * @returns {Promise<Object>} Deletion result
   */
  static async deleteCustomer(customerId) {
    try {
      const deleted = await stripe.customers.del(customerId);
      return {
        success: true,
        deleted
      };
    } catch (error) {
      console.error('Error deleting customer:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

/**
 * Subscription Management
 */
export class SubscriptionManager {
  /**
   * Create a new subscription
   * @param {Object} params - Subscription parameters
   * @param {string} params.customerId - Stripe customer ID
   * @param {string} params.priceId - Price ID from SUBSCRIPTION_PLANS
   * @param {string} params.paymentMethodId - Payment method ID
   * @param {Object} params.metadata - Additional metadata
   * @returns {Promise<Object>} Subscription result
   */
  static async createSubscription({ customerId, priceId, paymentMethodId, metadata = {} }) {
    try {
      // Attach payment method to customer
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId
      });

      // Set as default payment method
      await stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId
        }
      });

      // Create subscription
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
        metadata
      });

      return {
        success: true,
        subscriptionId: subscription.id,
        subscription,
        clientSecret: subscription.latest_invoice.payment_intent.client_secret
      };
    } catch (error) {
      console.error('Error creating subscription:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get subscription details
   * @param {string} subscriptionId - Subscription ID
   * @returns {Promise<Object>} Subscription details
   */
  static async getSubscription(subscriptionId) {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      return {
        success: true,
        subscription
      };
    } catch (error) {
      console.error('Error retrieving subscription:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Update subscription (upgrade/downgrade)
   * @param {string} subscriptionId - Subscription ID
   * @param {Object} params - Update parameters
   * @param {string} params.priceId - New price ID
   * @param {boolean} params.prorationBehavior - Proration setting
   * @returns {Promise<Object>} Updated subscription
   */
  static async updateSubscription(subscriptionId, { priceId, prorationBehavior = 'create_prorations' }) {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);

      const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
        items: [{
          id: subscription.items.data[0].id,
          price: priceId
        }],
        proration_behavior: prorationBehavior
      });

      return {
        success: true,
        subscription: updatedSubscription
      };
    } catch (error) {
      console.error('Error updating subscription:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Cancel subscription
   * @param {string} subscriptionId - Subscription ID
   * @param {Object} options - Cancellation options
   * @param {boolean} options.immediately - Cancel immediately or at period end
   * @returns {Promise<Object>} Cancellation result
   */
  static async cancelSubscription(subscriptionId, { immediately = false } = {}) {
    try {
      let subscription;

      if (immediately) {
        subscription = await stripe.subscriptions.cancel(subscriptionId);
      } else {
        subscription = await stripe.subscriptions.update(subscriptionId, {
          cancel_at_period_end: true
        });
      }

      return {
        success: true,
        subscription,
        cancelledImmediately: immediately
      };
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Resume a cancelled subscription
   * @param {string} subscriptionId - Subscription ID
   * @returns {Promise<Object>} Resumed subscription
   */
  static async resumeSubscription(subscriptionId) {
    try {
      const subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: false
      });

      return {
        success: true,
        subscription
      };
    } catch (error) {
      console.error('Error resuming subscription:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * List customer subscriptions
   * @param {string} customerId - Customer ID
   * @returns {Promise<Object>} List of subscriptions
   */
  static async listSubscriptions(customerId) {
    try {
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: 'all',
        expand: ['data.default_payment_method']
      });

      return {
        success: true,
        subscriptions: subscriptions.data
      };
    } catch (error) {
      console.error('Error listing subscriptions:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

/**
 * Payment Method Management
 */
export class PaymentMethodManager {
  /**
   * Attach payment method to customer
   * @param {string} paymentMethodId - Payment method ID
   * @param {string} customerId - Customer ID
   * @returns {Promise<Object>} Attachment result
   */
  static async attachPaymentMethod(paymentMethodId, customerId) {
    try {
      const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId
      });

      return {
        success: true,
        paymentMethod
      };
    } catch (error) {
      console.error('Error attaching payment method:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Detach payment method from customer
   * @param {string} paymentMethodId - Payment method ID
   * @returns {Promise<Object>} Detachment result
   */
  static async detachPaymentMethod(paymentMethodId) {
    try {
      const paymentMethod = await stripe.paymentMethods.detach(paymentMethodId);

      return {
        success: true,
        paymentMethod
      };
    } catch (error) {
      console.error('Error detaching payment method:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * List customer payment methods
   * @param {string} customerId - Customer ID
   * @param {string} type - Payment method type (card, etc.)
   * @returns {Promise<Object>} List of payment methods
   */
  static async listPaymentMethods(customerId, type = 'card') {
    try {
      const paymentMethods = await stripe.paymentMethods.list({
        customer: customerId,
        type
      });

      return {
        success: true,
        paymentMethods: paymentMethods.data
      };
    } catch (error) {
      console.error('Error listing payment methods:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Set default payment method
   * @param {string} customerId - Customer ID
   * @param {string} paymentMethodId - Payment method ID
   * @returns {Promise<Object>} Update result
   */
  static async setDefaultPaymentMethod(customerId, paymentMethodId) {
    try {
      const customer = await stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId
        }
      });

      return {
        success: true,
        customer
      };
    } catch (error) {
      console.error('Error setting default payment method:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

/**
 * Invoice Management
 */
export class InvoiceManager {
  /**
   * Get invoice by ID
   * @param {string} invoiceId - Invoice ID
   * @returns {Promise<Object>} Invoice details
   */
  static async getInvoice(invoiceId) {
    try {
      const invoice = await stripe.invoices.retrieve(invoiceId);
      return {
        success: true,
        invoice
      };
    } catch (error) {
      console.error('Error retrieving invoice:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * List customer invoices
   * @param {string} customerId - Customer ID
   * @param {number} limit - Number of invoices to return
   * @returns {Promise<Object>} List of invoices
   */
  static async listInvoices(customerId, limit = 100) {
    try {
      const invoices = await stripe.invoices.list({
        customer: customerId,
        limit
      });

      return {
        success: true,
        invoices: invoices.data
      };
    } catch (error) {
      console.error('Error listing invoices:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get upcoming invoice preview
   * @param {string} customerId - Customer ID
   * @param {string} subscriptionId - Subscription ID
   * @returns {Promise<Object>} Upcoming invoice
   */
  static async getUpcomingInvoice(customerId, subscriptionId) {
    try {
      const invoice = await stripe.invoices.retrieveUpcoming({
        customer: customerId,
        subscription: subscriptionId
      });

      return {
        success: true,
        invoice
      };
    } catch (error) {
      console.error('Error retrieving upcoming invoice:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Pay invoice manually
   * @param {string} invoiceId - Invoice ID
   * @returns {Promise<Object>} Payment result
   */
  static async payInvoice(invoiceId) {
    try {
      const invoice = await stripe.invoices.pay(invoiceId);
      return {
        success: true,
        invoice
      };
    } catch (error) {
      console.error('Error paying invoice:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Void invoice
   * @param {string} invoiceId - Invoice ID
   * @returns {Promise<Object>} Void result
   */
  static async voidInvoice(invoiceId) {
    try {
      const invoice = await stripe.invoices.voidInvoice(invoiceId);
      return {
        success: true,
        invoice
      };
    } catch (error) {
      console.error('Error voiding invoice:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

/**
 * Refund Management
 */
export class RefundManager {
  /**
   * Create a refund
   * @param {Object} params - Refund parameters
   * @param {string} params.paymentIntentId - Payment intent ID
   * @param {number} params.amount - Amount to refund (in cents)
   * @param {string} params.reason - Refund reason
   * @returns {Promise<Object>} Refund result
   */
  static async createRefund({ paymentIntentId, amount, reason = 'requested_by_customer' }) {
    try {
      const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount,
        reason
      });

      return {
        success: true,
        refund
      };
    } catch (error) {
      console.error('Error creating refund:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get refund details
   * @param {string} refundId - Refund ID
   * @returns {Promise<Object>} Refund details
   */
  static async getRefund(refundId) {
    try {
      const refund = await stripe.refunds.retrieve(refundId);
      return {
        success: true,
        refund
      };
    } catch (error) {
      console.error('Error retrieving refund:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * List refunds
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} List of refunds
   */
  static async listRefunds(params = {}) {
    try {
      const refunds = await stripe.refunds.list(params);
      return {
        success: true,
        refunds: refunds.data
      };
    } catch (error) {
      console.error('Error listing refunds:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

/**
 * Billing Portal Session
 */
export class BillingPortalManager {
  /**
   * Create a billing portal session
   * @param {string} customerId - Customer ID
   * @param {string} returnUrl - URL to return to after session
   * @returns {Promise<Object>} Portal session
   */
  static async createPortalSession(customerId, returnUrl) {
    try {
      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl
      });

      return {
        success: true,
        url: session.url,
        session
      };
    } catch (error) {
      console.error('Error creating billing portal session:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

/**
 * Payment Intent Management
 */
export class PaymentIntentManager {
  /**
   * Create payment intent for one-time payment
   * @param {Object} params - Payment parameters
   * @param {number} params.amount - Amount in cents
   * @param {string} params.currency - Currency code
   * @param {string} params.customerId - Customer ID
   * @param {Object} params.metadata - Additional metadata
   * @returns {Promise<Object>} Payment intent
   */
  static async createPaymentIntent({ amount, currency = 'usd', customerId, metadata = {} }) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency,
        customer: customerId,
        metadata,
        automatic_payment_methods: {
          enabled: true
        }
      });

      return {
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntent
      };
    } catch (error) {
      console.error('Error creating payment intent:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Confirm payment intent
   * @param {string} paymentIntentId - Payment intent ID
   * @param {string} paymentMethodId - Payment method ID
   * @returns {Promise<Object>} Confirmation result
   */
  static async confirmPaymentIntent(paymentIntentId, paymentMethodId) {
    try {
      const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
        payment_method: paymentMethodId
      });

      return {
        success: true,
        paymentIntent
      };
    } catch (error) {
      console.error('Error confirming payment intent:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Cancel payment intent
   * @param {string} paymentIntentId - Payment intent ID
   * @returns {Promise<Object>} Cancellation result
   */
  static async cancelPaymentIntent(paymentIntentId) {
    try {
      const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId);

      return {
        success: true,
        paymentIntent
      };
    } catch (error) {
      console.error('Error cancelling payment intent:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export { stripe };
export default {
  stripe,
  CustomerManager,
  SubscriptionManager,
  PaymentMethodManager,
  InvoiceManager,
  RefundManager,
  BillingPortalManager,
  PaymentIntentManager,
  SUBSCRIPTION_PLANS
};
