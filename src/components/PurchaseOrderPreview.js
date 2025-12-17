import React from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { FIRM_CONFIG } from '../config/firmConfig';
import { formatDate, formatNumber, numberToWords } from '../utils/purchaseOrderUtils';
import PurchaseOrderPdf from './PurchaseOrderPdf';
import './PurchaseOrderPreview.css';

const PurchaseOrderPreview = ({ poData, onClose }) => {
  const {
    poNumber,
    poDate,
    expectedDeliveryDate,
    vendorName,
    vendorPhone,
    vendorEmail,
    vendorAddress,
    vendorGstin,
    deliveryAddress,
    placeOfSupply,
    paymentTerms,
    deliveryTerms,
    notes,
    termsConditions,
    items,
    subtotal,
    grandTotal
  } = poData;

  const totalCgst = poData.totalCgst ?? 0;
  const totalSgst = poData.totalSgst ?? 0;
  const totalIgst = poData.totalIgst ?? 0;
  const totalTaxAmount = poData.totalTaxAmount ?? (totalCgst + totalSgst + totalIgst);

  const isIntraState = placeOfSupply === FIRM_CONFIG.state;
  const termsArray = termsConditions ? termsConditions.split('\n').filter(t => t.trim()) : [];

  return (
    <div className="po-preview-overlay">
      <div className="po-preview-container">
        <div className="po-preview-header">
          <h2>Purchase Order Preview</h2>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>
        
        <div className="po-preview-content">
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
            <div className="preview-po-title">
              <h2>PURCHASE ORDER</h2>
            </div>
          </div>

          {/* PO & Place of Supply Details */}
          <div className="preview-details-row">
            <div className="preview-details-box">
              <h3>PO Details</h3>
              <p><strong>PO No:</strong> {poNumber}</p>
              <p><strong>Date:</strong> {formatDate(poDate)}</p>
              {expectedDeliveryDate && (
                <p><strong>Expected Delivery:</strong> {formatDate(expectedDeliveryDate)}</p>
              )}
              {paymentTerms && <p><strong>Payment Terms:</strong> {paymentTerms}</p>}
              {deliveryTerms && <p><strong>Delivery Terms:</strong> {deliveryTerms}</p>}
            </div>
            <div className="preview-details-box">
              <h3>Place of Supply</h3>
              <p>{placeOfSupply}</p>
              <p className="tax-type">
                {isIntraState ? 'Intra-State (CGST + SGST)' : 'Inter-State (IGST)'}
              </p>
            </div>
          </div>

          {/* Vendor & Delivery Address */}
          <div className="preview-address-row">
            <div className="preview-address-box">
              <h3>Vendor Details</h3>
              <p className="address-name">{vendorName}</p>
              {vendorPhone && <p><strong>Phone:</strong> {vendorPhone}</p>}
              {vendorEmail && <p><strong>Email:</strong> {vendorEmail}</p>}
              {vendorGstin && <p><strong>GSTIN:</strong> {vendorGstin}</p>}
              <p>{vendorAddress}</p>
            </div>
            <div className="preview-address-box">
              <h3>Delivery Address</h3>
              <p>{deliveryAddress || FIRM_CONFIG.address}</p>
            </div>
          </div>

          {/* Items Table */}
          <div className="preview-items-section">
            <h3>Items / Services</h3>
            <table className="preview-items-table">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Description</th>
                  <th>HSN/SAC</th>
                  <th>Qty</th>
                  <th>Unit</th>
                  <th>Rate (₹)</th>
                  <th>Taxable</th>
                  <th>GST %</th>
                  {isIntraState ? (
                    <>
                      <th>CGST</th>
                      <th>SGST</th>
                    </>
                  ) : (
                    <th>IGST</th>
                  )}
                  <th>Total (₹)</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{item.description}</td>
                    <td>{item.hsnSacCode || '-'}</td>
                    <td>{item.quantity}</td>
                    <td>{item.unit || 'Nos'}</td>
                    <td className="text-right">{formatNumber(item.unitPrice)}</td>
                    <td className="text-right">{formatNumber(item.taxableValue)}</td>
                    <td className="text-center">{item.gstRate}%</td>
                    {isIntraState ? (
                      <>
                        <td className="text-right">{formatNumber(item.cgstAmount || 0)}</td>
                        <td className="text-right">{formatNumber(item.sgstAmount || 0)}</td>
                      </>
                    ) : (
                      <td className="text-right">{formatNumber(item.igstAmount || 0)}</td>
                    )}
                    <td className="text-right">{formatNumber(item.totalAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="preview-totals-section">
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

          {/* Amount in Words */}
          <div className="preview-amount-words">
            <strong>Amount in Words:</strong> {numberToWords(grandTotal)}
          </div>

          {/* Notes */}
          {notes && (
            <div className="preview-notes">
              <h3>Notes:</h3>
              <p>{notes}</p>
            </div>
          )}

          {/* Terms & Conditions */}
          {termsArray.length > 0 && (
            <div className="preview-terms">
              <h3>Terms & Conditions:</h3>
              <ul>
                {termsArray.map((term, index) => (
                  <li key={index}>{term}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Signature Section */}
          <div className="preview-signature-section">
            <div className="signature-box">
              <div className="signature-line"></div>
              <p>Vendor's Acceptance</p>
            </div>
            <div className="signature-box">
              <div className="signature-line"></div>
              <p>For {FIRM_CONFIG.name}</p>
              <p className="small">Authorized Signatory</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="po-preview-actions">
          <button onClick={onClose} className="btn-secondary">Close</button>
          <PDFDownloadLink
            document={<PurchaseOrderPdf poData={poData} />}
            fileName={`PO_${poNumber.replace(/\//g, '-')}.pdf`}
            className="btn-primary"
          >
            {({ blob, url, loading, error }) =>
              loading ? 'Generating PDF...' : 'Download PDF'
            }
          </PDFDownloadLink>
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrderPreview;
