import React, { useState, useEffect } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { supabase } from '../lib/supabase';
import InvoiceForm from '../components/InvoiceForm';
import InvoicePdf from '../components/InvoicePdf';
import InvoicePreview from '../components/InvoicePreview';
import { calculateInvoiceTotals } from '../utils/invoiceUtils';
import { saveInvoice, getInvoices, getNextInvoiceNumber, getInvoiceById, commitNextInvoiceNumber } from '../services/invoiceService';
import './Invoice.css';

const Invoice = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [savedInvoice, setSavedInvoice] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [nextInvoiceNumber, setNextInvoiceNumber] = useState(null);
  const [viewingInvoice, setViewingInvoice] = useState(null);

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchRecentInvoices();
        fetchNextInvoiceNumber();
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchRecentInvoices();
        fetchNextInvoiceNumber();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchNextInvoiceNumber = async () => {
    try {
      const { invoiceNumber, sequenceNumber, financialYear } = await getNextInvoiceNumber();
      setNextInvoiceNumber({ invoiceNumber, sequenceNumber, financialYear });
    } catch (error) {
      console.error('Error fetching next invoice number:', error);
      // Fallback will be handled by the form's default value
    }
  };

  const fetchRecentInvoices = async () => {
    try {
      const data = await getInvoices({ limit: 5 });
      setRecentInvoices(data || []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    }
  };

  const handleFormSubmit = async (formData) => {
    if (!user) {
      setMessage({ type: 'error', text: 'Please sign in to create invoices' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Calculate totals with proper item calculations
      const calculatedData = calculateInvoiceTotals(
        formData.items.map(item => ({
          ...item,
          quantity: parseFloat(item.quantity),
          unitPrice: parseFloat(item.unitPrice),
          gstRate: parseFloat(item.gstRate)
        })),
        formData.placeOfSupply
      );

      // Commit the invoice number (this increments the sequence atomically)
      const { invoiceNumber, sequenceNumber } = await commitNextInvoiceNumber();

      // Prepare complete invoice data with committed invoice number
      const invoiceData = {
        invoiceNumber: invoiceNumber,
        sequenceNumber: sequenceNumber,
        invoiceDate: formData.invoiceDate,
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerGstin: formData.customerGstin,
        customerAddress: formData.customerAddress,
        shippingName: formData.shippingName,
        shippingPhone: formData.shippingPhone,
        shippingAddress: formData.shippingAddress,
        placeOfSupply: formData.placeOfSupply,
        items: calculatedData.items,
        ...calculatedData
      };

      // Save to Supabase using the service
      await saveInvoice(invoiceData);

      // Prepare data for PDF with the committed invoice number
      const pdfData = {
        ...formData,
        invoiceNumber: invoiceNumber,
        items: calculatedData.items,
        ...calculatedData
      };

      setSavedInvoice(pdfData);
      setMessage({ type: 'success', text: 'Invoice saved successfully!' });
      
      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // Refresh data
      fetchRecentInvoices();
      fetchNextInvoiceNumber();

    } catch (error) {
      console.error('Error saving invoice:', error);
      setMessage({ 
        type: 'error', 
        text: error.message || 'Failed to save invoice. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNewInvoice = () => {
    setSavedInvoice(null);
    setMessage({ type: '', text: '' });
  };

  // View current saved invoice
  const handleViewCurrentInvoice = () => {
    if (savedInvoice) {
      setViewingInvoice(savedInvoice);
    }
  };

  // View invoice from history
  const handleViewHistoryInvoice = async (invoice) => {
    try {
      // Fetch full invoice data including items
      const { invoice: fullInvoice, items } = await getInvoiceById(invoice.id);
      
      const isIntraState = fullInvoice.place_of_supply === 'Karnataka';
      
      // Transform items to match expected format
      const transformedItems = items.map(item => {
        const gstRate = parseFloat(item.gst_rate);
        return {
          description: item.description,
          hsnSacCode: item.hsn_sac_code,
          quantity: parseFloat(item.quantity),
          unitPrice: parseFloat(item.unit_price),
          taxableValue: parseFloat(item.taxable_value),
          gstRate: gstRate,
          cgstRate: isIntraState ? gstRate / 2 : 0,
          sgstRate: isIntraState ? gstRate / 2 : 0,
          igstRate: isIntraState ? 0 : gstRate,
          cgstAmount: parseFloat(item.cgst_amount || 0),
          sgstAmount: parseFloat(item.sgst_amount || 0),
          igstAmount: parseFloat(item.igst_amount || 0),
          totalAmount: parseFloat(item.total_amount)
        };
      });

      // Transform data to match the format expected by InvoicePreview
      const invoiceData = {
        invoiceNumber: fullInvoice.invoice_number,
        invoiceDate: fullInvoice.invoice_date,
        customerName: fullInvoice.customer_name,
        customerPhone: fullInvoice.customer_phone,
        customerGstin: fullInvoice.customer_gstin,
        customerAddress: fullInvoice.customer_address,
        shippingName: fullInvoice.shipping_name,
        shippingPhone: fullInvoice.shipping_phone,
        shippingAddress: fullInvoice.shipping_address,
        placeOfSupply: fullInvoice.place_of_supply,
        items: transformedItems,
        subtotal: parseFloat(fullInvoice.subtotal),
        totalCgst: parseFloat(fullInvoice.total_cgst || 0),
        totalSgst: parseFloat(fullInvoice.total_sgst || 0),
        totalIgst: parseFloat(fullInvoice.total_igst || 0),
        totalTaxAmount: parseFloat(fullInvoice.total_tax_amount || 0),
        grandTotal: parseFloat(fullInvoice.grand_total),
        isInterState: !isIntraState
      };
      
      setViewingInvoice(invoiceData);
    } catch (error) {
      console.error('Error loading invoice:', error);
      setMessage({ type: 'error', text: 'Failed to load invoice details' });
    }
  };

  // Close preview
  const handleClosePreview = () => {
    setViewingInvoice(null);
  };

  // If not logged in, show login prompt
  if (!user) {
    return (
      <div className="invoice-page">
        <div className="auth-required">
          <h2>Authentication Required</h2>
          <p>Please sign in to access the Invoice Generator.</p>
          <a href="/login" className="btn-signin">Sign In</a>
        </div>
      </div>
    );
  }

  return (
    <div className="invoice-page">
      <div className="invoice-header">
        <h1>Invoice Generator</h1>
        <p>Create GST compliant invoices for Excel Care Solutions</p>
      </div>

      {message.text && (
        <div className={`invoice-message ${message.type}`}>
          {message.text}
        </div>
      )}

      {savedInvoice ? (
        <div className="invoice-success">
          <div className="success-content">
            <div className="success-icon">✓</div>
            <h2>Invoice Created Successfully!</h2>
            <p>Invoice Number: <strong>{savedInvoice.invoiceNumber}</strong></p>
            <p>Customer: <strong>{savedInvoice.customerName}</strong></p>
            <p>Grand Total: <strong>₹{savedInvoice.grandTotal.toFixed(2)}</strong></p>
            
            <div className="success-actions">
              <button className="btn-view" onClick={handleViewCurrentInvoice}>
                View Invoice
              </button>
              
              <PDFDownloadLink
                document={<InvoicePdf invoiceData={savedInvoice} />}
                fileName={`Invoice_${savedInvoice.invoiceNumber.replace(/\//g, '_')}.pdf`}
                className="btn-download"
              >
                {({ loading: pdfLoading }) =>
                  pdfLoading ? 'Generating PDF...' : 'Download PDF Invoice'
                }
              </PDFDownloadLink>
              
              <button className="btn-new" onClick={handleNewInvoice}>
                Create New Invoice
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="invoice-content">
          <div className="form-container">
            <InvoiceForm 
              onSubmit={handleFormSubmit} 
              loading={loading}
              initialInvoiceNumber={nextInvoiceNumber?.invoiceNumber}
            />
          </div>
          
          {recentInvoices.length > 0 && (
            <div className="recent-invoices">
              <h3>Recent Invoices</h3>
              <ul>
                {recentInvoices.map(invoice => (
                  <li key={invoice.id}>
                    <span className="invoice-num">{invoice.invoice_number}</span>
                    <span className="invoice-customer">{invoice.customer_name}</span>
                    <span className="invoice-amount">₹{parseFloat(invoice.grand_total).toFixed(2)}</span>
                    <button 
                      className="btn-view-small" 
                      onClick={() => handleViewHistoryInvoice(invoice)}
                      title="View Invoice"
                    >
                      View
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Invoice Preview Modal */}
      {viewingInvoice && (
        <InvoicePreview 
          invoiceData={viewingInvoice} 
          onClose={handleClosePreview} 
        />
      )}
    </div>
  );
};

export default Invoice;
