import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { supabase } from '../lib/supabase';
import ConfirmedInvoiceForm from '../components/ConfirmedInvoiceForm';
import ConfirmedInvoicePdf from '../components/ConfirmedInvoicePdf';
import ConfirmedInvoicePreview from '../components/ConfirmedInvoicePreview';
import { calculateInvoiceTotals, roundToTwo } from '../utils/invoiceUtils';
import { saveConfirmedInvoice, getConfirmedInvoices, getNextConfirmedInvoiceNumber, getConfirmedInvoiceById, commitNextConfirmedInvoiceNumber } from '../services/confirmedInvoiceService';
import './Invoice.css';

const ConfirmedInvoice = () => {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [savedInvoice, setSavedInvoice] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [, setRecentInvoices] = useState([]);
  const [nextInvoiceNumber, setNextInvoiceNumber] = useState(null);
  const [viewingInvoice, setViewingInvoice] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchRecentInvoices();
        fetchNextInvoiceNumber();
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchRecentInvoices();
        fetchNextInvoiceNumber();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    setSavedInvoice(null);
    setMessage({ type: '', text: '' });
  }, [location.key]);

  const fetchNextInvoiceNumber = async () => {
    try {
      const { invoiceNumber, sequenceNumber, financialYear } = await getNextConfirmedInvoiceNumber();
      setNextInvoiceNumber({ invoiceNumber, sequenceNumber, financialYear });
    } catch (error) {
      console.error('Error fetching next confirmed invoice number:', error);
    }
  };

  const fetchRecentInvoices = async () => {
    try {
      const data = await getConfirmedInvoices({ limit: 5 });
      setRecentInvoices(data || []);
    } catch (error) {
      console.error('Error fetching confirmed invoices:', error);
    }
  };

  const handleFormSubmit = async (formData) => {
    if (!user) {
      setMessage({ type: 'error', text: 'Please sign in to create confirmed invoices' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const isUsdMode = formData.isUsdMode;
      const directUsdEntry = formData.directUsdEntry;
      const exchangeRate = formData.usdRate;

      let calculatedData, finalCalcData;

      if (isUsdMode && directUsdEntry && exchangeRate > 0) {
        // Direct USD entry: user entered prices in USD
        // Convert to INR for DB storage by multiplying by exchange rate
        calculatedData = calculateInvoiceTotals(
          formData.items.map(item => ({
            ...item,
            quantity: parseFloat(item.quantity),
            unitPrice: roundToTwo(parseFloat(item.unitPrice) * exchangeRate),
            gstRate: 0
          })),
          formData.placeOfSupply
        );

        // PDF data in USD (divide back to get original USD values)
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
      } else {
        // Standard flow: user entered prices in INR
        calculatedData = calculateInvoiceTotals(
          formData.items.map(item => ({
            ...item,
            quantity: parseFloat(item.quantity),
            unitPrice: parseFloat(item.unitPrice),
            gstRate: isUsdMode ? 0 : parseFloat(item.gstRate)
          })),
          formData.placeOfSupply
        );

        finalCalcData = calculatedData;
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
      }

      const { invoiceNumber, sequenceNumber } = await commitNextConfirmedInvoiceNumber();

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

      await saveConfirmedInvoice(invoiceData);

      const pdfData = {
        ...formData,
        invoiceNumber: invoiceNumber,
        items: finalCalcData.items,
        ...finalCalcData,
        isUsdMode: isUsdMode || false,
        usdRate: exchangeRate || null
      };

      setSavedInvoice(pdfData);
      setMessage({ type: 'success', text: 'Confirmed invoice saved successfully!' });
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      fetchRecentInvoices();
      fetchNextInvoiceNumber();

    } catch (error) {
      console.error('Error saving confirmed invoice:', error);
      setMessage({ 
        type: 'error', 
        text: error.message || 'Failed to save confirmed invoice. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNewInvoice = () => {
    setSavedInvoice(null);
    setMessage({ type: '', text: '' });
  };

  const handleViewCurrentInvoice = () => {
    if (savedInvoice) {
      setViewingInvoice(savedInvoice);
    }
  };

  // eslint-disable-next-line no-unused-vars
  const handleViewHistoryInvoice = async (invoice) => {
    try {
      const { invoice: fullInvoice, items } = await getConfirmedInvoiceById(invoice.id);
      
      const isIntraState = fullInvoice.place_of_supply === 'Karnataka';
      const isUsd = fullInvoice.currency_mode === 'USD';
      const rate = fullInvoice.exchange_rate ? parseFloat(fullInvoice.exchange_rate) : 1;
      
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
      console.error('Error loading confirmed invoice:', error);
      setMessage({ type: 'error', text: 'Failed to load confirmed invoice details' });
    }
  };

  const handleClosePreview = () => {
    setViewingInvoice(null);
  };

  if (!user) {
    return (
      <div className="invoice-page">
        <div className="auth-required">
          <h2>Authentication Required</h2>
          <p>Please sign in to access the Confirmed Invoice Generator.</p>
          <a href="/login" className="btn-signin">Sign In</a>
        </div>
      </div>
    );
  }

  return (
    <div className="invoice-page">
      <div className="invoice-header">
        <h1>Confirmed Invoice Generator</h1>
        <p>Create GST compliant confirmed invoices for Excel Care Solutions</p>
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
            <h2>Confirmed Invoice Created Successfully!</h2>
            <p>Invoice Number: <strong>{savedInvoice.invoiceNumber}</strong></p>
            <p>Customer: <strong>{savedInvoice.customerName}</strong></p>
            <p>Grand Total: <strong>{savedInvoice.isUsdMode ? '$' : '₹'}{savedInvoice.grandTotal.toFixed(2)}</strong></p>
            
            <div className="success-actions">
              <button className="btn-view" onClick={handleViewCurrentInvoice}>
                View Confirmed Invoice
              </button>
              
              <PDFDownloadLink
                document={<ConfirmedInvoicePdf invoiceData={savedInvoice} />}
                fileName={`Confirmed_Invoice_${savedInvoice.invoiceNumber.replace(/\//g, '_')}.pdf`}
                className="btn-download"
              >
                {({ loading: pdfLoading }) =>
                  pdfLoading ? 'Generating PDF...' : 'Download PDF Confirmed Invoice'
                }
              </PDFDownloadLink>
              
              <button className="btn-new" onClick={handleNewInvoice}>
                Create New Confirmed Invoice
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="invoice-content">
          <div className="form-container">
            <ConfirmedInvoiceForm 
              onSubmit={handleFormSubmit} 
              loading={loading}
              initialInvoiceNumber={nextInvoiceNumber?.invoiceNumber}
            />
          </div>
        </div>
      )}

      {viewingInvoice && (
        <ConfirmedInvoicePreview 
          invoiceData={viewingInvoice} 
          onClose={handleClosePreview} 
        />
      )}
    </div>
  );
};

export default ConfirmedInvoice;
