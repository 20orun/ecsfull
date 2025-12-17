import React, { useState, useEffect } from 'react';
import { pdf } from '@react-pdf/renderer';
import { supabase } from '../lib/supabase';
import PurchaseOrderPreview from '../components/PurchaseOrderPreview';
import PurchaseOrderPdf from '../components/PurchaseOrderPdf';
import { getPurchaseOrders, getPurchaseOrderById, updatePOStatus } from '../services/purchaseOrderService';
import './PurchaseOrderHistory.css';

const PurchaseOrderHistory = () => {
  const [user, setUser] = useState(null);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewingPO, setViewingPO] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterYear, setFilterYear] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [updatingStatus, setUpdatingStatus] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchPurchaseOrders();
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchPurchaseOrders();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchPurchaseOrders = async () => {
    setLoading(true);
    try {
      const data = await getPurchaseOrders({ limit: 100 });
      setPurchaseOrders(data || []);
    } catch (error) {
      console.error('Error fetching purchase orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewPO = async (po) => {
    try {
      const { purchaseOrder: fullPO, items } = await getPurchaseOrderById(po.id);
      
      const isIntraState = fullPO.place_of_supply === 'Kerala';
      
      const transformedItems = items.map(item => {
        const gstRate = parseFloat(item.gst_rate);
        return {
          description: item.description,
          hsnSacCode: item.hsn_sac_code,
          quantity: parseFloat(item.quantity),
          unit: item.unit || 'Nos',
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

      const poData = {
        poNumber: fullPO.po_number,
        poDate: fullPO.po_date,
        expectedDeliveryDate: fullPO.expected_delivery_date,
        vendorName: fullPO.vendor_name,
        vendorPhone: fullPO.vendor_phone,
        vendorEmail: fullPO.vendor_email,
        vendorGstin: fullPO.vendor_gstin,
        vendorAddress: fullPO.vendor_address,
        deliveryAddress: fullPO.delivery_address,
        placeOfSupply: fullPO.place_of_supply,
        paymentTerms: fullPO.payment_terms,
        deliveryTerms: fullPO.delivery_terms,
        notes: fullPO.notes,
        termsConditions: fullPO.terms_conditions,
        items: transformedItems,
        subtotal: parseFloat(fullPO.subtotal),
        totalCgst: parseFloat(fullPO.total_cgst || 0),
        totalSgst: parseFloat(fullPO.total_sgst || 0),
        totalIgst: parseFloat(fullPO.total_igst || 0),
        totalTaxAmount: parseFloat(fullPO.total_tax_amount || 0),
        grandTotal: parseFloat(fullPO.grand_total),
        isInterState: !isIntraState
      };
      
      setViewingPO(poData);
    } catch (error) {
      console.error('Error loading purchase order:', error);
    }
  };

  const handleStatusChange = async (poId, newStatus) => {
    try {
      setUpdatingStatus(poId);
      await updatePOStatus(poId, newStatus);
      // Refresh the PO list
      await fetchPurchaseOrders();
    } catch (err) {
      console.error('Error updating PO status:', err);
      alert('Failed to update status. Please try again.');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleDownloadPO = async (po) => {
    try {
      const { purchaseOrder: fullPO, items } = await getPurchaseOrderById(po.id);
      
      const isIntraState = fullPO.place_of_supply === 'Kerala';
      
      const transformedItems = items.map(item => {
        const gstRate = parseFloat(item.gst_rate);
        return {
          description: item.description,
          hsnSacCode: item.hsn_sac_code,
          quantity: parseFloat(item.quantity),
          unit: item.unit || 'Nos',
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

      const poData = {
        poNumber: fullPO.po_number,
        poDate: fullPO.po_date,
        expectedDeliveryDate: fullPO.expected_delivery_date,
        vendorName: fullPO.vendor_name,
        vendorPhone: fullPO.vendor_phone,
        vendorEmail: fullPO.vendor_email,
        vendorGstin: fullPO.vendor_gstin,
        vendorAddress: fullPO.vendor_address,
        deliveryAddress: fullPO.delivery_address,
        placeOfSupply: fullPO.place_of_supply,
        paymentTerms: fullPO.payment_terms,
        deliveryTerms: fullPO.delivery_terms,
        notes: fullPO.notes,
        termsConditions: fullPO.terms_conditions,
        items: transformedItems,
        subtotal: parseFloat(fullPO.subtotal),
        totalCgst: parseFloat(fullPO.total_cgst || 0),
        totalSgst: parseFloat(fullPO.total_sgst || 0),
        totalIgst: parseFloat(fullPO.total_igst || 0),
        totalTaxAmount: parseFloat(fullPO.total_tax_amount || 0),
        grandTotal: parseFloat(fullPO.grand_total),
        isInterState: !isIntraState
      };

      const blob = await pdf(<PurchaseOrderPdf poData={poData} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `PO_${fullPO.po_number.replace(/\//g, '-')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading purchase order:', error);
    }
  };

  const filteredPOs = purchaseOrders.filter(po => {
    const matchesSearch = 
      po.po_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.vendor_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesYear = filterYear === 'all' || po.financial_year === filterYear;
    const matchesStatus = filterStatus === 'all' || po.status === filterStatus;
    
    return matchesSearch && matchesYear && matchesStatus;
  });

  const uniqueYears = [...new Set(purchaseOrders.map(po => po.financial_year))].sort().reverse();

  const totalValue = filteredPOs.reduce((sum, po) => sum + parseFloat(po.grand_total || 0), 0);

  if (!user) {
    return (
      <div className="po-history-page">
        <div className="auth-required">
          <h2>Authentication Required</h2>
          <p>Please sign in to view purchase order history.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="po-history-page">
      <div className="history-header">
        <h1>Purchase Order History</h1>
        <p>View and manage all your purchase orders</p>
      </div>

      {/* Stats Bar */}
      <div className="stats-bar">
        <div className="stat-item">
          <span className="stat-label">Total POs</span>
          <span className="stat-value">{filteredPOs.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Total Value</span>
          <span className="stat-value">₹{totalValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by PO number or vendor name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
          >
            <option value="all">All Financial Years</option>
            {uniqueYears.map(year => (
              <option key={year} value={year}>FY {year}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* PO List */}
      <div className="po-list-container">
        {loading ? (
          <div className="loading">Loading purchase orders...</div>
        ) : filteredPOs.length === 0 ? (
          <div className="no-data">
            <p>No purchase orders found.</p>
            {searchTerm && <p>Try adjusting your search criteria.</p>}
          </div>
        ) : (
          <table className="po-table">
            <thead>
              <tr>
                <th>PO Number</th>
                <th>Date</th>
                <th>Vendor</th>
                <th>Status</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPOs.map(po => (
                <tr key={po.id}>
                  <td className="po-number">{po.po_number}</td>
                  <td>{new Date(po.po_date).toLocaleDateString('en-IN')}</td>
                  <td>{po.vendor_name}</td>
                  <td>
                    <select
                      className={`status-select ${po.status || 'draft'}`}
                      value={po.status || 'draft'}
                      onChange={(e) => handleStatusChange(po.id, e.target.value)}
                      disabled={updatingStatus === po.id}
                    >
                      <option value="draft">Draft</option>
                      <option value="sent">Sent</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="amount">₹{parseFloat(po.grand_total).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                  <td className="actions">
                    <button 
                      className="btn-action btn-view" 
                      onClick={() => handleViewPO(po)}
                      title="View PO"
                    >
                      View
                    </button>
                    <button 
                      className="btn-action btn-download" 
                      onClick={() => handleDownloadPO(po)}
                      title="Download PDF"
                    >
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* PO Preview Modal */}
      {viewingPO && (
        <PurchaseOrderPreview 
          poData={viewingPO} 
          onClose={() => setViewingPO(null)} 
        />
      )}
    </div>
  );
};

export default PurchaseOrderHistory;
