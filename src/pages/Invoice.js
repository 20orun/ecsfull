import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { supabase } from '../lib/supabase';
import InvoiceForm from '../components/InvoiceForm';
import InvoicePdf from '../components/InvoicePdf';
import InvoicePreview from '../components/InvoicePreview';
import { calculateInvoiceTotals, roundToTwo } from '../utils/invoiceUtils';
import { saveInvoice, getInvoices, getNextInvoiceNumber, getInvoiceById, commitNextInvoiceNumber } from '../services/invoiceService';
import './Invoice.css';

const Invoice = () => {
  const location = useLocation();
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

  // Reset to form view when navigating to this page via nav link
  useEffect(() => {
    setSavedInvoice(null);
    setMessage({ type: '', text: '' });
  }, [location.key]);

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
      const isUsdMode = formData.isUsdMode;
      const exchangeRate = formData.usdRate;

      // Calculate totals with proper item calculations
      const calculatedData = calculateInvoiceTotals(
        formData.items.map(item => ({
          ...item,
          quantity: parseFloat(item.quantity),
          unitPrice: parseFloat(item.unitPrice),
          gstRate: isUsdMode ? 0 : parseFloat(item.gstRate)
        })),
        formData.placeOfSupply
      );

      // Convert to USD if in USD mode
      let finalCalcData = calculatedData;
      if (isUsdMode && exchangeRate > 0) {
        finalCalcData = {
          ...calculatedData,
          items: calculatedData.items.map(item => ({
            ...item,
            unitPrice: roundToTwo(item.unitPrice / exchangeRate),
            taxableValue: roundToTwo(item.taxableValue / exchangeRate),
            totalAmount: roundToTwo(item.taxableValue / exchangeRate),
            cgstAmount: 0, sgstAmount: 0, igstAmount: 0,
            cgstRate: 0, sgstRate: 0, igstRate: 0
          })),
          subtotal: roundToTwo(calculatedData.subtotal / exchangeRate),
          totalCgst: 0, totalSgst: 0, totalIgst: 0,
          totalTaxAmount: 0,
          grandTotal: roundToTwo(calculatedData.subtotal / exchangeRate)
        };
      }

      // Commit the invoice number (this increments the sequence atomically)
      const { invoiceNumber, sequenceNumber } = await commitNextInvoiceNumber();

      // Prepare complete invoice data with committed invoice number
      // Always store INR values in the database
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
        currencyMode: isUsdMode ? 'USD' : 'INR',
        exchangeRate: isUsdMode ? exchangeRate : null,
        items: calculatedData.items,
        ...calculatedData
      };

      // Save to Supabase using the service
      await saveInvoice(invoiceData);

      // Prepare data for PDF with the committed invoice number
      const pdfData = {
        ...formData,
        invoiceNumber: invoiceNumber,
        items: finalCalcData.items,
        ...finalCalcData,
        isUsdMode: isUsdMode || false,
        usdRate: exchangeRate || null
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
      const isUsd = fullInvoice.currency_mode === 'USD';
      const rate = fullInvoice.exchange_rate ? parseFloat(fullInvoice.exchange_rate) : 1;
      
      // DB stores INR values; convert to USD for display if needed
      const transformedItems = items.map(item => {
        const gstRate = parseFloat(item.gst_rate);
        const unitPrice = parseFloat(item.unit_price);
        const taxableValue = parseFloat(item.taxable_value);
        const totalAmount = parseFloat(item.total_amount);
        return {
          description: item.description,
          hsnSacCode: item.hsn_sac_code,
          quantity: parseFloat(item.quantity),
          unitPrice: isUsd ? roundToTwo(unitPrice / rate) : unitPrice,
          taxableValue: isUsd ? roundToTwo(taxableValue / rate) : taxableValue,
          gstRate: gstRate,
          cgstRate: isUsd ? 0 : (isIntraState ? gstRate / 2 : 0),
          sgstRate: isUsd ? 0 : (isIntraState ? gstRate / 2 : 0),
          igstRate: isUsd ? 0 : (isIntraState ? 0 : gstRate),
          cgstAmount: isUsd ? 0 : parseFloat(item.cgst_amount || 0),
          sgstAmount: isUsd ? 0 : parseFloat(item.sgst_amount || 0),
          igstAmount: isUsd ? 0 : parseFloat(item.igst_amount || 0),
          totalAmount: isUsd ? roundToTwo(taxableValue / rate) : totalAmount
        };
      });

      const subtotal = parseFloat(fullInvoice.subtotal);
      const grandTotal = parseFloat(fullInvoice.grand_total);

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
        isUsdMode: isUsd,
        usdRate: isUsd ? rate : null,
        items: transformedItems,
        subtotal: isUsd ? roundToTwo(subtotal / rate) : subtotal,
        totalCgst: isUsd ? 0 : parseFloat(fullInvoice.total_cgst || 0),
        totalSgst: isUsd ? 0 : parseFloat(fullInvoice.total_sgst || 0),
        totalIgst: isUsd ? 0 : parseFloat(fullInvoice.total_igst || 0),
        totalTaxAmount: isUsd ? 0 : parseFloat(fullInvoice.total_tax_amount || 0),
        grandTotal: isUsd ? roundToTwo(subtotal / rate) : grandTotal,
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
            <p>Grand Total: <strong>{savedInvoice.isUsdMode ? '$' : '₹'}{savedInvoice.grandTotal.toFixed(2)}</strong></p>
            
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
