-- =============================================
-- Excel Care Solutions Invoice System
-- Database Schema for Supabase
-- GST Compliant Invoice Management
-- =============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- INVOICE_SEQUENCES TABLE
-- Tracks consecutive invoice numbers per financial year
-- As required by Rule 46(b) of CGST Rules 2017
-- =============================================
CREATE TABLE invoice_sequences (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    financial_year VARCHAR(5) NOT NULL UNIQUE, -- Format: YY-YY (e.g., 24-25)
    last_sequence INTEGER NOT NULL DEFAULT 0,
    prefix VARCHAR(10) NOT NULL DEFAULT 'ECS',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =============================================
-- INVOICES TABLE
-- Stores invoice header information
-- =============================================
CREATE TABLE invoices (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Invoice identification
    invoice_number VARCHAR(16) UNIQUE NOT NULL, -- Max 16 chars as per GST Rule 46(b)
    financial_year VARCHAR(5) NOT NULL, -- Format: YY-YY
    sequence_number INTEGER NOT NULL, -- Sequential number within FY
    invoice_date DATE NOT NULL,
    
    -- Billing details
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20),
    customer_gstin VARCHAR(15), -- Optional, 15 characters for valid GSTIN
    customer_address TEXT NOT NULL,
    
    -- Shipping details
    shipping_name VARCHAR(255),
    shipping_phone VARCHAR(20),
    shipping_address TEXT,
    
    place_of_supply VARCHAR(100) NOT NULL, -- State name for GST calculation
    
    -- Financial totals
    subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0,
    total_cgst DECIMAL(12, 2) NOT NULL DEFAULT 0,
    total_sgst DECIMAL(12, 2) NOT NULL DEFAULT 0,
    total_igst DECIMAL(12, 2) NOT NULL DEFAULT 0,
    total_tax_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    grand_total DECIMAL(12, 2) NOT NULL DEFAULT 0,
    
    -- User tracking
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    
    -- Unique constraint for consecutive numbering per FY
    UNIQUE(financial_year, sequence_number)
);

-- =============================================
-- INVOICE_ITEMS TABLE
-- Stores individual line items for each invoice
-- =============================================
CREATE TABLE invoice_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE NOT NULL,
    
    -- Item details
    description TEXT NOT NULL,
    hsn_sac_code VARCHAR(8) NOT NULL, -- HSN/SAC codes are typically 4-8 digits
    quantity DECIMAL(10, 2) NOT NULL DEFAULT 1,
    unit_price DECIMAL(12, 2) NOT NULL,
    
    -- Tax calculation
    taxable_value DECIMAL(12, 2) NOT NULL, -- quantity * unit_price
    gst_rate DECIMAL(5, 2) NOT NULL, -- GST rate percentage (e.g., 5, 12, 18, 28)
    
    -- Individual tax amounts (calculated based on place of supply)
    cgst_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    sgst_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    igst_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(12, 2) NOT NULL, -- taxable_value + tax amounts
    
    -- Ordering
    item_order INTEGER NOT NULL DEFAULT 0
);

-- =============================================
-- INDEXES
-- For better query performance
-- =============================================
CREATE INDEX idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_created_by ON invoices(created_by);
CREATE INDEX idx_invoices_invoice_date ON invoices(invoice_date);
CREATE INDEX idx_invoices_financial_year ON invoices(financial_year);
CREATE INDEX idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX idx_invoice_sequences_fy ON invoice_sequences(financial_year);

-- =============================================
-- GET NEXT INVOICE NUMBER FUNCTION (PREVIEW ONLY)
-- Returns the next sequence number WITHOUT incrementing
-- Use this for displaying the next invoice number to the user
-- =============================================
CREATE OR REPLACE FUNCTION get_next_invoice_number_preview(p_financial_year VARCHAR(5), p_prefix VARCHAR(10) DEFAULT 'ECS')
RETURNS TABLE(invoice_number VARCHAR(16), sequence_num INTEGER) AS $$
DECLARE
    v_sequence INTEGER;
    v_invoice_number VARCHAR(16);
BEGIN
    -- Get the current last sequence for this financial year
    SELECT last_sequence INTO v_sequence
    FROM invoice_sequences
    WHERE financial_year = p_financial_year;
    
    -- If no record exists, next sequence is 1, otherwise last_sequence + 1
    IF v_sequence IS NULL THEN
        v_sequence := 1;
    ELSE
        v_sequence := v_sequence + 1;
    END IF;
    
    -- Format: PREFIX/YY-YY/NNNNN (max 16 chars)
    v_invoice_number := p_prefix || '/' || p_financial_year || '/' || LPAD(v_sequence::TEXT, 5, '0');
    
    RETURN QUERY SELECT v_invoice_number, v_sequence;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- GET NEXT INVOICE NUMBER FUNCTION (COMMIT)
-- Atomically gets and increments the sequence for a financial year
-- Returns the complete invoice number in format: PREFIX/FY/NNNNN
-- Use this when actually saving an invoice
-- =============================================
CREATE OR REPLACE FUNCTION get_next_invoice_number(p_financial_year VARCHAR(5), p_prefix VARCHAR(10) DEFAULT 'ECS')
RETURNS TABLE(invoice_number VARCHAR(16), sequence_num INTEGER) AS $$
DECLARE
    v_sequence INTEGER;
    v_invoice_number VARCHAR(16);
BEGIN
    -- Insert or update the sequence for this financial year
    INSERT INTO invoice_sequences (financial_year, last_sequence, prefix)
    VALUES (p_financial_year, 1, p_prefix)
    ON CONFLICT (financial_year) 
    DO UPDATE SET 
        last_sequence = invoice_sequences.last_sequence + 1,
        updated_at = NOW()
    RETURNING invoice_sequences.last_sequence INTO v_sequence;
    
    -- Format: PREFIX/YY-YY/NNNNN (max 16 chars)
    v_invoice_number := p_prefix || '/' || p_financial_year || '/' || LPAD(v_sequence::TEXT, 5, '0');
    
    RETURN QUERY SELECT v_invoice_number, v_sequence;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- UPDATED_AT TRIGGER
-- Automatically update the updated_at column
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_invoices_updated_at
    BEFORE UPDATE ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- All authenticated users can access all invoice data
-- =============================================

-- Enable RLS on all tables
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_sequences ENABLE ROW LEVEL SECURITY;

-- Invoice Sequences: All authenticated users can read and update (for getting next number)
CREATE POLICY "Authenticated users can read sequences" ON invoice_sequences
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can insert sequences" ON invoice_sequences
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Authenticated users can update sequences" ON invoice_sequences
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Invoices: All authenticated users can view all invoices
CREATE POLICY "Authenticated users can view all invoices" ON invoices
    FOR SELECT
    TO authenticated
    USING (true);

-- Invoices: All authenticated users can insert invoices
CREATE POLICY "Authenticated users can insert invoices" ON invoices
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Invoices: All authenticated users can update invoices
CREATE POLICY "Authenticated users can update invoices" ON invoices
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Invoices: All authenticated users can delete invoices
CREATE POLICY "Authenticated users can delete invoices" ON invoices
    FOR DELETE
    TO authenticated
    USING (true);

-- Invoice Items: All authenticated users can view all invoice items
CREATE POLICY "Authenticated users can view all invoice items" ON invoice_items
    FOR SELECT
    TO authenticated
    USING (true);

-- Invoice Items: All authenticated users can insert invoice items
CREATE POLICY "Authenticated users can insert invoice items" ON invoice_items
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Invoice Items: All authenticated users can update invoice items
CREATE POLICY "Authenticated users can update invoice items" ON invoice_items
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Invoice Items: All authenticated users can delete invoice items
CREATE POLICY "Authenticated users can delete invoice items" ON invoice_items
    FOR DELETE
    TO authenticated
    USING (true);

-- =============================================
-- COMMENTS
-- Documentation for the schema
-- =============================================
COMMENT ON TABLE invoices IS 'Stores GST compliant invoice headers for Excel Care Solutions';
COMMENT ON TABLE invoice_items IS 'Stores line items for each invoice';
COMMENT ON COLUMN invoices.place_of_supply IS 'Indian state name - determines CGST/SGST vs IGST';
COMMENT ON COLUMN invoices.customer_gstin IS '15-character GSTIN, optional for unregistered customers';
COMMENT ON COLUMN invoice_items.hsn_sac_code IS 'HSN code for goods or SAC code for services';
COMMENT ON COLUMN invoice_items.gst_rate IS 'GST rate as percentage (5, 12, 18, 28)';
