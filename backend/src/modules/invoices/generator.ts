import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { writeAuditLog } from "../../middleware/observability.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const invoiceStorageDir = path.join(__dirname, "../../../storage/invoices");

if (!fs.existsSync(invoiceStorageDir)) {
  fs.mkdirSync(invoiceStorageDir, { recursive: true });
}

export interface InvoiceItem {
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface InvoiceData {
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  depositAmount: number;
  taxAmount: number;
  totalAmount: number;
}

/**
 * Generates a clean HTML representation of the invoice.
 * Exposed downloadable format for the Hackathon.
 */
export async function generateInvoiceHTML(rentalId: string, data: InvoiceData): Promise<string> {
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${data.invoiceNumber}</title>
  <style>
    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      color: #333;
      margin: 0;
      padding: 40px;
      background-color: #f1f5f9;
    }
    .invoice-card {
      max-width: 800px;
      margin: 0 auto;
      background: #ffffff;
      padding: 40px;
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
    .invoice-header {
      display: flex;
      justify-content: space-between;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .company-details h1 {
      margin: 0 0 10px 0;
      font-size: 24px;
      color: #0f172a;
    }
    .invoice-details {
      text-align: right;
    }
    .invoice-details h2 {
      margin: 0 0 10px 0;
      font-size: 28px;
      color: #3b82f6;
    }
    .details-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 40px;
    }
    .bill-to h3, .ship-to h3 {
      margin: 0 0 10px 0;
      font-size: 14px;
      text-transform: uppercase;
      color: #64748b;
    }
    .bill-to p, .ship-to p {
      margin: 0 0 5px 0;
      font-size: 16px;
      line-height: 1.5;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }
    th {
      background-color: #f8fafc;
      color: #64748b;
      font-weight: 600;
      text-align: left;
      padding: 12px;
      border-bottom: 2px solid #e2e8f0;
    }
    td {
      padding: 12px;
      border-bottom: 1px solid #e2e8f0;
    }
    .totals {
      display: flex;
      justify-content: flex-end;
    }
    .totals-table {
      width: 300px;
      margin-bottom: 0;
    }
    .totals-table td {
      border: none;
      padding: 8px 12px;
    }
    .totals-table tr.grand-total {
      font-size: 18px;
      font-weight: bold;
      color: #0f172a;
      border-top: 2px solid #e2e8f0;
    }
    .footer {
      margin-top: 50px;
      text-align: center;
      color: #94a3b8;
      font-size: 12px;
      border-top: 1px solid #e2e8f0;
      padding-top: 20px;
    }
  </style>
</head>
<body>
  <div class="invoice-card">
    <div class="invoice-header">
      <div class="company-details">
        <h1>Rental Management Inc.</h1>
        <p>123 Operational Way<br>Suite 400<br>San Francisco, CA 94107</p>
      </div>
      <div class="invoice-details">
        <h2>INVOICE</h2>
        <p><strong>Invoice #:</strong> ${data.invoiceNumber}<br>
        <strong>Date:</strong> ${data.issueDate}<br>
        <strong>Due Date:</strong> ${data.dueDate}</p>
      </div>
    </div>
    
    <div class="details-grid">
      <div class="bill-to">
        <h3>Bill To:</h3>
        <p><strong>${data.customerName}</strong><br>
        Email: ${data.customerEmail}</p>
      </div>
      <div class="ship-to">
        <h3>Rental Period:</h3>
        <p><strong>Start:</strong> ${data.issueDate}<br>
        <strong>End:</strong> ${data.dueDate}</p>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Item Description</th>
          <th style="text-align: center;">Qty</th>
          <th style="text-align: right;">Unit Price</th>
          <th style="text-align: right;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${data.items
          .map(
            (item) => `
        <tr>
          <td>${item.name}</td>
          <td style="text-align: center;">${item.quantity}</td>
          <td style="text-align: right;">$${item.unitPrice.toFixed(2)}</td>
          <td style="text-align: right;">$${item.total.toFixed(2)}</td>
        </tr>
        `
          )
          .join("")}
      </tbody>
    </table>

    <div class="totals">
      <table class="totals-table">
        <tr>
          <td>Subtotal:</td>
          <td style="text-align: right;">$${data.subtotal.toFixed(2)}</td>
        </tr>
        <tr>
          <td>Security Deposit (Refundable):</td>
          <td style="text-align: right;">$${data.depositAmount.toFixed(2)}</td>
        </tr>
        <tr>
          <td>Tax (8.25%):</td>
          <td style="text-align: right;">$${data.taxAmount.toFixed(2)}</td>
        </tr>
        <tr class="grand-total">
          <td>Grand Total:</td>
          <td style="text-align: right;">$${data.totalAmount.toFixed(2)}</td>
        </tr>
      </table>
    </div>

    <div class="footer">
      <p>Thank you for renting with us! If you have any questions, please contact billing@rentalmanagement.com</p>
    </div>
  </div>
</body>
</html>
  `;

  const filePath = path.join(invoiceStorageDir, `invoice-${rentalId}.html`);
  fs.writeFileSync(filePath, htmlContent);
  
  writeAuditLog("INVOICE_GENERATED", "SYSTEM", { rentalId, invoiceNumber: data.invoiceNumber, filePath });

  return filePath;
}
