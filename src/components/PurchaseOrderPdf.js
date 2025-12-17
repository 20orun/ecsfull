import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';
import { FIRM_CONFIG } from '../config/firmConfig';
import { numberToWords, formatCurrency, formatNumber, formatDate } from '../utils/purchaseOrderUtils';

// Get the logo URL - use absolute URL for production PDF generation
const getLogoUrl = () => {
  if (typeof window !== 'undefined' && window.location.origin) {
    return `${window.location.origin}/ecs-invoice.png`;
  }
  return '/ecs-invoice.png';
};

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
  poTitle: {
    textAlign: 'right'
  },
  purchaseOrderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50'
  },
  // Details Section
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
    color: '#2c3e50',
    marginBottom: 8,
    borderBottom: '1px solid #ddd',
    paddingBottom: 5
  },
  detailsText: {
    fontSize: 9,
    color: '#333',
    marginBottom: 3
  },
  detailsLabel: {
    fontWeight: 'bold',
    color: '#555'
  },
  // Items Table
  table: {
    marginBottom: 15
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#2c3e50',
    color: 'white',
    padding: 8,
    fontSize: 8,
    fontWeight: 'bold'
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1px solid #eee',
    padding: 8,
    fontSize: 8
  },
  tableRowAlt: {
    flexDirection: 'row',
    borderBottom: '1px solid #eee',
    padding: 8,
    fontSize: 8,
    backgroundColor: '#f8f9fa'
  },
  colSno: { width: '5%', textAlign: 'center' },
  colDesc: { width: '30%' },
  colHsn: { width: '10%', textAlign: 'center' },
  colQty: { width: '8%', textAlign: 'center' },
  colUnit: { width: '7%', textAlign: 'center' },
  colRate: { width: '10%', textAlign: 'right' },
  colTaxable: { width: '10%', textAlign: 'right' },
  colGst: { width: '8%', textAlign: 'center' },
  colTotal: { width: '12%', textAlign: 'right' },
  // Totals Section
  totalsSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 15
  },
  totalsBox: {
    width: '40%',
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 4
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottom: '1px solid #eee'
  },
  totalRowFinal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderTop: '2px solid #2c3e50',
    marginTop: 5
  },
  totalLabel: {
    fontSize: 9,
    color: '#555'
  },
  totalValue: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#2c3e50'
  },
  totalLabelFinal: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#2c3e50'
  },
  totalValueFinal: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#2c3e50'
  },
  // Amount in Words
  amountInWords: {
    padding: 10,
    backgroundColor: '#e8f5e9',
    borderRadius: 4,
    marginBottom: 15
  },
  amountInWordsLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 3
  },
  amountInWordsText: {
    fontSize: 9,
    color: '#333'
  },
  // Terms & Conditions
  termsSection: {
    padding: 10,
    backgroundColor: '#fff3cd',
    borderRadius: 4,
    marginBottom: 15
  },
  termsTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 8
  },
  termsText: {
    fontSize: 8,
    color: '#856404',
    marginBottom: 3
  },
  // Notes
  notesSection: {
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 4,
    marginBottom: 15
  },
  notesTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5
  },
  notesText: {
    fontSize: 9,
    color: '#333'
  },
  // Signature Section
  signatureSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    paddingTop: 20
  },
  signatureBox: {
    width: '40%',
    textAlign: 'center'
  },
  signatureLine: {
    borderTop: '1px solid #333',
    marginTop: 40,
    paddingTop: 5
  },
  signatureLabel: {
    fontSize: 9,
    color: '#555'
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    color: '#888',
    fontSize: 8,
    borderTop: '1px solid #eee',
    paddingTop: 10
  }
});

const PurchaseOrderPdf = ({ poData }) => {
  const {
    poNumber,
    poDate,
    expectedDeliveryDate,
    vendorName,
    vendorPhone,
    vendorEmail,
    vendorAddress,
    vendorGstin,
    deliveryAddress,
    placeOfSupply,
    paymentTerms,
    deliveryTerms,
    notes,
    termsConditions,
    items,
    subtotal,
    totalCgst,
    totalSgst,
    totalIgst,
    totalTaxAmount,
    grandTotal
  } = poData;

  const isIntraState = placeOfSupply === FIRM_CONFIG.state;
  const termsArray = termsConditions ? termsConditions.split('\n').filter(t => t.trim()) : [];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Image style={styles.logo} src={getLogoUrl()} />
            <View style={styles.firmInfo}>
              <Text style={styles.firmName}>{FIRM_CONFIG.name}</Text>
              <Text style={styles.firmAddress}>{FIRM_CONFIG.address}</Text>
              <Text style={styles.firmAddress}>GSTIN: {FIRM_CONFIG.gstin}</Text>
              <Text style={styles.firmAddress}>Phone: {FIRM_CONFIG.phone} | Email: {FIRM_CONFIG.email}</Text>
              <Text style={styles.firmAddress}>Website: {FIRM_CONFIG.website}</Text>
            </View>
          </View>
          <View style={styles.poTitle}>
            <Text style={styles.purchaseOrderText}>PURCHASE ORDER</Text>
          </View>
        </View>

        {/* PO Details & Vendor Details */}
        <View style={styles.detailsRow}>
          <View style={styles.detailsColumn}>
            <Text style={styles.detailsTitle}>PO Details</Text>
            <Text style={styles.detailsText}>
              <Text style={styles.detailsLabel}>PO No: </Text>{poNumber}
            </Text>
            <Text style={styles.detailsText}>
              <Text style={styles.detailsLabel}>Date: </Text>{formatDate(poDate)}
            </Text>
            {expectedDeliveryDate && (
              <Text style={styles.detailsText}>
                <Text style={styles.detailsLabel}>Expected Delivery: </Text>{formatDate(expectedDeliveryDate)}
              </Text>
            )}
            {paymentTerms && (
              <Text style={styles.detailsText}>
                <Text style={styles.detailsLabel}>Payment Terms: </Text>{paymentTerms}
              </Text>
            )}
            {deliveryTerms && (
              <Text style={styles.detailsText}>
                <Text style={styles.detailsLabel}>Delivery Terms: </Text>{deliveryTerms}
              </Text>
            )}
          </View>
          <View style={styles.detailsColumnLast}>
            <Text style={styles.detailsTitle}>Place of Supply</Text>
            <Text style={styles.detailsText}>{placeOfSupply}</Text>
            <Text style={styles.detailsText}>
              {isIntraState ? 'Intra-State (CGST + SGST)' : 'Inter-State (IGST)'}
            </Text>
          </View>
        </View>

        {/* Vendor & Delivery Address */}
        <View style={styles.addressRow}>
          <View style={styles.addressColumn}>
            <Text style={styles.detailsTitle}>Vendor Details</Text>
            <Text style={styles.detailsText}>{vendorName}</Text>
            {vendorPhone && <Text style={styles.detailsText}>Phone: {vendorPhone}</Text>}
            {vendorEmail && <Text style={styles.detailsText}>Email: {vendorEmail}</Text>}
            {vendorGstin && <Text style={styles.detailsText}>GSTIN: {vendorGstin}</Text>}
            <Text style={styles.detailsText}>{vendorAddress}</Text>
          </View>
          <View style={styles.addressColumnLast}>
            <Text style={styles.detailsTitle}>Delivery Address</Text>
            <Text style={styles.detailsText}>{deliveryAddress || FIRM_CONFIG.address}</Text>
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colSno}>S.No</Text>
            <Text style={styles.colDesc}>Description</Text>
            <Text style={styles.colHsn}>HSN/SAC</Text>
            <Text style={styles.colQty}>Qty</Text>
            <Text style={styles.colUnit}>Unit</Text>
            <Text style={styles.colRate}>Rate (₹)</Text>
            <Text style={styles.colTaxable}>Taxable</Text>
            <Text style={styles.colGst}>GST %</Text>
            <Text style={styles.colTotal}>Total (₹)</Text>
          </View>
          {items.map((item, index) => (
            <View key={index} style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
              <Text style={styles.colSno}>{index + 1}</Text>
              <Text style={styles.colDesc}>{item.description}</Text>
              <Text style={styles.colHsn}>{item.hsnSacCode || '-'}</Text>
              <Text style={styles.colQty}>{item.quantity}</Text>
              <Text style={styles.colUnit}>{item.unit || 'Nos'}</Text>
              <Text style={styles.colRate}>{formatNumber(item.unitPrice)}</Text>
              <Text style={styles.colTaxable}>{formatNumber(item.taxableValue)}</Text>
              <Text style={styles.colGst}>{item.gstRate}%</Text>
              <Text style={styles.colTotal}>{formatNumber(item.totalAmount)}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalsBox}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal:</Text>
              <Text style={styles.totalValue}>{formatCurrency(subtotal)}</Text>
            </View>
            {isIntraState ? (
              <>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>CGST:</Text>
                  <Text style={styles.totalValue}>{formatCurrency(totalCgst)}</Text>
                </View>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>SGST:</Text>
                  <Text style={styles.totalValue}>{formatCurrency(totalSgst)}</Text>
                </View>
              </>
            ) : (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>IGST:</Text>
                <Text style={styles.totalValue}>{formatCurrency(totalIgst)}</Text>
              </View>
            )}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Tax:</Text>
              <Text style={styles.totalValue}>{formatCurrency(totalTaxAmount)}</Text>
            </View>
            <View style={styles.totalRowFinal}>
              <Text style={styles.totalLabelFinal}>Grand Total:</Text>
              <Text style={styles.totalValueFinal}>{formatCurrency(grandTotal)}</Text>
            </View>
          </View>
        </View>

        {/* Amount in Words */}
        <View style={styles.amountInWords}>
          <Text style={styles.amountInWordsLabel}>Amount in Words:</Text>
          <Text style={styles.amountInWordsText}>{numberToWords(grandTotal)}</Text>
        </View>

        {/* Notes */}
        {notes && (
          <View style={styles.notesSection}>
            <Text style={styles.notesTitle}>Notes:</Text>
            <Text style={styles.notesText}>{notes}</Text>
          </View>
        )}

        {/* Terms & Conditions */}
        {termsArray.length > 0 && (
          <View style={styles.termsSection}>
            <Text style={styles.termsTitle}>Terms & Conditions:</Text>
            {termsArray.map((term, index) => (
              <Text key={index} style={styles.termsText}>• {term}</Text>
            ))}
          </View>
        )}

        {/* Signature Section */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureBox}>
            <View style={styles.signatureLine}>
              <Text style={styles.signatureLabel}>Vendor's Acceptance</Text>
            </View>
          </View>
          <View style={styles.signatureBox}>
            <View style={styles.signatureLine}>
              <Text style={styles.signatureLabel}>For {FIRM_CONFIG.name}</Text>
              <Text style={styles.signatureLabel}>Authorized Signatory</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>This is a computer-generated document. No signature is required.</Text>
          <Text>{FIRM_CONFIG.name} | {FIRM_CONFIG.phone} | {FIRM_CONFIG.email}</Text>
        </View>
      </Page>
    </Document>
  );
};

export default PurchaseOrderPdf;
