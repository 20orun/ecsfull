import React, { useState, useEffect } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { supabase } from '../lib/supabase';
import PurchaseOrderForm from '../components/PurchaseOrderForm';
import PurchaseOrderPdf from '../components/PurchaseOrderPdf';
import PurchaseOrderPreview from '../components/PurchaseOrderPreview';
import { calculatePOTotals } from '../utils/purchaseOrderUtils';
import { savePurchaseOrder, getPurchaseOrders, getNextPONumber, getPurchaseOrderById, commitNextPONumber } from '../services/purchaseOrderService';
import './PurchaseOrder.css';

const PurchaseOrder = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [savedPO, setSavedPO] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [recentPOs, setRecentPOs] = useState([]);
  const [nextPONumber, setNextPONumber] = useState(null);
  const [viewingPO, setViewingPO] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchRecentPOs();
        fetchNextPONumber();
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchRecentPOs();
        fetchNextPONumber();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchNextPONumber = async () => {
    try {
      const { poNumber, sequenceNumber, financialYear } = await getNextPONumber();
      setNextPONumber({ poNumber, sequenceNumber, financialYear });
    } catch (error) {
      console.error('Error fetching next PO number:', error);
    }
  };

  const fetchRecentPOs = async () => {
    try {
      const data = await getPurchaseOrders({ limit: 5 });
      setRecentPOs(data || []);
    } catch (error) {
      console.error('Error fetching purchase orders:', error);
    }
  };

  const handleFormSubmit = async (formData) => {
    if (!user) {
      setMessage({ type: 'error', text: 'Please sign in to create purchase orders' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const calculatedData = calculatePOTotals(
        formData.items.map(item => ({
          ...item,
          quantity: parseFloat(item.quantity),
          unitPrice: parseFloat(item.unitPrice),
          gstRate: parseFloat(item.gstRate)
        })),
        formData.placeOfSupply
      );

      const { poNumber, sequenceNumber } = await commitNextPONumber();

      const poData = {
        poNumber: poNumber,
        sequenceNumber: sequenceNumber,
        poDate: formData.poDate,
        expectedDeliveryDate: formData.expectedDeliveryDate,
        vendorName: formData.vendorName,
        vendorPhone: formData.vendorPhone,
        vendorEmail: formData.vendorEmail,
        vendorGstin: formData.vendorGstin,
        vendorAddress: formData.vendorAddress,
        deliveryAddress: formData.deliveryAddress,
        placeOfSupply: formData.placeOfSupply,
        paymentTerms: formData.paymentTerms,
        deliveryTerms: formData.deliveryTerms,
        notes: formData.notes,
        termsConditions: formData.termsConditions,
        items: calculatedData.items,
        ...calculatedData
      };

      await savePurchaseOrder(poData);

      const pdfData = {
        ...formData,
        poNumber: poNumber,
        items: calculatedData.items,
        ...calculatedData
      };

      setSavedPO(pdfData);
      setMessage({ type: 'success', text: 'Purchase Order saved successfully!' });
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      fetchRecentPOs();
      fetchNextPONumber();

    } catch (error) {
      console.error('Error saving purchase order:', error);
      setMessage({ 
        type: 'error', 
        text: error.message || 'Failed to save purchase order. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNewPO = () => {
    setSavedPO(null);
    setMessage({ type: '', text: '' });
  };

  const handleViewCurrentPO = () => {
    if (savedPO) {
      setViewingPO(savedPO);
    }
  };

  const handleViewHistoryPO = async (po) => {
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
      setMessage({ type: 'error', text: 'Failed to load purchase order' });
    }
  };

  if (!user) {
    return (
      <div className="po-page">
        <div className="auth-required">
          <h2>Authentication Required</h2>
          <p>Please sign in to create purchase orders.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="po-page">
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      {savedPO ? (
        <div className="po-success">
          <div className="success-header">
            <h2>✓ Purchase Order Generated Successfully!</h2>
            <p>PO Number: <strong>{savedPO.poNumber}</strong></p>
          </div>
          
          <div className="success-actions">
            <button onClick={handleViewCurrentPO} className="btn-view">
              View Purchase Order
            </button>
            <PDFDownloadLink
              document={<PurchaseOrderPdf poData={savedPO} />}
              fileName={`PO_${savedPO.poNumber.replace(/\//g, '-')}.pdf`}
              className="btn-download"
            >
              {({ blob, url, loading, error }) =>
                loading ? 'Generating PDF...' : 'Download PDF'
              }
            </PDFDownloadLink>
            <button onClick={handleNewPO} className="btn-new">
              Create New Purchase Order
            </button>
          </div>
        </div>
      ) : (
        <PurchaseOrderForm 
          onSubmit={handleFormSubmit} 
          loading={loading}
          initialPONumber={nextPONumber?.poNumber}
        />
      )}

      {/* Recent POs Sidebar */}
      {recentPOs.length > 0 && !savedPO && (
        <div className="recent-pos">
          <h3>Recent Purchase Orders</h3>
          <div className="recent-list">
            {recentPOs.map(po => (
              <div key={po.id} className="recent-item" onClick={() => handleViewHistoryPO(po)}>
                <div className="recent-number">{po.po_number}</div>
                <div className="recent-details">
                  <span className="recent-vendor">{po.vendor_name}</span>
                  <span className="recent-amount">₹{parseFloat(po.grand_total).toLocaleString('en-IN')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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

export default PurchaseOrder;
