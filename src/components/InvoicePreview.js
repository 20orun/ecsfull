import React from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { FIRM_CONFIG } from '../config/firmConfig';
import { formatDate, formatNumber, numberToWords } from '../utils/invoiceUtils';
import InvoicePdf from './InvoicePdf';
import './InvoicePreview.css';

const InvoicePreview = ({ invoiceData, onClose }) => {
  const {
    invoiceNumber,
    invoiceDate,
    customerName,
    customerPhone,
    customerAddress,
    customerGstin,
    shippingName,
    shippingPhone,
    shippingAddress,
    placeOfSupply,
    items,
    subtotal,
    grandTotal
  } = invoiceData;

  // Handle both naming conventions (totalCgst/cgst, totalSgst/sgst, etc.)
  const totalCgst = invoiceData.totalCgst ?? invoiceData.cgst ?? 0;
  const totalSgst = invoiceData.totalSgst ?? invoiceData.sgst ?? 0;
  const totalIgst = invoiceData.totalIgst ?? invoiceData.igst ?? 0;
  const totalTaxAmount = invoiceData.totalTaxAmount ?? (totalCgst + totalSgst + totalIgst);

  const isIntraState = placeOfSupply === FIRM_CONFIG.state;

  return (
    <div className="invoice-preview-overlay">
      <div className="invoice-preview-container">
        <div className="invoice-preview-header">
          <h2>Invoice Preview</h2>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>
        
        <div className="invoice-preview-content">
          {/* Company Header */}
          <div className="preview-company-header">
            <div className="preview-company-info">
              <img src="/ecs-logo.png" alt="Logo" className="preview-logo" />
              <div className="preview-company-details">
                <h1>{FIRM_CONFIG.name}</h1>
                <p>{FIRM_CONFIG.address}</p>
                <p>GSTIN: {FIRM_CONFIG.gstin}</p>
                <p>Phone: {FIRM_CONFIG.phone} | Email: {FIRM_CONFIG.email}</p>
                <p>Website: {FIRM_CONFIG.website}</p>
              </div>
            </div>
            <div className="preview-invoice-title">
              <h2>TAX INVOICE</h2>
            </div>
          </div>

          {/* Invoice & Place of Supply Details */}
          <div className="preview-details-row">
            <div className="preview-details-box">
              <h3>Invoice Details</h3>
              <p><strong>Invoice No:</strong> {invoiceNumber}</p>
              <p><strong>Date:</strong> {formatDate(invoiceDate)}</p>
            </div>
            <div className="preview-details-box">
              <h3>Place of Supply</h3>
              <p>{placeOfSupply}</p>
              <p className="tax-type">
                {isIntraState ? 'Intra-State (CGST + SGST)' : 'Inter-State (IGST)'}
              </p>
            </div>
          </div>

          {/* Billing & Shipping Address */}
          <div className="preview-address-row">
            <div className="preview-address-box">
              <h3>Billing Address</h3>
              <p className="address-name">{customerName}</p>
              {customerPhone && <p><strong>Phone:</strong> {customerPhone}</p>}
              <p>{customerAddress}</p>
              {customerGstin && <p><strong>GSTIN:</strong> {customerGstin}</p>}
            </div>
            <div className="preview-address-box">
              <h3>Shipping Address</h3>
              <p className="address-name">{shippingName || customerName}</p>
              {(shippingPhone || customerPhone) && (
                <p><strong>Phone:</strong> {shippingPhone || customerPhone}</p>
              )}
              <p>{shippingAddress || customerAddress}</p>
            </div>
          </div>

          {/* Items Table */}
          <div className="preview-table-container">
            <table className="preview-items-table">
              <thead>
                <tr className="table-header-main">
                  <th rowSpan="2">Sr.</th>
                  <th rowSpan="2">Description</th>
                  <th rowSpan="2">HSN/SAC</th>
                  <th rowSpan="2">Qty</th>
                  <th rowSpan="2">Rate</th>
                  <th rowSpan="2">Taxable Amt</th>
                  {isIntraState ? (
                    <>
                      <th colSpan="2">CGST</th>
                      <th colSpan="2">SGST</th>
                    </>
                  ) : (
                    <th colSpan="2">IGST</th>
                  )}
                  <th rowSpan="2">Total</th>
                </tr>
                <tr className="table-header-sub">
                  {isIntraState ? (
                    <>
                      <th>%</th>
                      <th>Amt</th>
                      <th>%</th>
                      <th>Amt</th>
                    </>
                  ) : (
                    <>
                      <th>%</th>
                      <th>Amt</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'row-even' : 'row-odd'}>
                    <td className="text-center">{index + 1}</td>
                    <td>{item.description}</td>
                    <td className="text-center">{item.hsnSacCode}</td>
                    <td className="text-center">{item.quantity}</td>
                    <td className="text-right">{item.unitPrice.toFixed(2)}</td>
                    <td className="text-right">{item.taxableValue.toFixed(2)}</td>
                    {isIntraState ? (
                      <>
                        <td className="text-right">{item.cgstRate.toFixed(2)}</td>
                        <td className="text-right">{item.cgstAmount.toFixed(2)}</td>
                        <td className="text-right">{item.sgstRate.toFixed(2)}</td>
                        <td className="text-right">{item.sgstAmount.toFixed(2)}</td>
                      </>
                    ) : (
                      <>
                        <td className="text-right">{item.igstRate.toFixed(2)}</td>
                        <td className="text-right">{item.igstAmount.toFixed(2)}</td>
                      </>
                    )}
                    <td className="text-right">{item.totalAmount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="preview-totals-section">
            <div className="preview-amount-words">
              <p><strong>Amount in Words:</strong></p>
              <p>{numberToWords(grandTotal)}</p>
            </div>
            <div className="preview-totals-box">
              <div className="total-row">
                <span>Subtotal:</span>
                <span>₹{formatNumber(subtotal)}</span>
              </div>
              {isIntraState ? (
                <>
                  <div className="total-row">
                    <span>CGST:</span>
                    <span>₹{formatNumber(totalCgst)}</span>
                  </div>
                  <div className="total-row">
                    <span>SGST:</span>
                    <span>₹{formatNumber(totalSgst)}</span>
                  </div>
                </>
              ) : (
                <div className="total-row">
                  <span>IGST:</span>
                  <span>₹{formatNumber(totalIgst)}</span>
                </div>
              )}
              <div className="total-row">
                <span>Total Tax:</span>
                <span>₹{formatNumber(totalTaxAmount)}</span>
              </div>
              <div className="total-row grand-total">
                <span>Grand Total:</span>
                <span>₹{formatNumber(grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="preview-footer">
            <div className="preview-signature">
              <div className="signature-line"></div>
              <p>Authorised Signatory</p>
              <p className="company-name">For {FIRM_CONFIG.name}</p>
            </div>
          </div>

          <div className="preview-jurisdiction">
            Subject to {FIRM_CONFIG.jurisdiction} Jurisdiction. This is a computer generated invoice.
          </div>

          {/* Action Buttons */}
          <div className="preview-actions">
            <PDFDownloadLink
              document={<InvoicePdf invoiceData={invoiceData} />}
              fileName={`Invoice_${invoiceNumber.replace(/\//g, '_')}.pdf`}
              className="btn-preview-download"
            >
              {({ loading: pdfLoading }) =>
                pdfLoading ? 'Generating PDF...' : 'Download PDF'
              }
            </PDFDownloadLink>
            <button className="btn-preview-close" onClick={onClose}>
              Close Preview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePreview;
