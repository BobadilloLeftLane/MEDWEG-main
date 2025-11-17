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
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 228 (class 1259 OID 50751)
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_logs (
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

CREATE TABLE public.institutions (
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

CREATE TABLE public.invoices (
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

CREATE TABLE public.order_items (
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

CREATE TABLE public.orders (
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

CREATE SEQUENCE public.orders_order_number_seq
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

CREATE TABLE public.patients (
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

CREATE TABLE public.products (
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

CREATE TABLE public.push_subscriptions (
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

CREATE TABLE public.recurring_order_executions (
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

CREATE TABLE public.recurring_order_template_items (
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

CREATE TABLE public.recurring_order_templates (
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

CREATE TABLE public.users (
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

CREATE TABLE public.workers (
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


--
-- TOC entry 5163 (class 0 OID 50751)
-- Dependencies: 228
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.audit_logs (id, user_id, worker_id, action, table_name, record_id, ip_address, user_agent, details, created_at) FROM stdin;
\.


--
-- TOC entry 5154 (class 0 OID 50555)
-- Dependencies: 219
-- Data for Name: institutions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.institutions (id, name, address_street, address_plz, address_city, is_verified, is_active, created_at, updated_at, address, email) FROM stdin;
e1a901d9-375a-4add-9768-93c8844dfd0b	Pflegedienst GmbH	\\xc30d0407030244a17339be01baca69d23e01883f35cc1443fd9c6d8a1eb1b193b9b96f571e65a406b4d8ec7bbaa5847f7ad20e91be3a06c1934e3420cc3d517c551417788d3470890c16217f8e2718	86153	Augsburg	t	t	2025-11-16 09:25:19.323128	2025-11-16 09:31:57.651533	\N	\N
\.


--
-- TOC entry 5161 (class 0 OID 50703)
-- Dependencies: 226
-- Data for Name: invoices; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.invoices (id, order_id, institution_id, patient_id, invoice_number, invoice_year, total_amount, pdf_s3_key, created_at, invoice_date) FROM stdin;
\.


--
-- TOC entry 5160 (class 0 OID 50683)
-- Dependencies: 225
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.order_items (id, order_id, product_id, quantity, price_per_unit, subtotal, created_at) FROM stdin;
\.


--
-- TOC entry 5159 (class 0 OID 50642)
-- Dependencies: 224
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.orders (id, institution_id, patient_id, created_by_user_id, created_by_worker_id, status, is_recurring, scheduled_date, is_confirmed, approved_by_admin_id, approved_at, shipped_at, total_amount, created_at, updated_at, order_number, selected_shipping_carrier, selected_shipping_price) FROM stdin;
\.


--
-- TOC entry 5156 (class 0 OID 50591)
-- Dependencies: 221
-- Data for Name: patients; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.patients (id, institution_id, first_name, last_name, address, unique_code, is_active, created_at, updated_at, date_of_birth) FROM stdin;
c8704740-9fd5-45c0-b75a-b3534fbb483c	e1a901d9-375a-4add-9768-93c8844dfd0b	\\xc30d040703028ed7ad7fc47f695b66d235015b309368f4b75502b1402d2ebac6cb69de2b2d2eae92d7ffbe97c4d73d34fff2ec88e62a495f40e7ad3f2c2aa1bf42d29e08667b	\\xc30d04070302bf9c40b5946ce36c7cd239019cad69f47eebf1f5be9b069edb63b96bafc9c94560b7f9709a5c25b6055ae7c6099c8e69c3579abe3c17d88adfe1bd82c4b9e7758bf5f160	\\xc30d0407030278b77ee65356b3a976d249012207be261b09f9a5c974c37fd44234b126cca9241ef538023bd2d63ab6bf729f1343e323dd7c54ea08c718dc397f11317c85d5add42d4a8d881fda96efaf9ace3c66dca55a2b748a	PAT-1763282257787-867	t	2025-11-16 09:37:37.800652	2025-11-16 09:37:37.800652	\\xc30d0407030249f14b80b87569907ed23b012bd9269e1dacad23db7f36f2fbd9a08194e1068b89375bf0bb292fb664dbbbc5bc6f15f15d8984d657b5ceeed814d5389e5d4ecbaeee55536bfd
\.


--
-- TOC entry 5158 (class 0 OID 50629)
-- Dependencies: 223
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.products (id, name_de, description_de, type, size, quantity_per_box, unit, price_per_unit, is_available, created_at, updated_at, min_order_quantity, image_url, stock_quantity, low_stock_threshold, low_stock_alert_acknowledged, purchase_price, weight, weight_unit) FROM stdin;
ba14d313-f0bf-4c9b-836a-5f9128a1a06f	Meditrade® unisex Einmalhandschuhe Nitril® NextGen® blau (M) 	Komfort und Schutz im Einklang\nDiese Einmalhandschuhe bieten nicht nur Schutz, sondern auch einen hohen Tragekomfort. Die unsterile, wasserdichte, latexfreie, allergiefreie und texturierte Konstruktion sorgt für ein angenehmes Tragegefühl, das auch bei langen Einsatzzeiten erhalten bleibt.	gloves	M	100	Stück	6.00	t	2025-11-08 09:56:00.769281	2025-11-14 11:06:28.663403	1	/images/products/ppe-gloves@2x.png	415	20	t	1.90	0.35	kg
30140210-e7a5-44b4-97a9-a580fd5118eb	Meditrade® unisex Einmalhandschuhe Nitril® NextGen® blau (S)	Komfort und Schutz im Einklang\nDiese Einmalhandschuhe bieten nicht nur Schutz, sondern auch einen hohen Tragekomfort. Die unsterile, wasserdichte, latexfreie, allergiefreie und texturierte Konstruktion sorgt für ein angenehmes Tragegefühl, das auch bei langen Einsatzzeiten erhalten bleibt.	gloves	S	100	Stück	6.00	t	2025-11-08 09:56:31.941167	2025-11-14 11:06:28.678455	1	/images/products/ppe-gloves@2x.png	245	20	t	1.90	0.35	kg
ebcc1955-88fe-4511-aed2-6ad4f218c37f	Meditrade® unisex Einmalhandschuhe Nitril® NextGen® blau (XL)	Komfort und Schutz im Einklang\nDiese Einmalhandschuhe bieten nicht nur Schutz, sondern auch einen hohen Tragekomfort. Die unsterile, wasserdichte, latexfreie, allergiefreie und texturierte Konstruktion sorgt für ein angenehmes Tragegefühl, das auch bei langen Einsatzzeiten erhalten bleibt.	gloves	XL	100	Stück	6.00	t	2025-11-08 09:57:30.197654	2025-11-14 11:06:28.681213	1	/images/products/ppe-gloves@2x.png	142	20	t	2.20	0.35	kg
df45045b-dc1e-489a-b468-db8dfdb78237	Meditrade® unisex Einmalhandschuhe Nitril® NextGen®(L)	Komfort und Schutz im Einklang\nDiese Einmalhandschuhe bieten nicht nur Schutz, sondern auch einen hohen Tragekomfort. Die unsterile, wasserdichte, latexfreie, allergiefreie und texturierte Konstruktion sorgt für ein angenehmes Tragegefühl, das auch bei langen Einsatzzeiten erhalten bleibt.	gloves	L	100	Stück	6.00	t	2025-11-08 09:55:09.304051	2025-11-14 11:06:28.684587	1	/images/products/ppe-gloves@2x.png	280	20	t	2.20	0.35	kg
750b3ed3-bcc5-48f8-9241-74282aea78b0	HARTMANN Sterillium pure Händedesinfektionsmittel 500 ml	Ob als mobile Pflegekraft, Hausarzt auf Hausbesuch, Außendienstmitarbeiter oder auf Reisen – verwenden Sie unterwegs zur Desinfektion und Reinigung der Hände das Händedesinfektionsmittel Sterillium pure von HARTMANN und profitieren Sie von der hohen Sofortwirkung sowie der Langzeitwirkung des bewährten Händedesinfektionsmittels.	disinfectant_liquid	\N	500	ml	6.00	t	2025-11-08 10:01:22.283106	2025-11-14 11:06:28.68738	1	/images/products/ppe-sanitizer@2x.png	235	20	t	5.00	0.60	kg
1ff4a7d2-a965-46da-bf65-06bd063a07eb	HARTMANN Desinfektionstücher Bacillol Tissues 1-lagig weiß, 100 Tücher	Einfacher geht die Desinfektion alkoholbeständiger Flächen und Medizinprodukte nicht: Öffnen Sie die Spenderdose, ziehen Sie ein bereits mit Desinfektionsmittel getränktes Tuch heraus und wischen Sie damit über die zu desinfizierenden Bereiche! So einfach verwenden Sie diese gebrauchsfertigen Desinfektionstücher Bacillol Tissues von HARTMANN aus der praktischen Spenderdose. Sie sind geeignet in allen Innenbereichen, in denen eine umfassende Desinfektion innerhalb kürzester Zeit erforderlich ist.\nIdeal im Haushalt und im Lebensmittelbereich\nDie Tücher verwenden Sie im ganzen Haushalt sowie in Bereichen der Essenszubereitung und in Futtermittelbereichen. Desinfizieren Sie mit den aldehyd-, farbstoff- und parfümfreien, griffigen Tissue-Tüchern umfassend in Sekundenschnelle alkoholbeständige .	disinfectant_wipes	\N	100	Stück	5.00	t	2025-11-08 10:00:30.134303	2025-11-14 11:06:28.690166	1	/images/products/disinfecting-wipes@2x.png	489	30	t	3.00	0.40	kg
\.


--
-- TOC entry 5162 (class 0 OID 50735)
-- Dependencies: 227
-- Data for Name: push_subscriptions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.push_subscriptions (id, user_id, endpoint, p256dh_key, auth_key, created_at, last_used_at) FROM stdin;
\.


--
-- TOC entry 5167 (class 0 OID 51260)
-- Dependencies: 232
-- Data for Name: recurring_order_executions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.recurring_order_executions (id, template_id, execution_month, notification_sent, notification_sent_at, is_approved, approved_at, approved_by_user_id, orders_created, orders_created_at, created_order_ids, created_at) FROM stdin;
\.


--
-- TOC entry 5166 (class 0 OID 51242)
-- Dependencies: 231
-- Data for Name: recurring_order_template_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.recurring_order_template_items (id, template_id, product_id, quantity, created_at) FROM stdin;
\.


--
-- TOC entry 5165 (class 0 OID 51215)
-- Dependencies: 230
-- Data for Name: recurring_order_templates; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.recurring_order_templates (id, institution_id, patient_id, name, is_active, execution_day_of_month, delivery_day_of_month, notification_days_before, created_at, updated_at, created_by_user_id) FROM stdin;
\.


--
-- TOC entry 5155 (class 0 OID 50569)
-- Dependencies: 220
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, email, password_hash, role, institution_id, is_verified, verification_code, verification_code_expires_at, reset_token, reset_token_expires_at, is_active, created_at, updated_at, last_login_at, is_email_verified) FROM stdin;
9126a28f-29cc-4bac-b1cf-6c51dc5f2baa	service.medwegbavaria@gmail.com	$2a$06$CEK2S5NT91bWyrUHg79bfeQe5.JpE2BPa9WMgC7eQxKAzYTVI4usm	admin_application	\N	t	\N	\N	\N	\N	t	2025-11-17 14:37:57.119508	2025-11-17 14:37:57.119508	\N	f
\.


--
-- TOC entry 5157 (class 0 OID 50612)
-- Dependencies: 222
-- Data for Name: workers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.workers (id, patient_id, username, password_hash, is_active, created_at, last_login_at, institution_id, updated_at) FROM stdin;
e3b9ad75-e239-44b6-a972-78bf44979de1	c8704740-9fd5-45c0-b75a-b3534fbb483c	HHeinrich	$2b$12$I3QSaq0QoP0GOuTGbMaVq.DZR6Eksdb2.VfRX85sFxbblsEmK7hMe	t	2025-11-16 14:03:24.248622	2025-11-16 14:03:51.666056	e1a901d9-375a-4add-9768-93c8844dfd0b	2025-11-16 14:03:51.666056
\.


--
-- TOC entry 5190 (class 0 OID 0)
-- Dependencies: 229
-- Name: orders_order_number_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.orders_order_number_seq', 16, true);


--
-- TOC entry 4960 (class 2606 OID 50759)
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 4904 (class 2606 OID 52315)
-- Name: institutions institutions_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.institutions
    ADD CONSTRAINT institutions_email_key UNIQUE (email);


--
-- TOC entry 4906 (class 2606 OID 50566)
-- Name: institutions institutions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.institutions
    ADD CONSTRAINT institutions_pkey PRIMARY KEY (id);


--
-- TOC entry 4953 (class 2606 OID 50714)
-- Name: invoices invoices_invoice_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_invoice_number_key UNIQUE (invoice_number);


--
-- TOC entry 4955 (class 2606 OID 50712)
-- Name: invoices invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (id);


--
-- TOC entry 4946 (class 2606 OID 50690)
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- TOC entry 4942 (class 2606 OID 50652)
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- TOC entry 4919 (class 2606 OID 50601)
-- Name: patients patients_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_pkey PRIMARY KEY (id);


--
-- TOC entry 4921 (class 2606 OID 50603)
-- Name: patients patients_unique_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_unique_code_key UNIQUE (unique_code);


--
-- TOC entry 4932 (class 2606 OID 50639)
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- TOC entry 4958 (class 2606 OID 50744)
-- Name: push_subscriptions push_subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.push_subscriptions
    ADD CONSTRAINT push_subscriptions_pkey PRIMARY KEY (id);


--
-- TOC entry 4977 (class 2606 OID 51271)
-- Name: recurring_order_executions recurring_order_executions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_order_executions
    ADD CONSTRAINT recurring_order_executions_pkey PRIMARY KEY (id);


--
-- TOC entry 4979 (class 2606 OID 51273)
-- Name: recurring_order_executions recurring_order_executions_template_id_execution_month_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_order_executions
    ADD CONSTRAINT recurring_order_executions_template_id_execution_month_key UNIQUE (template_id, execution_month);


--
-- TOC entry 4972 (class 2606 OID 51249)
-- Name: recurring_order_template_items recurring_order_template_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_order_template_items
    ADD CONSTRAINT recurring_order_template_items_pkey PRIMARY KEY (id);


--
-- TOC entry 4969 (class 2606 OID 51226)
-- Name: recurring_order_templates recurring_order_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_order_templates
    ADD CONSTRAINT recurring_order_templates_pkey PRIMARY KEY (id);


--
-- TOC entry 4912 (class 2606 OID 50582)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 4914 (class 2606 OID 50580)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4925 (class 2606 OID 50619)
-- Name: workers workers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workers
    ADD CONSTRAINT workers_pkey PRIMARY KEY (id);


--
-- TOC entry 4927 (class 2606 OID 50621)
-- Name: workers workers_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workers
    ADD CONSTRAINT workers_username_key UNIQUE (username);


--
-- TOC entry 4961 (class 1259 OID 50773)
-- Name: idx_audit_logs_action; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_logs_action ON public.audit_logs USING btree (action);


--
-- TOC entry 4962 (class 1259 OID 50772)
-- Name: idx_audit_logs_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_logs_created_at ON public.audit_logs USING btree (created_at DESC);


--
-- TOC entry 4963 (class 1259 OID 50770)
-- Name: idx_audit_logs_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_logs_user ON public.audit_logs USING btree (user_id);


--
-- TOC entry 4964 (class 1259 OID 50771)
-- Name: idx_audit_logs_worker; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_logs_worker ON public.audit_logs USING btree (worker_id);


--
-- TOC entry 4900 (class 1259 OID 50568)
-- Name: idx_institutions_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_institutions_active ON public.institutions USING btree (is_active);


--
-- TOC entry 4901 (class 1259 OID 52316)
-- Name: idx_institutions_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_institutions_email ON public.institutions USING btree (email);


--
-- TOC entry 4902 (class 1259 OID 50567)
-- Name: idx_institutions_plz; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_institutions_plz ON public.institutions USING btree (address_plz);


--
-- TOC entry 4947 (class 1259 OID 50731)
-- Name: idx_invoices_institution; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_invoices_institution ON public.invoices USING btree (institution_id);


--
-- TOC entry 4948 (class 1259 OID 50733)
-- Name: idx_invoices_number; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_invoices_number ON public.invoices USING btree (invoice_number);


--
-- TOC entry 4949 (class 1259 OID 50730)
-- Name: idx_invoices_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_invoices_order ON public.invoices USING btree (order_id);


--
-- TOC entry 4950 (class 1259 OID 50732)
-- Name: idx_invoices_patient; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_invoices_patient ON public.invoices USING btree (patient_id);


--
-- TOC entry 4951 (class 1259 OID 50734)
-- Name: idx_invoices_year; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_invoices_year ON public.invoices USING btree (invoice_year);


--
-- TOC entry 4943 (class 1259 OID 50701)
-- Name: idx_order_items_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_order_items_order ON public.order_items USING btree (order_id);


--
-- TOC entry 4944 (class 1259 OID 50702)
-- Name: idx_order_items_product; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_order_items_product ON public.order_items USING btree (product_id);


--
-- TOC entry 4933 (class 1259 OID 50682)
-- Name: idx_orders_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_created_at ON public.orders USING btree (created_at DESC);


--
-- TOC entry 4934 (class 1259 OID 50678)
-- Name: idx_orders_institution; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_institution ON public.orders USING btree (institution_id);


--
-- TOC entry 4935 (class 1259 OID 51291)
-- Name: idx_orders_institution_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_institution_id ON public.orders USING btree (institution_id);


--
-- TOC entry 4936 (class 1259 OID 51293)
-- Name: idx_orders_is_confirmed; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_is_confirmed ON public.orders USING btree (is_confirmed);


--
-- TOC entry 4937 (class 1259 OID 50679)
-- Name: idx_orders_patient; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_patient ON public.orders USING btree (patient_id);


--
-- TOC entry 4938 (class 1259 OID 51292)
-- Name: idx_orders_patient_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_patient_id ON public.orders USING btree (patient_id);


--
-- TOC entry 4939 (class 1259 OID 50681)
-- Name: idx_orders_scheduled_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_scheduled_date ON public.orders USING btree (scheduled_date);


--
-- TOC entry 4940 (class 1259 OID 51178)
-- Name: idx_orders_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_status ON public.orders USING btree (status);


--
-- TOC entry 4915 (class 1259 OID 50611)
-- Name: idx_patients_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_patients_active ON public.patients USING btree (is_active);


--
-- TOC entry 4916 (class 1259 OID 50609)
-- Name: idx_patients_institution; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_patients_institution ON public.patients USING btree (institution_id);


--
-- TOC entry 4917 (class 1259 OID 50610)
-- Name: idx_patients_unique_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_patients_unique_code ON public.patients USING btree (unique_code);


--
-- TOC entry 4928 (class 1259 OID 50641)
-- Name: idx_products_available; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_available ON public.products USING btree (is_available);


--
-- TOC entry 4929 (class 1259 OID 51190)
-- Name: idx_products_low_stock; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_low_stock ON public.products USING btree (stock_quantity, low_stock_threshold) WHERE (stock_quantity < low_stock_threshold);


--
-- TOC entry 4930 (class 1259 OID 50640)
-- Name: idx_products_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_type ON public.products USING btree (type);


--
-- TOC entry 4956 (class 1259 OID 50750)
-- Name: idx_push_subscriptions_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_push_subscriptions_user ON public.push_subscriptions USING btree (user_id);


--
-- TOC entry 4973 (class 1259 OID 51289)
-- Name: idx_recurring_executions_month; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_recurring_executions_month ON public.recurring_order_executions USING btree (execution_month);


--
-- TOC entry 4974 (class 1259 OID 51290)
-- Name: idx_recurring_executions_notification; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_recurring_executions_notification ON public.recurring_order_executions USING btree (notification_sent, is_approved);


--
-- TOC entry 4975 (class 1259 OID 51288)
-- Name: idx_recurring_executions_template; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_recurring_executions_template ON public.recurring_order_executions USING btree (template_id);


--
-- TOC entry 4970 (class 1259 OID 51287)
-- Name: idx_recurring_template_items_template; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_recurring_template_items_template ON public.recurring_order_template_items USING btree (template_id);


--
-- TOC entry 4965 (class 1259 OID 51286)
-- Name: idx_recurring_templates_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_recurring_templates_active ON public.recurring_order_templates USING btree (is_active);


--
-- TOC entry 4966 (class 1259 OID 51284)
-- Name: idx_recurring_templates_institution; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_recurring_templates_institution ON public.recurring_order_templates USING btree (institution_id);


--
-- TOC entry 4967 (class 1259 OID 51285)
-- Name: idx_recurring_templates_patient; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_recurring_templates_patient ON public.recurring_order_templates USING btree (patient_id);


--
-- TOC entry 4907 (class 1259 OID 50588)
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- TOC entry 4908 (class 1259 OID 52318)
-- Name: idx_users_email_verified; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_email_verified ON public.users USING btree (is_email_verified);


--
-- TOC entry 4909 (class 1259 OID 50590)
-- Name: idx_users_institution; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_institution ON public.users USING btree (institution_id);


--
-- TOC entry 4910 (class 1259 OID 50589)
-- Name: idx_users_role; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_role ON public.users USING btree (role);


--
-- TOC entry 4922 (class 1259 OID 50627)
-- Name: idx_workers_patient; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_workers_patient ON public.workers USING btree (patient_id);


--
-- TOC entry 4923 (class 1259 OID 50628)
-- Name: idx_workers_username; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_workers_username ON public.workers USING btree (username);


--
-- TOC entry 5004 (class 2620 OID 50775)
-- Name: institutions update_institutions_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_institutions_updated_at BEFORE UPDATE ON public.institutions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 5008 (class 2620 OID 50779)
-- Name: orders update_orders_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 5006 (class 2620 OID 50777)
-- Name: patients update_patients_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON public.patients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 5007 (class 2620 OID 50778)
-- Name: products update_products_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 5005 (class 2620 OID 50776)
-- Name: users update_users_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4995 (class 2606 OID 50760)
-- Name: audit_logs audit_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 4996 (class 2606 OID 50765)
-- Name: audit_logs audit_logs_worker_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_worker_id_fkey FOREIGN KEY (worker_id) REFERENCES public.workers(id) ON DELETE SET NULL;


--
-- TOC entry 4991 (class 2606 OID 50720)
-- Name: invoices invoices_institution_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_institution_id_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id) ON DELETE CASCADE;


--
-- TOC entry 4992 (class 2606 OID 50715)
-- Name: invoices invoices_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- TOC entry 4993 (class 2606 OID 50725)
-- Name: invoices invoices_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;


--
-- TOC entry 4989 (class 2606 OID 50691)
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- TOC entry 4990 (class 2606 OID 50696)
-- Name: order_items order_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE RESTRICT;


--
-- TOC entry 4984 (class 2606 OID 50673)
-- Name: orders orders_approved_by_admin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_approved_by_admin_id_fkey FOREIGN KEY (approved_by_admin_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 4985 (class 2606 OID 50663)
-- Name: orders orders_created_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 4986 (class 2606 OID 50668)
-- Name: orders orders_created_by_worker_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_created_by_worker_id_fkey FOREIGN KEY (created_by_worker_id) REFERENCES public.workers(id) ON DELETE SET NULL;


--
-- TOC entry 4987 (class 2606 OID 50653)
-- Name: orders orders_institution_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_institution_id_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id) ON DELETE CASCADE;


--
-- TOC entry 4988 (class 2606 OID 50658)
-- Name: orders orders_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;


--
-- TOC entry 4981 (class 2606 OID 50604)
-- Name: patients patients_institution_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_institution_id_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id) ON DELETE CASCADE;


--
-- TOC entry 4994 (class 2606 OID 50745)
-- Name: push_subscriptions push_subscriptions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.push_subscriptions
    ADD CONSTRAINT push_subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5002 (class 2606 OID 51279)
-- Name: recurring_order_executions recurring_order_executions_approved_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_order_executions
    ADD CONSTRAINT recurring_order_executions_approved_by_user_id_fkey FOREIGN KEY (approved_by_user_id) REFERENCES public.users(id);


--
-- TOC entry 5003 (class 2606 OID 51274)
-- Name: recurring_order_executions recurring_order_executions_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_order_executions
    ADD CONSTRAINT recurring_order_executions_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.recurring_order_templates(id) ON DELETE CASCADE;


--
-- TOC entry 5000 (class 2606 OID 51255)
-- Name: recurring_order_template_items recurring_order_template_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_order_template_items
    ADD CONSTRAINT recurring_order_template_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- TOC entry 5001 (class 2606 OID 51250)
-- Name: recurring_order_template_items recurring_order_template_items_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_order_template_items
    ADD CONSTRAINT recurring_order_template_items_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.recurring_order_templates(id) ON DELETE CASCADE;


--
-- TOC entry 4997 (class 2606 OID 51237)
-- Name: recurring_order_templates recurring_order_templates_created_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_order_templates
    ADD CONSTRAINT recurring_order_templates_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES public.users(id);


--
-- TOC entry 4998 (class 2606 OID 51227)
-- Name: recurring_order_templates recurring_order_templates_institution_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_order_templates
    ADD CONSTRAINT recurring_order_templates_institution_id_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id) ON DELETE CASCADE;


--
-- TOC entry 4999 (class 2606 OID 51232)
-- Name: recurring_order_templates recurring_order_templates_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_order_templates
    ADD CONSTRAINT recurring_order_templates_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;


--
-- TOC entry 4980 (class 2606 OID 50583)
-- Name: users users_institution_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_institution_id_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id) ON DELETE CASCADE;


--
-- TOC entry 4982 (class 2606 OID 52374)
-- Name: workers workers_institution_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workers
    ADD CONSTRAINT workers_institution_id_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id) ON DELETE CASCADE;


--
-- TOC entry 4983 (class 2606 OID 50622)
-- Name: workers workers_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workers
    ADD CONSTRAINT workers_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;


-- Completed on 2025-11-17 14:39:03

--
-- PostgreSQL database dump complete
--

