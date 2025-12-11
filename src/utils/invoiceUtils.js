import { FIRM_CONFIG } from '../config/firmConfig';

/**
 * Calculate GST for a line item based on place of supply
 * @param {number} taxableValue - The taxable value (quantity * unit price)
 * @param {number} gstRate - The GST rate percentage (e.g., 18)
 * @param {string} placeOfSupply - The state where goods/services are supplied
 * @returns {Object} Object containing cgst, sgst, igst amounts and total
 */
export const calculateItemGST = (taxableValue, gstRate, placeOfSupply) => {
  const isIntraState = placeOfSupply === FIRM_CONFIG.state;
  
  let cgstAmount = 0;
  let sgstAmount = 0;
  let igstAmount = 0;
  
  if (isIntraState) {
    // Intra-state: Split GST into CGST and SGST
    const halfRate = gstRate / 2;
    cgstAmount = roundToTwo((taxableValue * halfRate) / 100);
    sgstAmount = roundToTwo((taxableValue * halfRate) / 100);
  } else {
    // Inter-state: Full IGST
    igstAmount = roundToTwo((taxableValue * gstRate) / 100);
  }
  
  const totalTax = cgstAmount + sgstAmount + igstAmount;
  const totalAmount = roundToTwo(taxableValue + totalTax);
  
  return {
    cgstRate: isIntraState ? gstRate / 2 : 0,
    sgstRate: isIntraState ? gstRate / 2 : 0,
    igstRate: isIntraState ? 0 : gstRate,
    cgstAmount,
    sgstAmount,
    igstAmount,
    totalTax,
    totalAmount
  };
};

/**
 * Calculate totals for all invoice items
 * @param {Array} items - Array of invoice items
 * @param {string} placeOfSupply - The state where goods/services are supplied
 * @returns {Object} Object containing subtotal, tax totals, and grand total
 */
export const calculateInvoiceTotals = (items, placeOfSupply) => {
  let subtotal = 0;
  let totalCgst = 0;
  let totalSgst = 0;
  let totalIgst = 0;
  
  const calculatedItems = items.map((item, index) => {
    const taxableValue = roundToTwo(item.quantity * item.unitPrice);
    const gstCalc = calculateItemGST(taxableValue, item.gstRate, placeOfSupply);
    
    subtotal += taxableValue;
    totalCgst += gstCalc.cgstAmount;
    totalSgst += gstCalc.sgstAmount;
    totalIgst += gstCalc.igstAmount;
    
    return {
      ...item,
      taxableValue,
      ...gstCalc,
      itemOrder: index + 1
    };
  });
  
  const totalTaxAmount = roundToTwo(totalCgst + totalSgst + totalIgst);
  const grandTotal = roundToTwo(subtotal + totalTaxAmount);
  
  return {
    items: calculatedItems,
    subtotal: roundToTwo(subtotal),
    totalCgst: roundToTwo(totalCgst),
    totalSgst: roundToTwo(totalSgst),
    totalIgst: roundToTwo(totalIgst),
    totalTaxAmount,
    grandTotal
  };
};

/**
 * Round number to 2 decimal places
 * @param {number} num - Number to round
 * @returns {number} Rounded number
 */
export const roundToTwo = (num) => {
  return Math.round((num + Number.EPSILON) * 100) / 100;
};

/**
 * Format currency in Indian Rupees with symbol
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string with ₹ symbol
 */
export const formatCurrency = (amount) => {
  return '₹' + new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

/**
 * Format number in Indian style without currency symbol
 * @param {number} amount - Amount to format
 * @returns {string} Formatted number string without symbol
 */
export const formatNumber = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

/**
 * Convert number to words (Indian numbering system)
 * @param {number} num - Number to convert
 * @returns {string} Number in words
 */
export const numberToWords = (num) => {
  if (num === 0) return 'Zero Rupees Only';
  
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  const convertLessThanThousand = (n) => {
    if (n === 0) return '';
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
    return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + convertLessThanThousand(n % 100) : '');
  };
  
  // Handle negative numbers
  if (num < 0) return 'Negative ' + numberToWords(Math.abs(num));
  
  // Split into rupees and paise
  const rupees = Math.floor(num);
  const paise = Math.round((num - rupees) * 100);
  
  let result = '';
  
  if (rupees > 0) {
    // Indian numbering: Crore, Lakh, Thousand, Hundred
    const crore = Math.floor(rupees / 10000000);
    const lakh = Math.floor((rupees % 10000000) / 100000);
    const thousand = Math.floor((rupees % 100000) / 1000);
    const hundred = rupees % 1000;
    
    if (crore > 0) result += convertLessThanThousand(crore) + ' Crore ';
    if (lakh > 0) result += convertLessThanThousand(lakh) + ' Lakh ';
    if (thousand > 0) result += convertLessThanThousand(thousand) + ' Thousand ';
    if (hundred > 0) result += convertLessThanThousand(hundred);
    
    result = result.trim() + ' Rupees';
  }
  
  if (paise > 0) {
    result += (rupees > 0 ? ' and ' : '') + convertLessThanThousand(paise) + ' Paise';
  }
  
  return result.trim() + ' Only';
};

/**
 * Validate GSTIN format
 * @param {string} gstin - GSTIN to validate
 * @returns {boolean} True if valid format
 */
export const validateGSTIN = (gstin) => {
  if (!gstin) return true; // Optional field
  
  // GSTIN format: 2 digit state code + 10 char PAN + 1 entity code + 1 Z + 1 checksum
  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return gstinRegex.test(gstin.toUpperCase());
};

/**
 * Get current financial year in format YY-YY (e.g., 24-25 for April 2024 to March 2025)
 * Financial year in India runs from April 1 to March 31
 * @returns {string} Financial year string
 */
export const getFinancialYear = () => {
  const date = new Date();
  const month = date.getMonth(); // 0-11
  const year = date.getFullYear();
  
  // If month is Jan-Mar (0-2), we're in the previous financial year
  // If month is Apr-Dec (3-11), we're in the current financial year
  const fyStartYear = month < 3 ? year - 1 : year;
  const fyEndYear = fyStartYear + 1;
  
  return `${fyStartYear.toString().slice(-2)}-${fyEndYear.toString().slice(-2)}`;
};

/**
 * Generate GST-compliant invoice number
 * Format: PREFIX/FY/NNNNN (max 16 characters as per Rule 46(b) of CGST Rules 2017)
 * - PREFIX: Firm prefix from config (e.g., ECS - 3 chars)
 * - FY: Financial year e.g., 24-25 (5 chars)
 * - NNNNN: Sequential number (5 digits)
 * Total: 3 + 1 + 5 + 1 + 5 = 15 characters (within 16 char limit)
 * 
 * Note: In production, the sequential number should be fetched from database
 * to ensure uniqueness and consecutive numbering
 * @returns {string} Generated invoice number
 */
export const generateInvoiceNumber = () => {
  const prefix = FIRM_CONFIG.invoicePrefix || 'INV';
  const fy = getFinancialYear();
  
  // In production, this should come from database to ensure consecutive numbering
  // For now, using timestamp-based number (last 5 digits)
  const timestamp = Date.now();
  const seqNum = (timestamp % 100000).toString().padStart(5, '0');
  
  // Format: ECS/24-25/00001 (15 characters)
  return `${prefix}/${fy}/${seqNum}`;
};

/**
 * Validate invoice number format as per GST Rule 46(b)
 * @param {string} invoiceNumber - Invoice number to validate
 * @returns {boolean} True if valid
 */
export const validateInvoiceNumber = (invoiceNumber) => {
  if (!invoiceNumber || typeof invoiceNumber !== 'string') return false;
  
  // Max 16 characters
  if (invoiceNumber.length > 16) return false;
  
  // Only allowed characters: alphabets, numerals, hyphen, slash
  const validPattern = /^[A-Za-z0-9/-]+$/;
  if (!validPattern.test(invoiceNumber)) return false;
  
  return true;
};

/**
 * Format date for display
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};
