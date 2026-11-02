/**
 * Invoice Generation and Management
 *
 * Handles invoice creation, formatting, and delivery for Formula Nebula
 */

import { InvoiceManager } from '../payments/stripe.js';

/**
 * Invoice formatter for different output formats
 */
export class InvoiceFormatter {
  /**
   * Format invoice data for display
   * @param {Object} invoice - Stripe invoice object
   * @returns {Object} Formatted invoice data
   */
  static formatInvoiceData(invoice) {
    return {
      id: invoice.id,
      number: invoice.number,
      status: invoice.status,
      customer: {
        id: invoice.customer,
        email: invoice.customer_email,
        name: invoice.customer_name
      },
      billing: {
        address: invoice.customer_address,
        email: invoice.customer_email,
        phone: invoice.customer_phone
      },
      amounts: {
        subtotal: invoice.subtotal / 100,
        tax: invoice.tax / 100,
        total: invoice.total / 100,
        amountDue: invoice.amount_due / 100,
        amountPaid: invoice.amount_paid / 100,
        amountRemaining: invoice.amount_remaining / 100,
        currency: invoice.currency.toUpperCase()
      },
      dates: {
        created: new Date(invoice.created * 1000),
        due: invoice.due_date ? new Date(invoice.due_date * 1000) : null,
        paid: invoice.status_transitions?.paid_at
          ? new Date(invoice.status_transitions.paid_at * 1000)
          : null,
        periodStart: new Date(invoice.period_start * 1000),
        periodEnd: new Date(invoice.period_end * 1000)
      },
      items: invoice.lines.data.map(line => ({
        id: line.id,
        description: line.description,
        quantity: line.quantity,
        unitAmount: line.price?.unit_amount / 100,
        amount: line.amount / 100,
        currency: line.currency.toUpperCase(),
        period: {
          start: new Date(line.period.start * 1000),
          end: new Date(line.period.end * 1000)
        },
        proration: line.proration
      })),
      urls: {
        hosted: invoice.hosted_invoice_url,
        pdf: invoice.invoice_pdf
      },
      metadata: invoice.metadata
    };
  }

  /**
   * Generate HTML invoice
   * @param {Object} formattedInvoice - Formatted invoice data
   * @returns {string} HTML invoice
   */
  static generateHTML(formattedInvoice) {
    const { customer, billing, amounts, dates, items, number } = formattedInvoice;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${number}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 3px solid #667eea;
    }
    .logo {
      font-size: 32px;
      font-weight: bold;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .invoice-details {
      text-align: right;
    }
    .invoice-details h1 {
      font-size: 28px;
      color: #667eea;
      margin-bottom: 10px;
    }
    .invoice-number {
      font-size: 14px;
      color: #666;
    }
    .info-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      margin-bottom: 40px;
    }
    .info-block h3 {
      font-size: 12px;
      text-transform: uppercase;
      color: #666;
      margin-bottom: 10px;
      letter-spacing: 1px;
    }
    .info-block p {
      margin-bottom: 5px;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }
    .items-table thead {
      background: #f8f9fa;
    }
    .items-table th {
      text-align: left;
      padding: 12px;
      font-size: 12px;
      text-transform: uppercase;
      color: #666;
      font-weight: 600;
      letter-spacing: 0.5px;
    }
    .items-table td {
      padding: 15px 12px;
      border-bottom: 1px solid #e9ecef;
    }
    .items-table tr:last-child td {
      border-bottom: none;
    }
    .text-right {
      text-align: right;
    }
    .summary {
      margin-left: auto;
      width: 300px;
      border-top: 2px solid #e9ecef;
      padding-top: 20px;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
    }
    .summary-row.total {
      font-size: 18px;
      font-weight: bold;
      color: #667eea;
      border-top: 2px solid #e9ecef;
      padding-top: 15px;
      margin-top: 10px;
    }
    .footer {
      margin-top: 60px;
      padding-top: 30px;
      border-top: 1px solid #e9ecef;
      text-align: center;
      color: #666;
      font-size: 14px;
    }
    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }
    .status-paid {
      background: #d4edda;
      color: #155724;
    }
    .status-open {
      background: #fff3cd;
      color: #856404;
    }
    .status-draft {
      background: #e2e3e5;
      color: #383d41;
    }
    @media print {
      body { padding: 20px; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">Formula Nebula</div>
    <div class="invoice-details">
      <h1>INVOICE</h1>
      <div class="invoice-number">#${number}</div>
      <span class="status-badge status-${formattedInvoice.status}">${formattedInvoice.status}</span>
    </div>
  </div>

  <div class="info-section">
    <div class="info-block">
      <h3>Bill To</h3>
      <p><strong>${customer.name || customer.email}</strong></p>
      ${billing.address ? `
        <p>${billing.address.line1}</p>
        ${billing.address.line2 ? `<p>${billing.address.line2}</p>` : ''}
        <p>${billing.address.city}, ${billing.address.state} ${billing.address.postal_code}</p>
        <p>${billing.address.country}</p>
      ` : ''}
      <p>${customer.email}</p>
      ${billing.phone ? `<p>${billing.phone}</p>` : ''}
    </div>
    <div class="info-block">
      <h3>Invoice Details</h3>
      <p><strong>Date Issued:</strong> ${dates.created.toLocaleDateString()}</p>
      ${dates.due ? `<p><strong>Due Date:</strong> ${dates.due.toLocaleDateString()}</p>` : ''}
      ${dates.paid ? `<p><strong>Date Paid:</strong> ${dates.paid.toLocaleDateString()}</p>` : ''}
      <p><strong>Billing Period:</strong></p>
      <p>${dates.periodStart.toLocaleDateString()} - ${dates.periodEnd.toLocaleDateString()}</p>
    </div>
  </div>

  <table class="items-table">
    <thead>
      <tr>
        <th>Description</th>
        <th class="text-right">Quantity</th>
        <th class="text-right">Unit Price</th>
        <th class="text-right">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${items.map(item => `
        <tr>
          <td>
            <strong>${item.description}</strong>
            ${item.proration ? '<br><small style="color: #666;">Prorated charge</small>' : ''}
            <br><small style="color: #666;">${item.period.start.toLocaleDateString()} - ${item.period.end.toLocaleDateString()}</small>
          </td>
          <td class="text-right">${item.quantity}</td>
          <td class="text-right">${amounts.currency} ${item.unitAmount.toFixed(2)}</td>
          <td class="text-right">${amounts.currency} ${item.amount.toFixed(2)}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="summary">
    <div class="summary-row">
      <span>Subtotal:</span>
      <span>${amounts.currency} ${amounts.subtotal.toFixed(2)}</span>
    </div>
    ${amounts.tax > 0 ? `
      <div class="summary-row">
        <span>Tax:</span>
        <span>${amounts.currency} ${amounts.tax.toFixed(2)}</span>
      </div>
    ` : ''}
    ${amounts.amountPaid > 0 ? `
      <div class="summary-row">
        <span>Amount Paid:</span>
        <span>-${amounts.currency} ${amounts.amountPaid.toFixed(2)}</span>
      </div>
    ` : ''}
    <div class="summary-row total">
      <span>Total ${amounts.amountRemaining > 0 ? 'Due' : ''}:</span>
      <span>${amounts.currency} ${(amounts.amountRemaining || amounts.total).toFixed(2)}</span>
    </div>
  </div>

  <div class="footer">
    <p><strong>Formula Nebula</strong></p>
    <p>Thank you for your business!</p>
    <p style="margin-top: 20px; font-size: 12px; color: #999;">
      Questions? Contact us at support@formulanebula.com
    </p>
  </div>
</body>
</html>
    `.trim();
  }

  /**
   * Generate plain text invoice
   * @param {Object} formattedInvoice - Formatted invoice data
   * @returns {string} Plain text invoice
   */
  static generateText(formattedInvoice) {
    const { customer, amounts, dates, items, number } = formattedInvoice;

    let text = `
═══════════════════════════════════════════════════════════
                     FORMULA NEBULA
                       INVOICE
═══════════════════════════════════════════════════════════

Invoice Number: ${number}
Status: ${formattedInvoice.status.toUpperCase()}

BILL TO:
${customer.name || customer.email}
${customer.email}

INVOICE DETAILS:
Date Issued: ${dates.created.toLocaleDateString()}
${dates.due ? `Due Date: ${dates.due.toLocaleDateString()}` : ''}
${dates.paid ? `Date Paid: ${dates.paid.toLocaleDateString()}` : ''}
Billing Period: ${dates.periodStart.toLocaleDateString()} - ${dates.periodEnd.toLocaleDateString()}

───────────────────────────────────────────────────────────
ITEMS
───────────────────────────────────────────────────────────

`;

    items.forEach(item => {
      text += `${item.description}\n`;
      text += `  Period: ${item.period.start.toLocaleDateString()} - ${item.period.end.toLocaleDateString()}\n`;
      text += `  Quantity: ${item.quantity} × ${amounts.currency} ${item.unitAmount.toFixed(2)} = ${amounts.currency} ${item.amount.toFixed(2)}\n\n`;
    });

    text += `───────────────────────────────────────────────────────────\n`;
    text += `Subtotal:     ${amounts.currency} ${amounts.subtotal.toFixed(2)}\n`;
    if (amounts.tax > 0) {
      text += `Tax:          ${amounts.currency} ${amounts.tax.toFixed(2)}\n`;
    }
    if (amounts.amountPaid > 0) {
      text += `Amount Paid: -${amounts.currency} ${amounts.amountPaid.toFixed(2)}\n`;
    }
    text += `───────────────────────────────────────────────────────────\n`;
    text += `TOTAL ${amounts.amountRemaining > 0 ? 'DUE' : ''}:     ${amounts.currency} ${(amounts.amountRemaining || amounts.total).toFixed(2)}\n`;
    text += `═══════════════════════════════════════════════════════════\n\n`;
    text += `Thank you for your business!\n`;
    text += `Questions? Contact us at support@formulanebula.com\n`;

    return text;
  }

  /**
   * Generate JSON invoice data
   * @param {Object} formattedInvoice - Formatted invoice data
   * @returns {string} JSON string
   */
  static generateJSON(formattedInvoice) {
    return JSON.stringify(formattedInvoice, null, 2);
  }
}

/**
 * Invoice service for business logic
 */
export class InvoiceService {
  /**
   * Get invoice by ID with formatting
   * @param {string} invoiceId - Invoice ID
   * @param {string} format - Output format (html, text, json, object)
   * @returns {Promise<Object>} Formatted invoice
   */
  static async getInvoice(invoiceId, format = 'object') {
    const result = await InvoiceManager.getInvoice(invoiceId);

    if (!result.success) {
      return result;
    }

    const formatted = InvoiceFormatter.formatInvoiceData(result.invoice);

    switch (format) {
      case 'html':
        return {
          success: true,
          invoice: formatted,
          output: InvoiceFormatter.generateHTML(formatted)
        };
      case 'text':
        return {
          success: true,
          invoice: formatted,
          output: InvoiceFormatter.generateText(formatted)
        };
      case 'json':
        return {
          success: true,
          invoice: formatted,
          output: InvoiceFormatter.generateJSON(formatted)
        };
      default:
        return {
          success: true,
          invoice: formatted
        };
    }
  }

  /**
   * Get all invoices for a customer
   * @param {string} customerId - Customer ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} List of invoices
   */
  static async getCustomerInvoices(customerId, options = {}) {
    const { limit = 100, format = 'object' } = options;

    const result = await InvoiceManager.listInvoices(customerId, limit);

    if (!result.success) {
      return result;
    }

    const formattedInvoices = result.invoices.map(invoice =>
      InvoiceFormatter.formatInvoiceData(invoice)
    );

    return {
      success: true,
      invoices: formattedInvoices,
      count: formattedInvoices.length
    };
  }

  /**
   * Get upcoming invoice for a subscription
   * @param {string} customerId - Customer ID
   * @param {string} subscriptionId - Subscription ID
   * @returns {Promise<Object>} Upcoming invoice
   */
  static async getUpcomingInvoice(customerId, subscriptionId) {
    const result = await InvoiceManager.getUpcomingInvoice(customerId, subscriptionId);

    if (!result.success) {
      return result;
    }

    const formatted = InvoiceFormatter.formatInvoiceData(result.invoice);

    return {
      success: true,
      invoice: formatted
    };
  }

  /**
   * Download invoice as PDF
   * @param {string} invoiceId - Invoice ID
   * @returns {Promise<Object>} PDF URL
   */
  static async downloadInvoicePDF(invoiceId) {
    const result = await InvoiceManager.getInvoice(invoiceId);

    if (!result.success) {
      return result;
    }

    return {
      success: true,
      pdfUrl: result.invoice.invoice_pdf,
      hostedUrl: result.invoice.hosted_invoice_url
    };
  }

  /**
   * Generate invoice summary for display
   * @param {Object} invoice - Formatted invoice
   * @returns {Object} Summary data
   */
  static generateInvoiceSummary(invoice) {
    return {
      id: invoice.id,
      number: invoice.number,
      status: invoice.status,
      total: invoice.amounts.total,
      currency: invoice.amounts.currency,
      date: invoice.dates.created,
      dueDate: invoice.dates.due,
      paidDate: invoice.dates.paid,
      isPaid: invoice.status === 'paid',
      isOverdue: invoice.dates.due && new Date() > invoice.dates.due && invoice.status !== 'paid',
      itemCount: invoice.items.length,
      period: {
        start: invoice.dates.periodStart,
        end: invoice.dates.periodEnd
      }
    };
  }
}

export default {
  InvoiceFormatter,
  InvoiceService
};
