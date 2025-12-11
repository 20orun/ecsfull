import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { FIRM_CONFIG, INDIAN_STATES, GST_RATES } from '../config/firmConfig';
import { 
  calculateInvoiceTotals, 
  formatCurrency, 
  generateInvoiceNumber,
  validateGSTIN 
} from '../utils/invoiceUtils';
import './InvoiceForm.css';

const InvoiceForm = ({ onSubmit, loading, initialInvoiceNumber }) => {
  // Track which items have been added to the bill
  const [billedItems, setBilledItems] = useState([]);
  // Track if shipping address is same as billing
  const [sameAsShipping, setSameAsShipping] = useState(false);

  const defaultValues = useMemo(() => ({
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    customerGstin: '',
    shippingName: '',
    shippingPhone: '',
    shippingAddress: '',
    placeOfSupply: FIRM_CONFIG.state,
    invoiceNumber: initialInvoiceNumber || generateInvoiceNumber(),
    invoiceDate: new Date().toISOString().split('T')[0],
    items: [
      { description: '', hsnSacCode: '', quantity: 1, unitPrice: 0, gstRate: 18 }
    ]
  }), [initialInvoiceNumber]);

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
    getValues,
    setValue,
    reset
  } = useForm({
    defaultValues
  });

  // Update invoice number when it comes from Supabase
  useEffect(() => {
    if (initialInvoiceNumber) {
      setValue('invoiceNumber', initialInvoiceNumber);
    }
  }, [initialInvoiceNumber, setValue]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items'
  });

  const watchItems = watch('items');
  const watchPlaceOfSupply = watch('placeOfSupply');

  const isIntraState = watchPlaceOfSupply === FIRM_CONFIG.state;

  // Calculate totals based only on billed items
  const totals = useMemo(() => {
    if (billedItems.length === 0) {
      return {
        items: [],
        subtotal: 0,
        totalCgst: 0,
        totalSgst: 0,
        totalIgst: 0,
        totalTaxAmount: 0,
        grandTotal: 0
      };
    }

    const itemsToCalculate = billedItems.map(item => ({
      ...item,
      quantity: parseFloat(item.quantity) || 0,
      unitPrice: parseFloat(item.unitPrice) || 0,
      gstRate: parseFloat(item.gstRate) || 0
    }));
    
    return calculateInvoiceTotals(itemsToCalculate, watchPlaceOfSupply);
  }, [billedItems, watchPlaceOfSupply]);

  // Check if an item is already billed (by index in form)
  const isItemBilled = useCallback((index) => {
    return billedItems.some(item => item.formIndex === index);
  }, [billedItems]);

  // Add item to bill
  const addToBill = useCallback((index) => {
    const items = getValues('items');
    const item = items[index];
    
    // Validate item has required fields
    if (!item.description || !item.hsnSacCode || !item.quantity || !item.unitPrice) {
      alert('Please fill in all item fields before adding to bill');
      return;
    }

    const billedItem = {
      ...item,
      formIndex: index,
      quantity: parseFloat(item.quantity) || 0,
      unitPrice: parseFloat(item.unitPrice) || 0,
      gstRate: parseFloat(item.gstRate) || 0
    };

    setBilledItems(prev => [...prev, billedItem]);
  }, [getValues]);

  // Update item in bill
  const updateInBill = useCallback((index) => {
    const items = getValues('items');
    const item = items[index];
    
    // Validate item has required fields
    if (!item.description || !item.hsnSacCode || !item.quantity || !item.unitPrice) {
      alert('Please fill in all item fields before updating');
      return;
    }

    const updatedItem = {
      ...item,
      formIndex: index,
      quantity: parseFloat(item.quantity) || 0,
      unitPrice: parseFloat(item.unitPrice) || 0,
      gstRate: parseFloat(item.gstRate) || 0
    };

    setBilledItems(prev => prev.map(bi => 
      bi.formIndex === index ? updatedItem : bi
    ));
  }, [getValues]);

  // Remove item from bill
  const removeFromBill = useCallback((index) => {
    setBilledItems(prev => prev.filter(item => item.formIndex !== index));
  }, []);

  // Remove item row entirely
  const removeItemRow = useCallback((index) => {
    // First remove from billed items if it exists
    removeFromBill(index);
    // Update formIndex for items after this one
    setBilledItems(prev => prev.map(item => ({
      ...item,
      formIndex: item.formIndex > index ? item.formIndex - 1 : item.formIndex
    })));
    // Remove from form
    remove(index);
  }, [remove, removeFromBill]);

  const addItem = useCallback(() => {
    append({ description: '', hsnSacCode: '', quantity: 1, unitPrice: 0, gstRate: 18 });
  }, [append]);

  const handleFormSubmit = useCallback((data) => {
    // Validate GSTIN if provided
    if (data.customerGstin && !validateGSTIN(data.customerGstin)) {
      alert('Invalid GSTIN format');
      return;
    }

    // Check if there are any billed items
    if (billedItems.length === 0) {
      alert('Please add at least one item to the bill before generating invoice');
      return;
    }

    // Prepare data with calculated values using only billed items
    const invoiceData = {
      ...data,
      shippingName: sameAsShipping ? data.customerName : data.shippingName,
      shippingPhone: sameAsShipping ? data.customerPhone : data.shippingPhone,
      shippingAddress: sameAsShipping ? data.customerAddress : data.shippingAddress,
      items: billedItems.map(item => ({
        description: item.description,
        hsnSacCode: item.hsnSacCode,
        quantity: parseFloat(item.quantity),
        unitPrice: parseFloat(item.unitPrice),
        gstRate: parseFloat(item.gstRate)
      })),
      ...totals
    };

    onSubmit(invoiceData);
  }, [onSubmit, totals, billedItems]);

  const handleReset = useCallback(() => {
    setBilledItems([]);
    setSameAsShipping(false);
    reset({
      ...defaultValues,
      invoiceNumber: generateInvoiceNumber()
    });
  }, [reset, defaultValues]);

  return (
    <div className="invoice-form-container">
      {/* Firm Details Header */}
      <div className="firm-header">
        <h2>{FIRM_CONFIG.name}</h2>
        <p>{FIRM_CONFIG.address}</p>
        <p>GSTIN: {FIRM_CONFIG.gstin}</p>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="invoice-form">
        {/* Invoice Details */}
        <div className="form-section">
          <h3>Invoice Details</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Invoice Number *</label>
              <input
                type="text"
                {...register('invoiceNumber', { required: true })}
                className={errors.invoiceNumber ? 'error' : ''}
              />
              {errors.invoiceNumber && <span className="error-text">Invoice number is required</span>}
            </div>
            <div className="form-group">
              <label>Invoice Date *</label>
              <input
                type="date"
                {...register('invoiceDate', { required: true })}
                className={errors.invoiceDate ? 'error' : ''}
              />
              {errors.invoiceDate && <span className="error-text">Invoice date is required</span>}
            </div>
          </div>
        </div>

        {/* Customer Details */}
        <div className="form-section">
          <h3>Customer Details</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Billing Name *</label>
              <input
                type="text"
                {...register('customerName', { required: true })}
                placeholder="Enter billing recipient name"
                className={errors.customerName ? 'error' : ''}
              />
              {errors.customerName && <span className="error-text">Billing name is required</span>}
            </div>
            <div className="form-group">
              <label>Billing Phone *</label>
              <input
                type="tel"
                {...register('customerPhone', { required: true })}
                placeholder="Enter phone number"
                className={errors.customerPhone ? 'error' : ''}
              />
              {errors.customerPhone && <span className="error-text">Billing phone is required</span>}
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Customer GSTIN (Optional)</label>
              <input
                type="text"
                {...register('customerGstin')}
                placeholder="22AAAAA0000A1Z5"
                maxLength={15}
                style={{ textTransform: 'uppercase' }}
              />
              {errors.customerGstin && <span className="error-text">{errors.customerGstin.message}</span>}
            </div>
          </div>
          <div className="form-row">
            <div className="form-group full-width">
              <label>Billing Address *</label>
              <textarea
                {...register('customerAddress', { required: true })}
                placeholder="Enter complete billing address"
                rows={3}
                className={errors.customerAddress ? 'error' : ''}
              />
              {errors.customerAddress && <span className="error-text">Billing address is required</span>}
            </div>
          </div>
          <div className="form-row">
            <div className="form-group full-width">
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="sameAsShipping"
                  checked={sameAsShipping}
                  onChange={(e) => {
                    setSameAsShipping(e.target.checked);
                    if (e.target.checked) {
                      setValue('shippingName', getValues('customerName'));
                      setValue('shippingPhone', getValues('customerPhone'));
                      setValue('shippingAddress', getValues('customerAddress'));
                    }
                  }}
                />
                <label htmlFor="sameAsShipping">Shipping address same as billing address</label>
              </div>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Shipping Name {!sameAsShipping && '*'}</label>
              <input
                type="text"
                {...register('shippingName', { required: !sameAsShipping })}
                placeholder="Enter shipping recipient name"
                disabled={sameAsShipping}
                className={errors.shippingName ? 'error' : ''}
                style={{ backgroundColor: sameAsShipping ? '#f0f0f0' : 'white' }}
              />
              {errors.shippingName && !sameAsShipping && <span className="error-text">Shipping name is required</span>}
            </div>
            <div className="form-group">
              <label>Shipping Phone {!sameAsShipping && '*'}</label>
              <input
                type="tel"
                {...register('shippingPhone', { required: !sameAsShipping })}
                placeholder="Enter phone number"
                disabled={sameAsShipping}
                className={errors.shippingPhone ? 'error' : ''}
                style={{ backgroundColor: sameAsShipping ? '#f0f0f0' : 'white' }}
              />
              {errors.shippingPhone && !sameAsShipping && <span className="error-text">Shipping phone is required</span>}
            </div>
          </div>
          <div className="form-row">
            <div className="form-group full-width">
              <label>Shipping Address {!sameAsShipping && '*'}</label>
              <textarea
                {...register('shippingAddress', { required: !sameAsShipping })}
                placeholder="Enter complete shipping address"
                rows={3}
                disabled={sameAsShipping}
                className={errors.shippingAddress ? 'error' : ''}
                style={{ backgroundColor: sameAsShipping ? '#f0f0f0' : 'white' }}
              />
              {errors.shippingAddress && !sameAsShipping && <span className="error-text">Shipping address is required</span>}
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Place of Supply (State) *</label>
              <select
                {...register('placeOfSupply', { required: true })}
                className={errors.placeOfSupply ? 'error' : ''}
              >
                {INDIAN_STATES.map(state => (
                  <option key={state.code} value={state.name}>
                    {state.code} - {state.name}
                  </option>
                ))}
              </select>
              {errors.placeOfSupply && <span className="error-text">Place of supply is required</span>}
            </div>
            <div className="form-group">
              <div className="tax-type-indicator">
                {isIntraState ? (
                  <span className="tax-badge intra">CGST + SGST (Intra-State)</span>
                ) : (
                  <span className="tax-badge inter">IGST (Inter-State)</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="form-section">
          <h3>Invoice Items</h3>
          <div className="items-table">
            <div className="items-header">
              <span className="col-desc">Description</span>
              <span className="col-hsn">HSN/SAC</span>
              <span className="col-qty">Qty</span>
              <span className="col-rate">Unit Price (₹)</span>
              <span className="col-gst">GST %</span>
              <span className="col-taxable">Taxable (₹)</span>
              <span className="col-action-wide">Actions</span>
            </div>
            
            {fields.map((field, index) => {
              const item = watchItems?.[index] || {};
              const taxableValue = (parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0);
              const isBilled = isItemBilled(index);
              
              return (
                <div key={field.id} className={`items-row ${isBilled ? 'billed' : ''}`}>
                  <div className="col-desc">
                    <input
                      type="text"
                      {...register(`items.${index}.description`, { required: true })}
                      placeholder="Item description"
                      className={errors.items?.[index]?.description ? 'error' : ''}
                    />
                  </div>
                  <div className="col-hsn">
                    <input
                      type="text"
                      {...register(`items.${index}.hsnSacCode`, { required: true })}
                      placeholder="HSN/SAC"
                      className={errors.items?.[index]?.hsnSacCode ? 'error' : ''}
                    />
                  </div>
                  <div className="col-qty">
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      {...register(`items.${index}.quantity`, { 
                        required: true,
                        valueAsNumber: true 
                      })}
                      className={errors.items?.[index]?.quantity ? 'error' : ''}
                    />
                  </div>
                  <div className="col-rate">
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      {...register(`items.${index}.unitPrice`, { 
                        required: true,
                        valueAsNumber: true 
                      })}
                      className={errors.items?.[index]?.unitPrice ? 'error' : ''}
                    />
                  </div>
                  <div className="col-gst">
                    <select
                      {...register(`items.${index}.gstRate`, { 
                        required: true,
                        valueAsNumber: true 
                      })}
                    >
                      {GST_RATES.map(rate => (
                        <option key={rate} value={rate}>{rate}%</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-taxable">
                    <span className="calculated-value">{formatCurrency(taxableValue)}</span>
                  </div>
                  <div className="col-action-wide">
                    <div className="action-buttons">
                      {isBilled ? (
                        <>
                          <button
                            type="button"
                            className="btn-update"
                            onClick={() => updateInBill(index)}
                            title="Update in Bill"
                          >
                            Update
                          </button>
                          <button
                            type="button"
                            className="btn-remove-bill"
                            onClick={() => removeFromBill(index)}
                            title="Remove from Bill"
                          >
                            Remove
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          className="btn-add-bill"
                          onClick={() => addToBill(index)}
                          title="Add to Bill"
                        >
                          Add to Bill
                        </button>
                      )}
                      {fields.length > 1 && (
                        <button
                          type="button"
                          className="btn-delete-row"
                          onClick={() => removeItemRow(index)}
                          title="Delete Row"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <button type="button" className="btn-add-item" onClick={addItem}>
            + Add New Item Row
          </button>
        </div>

        {/* Totals Summary */}
        <div className="form-section totals-section">
          <h3>Invoice Summary</h3>
          {billedItems.length === 0 ? (
            <p className="no-items-message">No items added to bill yet. Click "Add to Bill" on items above.</p>
          ) : (
            <>
              <div className="billed-items-list">
                <h4>Items in Bill ({billedItems.length})</h4>
                <ul>
                  {billedItems.map((item, idx) => (
                    <li key={idx}>
                      {item.description} - Qty: {item.quantity} × ₹{item.unitPrice} = {formatCurrency(item.quantity * item.unitPrice)}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="totals-grid">
                <div className="total-row">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(totals.subtotal)}</span>
                </div>
                {isIntraState ? (
                  <>
                    <div className="total-row">
                      <span>CGST:</span>
                      <span>{formatCurrency(totals.totalCgst)}</span>
                    </div>
                    <div className="total-row">
                      <span>SGST:</span>
                      <span>{formatCurrency(totals.totalSgst)}</span>
                    </div>
                  </>
                ) : (
                  <div className="total-row">
                    <span>IGST:</span>
                    <span>{formatCurrency(totals.totalIgst)}</span>
                  </div>
                )}
                <div className="total-row total-tax">
                  <span>Total Tax:</span>
                  <span>{formatCurrency(totals.totalTaxAmount)}</span>
                </div>
                <div className="total-row grand-total">
                  <span>Grand Total:</span>
                  <span>{formatCurrency(totals.grandTotal)}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button type="button" className="btn-reset" onClick={handleReset}>
            Reset Form
          </button>
          <button type="submit" className="btn-submit" disabled={loading || billedItems.length === 0}>
            {loading ? 'Saving...' : 'Generate Invoice'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InvoiceForm;
