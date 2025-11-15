-- ========================================
-- PERFORMANCE INDEXES
-- Add indexes for faster queries
-- ========================================

-- Orders indexes
CREATE INDEX IF NOT EXISTS idx_orders_institution_id ON orders(institution_id);
CREATE INDEX IF NOT EXISTS idx_orders_patient_id ON orders(patient_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_is_confirmed ON orders(is_confirmed);
CREATE INDEX IF NOT EXISTS idx_orders_is_recurring ON orders(is_recurring);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);

-- Order items indexes
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- Patients indexes
CREATE INDEX IF NOT EXISTS idx_patients_institution_id ON patients(institution_id);
CREATE INDEX IF NOT EXISTS idx_patients_is_active ON patients(is_active);
CREATE INDEX IF NOT EXISTS idx_patients_unique_code ON patients(unique_code);

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_institution_id ON users(institution_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Workers indexes
CREATE INDEX IF NOT EXISTS idx_workers_institution_id ON workers(institution_id);
CREATE INDEX IF NOT EXISTS idx_workers_username ON workers(username);
CREATE INDEX IF NOT EXISTS idx_workers_is_active ON workers(is_active);

-- Products indexes
CREATE INDEX IF NOT EXISTS idx_products_type ON products(type);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_current_stock ON products(current_stock);

-- Recurring order templates indexes
CREATE INDEX IF NOT EXISTS idx_recurring_templates_institution_id ON recurring_order_templates(institution_id);
CREATE INDEX IF NOT EXISTS idx_recurring_templates_patient_id ON recurring_order_templates(patient_id);
CREATE INDEX IF NOT EXISTS idx_recurring_templates_is_active ON recurring_order_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_recurring_templates_execution_day ON recurring_order_templates(execution_day_of_month);

-- Recurring order template items indexes
CREATE INDEX IF NOT EXISTS idx_recurring_template_items_template_id ON recurring_order_template_items(template_id);
CREATE INDEX IF NOT EXISTS idx_recurring_template_items_product_id ON recurring_order_template_items(product_id);

-- Recurring order executions indexes
CREATE INDEX IF NOT EXISTS idx_recurring_executions_template_id ON recurring_order_executions(template_id);
CREATE INDEX IF NOT EXISTS idx_recurring_executions_is_approved ON recurring_order_executions(is_approved);
CREATE INDEX IF NOT EXISTS idx_recurring_executions_orders_created ON recurring_order_executions(orders_created);

-- Institutions indexes
CREATE INDEX IF NOT EXISTS idx_institutions_is_active ON institutions(is_active);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_orders_institution_status ON orders(institution_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_institution_created ON orders(institution_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_patients_institution_active ON patients(institution_id, is_active);

VACUUM ANALYZE orders;
VACUUM ANALYZE order_items;
VACUUM ANALYZE patients;
VACUUM ANALYZE products;
VACUUM ANALYZE users;
VACUUM ANALYZE workers;
VACUUM ANALYZE institutions;
VACUUM ANALYZE recurring_order_templates;
VACUUM ANALYZE recurring_order_template_items;
VACUUM ANALYZE recurring_order_executions;

-- Done
SELECT '✅ Performance indexes created successfully!' as status;
