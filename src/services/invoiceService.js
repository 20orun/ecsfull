import { supabase } from '../lib/supabase';
import { FIRM_CONFIG } from '../config/firmConfig';
import { getFinancialYear, validateInvoiceNumber } from '../utils/invoiceUtils';

/**
 * Invoice Service - Handles all Supabase operations for invoices
 * Ensures GST Rule 46(b) compliant consecutive invoice numbering
 */

/**
 * Get the next invoice number preview (does NOT increment the sequence)
 * Use this for displaying the next invoice number to the user
 * @returns {Promise<{invoiceNumber: string, sequenceNumber: number, financialYear: string}>}
 */
export const getNextInvoiceNumber = async () => {
  const financialYear = getFinancialYear();
  const prefix = FIRM_CONFIG.invoicePrefix || 'ECS';
  
  const { data, error } = await supabase
    .rpc('get_next_invoice_number_preview', {
      p_financial_year: financialYear,
      p_prefix: prefix
    });
  
  if (error) {
    console.error('Error getting next invoice number preview:', error);
    throw new Error('Failed to get invoice number');
  }
  
  if (data && data.length > 0) {
    return {
      invoiceNumber: data[0].invoice_number,
      sequenceNumber: data[0].sequence_num,
      financialYear
    };
  }
  
  throw new Error('No invoice number returned');
};

/**
 * Commit and get the next invoice number (increments the sequence)
 * Use this when actually saving an invoice
 * @returns {Promise<{invoiceNumber: string, sequenceNumber: number, financialYear: string}>}
 */
export const commitNextInvoiceNumber = async () => {
  const financialYear = getFinancialYear();
  const prefix = FIRM_CONFIG.invoicePrefix || 'ECS';
  
  const { data, error } = await supabase
    .rpc('get_next_invoice_number', {
      p_financial_year: financialYear,
      p_prefix: prefix
    });
  
  if (error) {
    console.error('Error committing invoice number:', error);
    throw new Error('Failed to generate invoice number');
  }
  
  if (data && data.length > 0) {
    return {
      invoiceNumber: data[0].invoice_number,
      sequenceNumber: data[0].sequence_num,
      financialYear
    };
  }
  
  throw new Error('No invoice number returned');
};

/**
 * Save invoice to Supabase
 * @param {Object} invoiceData - Complete invoice data
 * @returns {Promise<{invoice: Object, items: Array}>}
 */
export const saveInvoice = async (invoiceData) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  // Validate invoice number
  if (!validateInvoiceNumber(invoiceData.invoiceNumber)) {
    throw new Error('Invalid invoice number format');
  }
  
  const financialYear = getFinancialYear();
  
  // Start a transaction by inserting invoice first
  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .insert({
      invoice_number: invoiceData.invoiceNumber,
      financial_year: financialYear,
      sequence_number: invoiceData.sequenceNumber || 0,
      invoice_date: invoiceData.invoiceDate,
      customer_name: invoiceData.customerName,
      customer_phone: invoiceData.customerPhone || null,
      customer_gstin: invoiceData.customerGstin || null,
      customer_address: invoiceData.customerAddress,
      shipping_name: invoiceData.shippingName || null,
      shipping_phone: invoiceData.shippingPhone || null,
      shipping_address: invoiceData.shippingAddress || null,
      place_of_supply: invoiceData.placeOfSupply,
      subtotal: invoiceData.subtotal,
      total_cgst: invoiceData.totalCgst,
      total_sgst: invoiceData.totalSgst,
      total_igst: invoiceData.totalIgst,
      total_tax_amount: invoiceData.totalTaxAmount,
      grand_total: invoiceData.grandTotal,
      created_by: user.id
    })
    .select()
    .single();
  
  if (invoiceError) {
    console.error('Error saving invoice:', invoiceError);
    throw new Error('Failed to save invoice: ' + invoiceError.message);
  }
  
  // Insert invoice items
  const itemsToInsert = invoiceData.items.map((item, index) => ({
    invoice_id: invoice.id,
    description: item.description,
    hsn_sac_code: item.hsnSacCode,
    quantity: item.quantity,
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
    .from('invoice_items')
    .insert(itemsToInsert)
    .select();
  
  if (itemsError) {
    console.error('Error saving invoice items:', itemsError);
    // Try to rollback by deleting the invoice
    await supabase.from('invoices').delete().eq('id', invoice.id);
    throw new Error('Failed to save invoice items: ' + itemsError.message);
  }
  
  return { invoice, items };
};

/**
 * Get all invoices for the current user
 * @param {Object} options - Query options
 * @returns {Promise<Array>}
 */
export const getInvoices = async (options = {}) => {
  const { limit = 50, offset = 0, financialYear = null } = options;
  
  let query = supabase
    .from('invoices')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  
  if (financialYear) {
    query = query.eq('financial_year', financialYear);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching invoices:', error);
    throw new Error('Failed to fetch invoices');
  }
  
  return data;
};

/**
 * Get a single invoice with its items
 * @param {string} invoiceId - Invoice UUID
 * @returns {Promise<{invoice: Object, items: Array}>}
 */
export const getInvoiceById = async (invoiceId) => {
  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', invoiceId)
    .single();
  
  if (invoiceError) {
    console.error('Error fetching invoice:', invoiceError);
    throw new Error('Failed to fetch invoice');
  }
  
  const { data: items, error: itemsError } = await supabase
    .from('invoice_items')
    .select('*')
    .eq('invoice_id', invoiceId)
    .order('item_order', { ascending: true });
  
  if (itemsError) {
    console.error('Error fetching invoice items:', itemsError);
    throw new Error('Failed to fetch invoice items');
  }
  
  return { invoice, items };
};

/**
 * Get invoice by invoice number
 * @param {string} invoiceNumber - Invoice number
 * @returns {Promise<{invoice: Object, items: Array}>}
 */
export const getInvoiceByNumber = async (invoiceNumber) => {
  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .select('*')
    .eq('invoice_number', invoiceNumber)
    .single();
  
  if (invoiceError) {
    console.error('Error fetching invoice:', invoiceError);
    throw new Error('Failed to fetch invoice');
  }
  
  const { data: items, error: itemsError } = await supabase
    .from('invoice_items')
    .select('*')
    .eq('invoice_id', invoice.id)
    .order('item_order', { ascending: true });
  
  if (itemsError) {
    console.error('Error fetching invoice items:', itemsError);
    throw new Error('Failed to fetch invoice items');
  }
  
  return { invoice, items };
};

/**
 * Delete an invoice
 * @param {string} invoiceId - Invoice UUID
 * @returns {Promise<void>}
 */
export const deleteInvoice = async (invoiceId) => {
  // Items will be deleted automatically due to CASCADE
  const { error } = await supabase
    .from('invoices')
    .delete()
    .eq('id', invoiceId);
  
  if (error) {
    console.error('Error deleting invoice:', error);
    throw new Error('Failed to delete invoice');
  }
};

/**
 * Get invoice count and stats for a financial year
 * @param {string} financialYear - Financial year in YY-YY format
 * @returns {Promise<{count: number, totalAmount: number}>}
 */
export const getInvoiceStats = async (financialYear = null) => {
  const fy = financialYear || getFinancialYear();
  
  const { data, error } = await supabase
    .from('invoices')
    .select('grand_total')
    .eq('financial_year', fy);
  
  if (error) {
    console.error('Error fetching invoice stats:', error);
    throw new Error('Failed to fetch invoice stats');
  }
  
  const count = data.length;
  const totalAmount = data.reduce((sum, inv) => sum + parseFloat(inv.grand_total), 0);
  
  return { count, totalAmount, financialYear: fy };
};
