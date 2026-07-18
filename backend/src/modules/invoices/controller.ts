import { Request, Response } from "express";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { generateInvoiceHTML, InvoiceData } from "./generator.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const invoiceStorageDir = path.join(__dirname, "../../../storage/invoices");

/**
 * Endpoint: GET /api/v1/rentals/:rentalId/invoice
 * Returns invoice HTML for view/download.
 */
export async function downloadInvoice(req: Request, res: Response): Promise<void> {
  const { rentalId } = req.params;
  const filePath = path.join(invoiceStorageDir, `invoice-${rentalId}.html`);

  // Check if file exists. If not, generate mock/stub details so the demo script doesn't break
  if (!fs.existsSync(filePath)) {
    console.log(`[Invoice] Invoice file not found for rental ${rentalId}. Generating mock invoice...`);
    
    const mockData: InvoiceData = {
      invoiceNumber: `INV-${rentalId.substring(0, 6).toUpperCase()}-${Date.now().toString().slice(-4)}`,
      customerName: "Jane Doe (Demo Customer)",
      customerEmail: "jane.doe@example.com",
      issueDate: new Date().toLocaleDateString(),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      items: [
        { name: "DeWalt Heavy Duty Rotary Hammer Drill", quantity: 1, unitPrice: 45.00, total: 45.00 },
        { name: "Extension Cord 50ft Outdoor", quantity: 1, unitPrice: 5.00, total: 5.00 }
      ],
      subtotal: 50.00,
      depositAmount: 150.00,
      taxAmount: 4.13,
      totalAmount: 204.13
    };

    try {
      await generateInvoiceHTML(rentalId, mockData);
    } catch (err) {
      console.error("Failed to generate mock invoice HTML", err);
      res.status(500).json({
        success: false,
        error: { code: "INVOICE_GEN_ERROR", message: "Failed to generate invoice file" }
      });
      return;
    }
  }

  // Send the file
  res.setHeader("Content-Type", "text/html");
  res.sendFile(filePath);
}
