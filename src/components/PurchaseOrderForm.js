import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { FIRM_CONFIG, INDIAN_STATES, GST_RATES } from '../config/firmConfig';
import { 
  calculatePOTotals, 
  formatCurrency, 
  generatePONumber,
  validateGSTIN,
  PAYMENT_TERMS,
  DELIVERY_TERMS,
  DEFAULT_TERMS_CONDITIONS
} from '../utils/purchaseOrderUtils';
import './PurchaseOrderForm.css';

const UNITS = ['Nos', 'Pcs', 'Kgs', 'Ltrs', 'Mtrs', 'Sqm', 'Sqft', 'Box', 'Set', 'Pack', 'Pair', 'Hrs', 'Days'];

const PurchaseOrderForm = ({ onSubmit, loading, initialPONumber }) => {
  const [billedItems, setBilledItems] = useState([]);
  const [showTerms, setShowTerms] = useState(false);
  const [customTerms, setCustomTerms] = useState(DEFAULT_TERMS_CONDITIONS.join('\n'));

  const defaultValues = useMemo(() => ({
    vendorName: '',
    vendorPhone: '',
    vendorEmail: '',
    vendorAddress: '',
    vendorGstin: '',
    deliveryAddress: FIRM_CONFIG.address,
    placeOfSupply: FIRM_CONFIG.state,
    poNumber: initialPONumber || generatePONumber(),
    poDate: new Date().toISOString().split('T')[0],
    expectedDeliveryDate: '',
    paymentTerms: 'Net 30 Days',
    deliveryTerms: 'Door Delivery',
    notes: '',
    items: [
      { description: '', hsnSacCode: '', quantity: 1, unit: 'Nos', unitPrice: 0, gstRate: 18 }
    ]
  }), [initialPONumber]);

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

  useEffect(() => {
    if (initialPONumber) {
      setValue('poNumber', initialPONumber);
    }
  }, [initialPONumber, setValue]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items'
  });

  const watchItems = watch('items');
  const watchPlaceOfSupply = watch('placeOfSupply');

  const isIntraState = watchPlaceOfSupply === FIRM_CONFIG.state;

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
    
    return calculatePOTotals(itemsToCalculate, watchPlaceOfSupply);
  }, [billedItems, watchPlaceOfSupply]);

  const isItemBilled = useCallback((index) => {
    return billedItems.some(item => item.formIndex === index);
  }, [billedItems]);

  const addToBill = useCallback((index) => {
    const items = getValues('items');
    const item = items[index];
    
    if (!item.description || !item.quantity || !item.unitPrice) {
      alert('Please fill in Description, Quantity, and Unit Price before adding to bill');
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

  const updateInBill = useCallback((index) => {
    const items = getValues('items');
    const item = items[index];
    
    if (!item.description || !item.quantity || !item.unitPrice) {
      alert('Please fill in all required fields before updating');
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

  const removeFromBill = useCallback((index) => {
    setBilledItems(prev => prev.filter(item => item.formIndex !== index));
  }, []);

  const removeItemRow = useCallback((index) => {
    removeFromBill(index);
    setBilledItems(prev => prev.map(item => ({
      ...item,
      formIndex: item.formIndex > index ? item.formIndex - 1 : item.formIndex
    })));
    remove(index);
  }, [remove, removeFromBill]);

  const addItem = useCallback(() => {
    append({ description: '', hsnSacCode: '', quantity: 1, unit: 'Nos', unitPrice: 0, gstRate: 18 });
  }, [append]);

  const handleFormSubmit = useCallback((data) => {
    if (data.vendorGstin && !validateGSTIN(data.vendorGstin)) {
      alert('Invalid GSTIN format');
      return;
    }

    if (billedItems.length === 0) {
      alert('Please add at least one item to the purchase order');
      return;
    }

    const poData = {
      ...data,
      termsConditions: customTerms,
      items: billedItems.map(item => ({
        description: item.description,
        hsnSacCode: item.hsnSacCode || '',
        quantity: parseFloat(item.quantity),
        unit: item.unit || 'Nos',
        unitPrice: parseFloat(item.unitPrice),
        gstRate: parseFloat(item.gstRate)
      })),
      ...totals
    };

    onSubmit(poData);
  }, [onSubmit, totals, billedItems, customTerms]);

  const handleReset = useCallback(() => {
    setBilledItems([]);
    setCustomTerms(DEFAULT_TERMS_CONDITIONS.join('\n'));
    reset({
      ...defaultValues,
      poNumber: generatePONumber()
    });
  }, [reset, defaultValues]);

  return (
    <div className="po-form-container">
      {/* Firm Header */}
      <div className="firm-header">
        <h2>{FIRM_CONFIG.name}</h2>
        <p>{FIRM_CONFIG.address}</p>
        <p>GSTIN: {FIRM_CONFIG.gstin} | Phone: {FIRM_CONFIG.phone}</p>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="po-form">
        {/* PO Details Section */}
        <div className="form-section">
          <h3>Purchase Order Details</h3>
          <div className="form-row">
            <div className="form-group">
              <label>PO Number *</label>
              <input
                type="text"
                {...register('poNumber', { required: true })}
                readOnly
                className="readonly-input"
              />
            </div>
            <div className="form-group">
              <label>PO Date *</label>
              <input
                type="date"
                {...register('poDate', { required: true })}
                className={errors.poDate ? 'error' : ''}
              />
            </div>
            <div className="form-group">
              <label>Expected Delivery Date</label>
              <input
                type="date"
                {...register('expectedDeliveryDate')}
              />
            </div>
          </div>
        </div>

        {/* Vendor Details Section */}
        <div className="form-section">
          <h3>Vendor Details</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Vendor Name *</label>
              <input
                type="text"
                {...register('vendorName', { required: true })}
                className={errors.vendorName ? 'error' : ''}
              />
            </div>
            <div className="form-group">
              <label>Vendor Phone</label>
              <input
                type="tel"
                {...register('vendorPhone')}
              />
            </div>
            <div className="form-group">
              <label>Vendor Email</label>
              <input
                type="email"
                {...register('vendorEmail')}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Vendor GSTIN</label>
              <input
                type="text"
                {...register('vendorGstin')}
                placeholder="e.g., 29XXXXX1234X1Z5"
                style={{ textTransform: 'uppercase' }}
              />
            </div>
            <div className="form-group">
              <label>Place of Supply *</label>
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
            </div>
          </div>
          <div className="form-row">
            <div className="form-group full-width">
              <label>Vendor Address *</label>
              <textarea
                {...register('vendorAddress', { required: true })}
                rows="2"
                className={errors.vendorAddress ? 'error' : ''}
              />
            </div>
          </div>
        </div>

        {/* Delivery Details Section */}
        <div className="form-section">
          <h3>Delivery Details</h3>
          <div className="form-row">
            <div className="form-group full-width">
              <label>Delivery Address</label>
              <textarea
                {...register('deliveryAddress')}
                rows="2"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Payment Terms</label>
              <select {...register('paymentTerms')}>
                {PAYMENT_TERMS.map(term => (
                  <option key={term} value={term}>{term}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Delivery Terms</label>
              <select {...register('deliveryTerms')}>
                {DELIVERY_TERMS.map(term => (
                  <option key={term} value={term}>{term}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tax Type Indicator */}
        <div className="tax-indicator">
          <span className={`tax-badge ${isIntraState ? 'intra-state' : 'inter-state'}`}>
            {isIntraState ? 'Intra-State Supply (CGST + SGST)' : 'Inter-State Supply (IGST)'}
          </span>
        </div>

        {/* Items Section */}
        <div className="form-section">
          <h3>Items / Services</h3>
          <div className="items-table">
            <div className="items-header">
              <div className="col-desc">Description</div>
              <div className="col-hsn">HSN/SAC</div>
              <div className="col-qty">Qty</div>
              <div className="col-unit">Unit</div>
              <div className="col-rate">Rate (₹)</div>
              <div className="col-gst">GST %</div>
              <div className="col-taxable">Taxable Value</div>
              <div className="col-action-wide">Actions</div>
            </div>

            {fields.map((field, index) => {
              const item = watchItems[index] || {};
              const taxableValue = (parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0);
              const isBilled = isItemBilled(index);

              return (
                <div key={field.id} className={`items-row ${isBilled ? 'billed' : ''}`}>
                  <div className="col-desc">
                    <input
                      type="text"
                      {...register(`items.${index}.description`, { required: true })}
                      className={errors.items?.[index]?.description ? 'error' : ''}
                    />
                  </div>
                  <div className="col-hsn">
                    <input
                      type="text"
                      {...register(`items.${index}.hsnSacCode`)}
                    />
                  </div>
                  <div className="col-qty">
                    <input
                      type="number"
                      step="1"
                      min="1"
                      {...register(`items.${index}.quantity`, { 
                        required: true,
                        valueAsNumber: true 
                      })}
                      className={errors.items?.[index]?.quantity ? 'error' : ''}
                    />
                  </div>
                  <div className="col-unit">
                    <select {...register(`items.${index}.unit`)}>
                      {UNITS.map(unit => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </select>
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
                            title="Update in PO"
                          >
                            Update
                          </button>
                          <button
                            type="button"
                            className="btn-remove-bill"
                            onClick={() => removeFromBill(index)}
                            title="Remove from PO"
                          >
                            Remove
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          className="btn-add-bill"
                          onClick={() => addToBill(index)}
                          title="Add to PO"
                        >
                          Add to PO
                        </button>
                      )}
                      {fields.length > 1 && (
                        <button
                          type="button"
                          className="btn-delete"
                          onClick={() => removeItemRow(index)}
                          title="Delete Row"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button type="button" onClick={addItem} className="btn-add-item">
            + Add Another Item
          </button>
        </div>

        {/* PO Summary */}
        {billedItems.length > 0 && (
          <div className="form-section po-summary">
            <h3>Purchase Order Summary</h3>
            <div className="summary-items">
              {billedItems.map((item, index) => (
                <div key={index} className="summary-item">
                  <span className="item-name">
                    {item.description} - {item.quantity} {item.unit} × ₹{item.unitPrice} = {formatCurrency(item.quantity * item.unitPrice)}
                  </span>
                </div>
              ))}
            </div>
            <div className="totals-section">
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
              <div className="total-row grand-total">
                <span>Grand Total:</span>
                <span>{formatCurrency(totals.grandTotal)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Notes Section */}
        <div className="form-section">
          <h3>Additional Notes</h3>
          <div className="form-row">
            <div className="form-group full-width">
              <textarea
                {...register('notes')}
                rows="2"
                placeholder="Any special instructions or notes..."
              />
            </div>
          </div>
        </div>

        {/* Terms & Conditions */}
        <div className="form-section">
          <div className="terms-header">
            <h3>Terms & Conditions</h3>
            <button 
              type="button" 
              className="btn-toggle-terms"
              onClick={() => setShowTerms(!showTerms)}
            >
              {showTerms ? 'Hide' : 'Edit'}
            </button>
          </div>
          {showTerms && (
            <div className="form-row">
              <div className="form-group full-width">
                <textarea
                  value={customTerms}
                  onChange={(e) => setCustomTerms(e.target.value)}
                  rows="6"
                  placeholder="Enter terms and conditions (one per line)"
                />
              </div>
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button type="button" onClick={handleReset} className="btn-reset">
            Reset Form
          </button>
          <button type="submit" disabled={loading || billedItems.length === 0} className="btn-submit">
            {loading ? 'Generating...' : 'Generate Purchase Order'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PurchaseOrderForm;
