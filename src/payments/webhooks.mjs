/**
 * Stripe Webhook Handler
 *
 * Processes Stripe webhook events for Formula Nebula
 * Handles subscription lifecycle, payment events, and failures
 */

import Stripe from 'stripe';
import express from 'express';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia'
});

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

/**
 * Dunning Management Configuration
 * Handles failed payments and subscription recovery
 */
const DUNNING_CONFIG = {
  maxRetries: 3,
  retryDelays: [3, 7, 14], // Days between retries
  gracePeriod: 3, // Days before downgrade
  notificationEmails: true
};

/**
 * Database interface (mock - replace with actual DB)
 * In production, replace with actual database operations
 */
class Database {
  static async updateSubscription(userId, subscriptionData) {
    console.log(`[DB] Update subscription for user ${userId}:`, subscriptionData);
    // TODO: Implement actual database update
    return { success: true };
  }

  static async createInvoiceRecord(invoiceData) {
    console.log('[DB] Create invoice record:', invoiceData);
    // TODO: Implement actual database insert
    return { success: true, invoiceId: invoiceData.id };
  }

  static async updatePaymentStatus(userId, status) {
    console.log(`[DB] Update payment status for user ${userId}: ${status}`);
    // TODO: Implement actual database update
    return { success: true };
  }

  static async getUserByCustomerId(customerId) {
    console.log(`[DB] Get user by customer ID: ${customerId}`);
    // TODO: Implement actual database query
    return { userId: 'user_' + customerId, email: 'user@example.com' };
  }

  static async recordFailedPayment(userId, failureData) {
    console.log(`[DB] Record failed payment for user ${userId}:`, failureData);
    // TODO: Implement actual database insert
    return { success: true };
  }

  static async getFailedPaymentCount(subscriptionId) {
    console.log(`[DB] Get failed payment count for subscription: ${subscriptionId}`);
    // TODO: Implement actual database query
    return { count: 0 };
  }
}

/**
 * Notification service (mock - replace with actual service)
 */
class NotificationService {
  static async sendEmail({ to, subject, template, data }) {
    console.log(`[Email] Sending to ${to}: ${subject}`);
    console.log('[Email] Template:', template);
    console.log('[Email] Data:', data);
    // TODO: Implement actual email sending (SendGrid, AWS SES, etc.)
    return { success: true };
  }

  static async sendSlackNotification(message) {
    console.log('[Slack] Notification:', message);
    // TODO: Implement actual Slack webhook
    return { success: true };
  }
}

/**
 * Event Handlers
 */
const eventHandlers = {
  /**
   * Handle successful checkout completion
   */
  async 'checkout.session.completed'(event) {
    const session = event.data.object;

    console.log('[Webhook] Checkout session completed:', session.id);

    const { customer, subscription, metadata } = session;

    if (subscription) {
      // Update user subscription in database
      const user = await Database.getUserByCustomerId(customer);

      await Database.updateSubscription(user.userId, {
        stripeSubscriptionId: subscription,
        stripeCustomerId: customer,
        status: 'active',
        metadata
      });

      // Send welcome email
      await NotificationService.sendEmail({
        to: user.email,
        subject: 'Welcome to Formula Nebula Pro!',
        template: 'subscription_activated',
        data: {
          plan: metadata.planName,
          features: metadata.features
        }
      });
    }
  },

  /**
   * Handle subscription creation
   */
  async 'customer.subscription.created'(event) {
    const subscription = event.data.object;

    console.log('[Webhook] Subscription created:', subscription.id);

    const user = await Database.getUserByCustomerId(subscription.customer);

    await Database.updateSubscription(user.userId, {
      stripeSubscriptionId: subscription.id,
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end
    });
  },

  /**
   * Handle subscription updates
   */
  async 'customer.subscription.updated'(event) {
    const subscription = event.data.object;
    const previousAttributes = event.data.previous_attributes;

    console.log('[Webhook] Subscription updated:', subscription.id);
    console.log('[Webhook] Previous attributes:', previousAttributes);

    const user = await Database.getUserByCustomerId(subscription.customer);

    // Check for plan changes
    if (previousAttributes.items) {
      const oldPlan = previousAttributes.items.data[0].price.id;
      const newPlan = subscription.items.data[0].price.id;

      if (oldPlan !== newPlan) {
        console.log(`[Webhook] Plan changed from ${oldPlan} to ${newPlan}`);

        await NotificationService.sendEmail({
          to: user.email,
          subject: 'Your Formula Nebula subscription has been updated',
          template: 'subscription_updated',
          data: {
            oldPlan,
            newPlan,
            effectiveDate: new Date(subscription.current_period_start * 1000)
          }
        });
      }
    }

    // Check for cancellation
    if (subscription.cancel_at_period_end && !previousAttributes.cancel_at_period_end) {
      console.log('[Webhook] Subscription cancelled (at period end)');

      await NotificationService.sendEmail({
        to: user.email,
        subject: 'Your Formula Nebula subscription will be cancelled',
        template: 'subscription_cancelling',
        data: {
          cancelDate: new Date(subscription.current_period_end * 1000)
        }
      });
    }

    // Update database
    await Database.updateSubscription(user.userId, {
      status: subscription.status,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end
    });
  },

  /**
   * Handle subscription deletion
   */
  async 'customer.subscription.deleted'(event) {
    const subscription = event.data.object;

    console.log('[Webhook] Subscription deleted:', subscription.id);

    const user = await Database.getUserByCustomerId(subscription.customer);

    await Database.updateSubscription(user.userId, {
      status: 'cancelled',
      cancelledAt: new Date()
    });

    await NotificationService.sendEmail({
      to: user.email,
      subject: 'Your Formula Nebula subscription has been cancelled',
      template: 'subscription_cancelled',
      data: {
        cancelDate: new Date()
      }
    });

    // Notify internal team
    await NotificationService.sendSlackNotification({
      text: `🔴 Subscription cancelled: User ${user.userId} (${user.email})`
    });
  },

  /**
   * Handle successful invoice payment
   */
  async 'invoice.paid'(event) {
    const invoice = event.data.object;

    console.log('[Webhook] Invoice paid:', invoice.id);

    const user = await Database.getUserByCustomerId(invoice.customer);

    // Record invoice in database
    await Database.createInvoiceRecord({
      id: invoice.id,
      userId: user.userId,
      amount: invoice.amount_paid,
      currency: invoice.currency,
      status: 'paid',
      paidAt: new Date(invoice.status_transitions.paid_at * 1000),
      invoiceUrl: invoice.hosted_invoice_url,
      pdfUrl: invoice.invoice_pdf
    });

    await Database.updatePaymentStatus(user.userId, 'current');

    // Send receipt
    await NotificationService.sendEmail({
      to: user.email,
      subject: 'Receipt for your Formula Nebula subscription',
      template: 'invoice_paid',
      data: {
        amount: invoice.amount_paid / 100,
        currency: invoice.currency.toUpperCase(),
        invoiceUrl: invoice.hosted_invoice_url,
        pdfUrl: invoice.invoice_pdf
      }
    });
  },

  /**
   * Handle failed invoice payment (Dunning Management)
   */
  async 'invoice.payment_failed'(event) {
    const invoice = event.data.object;

    console.log('[Webhook] Invoice payment failed:', invoice.id);

    const user = await Database.getUserByCustomerId(invoice.customer);
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription);

    // Record failed payment
    await Database.recordFailedPayment(user.userId, {
      invoiceId: invoice.id,
      amount: invoice.amount_due,
      attemptCount: invoice.attempt_count,
      failedAt: new Date()
    });

    // Get failure count for dunning management
    const { count: failureCount } = await Database.getFailedPaymentCount(subscription.id);

    console.log(`[Dunning] Failed payment attempt ${failureCount + 1} of ${DUNNING_CONFIG.maxRetries}`);

    // Send failure notification
    await NotificationService.sendEmail({
      to: user.email,
      subject: 'Payment failed for your Formula Nebula subscription',
      template: 'payment_failed',
      data: {
        amount: invoice.amount_due / 100,
        currency: invoice.currency.toUpperCase(),
        attemptNumber: failureCount + 1,
        maxAttempts: DUNNING_CONFIG.maxRetries,
        nextRetryDate: failureCount < DUNNING_CONFIG.maxRetries
          ? new Date(Date.now() + DUNNING_CONFIG.retryDelays[failureCount] * 24 * 60 * 60 * 1000)
          : null,
        updatePaymentUrl: `${process.env.APP_URL}/billing/payment-method`
      }
    });

    // Handle dunning based on failure count
    if (failureCount + 1 >= DUNNING_CONFIG.maxRetries) {
      console.log('[Dunning] Maximum retries reached, entering grace period');

      await Database.updatePaymentStatus(user.userId, 'past_due');

      // Schedule subscription downgrade after grace period
      setTimeout(async () => {
        const currentStatus = await Database.updatePaymentStatus(user.userId, 'grace_period');

        await NotificationService.sendEmail({
          to: user.email,
          subject: 'Final notice: Update your payment method',
          template: 'payment_final_notice',
          data: {
            gracePeriodDays: DUNNING_CONFIG.gracePeriod,
            downgradeDate: new Date(Date.now() + DUNNING_CONFIG.gracePeriod * 24 * 60 * 60 * 1000)
          }
        });
      }, DUNNING_CONFIG.gracePeriod * 24 * 60 * 60 * 1000);

      // Notify internal team
      await NotificationService.sendSlackNotification({
        text: `⚠️ Payment failure - grace period: User ${user.userId} (${user.email})`
      });
    }

    await Database.updatePaymentStatus(user.userId, 'past_due');
  },

  /**
   * Handle invoice finalization
   */
  async 'invoice.finalized'(event) {
    const invoice = event.data.object;

    console.log('[Webhook] Invoice finalized:', invoice.id);

    const user = await Database.getUserByCustomerId(invoice.customer);

    // Create invoice record
    await Database.createInvoiceRecord({
      id: invoice.id,
      userId: user.userId,
      amount: invoice.amount_due,
      currency: invoice.currency,
      status: 'open',
      dueDate: invoice.due_date ? new Date(invoice.due_date * 1000) : null,
      invoiceUrl: invoice.hosted_invoice_url
    });
  },

  /**
   * Handle payment intent success
   */
  async 'payment_intent.succeeded'(event) {
    const paymentIntent = event.data.object;

    console.log('[Webhook] Payment intent succeeded:', paymentIntent.id);

    // Handle one-time payments
    if (!paymentIntent.invoice) {
      const user = await Database.getUserByCustomerId(paymentIntent.customer);

      await NotificationService.sendEmail({
        to: user.email,
        subject: 'Payment successful',
        template: 'payment_succeeded',
        data: {
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency.toUpperCase()
        }
      });
    }
  },

  /**
   * Handle payment intent failure
   */
  async 'payment_intent.payment_failed'(event) {
    const paymentIntent = event.data.object;

    console.log('[Webhook] Payment intent failed:', paymentIntent.id);

    const user = await Database.getUserByCustomerId(paymentIntent.customer);

    await NotificationService.sendEmail({
      to: user.email,
      subject: 'Payment failed',
      template: 'payment_failed_one_time',
      data: {
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency.toUpperCase(),
        error: paymentIntent.last_payment_error?.message
      }
    });
  },

  /**
   * Handle customer deletion
   */
  async 'customer.deleted'(event) {
    const customer = event.data.object;

    console.log('[Webhook] Customer deleted:', customer.id);

    const user = await Database.getUserByCustomerId(customer.id);

    await Database.updateSubscription(user.userId, {
      stripeCustomerId: null,
      status: 'cancelled'
    });
  },

  /**
   * Handle refund creation
   */
  async 'charge.refunded'(event) {
    const charge = event.data.object;

    console.log('[Webhook] Charge refunded:', charge.id);

    const user = await Database.getUserByCustomerId(charge.customer);

    await NotificationService.sendEmail({
      to: user.email,
      subject: 'Refund processed',
      template: 'refund_processed',
      data: {
        amount: charge.amount_refunded / 100,
        currency: charge.currency.toUpperCase(),
        refundDate: new Date()
      }
    });

    // Notify internal team
    await NotificationService.sendSlackNotification({
      text: `💰 Refund processed: $${charge.amount_refunded / 100} for user ${user.userId}`
    });
  }
};

/**
 * Webhook endpoint middleware
 */
export function createWebhookHandler() {
  const router = express.Router();

  // Stripe requires the raw body for signature verification
  router.post(
    '/webhooks/stripe',
    express.raw({ type: 'application/json' }),
    async (req, res) => {
      const sig = req.headers['stripe-signature'];

      let event;

      try {
        // Verify webhook signature
        event = stripe.webhooks.constructEvent(req.body, sig, WEBHOOK_SECRET);
      } catch (err) {
        console.error('[Webhook] Signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }

      console.log(`[Webhook] Received event: ${event.type}`);

      // Handle the event
      const handler = eventHandlers[event.type];

      if (handler) {
        try {
          await handler(event);
          console.log(`[Webhook] Successfully handled ${event.type}`);
        } catch (err) {
          console.error(`[Webhook] Error handling ${event.type}:`, err);
          // Return 200 to acknowledge receipt, even if processing failed
          // Stripe will not retry if we return an error
          return res.status(200).json({
            received: true,
            processed: false,
            error: err.message
          });
        }
      } else {
        console.log(`[Webhook] No handler for event type: ${event.type}`);
      }

      // Return success response
      res.status(200).json({ received: true, processed: true });
    }
  );

  return router;
}

/**
 * Setup webhook endpoint in Express app
 * @param {express.Application} app - Express app instance
 */
export function setupWebhooks(app) {
  const webhookRouter = createWebhookHandler();
  app.use(webhookRouter);

  console.log('[Webhooks] Stripe webhook handler registered at /webhooks/stripe');
}

export default {
  createWebhookHandler,
  setupWebhooks,
  eventHandlers,
  DUNNING_CONFIG
};
