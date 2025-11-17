--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

-- Started on 2025-11-17 14:39:02

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET search_path = public, pg_catalog;
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create ENUM types
DO $$ BEGIN
    CREATE TYPE public.user_role AS ENUM ('admin_application', 'admin_institution', 'worker');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.order_status AS ENUM ('new', 'confirmed', 'approved', 'shipped', 'delivered', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.product_type AS ENUM ('gloves', 'disinfectant_liquid', 'disinfectant_wipes', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.glove_size AS ENUM ('XS', 'S', 'M', 'L', 'XL', 'XXL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 228 (class 1259 OID 50751)
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid,
    worker_id uuid,
    action character varying(100) NOT NULL,
    table_name character varying(50) NOT NULL,
    record_id uuid,
    ip_address character varying(45),
    user_agent text,
    details jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- TOC entry 219 (class 1259 OID 50555)
-- Name: institutions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.institutions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(255) NOT NULL,
    address_street bytea NOT NULL,
    address_plz character varying(5) NOT NULL,
    address_city character varying(100) NOT NULL,
    is_verified boolean DEFAULT false,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    address text,
    email character varying(255)
);


--
-- TOC entry 5173 (class 0 OID 0)
-- Dependencies: 219
-- Name: COLUMN institutions.address; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.institutions.address IS 'Institution address for invoices';


--
-- TOC entry 226 (class 1259 OID 50703)
-- Name: invoices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.invoices (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    order_id uuid NOT NULL,
    institution_id uuid NOT NULL,
    patient_id uuid NOT NULL,
    invoice_number character varying(50) NOT NULL,
    invoice_year integer NOT NULL,
    total_amount numeric(10,2) NOT NULL,
    pdf_s3_key character varying(500),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    invoice_date date DEFAULT CURRENT_DATE NOT NULL
);


--
-- TOC entry 225 (class 1259 OID 50683)
-- Name: order_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.order_items (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    order_id uuid NOT NULL,
    product_id uuid NOT NULL,
    quantity integer NOT NULL,
    price_per_unit numeric(10,2) NOT NULL,
    subtotal numeric(10,2) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT order_items_quantity_check CHECK ((quantity > 0))
);


--
-- TOC entry 224 (class 1259 OID 50642)
-- Name: orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.orders (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    institution_id uuid NOT NULL,
    patient_id uuid NOT NULL,
    created_by_user_id uuid,
    created_by_worker_id uuid,
    status public.order_status DEFAULT 'new'::public.order_status NOT NULL,
    is_recurring boolean DEFAULT false,
    scheduled_date date,
    is_confirmed boolean DEFAULT false,
    approved_by_admin_id uuid,
    approved_at timestamp without time zone,
    shipped_at timestamp without time zone,
    total_amount numeric(10,2),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    order_number integer NOT NULL,
    selected_shipping_carrier character varying(50),
    selected_shipping_price numeric(10,2)
);


--
-- TOC entry 229 (class 1259 OID 51196)
-- Name: orders_order_number_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE IF NOT EXISTS public.orders_order_number_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 5174 (class 0 OID 0)
-- Dependencies: 229
-- Name: orders_order_number_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.orders_order_number_seq OWNED BY public.orders.order_number;


--
-- TOC entry 221 (class 1259 OID 50591)
-- Name: patients; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.patients (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    institution_id uuid NOT NULL,
    first_name bytea NOT NULL,
    last_name bytea NOT NULL,
    address bytea NOT NULL,
    unique_code character varying(50) NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    date_of_birth bytea
);


--
-- TOC entry 223 (class 1259 OID 50629)
-- Name: products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.products (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name_de character varying(255) NOT NULL,
    description_de text,
    type public.product_type NOT NULL,
    size public.glove_size,
    quantity_per_box integer NOT NULL,
    unit character varying(50) NOT NULL,
    price_per_unit numeric(10,2) NOT NULL,
    is_available boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    min_order_quantity integer DEFAULT 1 NOT NULL,
    image_url character varying(500),
    stock_quantity integer DEFAULT 0 NOT NULL,
    low_stock_threshold integer DEFAULT 20,
    low_stock_alert_acknowledged boolean DEFAULT false,
    purchase_price numeric(10,2) DEFAULT 0.00,
    weight numeric(10,2) DEFAULT 0.00,
    weight_unit character varying(10) DEFAULT 'kg'::character varying,
    CONSTRAINT check_weight_unit CHECK (((weight_unit)::text = ANY ((ARRAY['kg'::character varying, 'g'::character varying])::text[])))
);


--
-- TOC entry 5175 (class 0 OID 0)
-- Dependencies: 223
-- Name: COLUMN products.stock_quantity; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.products.stock_quantity IS 'Trenutna količina na lageru (Zustand)';


--
-- TOC entry 5176 (class 0 OID 0)
-- Dependencies: 223
-- Name: COLUMN products.low_stock_threshold; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.products.low_stock_threshold IS 'Minimum limit - alert ako stock < threshold';


--
-- TOC entry 5177 (class 0 OID 0)
-- Dependencies: 223
-- Name: COLUMN products.low_stock_alert_acknowledged; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.products.low_stock_alert_acknowledged IS 'Da li je admin čekirao low stock upozorenje';


--
-- TOC entry 5178 (class 0 OID 0)
-- Dependencies: 223
-- Name: COLUMN products.purchase_price; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.products.purchase_price IS 'Einkaufspreis (Nabavna cena) pro Einheit';


--
-- TOC entry 5179 (class 0 OID 0)
-- Dependencies: 223
-- Name: COLUMN products.weight; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.products.weight IS 'Gewicht (Težina) des Produkts';


--
-- TOC entry 227 (class 1259 OID 50735)
-- Name: push_subscriptions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.push_subscriptions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    endpoint text NOT NULL,
    p256dh_key text NOT NULL,
    auth_key text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    last_used_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- TOC entry 232 (class 1259 OID 51260)
-- Name: recurring_order_executions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.recurring_order_executions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    template_id uuid NOT NULL,
    execution_month date NOT NULL,
    notification_sent boolean DEFAULT false,
    notification_sent_at timestamp without time zone,
    is_approved boolean DEFAULT false,
    approved_at timestamp without time zone,
    approved_by_user_id uuid,
    orders_created boolean DEFAULT false,
    orders_created_at timestamp without time zone,
    created_order_ids uuid[],
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- TOC entry 5180 (class 0 OID 0)
-- Dependencies: 232
-- Name: TABLE recurring_order_executions; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.recurring_order_executions IS 'Tracking of recurring order executions per month';


--
-- TOC entry 5181 (class 0 OID 0)
-- Dependencies: 232
-- Name: COLUMN recurring_order_executions.execution_month; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.recurring_order_executions.execution_month IS 'Which month this execution is for (YYYY-MM-01 format)';


--
-- TOC entry 5182 (class 0 OID 0)
-- Dependencies: 232
-- Name: COLUMN recurring_order_executions.created_order_ids; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.recurring_order_executions.created_order_ids IS 'Array of order IDs created from this execution';


--
-- TOC entry 231 (class 1259 OID 51242)
-- Name: recurring_order_template_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.recurring_order_template_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    template_id uuid NOT NULL,
    product_id uuid NOT NULL,
    quantity integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT recurring_order_template_items_quantity_check CHECK ((quantity > 0))
);


--
-- TOC entry 5183 (class 0 OID 0)
-- Dependencies: 231
-- Name: TABLE recurring_order_template_items; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.recurring_order_template_items IS 'Products and quantities in recurring order template';


--
-- TOC entry 230 (class 1259 OID 51215)
-- Name: recurring_order_templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.recurring_order_templates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    institution_id uuid NOT NULL,
    patient_id uuid,
    name character varying(255) NOT NULL,
    is_active boolean DEFAULT true,
    execution_day_of_month integer NOT NULL,
    delivery_day_of_month integer NOT NULL,
    notification_days_before integer DEFAULT 5 NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_by_user_id uuid,
    CONSTRAINT recurring_order_templates_delivery_day_of_month_check CHECK (((delivery_day_of_month >= 1) AND (delivery_day_of_month <= 28))),
    CONSTRAINT recurring_order_templates_execution_day_of_month_check CHECK (((execution_day_of_month >= 1) AND (execution_day_of_month <= 28)))
);


--
-- TOC entry 5184 (class 0 OID 0)
-- Dependencies: 230
-- Name: TABLE recurring_order_templates; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.recurring_order_templates IS 'Templates for automatic recurring monthly orders';


--
-- TOC entry 5185 (class 0 OID 0)
-- Dependencies: 230
-- Name: COLUMN recurring_order_templates.patient_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.recurring_order_templates.patient_id IS 'If NULL, template applies to ALL patients in institution';


--
-- TOC entry 5186 (class 0 OID 0)
-- Dependencies: 230
-- Name: COLUMN recurring_order_templates.execution_day_of_month; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.recurring_order_templates.execution_day_of_month IS 'Day of month to create orders (e.g., 5 = 5th day)';


--
-- TOC entry 5187 (class 0 OID 0)
-- Dependencies: 230
-- Name: COLUMN recurring_order_templates.delivery_day_of_month; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.recurring_order_templates.delivery_day_of_month IS 'Desired delivery day of month (e.g., 20 = 20th day)';


--
-- TOC entry 5188 (class 0 OID 0)
-- Dependencies: 230
-- Name: COLUMN recurring_order_templates.notification_days_before; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.recurring_order_templates.notification_days_before IS 'Send notification N days before execution';


--
-- TOC entry 220 (class 1259 OID 50569)
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    role public.user_role NOT NULL,
    institution_id uuid,
    is_verified boolean DEFAULT false,
    verification_code character varying(6),
    verification_code_expires_at timestamp without time zone,
    reset_token character varying(255),
    reset_token_expires_at timestamp without time zone,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    last_login_at timestamp without time zone,
    is_email_verified boolean DEFAULT false
);


--
-- TOC entry 5189 (class 0 OID 0)
-- Dependencies: 220
-- Name: TABLE users; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.users IS 'Korisnici aplikacije - Admin App i Admin Institution';


--
-- TOC entry 222 (class 1259 OID 50612)
-- Name: workers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.workers (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    patient_id uuid NOT NULL,
    username character varying(50) NOT NULL,
    password_hash character varying(255) NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    last_login_at timestamp without time zone,
    institution_id uuid,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- TOC entry 4872 (class 2604 OID 51197)
-- Name: orders order_number; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders ALTER COLUMN order_number SET DEFAULT nextval('public.orders_order_number_seq'::regclass);

-- Note: Data inserts removed - this creates structure only
-- Use pgAdmin's Restore tool or psql for full data restore

--
-- TOC entry 5190 (class 0 OID 0)
-- Dependencies: 229
-- Name: orders_order_number_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.orders_order_number_seq', 16, true);


-- Primary Keys and Constraints

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.institutions
    ADD CONSTRAINT institutions_email_key UNIQUE (email);

ALTER TABLE ONLY public.institutions
    ADD CONSTRAINT institutions_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_invoice_number_key UNIQUE (invoice_number);

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_unique_code_key UNIQUE (unique_code);

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.push_subscriptions
    ADD CONSTRAINT push_subscriptions_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.recurring_order_executions
    ADD CONSTRAINT recurring_order_executions_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.recurring_order_executions
    ADD CONSTRAINT recurring_order_executions_template_id_execution_month_key UNIQUE (template_id, execution_month);

ALTER TABLE ONLY public.recurring_order_template_items
    ADD CONSTRAINT recurring_order_template_items_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.recurring_order_templates
    ADD CONSTRAINT recurring_order_templates_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.workers
    ADD CONSTRAINT workers_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.workers
    ADD CONSTRAINT workers_username_key UNIQUE (username);


-- Indexes

CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs USING btree (action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs USING btree (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_worker ON public.audit_logs USING btree (worker_id);
CREATE INDEX IF NOT EXISTS idx_institutions_active ON public.institutions USING btree (is_active);
CREATE INDEX IF NOT EXISTS idx_institutions_email ON public.institutions USING btree (email);
CREATE INDEX IF NOT EXISTS idx_institutions_plz ON public.institutions USING btree (address_plz);
CREATE INDEX IF NOT EXISTS idx_invoices_institution ON public.invoices USING btree (institution_id);
CREATE INDEX IF NOT EXISTS idx_invoices_number ON public.invoices USING btree (invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_order ON public.invoices USING btree (order_id);
CREATE INDEX IF NOT EXISTS idx_invoices_patient ON public.invoices USING btree (patient_id);
CREATE INDEX IF NOT EXISTS idx_invoices_year ON public.invoices USING btree (invoice_year);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items USING btree (order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON public.order_items USING btree (product_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders USING btree (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_institution ON public.orders USING btree (institution_id);
CREATE INDEX IF NOT EXISTS idx_orders_institution_id ON public.orders USING btree (institution_id);
CREATE INDEX IF NOT EXISTS idx_orders_is_confirmed ON public.orders USING btree (is_confirmed);
CREATE INDEX IF NOT EXISTS idx_orders_patient ON public.orders USING btree (patient_id);
CREATE INDEX IF NOT EXISTS idx_orders_patient_id ON public.orders USING btree (patient_id);
CREATE INDEX IF NOT EXISTS idx_orders_scheduled_date ON public.orders USING btree (scheduled_date);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders USING btree (status);
CREATE INDEX IF NOT EXISTS idx_patients_active ON public.patients USING btree (is_active);
CREATE INDEX IF NOT EXISTS idx_patients_institution ON public.patients USING btree (institution_id);
CREATE INDEX IF NOT EXISTS idx_patients_unique_code ON public.patients USING btree (unique_code);
CREATE INDEX IF NOT EXISTS idx_products_available ON public.products USING btree (is_available);
CREATE INDEX IF NOT EXISTS idx_products_low_stock ON public.products USING btree (stock_quantity, low_stock_threshold) WHERE (stock_quantity < low_stock_threshold);
CREATE INDEX IF NOT EXISTS idx_products_type ON public.products USING btree (type);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user ON public.push_subscriptions USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_executions_month ON public.recurring_order_executions USING btree (execution_month);
CREATE INDEX IF NOT EXISTS idx_recurring_executions_notification ON public.recurring_order_executions USING btree (notification_sent, is_approved);
CREATE INDEX IF NOT EXISTS idx_recurring_executions_template ON public.recurring_order_executions USING btree (template_id);
CREATE INDEX IF NOT EXISTS idx_recurring_template_items_template ON public.recurring_order_template_items USING btree (template_id);
CREATE INDEX IF NOT EXISTS idx_recurring_templates_active ON public.recurring_order_templates USING btree (is_active);
CREATE INDEX IF NOT EXISTS idx_recurring_templates_institution ON public.recurring_order_templates USING btree (institution_id);
CREATE INDEX IF NOT EXISTS idx_recurring_templates_patient ON public.recurring_order_templates USING btree (patient_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users USING btree (email);
CREATE INDEX IF NOT EXISTS idx_users_email_verified ON public.users USING btree (is_email_verified);
CREATE INDEX IF NOT EXISTS idx_users_institution ON public.users USING btree (institution_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users USING btree (role);
CREATE INDEX IF NOT EXISTS idx_workers_patient ON public.workers USING btree (patient_id);
CREATE INDEX IF NOT EXISTS idx_workers_username ON public.workers USING btree (username);


-- Triggers (only if function exists)

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
        DROP TRIGGER IF EXISTS update_institutions_updated_at ON public.institutions;
        CREATE TRIGGER update_institutions_updated_at BEFORE UPDATE ON public.institutions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

        DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
        CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

        DROP TRIGGER IF EXISTS update_patients_updated_at ON public.patients;
        CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON public.patients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

        DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
        CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

        DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
        CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END $$;


-- Foreign Keys

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_worker_id_fkey FOREIGN KEY (worker_id) REFERENCES public.workers(id) ON DELETE SET NULL;

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_institution_id_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE RESTRICT;

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_approved_by_admin_id_fkey FOREIGN KEY (approved_by_admin_id) REFERENCES public.users(id) ON DELETE SET NULL;

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES public.users(id) ON DELETE SET NULL;

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_created_by_worker_id_fkey FOREIGN KEY (created_by_worker_id) REFERENCES public.workers(id) ON DELETE SET NULL;

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_institution_id_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_institution_id_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.push_subscriptions
    ADD CONSTRAINT push_subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.recurring_order_executions
    ADD CONSTRAINT recurring_order_executions_approved_by_user_id_fkey FOREIGN KEY (approved_by_user_id) REFERENCES public.users(id);

ALTER TABLE ONLY public.recurring_order_executions
    ADD CONSTRAINT recurring_order_executions_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.recurring_order_templates(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.recurring_order_template_items
    ADD CONSTRAINT recurring_order_template_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.recurring_order_template_items
    ADD CONSTRAINT recurring_order_template_items_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.recurring_order_templates(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.recurring_order_templates
    ADD CONSTRAINT recurring_order_templates_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES public.users(id);

ALTER TABLE ONLY public.recurring_order_templates
    ADD CONSTRAINT recurring_order_templates_institution_id_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.recurring_order_templates
    ADD CONSTRAINT recurring_order_templates_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_institution_id_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.workers
    ADD CONSTRAINT workers_institution_id_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.workers
    ADD CONSTRAINT workers_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;

-- Completed on 2025-11-17 14:39:03

--
-- PostgreSQL database dump complete
--
