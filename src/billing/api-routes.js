/**
 * Billing API Routes
 *
 * Express routes for billing and subscription management
 */

import express from 'express';
import {
  CustomerManager,
  SubscriptionManager,
  PaymentMethodManager,
  InvoiceManager,
  RefundManager,
  BillingPortalManager,
  PaymentIntentManager,
  SUBSCRIPTION_PLANS
} from '../payments/stripe.js';
import { InvoiceService } from './invoices.js';

const router = express.Router();

/**
 * Middleware: Require authentication
 */
function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
}

/**
 * Middleware: Get or create Stripe customer
 */
async function ensureStripeCustomer(req, res, next) {
  const user = req.user;

  if (!user.stripeCustomerId) {
    // Create Stripe customer
    const result = await CustomerManager.createCustomer({
      email: user.email,
      userId: user.id,
      metadata: {
        username: user.username
      }
    });

    if (!result.success) {
      return res.status(500).json({ error: 'Failed to create customer' });
    }

    // Update user record with customer ID
    user.stripeCustomerId = result.customerId;
    // TODO: Save to database
  }

  req.stripeCustomerId = user.stripeCustomerId;
  next();
}

/**
 * GET /api/billing/plans
 * Get available subscription plans
 */
router.get('/plans', (req, res) => {
  res.json({
    success: true,
    plans: Object.values(SUBSCRIPTION_PLANS)
  });
});

/**
 * GET /api/billing/subscription
 * Get current subscription
 */
router.get('/subscription', requireAuth, ensureStripeCustomer, async (req, res) => {
  try {
    const result = await SubscriptionManager.listSubscriptions(req.stripeCustomerId);

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    const activeSubscription = result.subscriptions.find(
      sub => sub.status === 'active' || sub.status === 'trialing'
    );

    res.json({
      success: true,
      subscription: activeSubscription || null
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({ error: 'Failed to fetch subscription' });
  }
});

/**
 * POST /api/billing/subscription/create
 * Create a new subscription
 */
router.post('/subscription/create', requireAuth, ensureStripeCustomer, async (req, res) => {
  try {
    const { priceId, paymentMethodId } = req.body;

    if (!priceId || !paymentMethodId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await SubscriptionManager.createSubscription({
      customerId: req.stripeCustomerId,
      priceId,
      paymentMethodId,
      metadata: {
        userId: req.user.id
      }
    });

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json({
      success: true,
      subscription: result.subscription,
      clientSecret: result.clientSecret
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ error: 'Failed to create subscription' });
  }
});

/**
 * POST /api/billing/subscription/change
 * Update subscription plan
 */
router.post('/subscription/change', requireAuth, ensureStripeCustomer, async (req, res) => {
  try {
    const { planId } = req.body;

    if (!planId) {
      return res.status(400).json({ error: 'Plan ID required' });
    }

    // Get current subscription
    const subsResult = await SubscriptionManager.listSubscriptions(req.stripeCustomerId);
    if (!subsResult.success || subsResult.subscriptions.length === 0) {
      return res.status(404).json({ error: 'No active subscription found' });
    }

    const currentSub = subsResult.subscriptions[0];
    const newPlan = SUBSCRIPTION_PLANS[planId.toUpperCase()];

    if (!newPlan) {
      return res.status(400).json({ error: 'Invalid plan ID' });
    }

    // Update subscription
    const result = await SubscriptionManager.updateSubscription(currentSub.id, {
      priceId: newPlan.id,
      prorationBehavior: 'create_prorations'
    });

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json({
      success: true,
      subscription: result.subscription
    });
  } catch (error) {
    console.error('Error changing subscription:', error);
    res.status(500).json({ error: 'Failed to change subscription' });
  }
});

/**
 * POST /api/billing/subscription/cancel
 * Cancel subscription
 */
router.post('/subscription/cancel', requireAuth, ensureStripeCustomer, async (req, res) => {
  try {
    const { immediately = false } = req.body;

    // Get current subscription
    const subsResult = await SubscriptionManager.listSubscriptions(req.stripeCustomerId);
    if (!subsResult.success || subsResult.subscriptions.length === 0) {
      return res.status(404).json({ error: 'No active subscription found' });
    }

    const currentSub = subsResult.subscriptions[0];

    // Cancel subscription
    const result = await SubscriptionManager.cancelSubscription(currentSub.id, { immediately });

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json({
      success: true,
      subscription: result.subscription,
      cancelledImmediately: result.cancelledImmediately
    });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

/**
 * POST /api/billing/subscription/resume
 * Resume a cancelled subscription
 */
router.post('/subscription/resume', requireAuth, ensureStripeCustomer, async (req, res) => {
  try {
    const { subscriptionId } = req.body;

    if (!subscriptionId) {
      return res.status(400).json({ error: 'Subscription ID required' });
    }

    const result = await SubscriptionManager.resumeSubscription(subscriptionId);

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json({
      success: true,
      subscription: result.subscription
    });
  } catch (error) {
    console.error('Error resuming subscription:', error);
    res.status(500).json({ error: 'Failed to resume subscription' });
  }
});

/**
 * GET /api/billing/invoices
 * Get customer invoices
 */
router.get('/invoices', requireAuth, ensureStripeCustomer, async (req, res) => {
  try {
    const result = await InvoiceService.getCustomerInvoices(req.stripeCustomerId, {
      limit: 100,
      format: 'object'
    });

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json({
      success: true,
      invoices: result.invoices
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

/**
 * GET /api/billing/invoices/:invoiceId
 * Get specific invoice
 */
router.get('/invoices/:invoiceId', requireAuth, async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const { format = 'object' } = req.query;

    const result = await InvoiceService.getInvoice(invoiceId, format);

    if (!result.success) {
      return res.status(404).json({ error: result.error });
    }

    if (format === 'html') {
      res.setHeader('Content-Type', 'text/html');
      return res.send(result.output);
    }

    if (format === 'text') {
      res.setHeader('Content-Type', 'text/plain');
      return res.send(result.output);
    }

    res.json({
      success: true,
      invoice: result.invoice
    });
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({ error: 'Failed to fetch invoice' });
  }
});

/**
 * GET /api/billing/invoices/:invoiceId/download
 * Download invoice PDF
 */
router.get('/invoices/:invoiceId/download', requireAuth, async (req, res) => {
  try {
    const { invoiceId } = req.params;

    const result = await InvoiceService.downloadInvoicePDF(invoiceId);

    if (!result.success) {
      return res.status(404).json({ error: result.error });
    }

    res.redirect(result.pdfUrl);
  } catch (error) {
    console.error('Error downloading invoice:', error);
    res.status(500).json({ error: 'Failed to download invoice' });
  }
});

/**
 * GET /api/billing/upcoming-invoice
 * Get upcoming invoice preview
 */
router.get('/upcoming-invoice', requireAuth, ensureStripeCustomer, async (req, res) => {
  try {
    // Get current subscription
    const subsResult = await SubscriptionManager.listSubscriptions(req.stripeCustomerId);
    if (!subsResult.success || subsResult.subscriptions.length === 0) {
      return res.status(404).json({ error: 'No active subscription found' });
    }

    const currentSub = subsResult.subscriptions[0];

    const result = await InvoiceService.getUpcomingInvoice(req.stripeCustomerId, currentSub.id);

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json({
      success: true,
      invoice: result.invoice
    });
  } catch (error) {
    console.error('Error fetching upcoming invoice:', error);
    res.status(500).json({ error: 'Failed to fetch upcoming invoice' });
  }
});

/**
 * GET /api/billing/payment-methods
 * Get customer payment methods
 */
router.get('/payment-methods', requireAuth, ensureStripeCustomer, async (req, res) => {
  try {
    const result = await PaymentMethodManager.listPaymentMethods(req.stripeCustomerId);

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json({
      success: true,
      paymentMethods: result.paymentMethods
    });
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    res.status(500).json({ error: 'Failed to fetch payment methods' });
  }
});

/**
 * POST /api/billing/payment-methods
 * Add a payment method
 */
router.post('/payment-methods', requireAuth, ensureStripeCustomer, async (req, res) => {
  try {
    const { paymentMethodId } = req.body;

    if (!paymentMethodId) {
      return res.status(400).json({ error: 'Payment method ID required' });
    }

    const result = await PaymentMethodManager.attachPaymentMethod(
      paymentMethodId,
      req.stripeCustomerId
    );

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json({
      success: true,
      paymentMethod: result.paymentMethod
    });
  } catch (error) {
    console.error('Error adding payment method:', error);
    res.status(500).json({ error: 'Failed to add payment method' });
  }
});

/**
 * DELETE /api/billing/payment-methods/:methodId
 * Remove a payment method
 */
router.delete('/payment-methods/:methodId', requireAuth, async (req, res) => {
  try {
    const { methodId } = req.params;

    const result = await PaymentMethodManager.detachPaymentMethod(methodId);

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json({
      success: true,
      paymentMethod: result.paymentMethod
    });
  } catch (error) {
    console.error('Error removing payment method:', error);
    res.status(500).json({ error: 'Failed to remove payment method' });
  }
});

/**
 * POST /api/billing/payment-methods/default
 * Set default payment method
 */
router.post('/payment-methods/default', requireAuth, ensureStripeCustomer, async (req, res) => {
  try {
    const { paymentMethodId } = req.body;

    if (!paymentMethodId) {
      return res.status(400).json({ error: 'Payment method ID required' });
    }

    const result = await PaymentMethodManager.setDefaultPaymentMethod(
      req.stripeCustomerId,
      paymentMethodId
    );

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json({
      success: true,
      customer: result.customer
    });
  } catch (error) {
    console.error('Error setting default payment method:', error);
    res.status(500).json({ error: 'Failed to set default payment method' });
  }
});

/**
 * POST /api/billing/portal-session
 * Create Stripe billing portal session
 */
router.post('/portal-session', requireAuth, ensureStripeCustomer, async (req, res) => {
  try {
    const { returnUrl } = req.body;

    const result = await BillingPortalManager.createPortalSession(
      req.stripeCustomerId,
      returnUrl || `${process.env.APP_URL}/billing`
    );

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json({
      success: true,
      url: result.url
    });
  } catch (error) {
    console.error('Error creating portal session:', error);
    res.status(500).json({ error: 'Failed to create portal session' });
  }
});

/**
 * POST /api/billing/refund
 * Create a refund (admin only)
 */
router.post('/refund', requireAuth, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { paymentIntentId, amount, reason } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({ error: 'Payment intent ID required' });
    }

    const result = await RefundManager.createRefund({
      paymentIntentId,
      amount,
      reason: reason || 'requested_by_customer'
    });

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json({
      success: true,
      refund: result.refund
    });
  } catch (error) {
    console.error('Error creating refund:', error);
    res.status(500).json({ error: 'Failed to create refund' });
  }
});

/**
 * POST /api/billing/payment-intent
 * Create payment intent for one-time payment
 */
router.post('/payment-intent', requireAuth, ensureStripeCustomer, async (req, res) => {
  try {
    const { amount, currency = 'usd', metadata = {} } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount required' });
    }

    const result = await PaymentIntentManager.createPaymentIntent({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      customerId: req.stripeCustomerId,
      metadata: {
        userId: req.user.id,
        ...metadata
      }
    });

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json({
      success: true,
      clientSecret: result.clientSecret,
      paymentIntent: result.paymentIntent
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

export default router;
