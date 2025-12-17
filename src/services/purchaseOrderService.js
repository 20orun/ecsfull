import { supabase } from '../lib/supabase';
import { FIRM_CONFIG } from '../config/firmConfig';
import { getFinancialYear, validatePONumber } from '../utils/purchaseOrderUtils';

/**
 * Purchase Order Service - Handles all Supabase operations for purchase orders
 */

/**
 * Get the next PO number preview (does NOT increment the sequence)
 * @returns {Promise<{poNumber: string, sequenceNumber: number, financialYear: string}>}
 */
export const getNextPONumber = async () => {
  const financialYear = getFinancialYear();
  const prefix = FIRM_CONFIG.invoicePrefix || 'ECS';
  
  const { data, error } = await supabase
    .rpc('get_next_po_number_preview', {
      p_financial_year: financialYear,
      p_prefix: prefix
    });
  
  if (error) {
    console.error('Error getting next PO number preview:', error);
    throw new Error('Failed to get PO number');
  }
  
  if (data && data.length > 0) {
    return {
      poNumber: data[0].po_number,
      sequenceNumber: data[0].sequence_num,
      financialYear
    };
  }
  
  throw new Error('No PO number returned');
};

/**
 * Commit and get the next PO number (increments the sequence)
 * @returns {Promise<{poNumber: string, sequenceNumber: number, financialYear: string}>}
 */
export const commitNextPONumber = async () => {
  const financialYear = getFinancialYear();
  const prefix = FIRM_CONFIG.invoicePrefix || 'ECS';
  
  const { data, error } = await supabase
    .rpc('get_next_po_number', {
      p_financial_year: financialYear,
      p_prefix: prefix
    });
  
  if (error) {
    console.error('Error committing PO number:', error);
    throw new Error('Failed to generate PO number');
  }
  
  if (data && data.length > 0) {
    return {
      poNumber: data[0].po_number,
      sequenceNumber: data[0].sequence_num,
      financialYear
    };
  }
  
  throw new Error('No PO number returned');
};

/**
 * Save purchase order to Supabase
 * @param {Object} poData - Complete purchase order data
 * @returns {Promise<{purchaseOrder: Object, items: Array}>}
 */
export const savePurchaseOrder = async (poData) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  // Validate PO number
  if (!validatePONumber(poData.poNumber)) {
    throw new Error('Invalid PO number format');
  }
  
  const financialYear = getFinancialYear();
  
  // Insert purchase order
  const { data: purchaseOrder, error: poError } = await supabase
    .from('purchase_orders')
    .insert({
      po_number: poData.poNumber,
      financial_year: financialYear,
      sequence_number: poData.sequenceNumber || 0,
      po_date: poData.poDate,
      expected_delivery_date: poData.expectedDeliveryDate || null,
      vendor_name: poData.vendorName,
      vendor_phone: poData.vendorPhone || null,
      vendor_email: poData.vendorEmail || null,
      vendor_gstin: poData.vendorGstin || null,
      vendor_address: poData.vendorAddress,
      delivery_address: poData.deliveryAddress || FIRM_CONFIG.address,
      place_of_supply: poData.placeOfSupply,
      payment_terms: poData.paymentTerms || null,
      delivery_terms: poData.deliveryTerms || null,
      notes: poData.notes || null,
      terms_conditions: poData.termsConditions || null,
      subtotal: poData.subtotal,
      total_cgst: poData.totalCgst,
      total_sgst: poData.totalSgst,
      total_igst: poData.totalIgst,
      total_tax_amount: poData.totalTaxAmount,
      grand_total: poData.grandTotal,
      status: poData.status || 'draft',
      created_by: user.id
    })
    .select()
    .single();
  
  if (poError) {
    console.error('Error saving purchase order:', poError);
    throw new Error('Failed to save purchase order: ' + poError.message);
  }
  
  // Insert purchase order items
  const itemsToInsert = poData.items.map((item, index) => ({
    purchase_order_id: purchaseOrder.id,
    description: item.description,
    hsn_sac_code: item.hsnSacCode,
    quantity: item.quantity,
    unit: item.unit || 'Nos',
    unit_price: item.unitPrice,
    taxable_value: item.taxableValue,
    gst_rate: item.gstRate,
    cgst_amount: item.cgstAmount || 0,
    sgst_amount: item.sgstAmount || 0,
    igst_amount: item.igstAmount || 0,
    total_amount: item.totalAmount,
    item_order: index
  }));
  
  const { data: items, error: itemsError } = await supabase
    .from('purchase_order_items')
    .insert(itemsToInsert)
    .select();
  
  if (itemsError) {
    console.error('Error saving PO items:', itemsError);
    // Rollback by deleting the PO
    await supabase.from('purchase_orders').delete().eq('id', purchaseOrder.id);
    throw new Error('Failed to save PO items: ' + itemsError.message);
  }
  
  return {
    purchaseOrder,
    items
  };
};

/**
 * Get purchase orders with optional filters
 * @param {Object} options - Filter options
 * @returns {Promise<Array>}
 */
export const getPurchaseOrders = async (options = {}) => {
  const { limit = 50, financialYear, status } = options;
  
  let query = supabase
    .from('purchase_orders')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (financialYear) {
    query = query.eq('financial_year', financialYear);
  }
  
  if (status) {
    query = query.eq('status', status);
  }
  
  if (limit) {
    query = query.limit(limit);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching purchase orders:', error);
    throw new Error('Failed to fetch purchase orders');
  }
  
  return data;
};

/**
 * Get a specific purchase order by ID with items
 * @param {string} id - Purchase order ID
 * @returns {Promise<{purchaseOrder: Object, items: Array}>}
 */
export const getPurchaseOrderById = async (id) => {
  const { data: purchaseOrder, error: poError } = await supabase
    .from('purchase_orders')
    .select('*')
    .eq('id', id)
    .single();
  
  if (poError) {
    console.error('Error fetching purchase order:', poError);
    throw new Error('Failed to fetch purchase order');
  }
  
  const { data: items, error: itemsError } = await supabase
    .from('purchase_order_items')
    .select('*')
    .eq('purchase_order_id', id)
    .order('item_order');
  
  if (itemsError) {
    console.error('Error fetching PO items:', itemsError);
    throw new Error('Failed to fetch PO items');
  }
  
  return {
    purchaseOrder,
    items
  };
};

/**
 * Update purchase order status
 * @param {string} id - Purchase order ID
 * @param {string} status - New status
 * @returns {Promise<Object>}
 */
export const updatePOStatus = async (id, status) => {
  const { data, error } = await supabase
    .from('purchase_orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating PO status:', error);
    throw new Error('Failed to update PO status');
  }
  
  return data;
};

/**
 * Delete a purchase order
 * @param {string} id - Purchase order ID
 * @returns {Promise<void>}
 */
export const deletePurchaseOrder = async (id) => {
  // Delete items first
  const { error: itemsError } = await supabase
    .from('purchase_order_items')
    .delete()
    .eq('purchase_order_id', id);
  
  if (itemsError) {
    console.error('Error deleting PO items:', itemsError);
    throw new Error('Failed to delete PO items');
  }
  
  // Delete purchase order
  const { error: poError } = await supabase
    .from('purchase_orders')
    .delete()
    .eq('id', id);
  
  if (poError) {
    console.error('Error deleting purchase order:', poError);
    throw new Error('Failed to delete purchase order');
  }
};
