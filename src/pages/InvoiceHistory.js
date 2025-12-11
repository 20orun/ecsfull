import React, { useState, useEffect } from 'react';
import { pdf } from '@react-pdf/renderer';
import { supabase } from '../lib/supabase';
import InvoicePreview from '../components/InvoicePreview';
import InvoicePdf from '../components/InvoicePdf';
import { getInvoices, getInvoiceById } from '../services/invoiceService';
import './InvoiceHistory.css';

const InvoiceHistory = () => {
  const [user, setUser] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewingInvoice, setViewingInvoice] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterYear, setFilterYear] = useState('all');

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchInvoices();
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchInvoices();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const data = await getInvoices({ limit: 100 });
      setInvoices(data || []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewInvoice = async (invoice) => {
    try {
      const { invoice: fullInvoice, items } = await getInvoiceById(invoice.id);
      
      const isIntraState = fullInvoice.place_of_supply === 'Karnataka';
      
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
    }
  };

  const handleClosePreview = () => {
    setViewingInvoice(null);
  };

  const handleDownloadInvoice = async (invoice) => {
    try {
      const { invoice: fullInvoice, items } = await getInvoiceById(invoice.id);
      
      const isIntraState = fullInvoice.place_of_supply === 'Karnataka';
      
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

      // Generate PDF blob and trigger download
      const blob = await pdf(<InvoicePdf invoiceData={invoiceData} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Invoice_${fullInvoice.invoice_number.replace(/\//g, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading invoice:', error);
    }
  };

  // Get unique financial years from invoices
  const financialYears = [...new Set(invoices.map(inv => inv.financial_year))].sort().reverse();

  // Filter invoices
  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customer_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesYear = filterYear === 'all' || invoice.financial_year === filterYear;
    return matchesSearch && matchesYear;
  });

  // If not logged in, show login prompt
  if (!user) {
    return (
      <div className="invoice-history-page">
        <div className="auth-required">
          <h2>Authentication Required</h2>
          <p>Please sign in to view invoice history.</p>
          <a href="/login" className="btn-signin">Sign In</a>
        </div>
      </div>
    );
  }

  return (
    <div className="invoice-history-page">
      <div className="history-header">
        <h1>Invoice History</h1>
        <p>View and manage all generated invoices</p>
      </div>

      <div className="history-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by invoice number or customer name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-box">
          <select 
            value={filterYear} 
            onChange={(e) => setFilterYear(e.target.value)}
          >
            <option value="all">All Financial Years</option>
            {financialYears.map(year => (
              <option key={year} value={year}>FY {year}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="history-stats">
        <div className="stat-card">
          <span className="stat-value">{filteredInvoices.length}</span>
          <span className="stat-label">Total Invoices</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">
            ₹{filteredInvoices.reduce((sum, inv) => sum + parseFloat(inv.grand_total), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
          <span className="stat-label">Total Revenue</span>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <p>Loading invoices...</p>
        </div>
      ) : filteredInvoices.length === 0 ? (
        <div className="empty-state">
          <p>No invoices found.</p>
        </div>
      ) : (
        <div className="invoices-table-container">
          <table className="invoices-table">
            <thead>
              <tr>
                <th>Invoice No.</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map(invoice => (
                <tr key={invoice.id}>
                  <td className="invoice-number">{invoice.invoice_number}</td>
                  <td>{new Date(invoice.invoice_date).toLocaleDateString('en-IN')}</td>
                  <td>{invoice.customer_name}</td>
                  <td className="amount">₹{parseFloat(invoice.grand_total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td className="actions-cell">
                    <button 
                      className="btn-view"
                      onClick={() => handleViewInvoice(invoice)}
                    >
                      View
                    </button>
                    <button 
                      className="btn-download"
                      onClick={() => handleDownloadInvoice(invoice)}
                    >
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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

export default InvoiceHistory;
