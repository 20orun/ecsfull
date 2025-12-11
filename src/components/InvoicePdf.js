import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';
import { FIRM_CONFIG } from '../config/firmConfig';
import { numberToWords, formatCurrency, formatNumber, formatDate } from '../utils/invoiceUtils';

// Register Roboto font from Google Fonts which supports Rupee symbol
Font.register({
  family: 'Roboto',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Me5Q.ttf',
      fontWeight: 400,
    },
    {
      src: 'https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlvAw.ttf',
      fontWeight: 700,
    },
  ],
});

// PDF Styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 9,
    fontFamily: 'Roboto'
  },
  // Header Section
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    borderBottom: '2px solid #2c3e50',
    paddingBottom: 15
  },
  logo: {
    width: 60,
    height: 60,
    marginRight: 10
  },
  headerContent: {
    flexDirection: 'row',
    flex: 1
  },
  firmInfo: {
    flex: 1
  },
  firmName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5
  },
  firmAddress: {
    fontSize: 9,
    color: '#555',
    marginBottom: 2
  },
  invoiceTitle: {
    textAlign: 'right'
  },
  taxInvoice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50'
  },
  // Invoice Details
  detailsRow: {
    flexDirection: 'row',
    marginBottom: 15
  },
  addressRow: {
    flexDirection: 'row',
    marginBottom: 15
  },
  detailsColumn: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 4,
    marginRight: 10
  },
  addressColumn: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 4,
    marginRight: 10
  },
  addressColumnLast: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 4
  },
  detailsColumnLast: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 4
  },
  detailsTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2c3e50',
    borderBottom: '1px solid #ddd',
    paddingBottom: 4
  },
  detailsText: {
    fontSize: 9,
    marginBottom: 3,
    color: '#333'
  },
  detailsLabel: {
    fontWeight: 'bold',
    color: '#555'
  },
  // Items Table
  table: {
    marginTop: 10,
    marginBottom: 20,
    border: '1px solid #ddd'
  },
  tableHeaderRow1: {
    flexDirection: 'row',
    backgroundColor: '#2c3e50',
    color: 'white',
    paddingVertical: 6,
    paddingHorizontal: 4,
    fontWeight: 'bold',
    fontSize: 9
  },
  tableHeaderRow2: {
    flexDirection: 'row',
    backgroundColor: '#3d5166',
    color: 'white',
    paddingVertical: 4,
    paddingHorizontal: 4,
    fontWeight: 'bold',
    fontSize: 8
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1px solid #ddd',
    paddingVertical: 6,
    paddingHorizontal: 4,
    fontSize: 9,
    alignItems: 'center'
  },
  tableRowAlt: {
    flexDirection: 'row',
    borderBottom: '1px solid #ddd',
    paddingVertical: 6,
    paddingHorizontal: 4,
    fontSize: 9,
    backgroundColor: '#f9f9f9',
    alignItems: 'center'
  },
  // Column widths - simplified layout with borders
  colSr: { width: '5%', textAlign: 'center', borderRight: '1px solid #ccc', paddingRight: 2 },
  colDesc: { width: '25%', paddingLeft: 4, paddingRight: 4, borderRight: '1px solid #ccc' },
  colHsn: { width: '10%', textAlign: 'center', borderRight: '1px solid #ccc' },
  colQty: { width: '6%', textAlign: 'center', borderRight: '1px solid #ccc' },
  colRate: { width: '10%', textAlign: 'right', paddingRight: 4, borderRight: '1px solid #ccc' },
  colTaxable: { width: '12%', textAlign: 'right', paddingRight: 4, borderRight: '1px solid #ccc' },
  colTotal: { width: '12%', textAlign: 'right', paddingRight: 4 },
  // Tax column group (contains % and Amt)
  taxColumnGroup: {
    width: '10%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRight: '1px solid #ccc'
  },
  taxColumnGroupWide: {
    width: '20%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRight: '1px solid #ccc'
  },
  taxPercent: {
    width: '40%',
    textAlign: 'right',
    fontSize: 8,
    paddingRight: 2,
    borderRight: '0.5px solid #ddd'
  },
  taxAmount: {
    width: '60%',
    textAlign: 'right',
    fontSize: 9,
    paddingRight: 3
  },
  // Sub-header styles
  subHeaderContainer: {
    flexDirection: 'row',
    width: '10%',
    justifyContent: 'space-between',
    borderRight: '1px solid #4a6278'
  },
  subHeaderContainerWide: {
    flexDirection: 'row',
    width: '20%',
    justifyContent: 'space-between'
  },
  subHeaderText: {
    width: '50%',
    textAlign: 'center',
    fontSize: 7
  },
  // Totals Section
  totalsSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10
  },
  totalsBox: {
    width: 250,
    borderRadius: 4,
    overflow: 'hidden'
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 6,
    borderBottom: '1px solid #eee',
    backgroundColor: '#f8f9fa'
  },
  totalRowGrand: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 8,
    backgroundColor: '#2c3e50',
    color: 'white',
    fontWeight: 'bold',
    fontSize: 11
  },
  totalLabel: {
    fontWeight: 'bold'
  },
  // Amount in Words
  amountWords: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 4
  },
  amountWordsLabel: {
    fontWeight: 'bold',
    marginBottom: 3
  },
  amountWordsText: {
    color: '#333'
  },
  // Footer Section
  footer: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  bankDetails: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 4,
    marginRight: 15
  },
  bankTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2c3e50',
    borderBottom: '1px solid #ddd',
    paddingBottom: 4
  },
  bankText: {
    fontSize: 8,
    marginBottom: 2
  },
  signatureBox: {
    width: 180,
    textAlign: 'center',
    padding: 10
  },
  signatureLine: {
    borderTop: '1px solid #333',
    marginTop: 50,
    paddingTop: 5
  },
  signatureText: {
    fontSize: 9,
    fontWeight: 'bold'
  },
  // Jurisdiction
  jurisdiction: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 8,
    color: '#666'
  }
});

const InvoicePdf = ({ invoiceData }) => {
  const {
    invoiceNumber,
    invoiceDate,
    customerName,
    customerPhone,
    customerAddress,
    customerGstin,
    shippingName,
    shippingPhone,
    shippingAddress,
    placeOfSupply,
    items,
    subtotal,
    totalCgst,
    totalSgst,
    totalIgst,
    totalTaxAmount,
    grandTotal
  } = invoiceData;

  const isIntraState = placeOfSupply === FIRM_CONFIG.state;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Image style={styles.logo} src="/ecs-invoice.png" />
            <View style={styles.firmInfo}>
              <Text style={styles.firmName}>{FIRM_CONFIG.name}</Text>
              <Text style={styles.firmAddress}>{FIRM_CONFIG.address}</Text>
              <Text style={styles.firmAddress}>GSTIN: {FIRM_CONFIG.gstin}</Text>
              <Text style={styles.firmAddress}>Phone: {FIRM_CONFIG.phone} | Email: {FIRM_CONFIG.email}</Text>
              <Text style={styles.firmAddress}>Website: {FIRM_CONFIG.website}</Text>
            </View>
          </View>
          <View style={styles.invoiceTitle}>
            <Text style={styles.taxInvoice}>TAX INVOICE</Text>
          </View>
        </View>

        {/* Invoice & Customer Details */}
        <View style={styles.detailsRow}>
          <View style={styles.detailsColumn}>
            <Text style={styles.detailsTitle}>Invoice Details</Text>
            <Text style={styles.detailsText}>
              <Text style={styles.detailsLabel}>Invoice No: </Text>{invoiceNumber}
            </Text>
            <Text style={styles.detailsText}>
              <Text style={styles.detailsLabel}>Date: </Text>{formatDate(invoiceDate)}
            </Text>
          </View>
          <View style={styles.detailsColumnLast}>
            <Text style={styles.detailsTitle}>Place of Supply</Text>
            <Text style={styles.detailsText}>{placeOfSupply}</Text>
            <Text style={styles.detailsText}>
              {placeOfSupply === FIRM_CONFIG.state ? 'Intra-State (CGST + SGST)' : 'Inter-State (IGST)'}
            </Text>
          </View>
        </View>

        {/* Billing & Shipping Address */}
        <View style={styles.addressRow}>
          <View style={styles.addressColumn}>
            <Text style={styles.detailsTitle}>Billing Address</Text>
            <Text style={styles.detailsText}>
              <Text style={styles.detailsLabel}>{customerName}</Text>
            </Text>
            {customerPhone && (
              <Text style={styles.detailsText}>
                <Text style={styles.detailsLabel}>Phone: </Text>{customerPhone}
              </Text>
            )}
            <Text style={styles.detailsText}>{customerAddress}</Text>
            {customerGstin && (
              <Text style={styles.detailsText}>
                <Text style={styles.detailsLabel}>GSTIN: </Text>{customerGstin}
              </Text>
            )}
          </View>
          <View style={styles.addressColumnLast}>
            <Text style={styles.detailsTitle}>Shipping Address</Text>
            <Text style={styles.detailsText}>
              <Text style={styles.detailsLabel}>{shippingName || customerName}</Text>
            </Text>
            {(shippingPhone || customerPhone) && (
              <Text style={styles.detailsText}>
                <Text style={styles.detailsLabel}>Phone: </Text>{shippingPhone || customerPhone}
              </Text>
            )}
            <Text style={styles.detailsText}>{shippingAddress || customerAddress}</Text>
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          {/* Header Row 1 - Main headers */}
          <View style={styles.tableHeaderRow1}>
            <Text style={{...styles.colSr, borderRight: '1px solid #4a6278'}}>Sr.</Text>
            <Text style={{...styles.colDesc, borderRight: '1px solid #4a6278'}}>Description</Text>
            <Text style={{...styles.colHsn, borderRight: '1px solid #4a6278'}}>HSN/SAC</Text>
            <Text style={{...styles.colQty, borderRight: '1px solid #4a6278'}}>Qty</Text>
            <Text style={{...styles.colRate, borderRight: '1px solid #4a6278'}}>Rate</Text>
            <Text style={{...styles.colTaxable, borderRight: '1px solid #4a6278'}}>Taxable Amt</Text>
            {isIntraState ? (
              <>
                <Text style={{ width: '10%', textAlign: 'center', borderRight: '1px solid #4a6278' }}>CGST</Text>
                <Text style={{ width: '10%', textAlign: 'center', borderRight: '1px solid #4a6278' }}>SGST</Text>
              </>
            ) : (
              <Text style={{ width: '20%', textAlign: 'center', borderRight: '1px solid #4a6278' }}>IGST</Text>
            )}
            <Text style={styles.colTotal}>Total</Text>
          </View>
          {/* Header Row 2 - Sub headers (% and Amt) */}
          <View style={styles.tableHeaderRow2}>
            <Text style={{...styles.colSr, borderRight: '1px solid #4a6278'}}></Text>
            <Text style={{...styles.colDesc, borderRight: '1px solid #4a6278'}}></Text>
            <Text style={{...styles.colHsn, borderRight: '1px solid #4a6278'}}></Text>
            <Text style={{...styles.colQty, borderRight: '1px solid #4a6278'}}></Text>
            <Text style={{...styles.colRate, borderRight: '1px solid #4a6278'}}></Text>
            <Text style={{...styles.colTaxable, borderRight: '1px solid #4a6278'}}></Text>
            {isIntraState ? (
              <>
                <View style={styles.subHeaderContainer}>
                  <Text style={styles.subHeaderText}>%</Text>
                  <Text style={styles.subHeaderText}>Amt</Text>
                </View>
                <View style={styles.subHeaderContainer}>
                  <Text style={styles.subHeaderText}>%</Text>
                  <Text style={styles.subHeaderText}>Amt</Text>
                </View>
              </>
            ) : (
              <View style={styles.subHeaderContainerWide}>
                <Text style={styles.subHeaderText}>%</Text>
                <Text style={styles.subHeaderText}>Amt</Text>
              </View>
            )}
            <Text style={styles.colTotal}></Text>
          </View>

          {items.map((item, index) => (
            <View 
              key={index} 
              style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}
            >
              <Text style={styles.colSr}>{index + 1}</Text>
              <Text style={styles.colDesc}>{item.description}</Text>
              <Text style={styles.colHsn}>{item.hsnSacCode}</Text>
              <Text style={styles.colQty}>{item.quantity}</Text>
              <Text style={styles.colRate}>{item.unitPrice.toFixed(2)}</Text>
              <Text style={styles.colTaxable}>{item.taxableValue.toFixed(2)}</Text>
              {isIntraState ? (
                <>
                  <View style={styles.taxColumnGroup}>
                    <Text style={styles.taxPercent}>{item.cgstRate.toFixed(2)}</Text>
                    <Text style={styles.taxAmount}>{item.cgstAmount.toFixed(2)}</Text>
                  </View>
                  <View style={styles.taxColumnGroup}>
                    <Text style={styles.taxPercent}>{item.sgstRate.toFixed(2)}</Text>
                    <Text style={styles.taxAmount}>{item.sgstAmount.toFixed(2)}</Text>
                  </View>
                </>
              ) : (
                <View style={styles.taxColumnGroupWide}>
                  <Text style={styles.taxPercent}>{item.igstRate.toFixed(2)}</Text>
                  <Text style={styles.taxAmount}>{item.igstAmount.toFixed(2)}</Text>
                </View>
              )}
              <Text style={styles.colTotal}>{item.totalAmount.toFixed(2)}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalsBox}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal:</Text>
              <Text>₹{formatNumber(subtotal)}</Text>
            </View>
            {isIntraState ? (
              <>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>CGST:</Text>
                  <Text>₹{formatNumber(totalCgst)}</Text>
                </View>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>SGST:</Text>
                  <Text>₹{formatNumber(totalSgst)}</Text>
                </View>
              </>
            ) : (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>IGST:</Text>
                <Text>₹{formatNumber(totalIgst)}</Text>
              </View>
            )}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Tax:</Text>
              <Text>₹{formatNumber(totalTaxAmount)}</Text>
            </View>
            <View style={styles.totalRowGrand}>
              <Text>Grand Total:</Text>
              <Text>₹{formatNumber(grandTotal)}</Text>
            </View>
          </View>
        </View>

        {/* Amount in Words */}
        <View style={styles.amountWords}>
          <Text style={styles.amountWordsLabel}>Amount in Words:</Text>
          <Text style={styles.amountWordsText}>{numberToWords(grandTotal)}</Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={{ flex: 1 }}></View>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLine}></Text>
            <Text style={styles.signatureText}>Authorised Signatory</Text>
            <Text style={{ fontSize: 8 }}>For {FIRM_CONFIG.name}</Text>
          </View>
        </View>

        {/* Jurisdiction */}
        <Text style={styles.jurisdiction}>
          Subject to {FIRM_CONFIG.jurisdiction} Jurisdiction. This is a computer generated invoice.
        </Text>
      </Page>
    </Document>
  );
};

export default InvoicePdf;
