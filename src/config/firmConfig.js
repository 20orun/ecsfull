// Excel Care Solutions - Firm Configuration
// Update these values with your actual business details

export const FIRM_CONFIG = {
  name: 'Excel Care Solutions',
  address: 'Cabin No X, Brindaban Business Centre, Manimala Road, Cochin, Kerala, India - 682024',
  gstin: '32AAMFE1322R1ZB', // Replace with actual GSTIN
  state: 'Kerala', // Firm's state for CGST/SGST vs IGST determination
  stateCode: '32', // Kerala state code
  phone: '+91 9446360977',
  email: 'info@excelcare.us',
  website: 'www.excelcare.us',
  // Invoice number prefix (max 3-4 chars recommended to stay within 16 char limit)
  // Format: PREFIX/FY/NNNNN (e.g., ECS/24-25/00001)
  invoicePrefix: 'ECS',
  bankDetails: {
    bankName: 'State Bank of India',
    accountNumber: '1234567890123456',
    ifscCode: 'SBIN0001234',
    branchName: 'Bangalore Main Branch'
  },
  jurisdiction: 'Kerala'
};

// Indian States with GST Codes
export const INDIAN_STATES = [
  { code: '01', name: 'Jammu and Kashmir' },
  { code: '02', name: 'Himachal Pradesh' },
  { code: '03', name: 'Punjab' },
  { code: '04', name: 'Chandigarh' },
  { code: '05', name: 'Uttarakhand' },
  { code: '06', name: 'Haryana' },
  { code: '07', name: 'Delhi' },
  { code: '08', name: 'Rajasthan' },
  { code: '09', name: 'Uttar Pradesh' },
  { code: '10', name: 'Bihar' },
  { code: '11', name: 'Sikkim' },
  { code: '12', name: 'Arunachal Pradesh' },
  { code: '13', name: 'Nagaland' },
  { code: '14', name: 'Manipur' },
  { code: '15', name: 'Mizoram' },
  { code: '16', name: 'Tripura' },
  { code: '17', name: 'Meghalaya' },
  { code: '18', name: 'Assam' },
  { code: '19', name: 'West Bengal' },
  { code: '20', name: 'Jharkhand' },
  { code: '21', name: 'Odisha' },
  { code: '22', name: 'Chhattisgarh' },
  { code: '23', name: 'Madhya Pradesh' },
  { code: '24', name: 'Gujarat' },
  { code: '25', name: 'Daman and Diu' },
  { code: '26', name: 'Dadra and Nagar Haveli' },
  { code: '27', name: 'Maharashtra' },
  { code: '28', name: 'Andhra Pradesh' },
  { code: '29', name: 'Karnataka' },
  { code: '30', name: 'Goa' },
  { code: '31', name: 'Lakshadweep' },
  { code: '32', name: 'Kerala' },
  { code: '33', name: 'Tamil Nadu' },
  { code: '34', name: 'Puducherry' },
  { code: '35', name: 'Andaman and Nicobar Islands' },
  { code: '36', name: 'Telangana' },
  { code: '37', name: 'Andhra Pradesh (New)' },
  { code: '38', name: 'Ladakh' }
];

// Common GST Rates
export const GST_RATES = [0, 5, 12, 18, 28];
