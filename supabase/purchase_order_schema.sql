-- =====================================================
-- Purchase Order Tables and Policies for Supabase
-- Run this SQL in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- 1. Create purchase_orders table
-- =====================================================
CREATE TABLE IF NOT EXISTS purchase_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    po_number VARCHAR(20) NOT NULL UNIQUE,
    financial_year VARCHAR(10) NOT NULL,
    sequence_number INTEGER NOT NULL,
    po_date DATE NOT NULL,
    expected_delivery_date DATE,
    
    -- Vendor Details
    vendor_name VARCHAR(255) NOT NULL,
    vendor_phone VARCHAR(20),
    vendor_email VARCHAR(255),
    vendor_gstin VARCHAR(15),
    vendor_address TEXT NOT NULL,
    
    -- Delivery Details
    delivery_address TEXT,
    place_of_supply VARCHAR(100) NOT NULL,
    payment_terms VARCHAR(100),
    delivery_terms VARCHAR(100),
    
    -- Notes & Terms
    notes TEXT,
    terms_conditions TEXT,
    
    -- Amounts
    subtotal DECIMAL(15, 2) NOT NULL,
    total_cgst DECIMAL(15, 2) DEFAULT 0,
    total_sgst DECIMAL(15, 2) DEFAULT 0,
    total_igst DECIMAL(15, 2) DEFAULT 0,
    total_tax_amount DECIMAL(15, 2) NOT NULL,
    grand_total DECIMAL(15, 2) NOT NULL,
    
    -- Status
    status VARCHAR(20) DEFAULT 'draft',
    
    -- Audit Fields
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on po_number for faster lookups
CREATE INDEX IF NOT EXISTS idx_purchase_orders_po_number ON purchase_orders(po_number);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_financial_year ON purchase_orders(financial_year);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_vendor_name ON purchase_orders(vendor_name);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_created_by ON purchase_orders(created_by);

-- =====================================================
-- 2. Create purchase_order_items table
-- =====================================================
CREATE TABLE IF NOT EXISTS purchase_order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    description VARCHAR(500) NOT NULL,
    hsn_sac_code VARCHAR(10),
    quantity DECIMAL(10, 2) NOT NULL,
    unit VARCHAR(20) DEFAULT 'Nos',
    unit_price DECIMAL(15, 2) NOT NULL,
    taxable_value DECIMAL(15, 2) NOT NULL,
    gst_rate DECIMAL(5, 2) NOT NULL,
    cgst_amount DECIMAL(15, 2) DEFAULT 0,
    sgst_amount DECIMAL(15, 2) DEFAULT 0,
    igst_amount DECIMAL(15, 2) DEFAULT 0,
    total_amount DECIMAL(15, 2) NOT NULL,
    item_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on purchase_order_id for faster joins
CREATE INDEX IF NOT EXISTS idx_po_items_purchase_order_id ON purchase_order_items(purchase_order_id);

-- =====================================================
-- 3. Create po_number_sequence table for tracking sequences
-- =====================================================
CREATE TABLE IF NOT EXISTS po_number_sequence (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    financial_year VARCHAR(10) NOT NULL UNIQUE,
    last_sequence INTEGER DEFAULT 0,
    prefix VARCHAR(10) DEFAULT 'ECS',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. Create function to get next PO number (preview - doesn't increment)
-- =====================================================
CREATE OR REPLACE FUNCTION get_next_po_number_preview(
    p_financial_year VARCHAR,
    p_prefix VARCHAR DEFAULT 'ECS'
)
RETURNS TABLE (po_number VARCHAR, sequence_num INTEGER) AS $$
DECLARE
    v_next_sequence INTEGER;
BEGIN
    -- Get the current sequence or default to 0
    SELECT COALESCE(last_sequence, 0) + 1 INTO v_next_sequence
    FROM po_number_sequence
    WHERE financial_year = p_financial_year;
    
    -- If no record exists, start from 1
    IF v_next_sequence IS NULL THEN
        v_next_sequence := 1;
    END IF;
    
    -- Return the preview PO number (format: ECS/PO/25-26/00001)
    RETURN QUERY SELECT 
        (p_prefix || '/PO/' || p_financial_year || '/' || LPAD(v_next_sequence::TEXT, 5, '0'))::VARCHAR,
        v_next_sequence;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 5. Create function to commit and get next PO number (increments sequence)
-- =====================================================
CREATE OR REPLACE FUNCTION get_next_po_number(
    p_financial_year VARCHAR,
    p_prefix VARCHAR DEFAULT 'ECS'
)
RETURNS TABLE (po_number VARCHAR, sequence_num INTEGER) AS $$
DECLARE
    v_next_sequence INTEGER;
BEGIN
    -- Lock and update the sequence atomically using UPSERT
    INSERT INTO po_number_sequence (financial_year, last_sequence, prefix)
    VALUES (p_financial_year, 1, p_prefix)
    ON CONFLICT (financial_year) 
    DO UPDATE SET 
        last_sequence = po_number_sequence.last_sequence + 1,
        updated_at = NOW()
    RETURNING last_sequence INTO v_next_sequence;
    
    -- Return the committed PO number
    RETURN QUERY SELECT 
        (p_prefix || '/PO/' || p_financial_year || '/' || LPAD(v_next_sequence::TEXT, 5, '0'))::VARCHAR,
        v_next_sequence;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 6. Enable Row Level Security (RLS)
-- =====================================================
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE po_number_sequence ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 7. Create RLS Policies for purchase_orders
-- =====================================================

-- Policy: Allow all authenticated users to view all POs
CREATE POLICY "Allow authenticated users to view all purchase orders"
    ON purchase_orders
    FOR SELECT
    TO authenticated
    USING (true);

-- Policy: Allow authenticated users to insert POs
CREATE POLICY "Allow authenticated users to insert purchase orders"
    ON purchase_orders
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = created_by);

-- Policy: Allow authenticated users to update all POs
CREATE POLICY "Allow authenticated users to update purchase orders"
    ON purchase_orders
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Policy: Allow authenticated users to delete their own POs
CREATE POLICY "Allow authenticated users to delete their purchase orders"
    ON purchase_orders
    FOR DELETE
    TO authenticated
    USING (auth.uid() = created_by);

-- =====================================================
-- 8. Create RLS Policies for purchase_order_items
-- =====================================================

-- Policy: Allow all authenticated users to view all PO items
CREATE POLICY "Allow authenticated users to view all po items"
    ON purchase_order_items
    FOR SELECT
    TO authenticated
    USING (true);

-- Policy: Allow authenticated users to insert PO items
CREATE POLICY "Allow authenticated users to insert po items"
    ON purchase_order_items
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Policy: Allow authenticated users to update PO items
CREATE POLICY "Allow authenticated users to update po items"
    ON purchase_order_items
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Policy: Allow authenticated users to delete PO items
CREATE POLICY "Allow authenticated users to delete po items"
    ON purchase_order_items
    FOR DELETE
    TO authenticated
    USING (true);

-- =====================================================
-- 9. Create RLS Policies for po_number_sequence
-- =====================================================

-- Policy: Allow authenticated users to view sequence
CREATE POLICY "Allow authenticated users to view po sequence"
    ON po_number_sequence
    FOR SELECT
    TO authenticated
    USING (true);

-- Policy: Allow authenticated users to insert sequence
CREATE POLICY "Allow authenticated users to insert po sequence"
    ON po_number_sequence
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Policy: Allow authenticated users to update sequence
CREATE POLICY "Allow authenticated users to update po sequence"
    ON po_number_sequence
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- =====================================================
-- 10. Create trigger to auto-update updated_at timestamp
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for purchase_orders
DROP TRIGGER IF EXISTS update_purchase_orders_updated_at ON purchase_orders;
CREATE TRIGGER update_purchase_orders_updated_at
    BEFORE UPDATE ON purchase_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 11. Grant necessary permissions
-- =====================================================
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON purchase_orders TO authenticated;
GRANT ALL ON purchase_order_items TO authenticated;
GRANT ALL ON po_number_sequence TO authenticated;

-- Grant execute permission on functions
GRANT EXECUTE ON FUNCTION get_next_po_number_preview(VARCHAR, VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION get_next_po_number(VARCHAR, VARCHAR) TO authenticated;

-- =====================================================
-- DONE! Purchase Order tables, policies, and functions created.
-- =====================================================
