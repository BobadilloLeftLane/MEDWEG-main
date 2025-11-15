-- ========================================
-- CLEANUP DATABASE - Keep only admin@gmail.com and admin's products
-- ========================================
-- IMPORTANT: This will delete all data except admin user and products created by admin
-- Run this in pgAdmin Query Tool

BEGIN;

-- Get admin user ID
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Find admin user
  SELECT id INTO admin_user_id FROM users WHERE email = 'admin@gmail.com' LIMIT 1;

  IF admin_user_id IS NULL THEN
    RAISE EXCEPTION 'Admin user not found!';
  END IF;

  RAISE NOTICE 'Admin user ID: %', admin_user_id;

  -- Delete recurring order executions
  DELETE FROM recurring_order_executions;
  RAISE NOTICE '✓ Deleted recurring order executions';

  -- Delete recurring order template items
  DELETE FROM recurring_order_template_items;
  RAISE NOTICE '✓ Deleted recurring order template items';

  -- Delete recurring order templates
  DELETE FROM recurring_order_templates;
  RAISE NOTICE '✓ Deleted recurring order templates';

  -- Delete order items
  DELETE FROM order_items;
  RAISE NOTICE '✓ Deleted order items';

  -- Delete all orders
  DELETE FROM orders;
  RAISE NOTICE '✓ Deleted all orders';

  -- Delete all patients
  DELETE FROM patients;
  RAISE NOTICE '✓ Deleted all patients';

  -- Delete all workers
  DELETE FROM workers;
  RAISE NOTICE '✓ Deleted all workers';

  -- Delete all institutions (except those owned by admin if any)
  DELETE FROM institutions WHERE id NOT IN (
    SELECT DISTINCT institution_id FROM users WHERE id = admin_user_id
  );
  RAISE NOTICE '✓ Deleted institutions';

  -- Delete all users except admin@gmail.com
  DELETE FROM users WHERE email != 'admin@gmail.com';
  RAISE NOTICE '✓ Deleted users (kept admin@gmail.com)';

  -- Delete products NOT created by admin
  DELETE FROM products WHERE created_by_admin_id != admin_user_id OR created_by_admin_id IS NULL;
  RAISE NOTICE '✓ Deleted products (kept admin products)';

  -- Reset order number sequence
  ALTER SEQUENCE IF EXISTS orders_order_number_seq RESTART WITH 1;
  RAISE NOTICE '✓ Reset order number sequence';

  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ Cleanup completed successfully!';
  RAISE NOTICE 'Kept: admin@gmail.com and products created by admin';
  RAISE NOTICE '========================================';

END $$;

COMMIT;

-- Verify what's left
SELECT 'Users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Products', COUNT(*) FROM products
UNION ALL
SELECT 'Institutions', COUNT(*) FROM institutions
UNION ALL
SELECT 'Patients', COUNT(*) FROM patients
UNION ALL
SELECT 'Orders', COUNT(*) FROM orders
UNION ALL
SELECT 'Workers', COUNT(*) FROM workers;
