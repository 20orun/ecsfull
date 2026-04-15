import { supabase } from '../lib/supabase';
import { getFinancialYear, validateInvoiceNumber } from '../utils/invoiceUtils';

/**
 * Confirmed Invoice Service - Handles all Supabase operations for confirmed invoices
 * Ensures GST Rule 46(b) compliant consecutive invoice numbering
 */

/**
 * Get the next confirmed invoice number preview (does NOT increment the sequence)
 */
export const getNextConfirmedInvoiceNumber = async () => {
  const financialYear = getFinancialYear();
  // Always use CINV for confirmed invoices
  const prefix = 'CINV';
  const { data, error } = await supabase
    .rpc('get_next_confirmed_invoice_number_preview', {
      p_financial_year: financialYear,
      p_prefix: prefix
    });
  
  if (error) {
    console.error('Error getting next confirmed invoice number preview:', error);
    throw new Error('Failed to get confirmed invoice number');
  }
  
  if (data && data.length > 0) {
    return {
      invoiceNumber: data[0].invoice_number,
      sequenceNumber: data[0].sequence_num,
      financialYear
    };
  }
  
  throw new Error('No confirmed invoice number returned');
};

/**
 * Commit and get the next confirmed invoice number (increments the sequence)
 */
export const commitNextConfirmedInvoiceNumber = async () => {
  const financialYear = getFinancialYear();
  // Always use CINV for confirmed invoices
  const prefix = 'CINV';
  const { data, error } = await supabase
    .rpc('get_next_confirmed_invoice_number', {
      p_financial_year: financialYear,
      p_prefix: prefix
    });
  
  if (error) {
    console.error('Error committing confirmed invoice number:', error);
    throw new Error('Failed to generate confirmed invoice number');
  }
  
  if (data && data.length > 0) {
    return {
      invoiceNumber: data[0].invoice_number,
      sequenceNumber: data[0].sequence_num,
      financialYear
    };
  }
  
  throw new Error('No confirmed invoice number returned');
};

/**
 * Save confirmed invoice to Supabase
 */
export const saveConfirmedInvoice = async (invoiceData) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  if (!validateInvoiceNumber(invoiceData.invoiceNumber)) {
    throw new Error('Invalid invoice number format');
  }
  
  const financialYear = getFinancialYear();
  
  const { data: invoice, error: invoiceError } = await supabase
    .from('confirmed_invoices')
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
      currency_mode: invoiceData.currencyMode || 'INR',
      exchange_rate: invoiceData.exchangeRate || null,
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
    console.error('Error saving confirmed invoice:', invoiceError);
    throw new Error('Failed to save confirmed invoice: ' + invoiceError.message);
  }
  
  const itemsToInsert = invoiceData.items.map((item, index) => ({
    confirmed_invoice_id: invoice.id,
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
    .from('confirmed_invoice_items')
    .insert(itemsToInsert)
    .select();
  
  if (itemsError) {
    console.error('Error saving confirmed invoice items:', itemsError);
    await supabase.from('confirmed_invoices').delete().eq('id', invoice.id);
    throw new Error('Failed to save confirmed invoice items: ' + itemsError.message);
  }
  
  return { invoice, items };
};

/**
 * Get all confirmed invoices for the current user
 */
export const getConfirmedInvoices = async (options = {}) => {
  const { limit = 50, offset = 0, financialYear = null } = options;
  
  let query = supabase
    .from('confirmed_invoices')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  
  if (financialYear) {
    query = query.eq('financial_year', financialYear);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching confirmed invoices:', error);
    throw new Error('Failed to fetch confirmed invoices');
  }
  
  return data;
};

/**
 * Get a single confirmed invoice with its items
 */
export const getConfirmedInvoiceById = async (invoiceId) => {
  const { data: invoice, error: invoiceError } = await supabase
    .from('confirmed_invoices')
    .select('*')
    .eq('id', invoiceId)
    .single();
  
  if (invoiceError) {
    console.error('Error fetching confirmed invoice:', invoiceError);
    throw new Error('Failed to fetch confirmed invoice');
  }
  
  const { data: items, error: itemsError } = await supabase
    .from('confirmed_invoice_items')
    .select('*')
    .eq('confirmed_invoice_id', invoiceId)
    .order('item_order', { ascending: true });
  
  if (itemsError) {
    console.error('Error fetching confirmed invoice items:', itemsError);
    throw new Error('Failed to fetch confirmed invoice items');
  }
  
  return { invoice, items };
};

/**
 * Get confirmed invoice by invoice number
 */
export const getConfirmedInvoiceByNumber = async (invoiceNumber) => {
  const { data: invoice, error: invoiceError } = await supabase
    .from('confirmed_invoices')
    .select('*')
    .eq('invoice_number', invoiceNumber)
    .single();
  
  if (invoiceError) {
    console.error('Error fetching confirmed invoice:', invoiceError);
    throw new Error('Failed to fetch confirmed invoice');
  }
  
  const { data: items, error: itemsError } = await supabase
    .from('confirmed_invoice_items')
    .select('*')
    .eq('confirmed_invoice_id', invoice.id)
    .order('item_order', { ascending: true });
  
  if (itemsError) {
    console.error('Error fetching confirmed invoice items:', itemsError);
    throw new Error('Failed to fetch confirmed invoice items');
  }
  
  return { invoice, items };
};

/**
 * Delete a confirmed invoice
 */
export const deleteConfirmedInvoice = async (invoiceId) => {
  const { error } = await supabase
    .from('confirmed_invoices')
    .delete()
    .eq('id', invoiceId);
  
  if (error) {
    console.error('Error deleting confirmed invoice:', error);
    throw new Error('Failed to delete confirmed invoice');
  }
};

/**
 * Get confirmed invoice count and stats for a financial year
 */
export const getConfirmedInvoiceStats = async (financialYear = null) => {
  const fy = financialYear || getFinancialYear();
  
  const { data, error } = await supabase
    .from('confirmed_invoices')
    .select('grand_total')
    .eq('financial_year', fy);
  
  if (error) {
    console.error('Error fetching confirmed invoice stats:', error);
    throw new Error('Failed to fetch confirmed invoice stats');
  }
  
  const count = data.length;
  const totalAmount = data.reduce((sum, inv) => sum + parseFloat(inv.grand_total), 0);
  
  return { count, totalAmount, financialYear: fy };
};
