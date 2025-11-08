-- ============================================
-- Migration: Recurring Order Templates
-- Automatske mesečne narudžbine za pacijente
-- ============================================

-- 1. Recurring Order Templates
-- Šabloni za automatske narudžbine
CREATE TABLE recurring_order_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    -- Ako je patient_id NULL, template važi za SVE pacijente u instituciji

    name VARCHAR(255) NOT NULL, -- Npr. "Mesečna narudžbina rukavica"
    is_active BOOLEAN DEFAULT true,

    -- Scheduling
    execution_day_of_month INTEGER NOT NULL CHECK (execution_day_of_month BETWEEN 1 AND 28),
    -- Dan u mesecu kada se kreira narudžbina (5. u mesecu)

    delivery_day_of_month INTEGER NOT NULL CHECK (delivery_day_of_month BETWEEN 1 AND 28),
    -- Željena datum isporuke (20. u mesecu)

    notification_days_before INTEGER NOT NULL DEFAULT 5,
    -- Broj dana pre execution_day kada se šalje notifikacija

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by_user_id UUID REFERENCES users(id)
);

-- 2. Recurring Order Template Items
-- Proizvodi i količine u template-u
CREATE TABLE recurring_order_template_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES recurring_order_templates(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Recurring Order Executions
-- Evidencija izvršenih recurring narudžbina
CREATE TABLE recurring_order_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES recurring_order_templates(id) ON DELETE CASCADE,

    -- Za koji mesec je kreirana narudžbina
    execution_month DATE NOT NULL, -- Format: YYYY-MM-01

    -- Notification tracking
    notification_sent BOOLEAN DEFAULT false,
    notification_sent_at TIMESTAMP,

    -- Approval tracking
    is_approved BOOLEAN DEFAULT false,
    approved_at TIMESTAMP,
    approved_by_user_id UUID REFERENCES users(id),

    -- Order creation tracking
    orders_created BOOLEAN DEFAULT false,
    orders_created_at TIMESTAMP,
    created_order_ids UUID[], -- Array of created order IDs

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Ensure one execution per template per month
    UNIQUE(template_id, execution_month)
);

-- Indexes for performance
CREATE INDEX idx_recurring_templates_institution ON recurring_order_templates(institution_id);
CREATE INDEX idx_recurring_templates_patient ON recurring_order_templates(patient_id);
CREATE INDEX idx_recurring_templates_active ON recurring_order_templates(is_active);
CREATE INDEX idx_recurring_template_items_template ON recurring_order_template_items(template_id);
CREATE INDEX idx_recurring_executions_template ON recurring_order_executions(template_id);
CREATE INDEX idx_recurring_executions_month ON recurring_order_executions(execution_month);
CREATE INDEX idx_recurring_executions_notification ON recurring_order_executions(notification_sent, is_approved);

-- Comments
COMMENT ON TABLE recurring_order_templates IS 'Templates for automatic recurring monthly orders';
COMMENT ON COLUMN recurring_order_templates.patient_id IS 'If NULL, template applies to ALL patients in institution';
COMMENT ON COLUMN recurring_order_templates.execution_day_of_month IS 'Day of month to create orders (e.g., 5 = 5th day)';
COMMENT ON COLUMN recurring_order_templates.delivery_day_of_month IS 'Desired delivery day of month (e.g., 20 = 20th day)';
COMMENT ON COLUMN recurring_order_templates.notification_days_before IS 'Send notification N days before execution';

COMMENT ON TABLE recurring_order_template_items IS 'Products and quantities in recurring order template';

COMMENT ON TABLE recurring_order_executions IS 'Tracking of recurring order executions per month';
COMMENT ON COLUMN recurring_order_executions.execution_month IS 'Which month this execution is for (YYYY-MM-01 format)';
COMMENT ON COLUMN recurring_order_executions.created_order_ids IS 'Array of order IDs created from this execution';

-- KRAJ
