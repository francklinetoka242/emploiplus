--
-- PostgreSQL database dump
--

\restrict pdIJ4d1cujRcXWxWbFmYaxKZSTpy2zYsgifFvoyhQxfgOfC5AnUeFvTeQzCMykr

-- Dumped from database version 16.11 (Ubuntu 16.11-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.11 (Ubuntu 16.11-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: update_documents_updated_at(); Type: FUNCTION; Schema: public; Owner: emploip01_admin
--

CREATE FUNCTION public.update_documents_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$;


ALTER FUNCTION public.update_documents_updated_at() OWNER TO emploip01_admin;

--
-- Name: update_timestamp_column(); Type: FUNCTION; Schema: public; Owner: emploip01_admin
--

CREATE FUNCTION public.update_timestamp_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_timestamp_column() OWNER TO emploip01_admin;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: subscription_plans; Type: TABLE; Schema: public; Owner: emploip01_admin
--

CREATE TABLE public.subscription_plans (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    slug character varying(100) NOT NULL,
    description text,
    level integer NOT NULL,
    price numeric(10,2) DEFAULT 0 NOT NULL,
    currency character varying(3) DEFAULT 'XAF'::character varying,
    billing_period character varying(20) DEFAULT 'monthly'::character varying NOT NULL,
    duration_days integer DEFAULT 30,
    features jsonb DEFAULT '{}'::jsonb,
    active boolean DEFAULT true,
    max_users integer,
    max_jobs integer,
    max_formations integer,
    max_api_calls integer,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.subscription_plans OWNER TO emploip01_admin;

--
-- Name: user_subscriptions; Type: TABLE; Schema: public; Owner: emploip01_admin
--

CREATE TABLE public.user_subscriptions (
    id integer NOT NULL,
    user_id integer NOT NULL,
    plan_id integer NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    start_date timestamp without time zone DEFAULT now() NOT NULL,
    end_date timestamp without time zone,
    renewal_date timestamp without time zone,
    transaction_id character varying(100),
    payment_method character varying(50),
    amount_paid numeric(10,2),
    currency character varying(3) DEFAULT 'XAF'::character varying,
    auto_renew boolean DEFAULT true,
    renew_attempts integer DEFAULT 0,
    last_renewal_attempt timestamp without time zone,
    renewal_count integer DEFAULT 0,
    notes text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.user_subscriptions OWNER TO emploip01_admin;

--
-- Name: active_user_subscriptions; Type: VIEW; Schema: public; Owner: emploip01_admin
--

CREATE VIEW public.active_user_subscriptions AS
 SELECT us.id,
    us.user_id,
    us.plan_id,
    sp.name AS plan_name,
    sp.slug AS plan_slug,
    sp.price,
    sp.currency,
    sp.features,
    us.start_date,
    us.end_date,
    us.status,
    us.auto_renew,
    us.created_at
   FROM (public.user_subscriptions us
     JOIN public.subscription_plans sp ON ((us.plan_id = sp.id)))
  WHERE (((us.status)::text = 'active'::text) AND ((us.end_date IS NULL) OR (us.end_date > now())));


ALTER VIEW public.active_user_subscriptions OWNER TO emploip01_admin;

--
-- Name: admin_roles; Type: TABLE; Schema: public; Owner: emploip01_admin
--

CREATE TABLE public.admin_roles (
    id bigint NOT NULL,
    admin_id bigint,
    role_id bigint
);


ALTER TABLE public.admin_roles OWNER TO emploip01_admin;

--
-- Name: admin_roles_id_seq; Type: SEQUENCE; Schema: public; Owner: emploip01_admin
--

CREATE SEQUENCE public.admin_roles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.admin_roles_id_seq OWNER TO emploip01_admin;

--
-- Name: admin_roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: emploip01_admin
--

ALTER SEQUENCE public.admin_roles_id_seq OWNED BY public.admin_roles.id;


--
-- Name: admins; Type: TABLE; Schema: public; Owner: emploip01_admin
--

CREATE TABLE public.admins (
    id integer NOT NULL,
    last_name character varying(100) NOT NULL,
    first_name character varying(100) NOT NULL,
    email character varying(255) NOT NULL,
    password text NOT NULL,
    phone character varying(20),
    country character varying(100),
    city character varying(100),
    birth_date date,
    avatar_url text DEFAULT 'https://ui-avatars.com/api/?name=Admin'::text,
    role character varying(50) NOT NULL,
    is_verified boolean DEFAULT false,
    verification_token text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    perm_manage_users boolean DEFAULT false,
    perm_manage_roles boolean DEFAULT false,
    perm_edit_content boolean DEFAULT false,
    perm_publish_content boolean DEFAULT false,
    perm_view_audit_logs boolean DEFAULT false,
    perm_manage_services boolean DEFAULT false,
    perm_manage_faq boolean DEFAULT false,
    perm_manage_settings boolean DEFAULT false,
    perm_manage_catalog boolean DEFAULT false,
    is_active boolean DEFAULT true NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    locked_until timestamp without time zone,
    perm_jobs boolean DEFAULT false,
    perm_trainings boolean DEFAULT false,
    perm_services boolean DEFAULT false,
    perm_faq boolean DEFAULT false,
    perm_users boolean DEFAULT false,
    perm_editoriale boolean DEFAULT false,
    level integer DEFAULT 1,
    department character varying(100),
    permissions jsonb DEFAULT '{}'::jsonb,
    subscription_id integer,
    role_level integer DEFAULT 1,
    status character varying(20) DEFAULT 'pending'::character varying,
    profile_picture text,
    activation_token text,
    token_expires_at timestamp without time zone,
    reset_token character varying,
    reset_token_expires timestamp without time zone,
    bio text,
    CONSTRAINT admins_level_check CHECK (((level >= 1) AND (level <= 5))),
    CONSTRAINT admins_role_level_check CHECK (((role_level >= 1) AND (role_level <= 5))),
    CONSTRAINT admins_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'active'::character varying, 'blocked'::character varying])::text[])))
);


ALTER TABLE public.admins OWNER TO emploip01_admin;

--
-- Name: COLUMN admins.reset_token; Type: COMMENT; Schema: public; Owner: emploip01_admin
--

COMMENT ON COLUMN public.admins.reset_token IS 'Hashed token for password reset requests';


--
-- Name: COLUMN admins.reset_token_expires; Type: COMMENT; Schema: public; Owner: emploip01_admin
--

COMMENT ON COLUMN public.admins.reset_token_expires IS 'Expiration timestamp for password reset token';


--
-- Name: COLUMN admins.bio; Type: COMMENT; Schema: public; Owner: emploip01_admin
--

COMMENT ON COLUMN public.admins.bio IS 'Admin biography/description (max 500 chars)';


--
-- Name: admin_roles_overview; Type: VIEW; Schema: public; Owner: emploip01_admin
--

CREATE VIEW public.admin_roles_overview AS
 SELECT level,
    role,
    count(*) AS total_admins,
    string_agg(concat(first_name, ' ', last_name), ', '::text) AS admin_names
   FROM public.admins
  GROUP BY level, role
  ORDER BY level;


ALTER VIEW public.admin_roles_overview OWNER TO emploip01_admin;

--
-- Name: admins_id_seq; Type: SEQUENCE; Schema: public; Owner: emploip01_admin
--

CREATE SEQUENCE public.admins_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.admins_id_seq OWNER TO emploip01_admin;

--
-- Name: admins_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: emploip01_admin
--

ALTER SEQUENCE public.admins_id_seq OWNED BY public.admins.id;


--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: emploip01_admin
--

CREATE TABLE public.audit_logs (
    id bigint NOT NULL,
    action text NOT NULL,
    details jsonb,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.audit_logs OWNER TO emploip01_admin;

--
-- Name: audit_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: emploip01_admin
--

CREATE SEQUENCE public.audit_logs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.audit_logs_id_seq OWNER TO emploip01_admin;

--
-- Name: audit_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: emploip01_admin
--

ALTER SEQUENCE public.audit_logs_id_seq OWNED BY public.audit_logs.id;


--
-- Name: documents; Type: TABLE; Schema: public; Owner: emploip01_admin
--

CREATE TABLE public.documents (
    id integer NOT NULL,
    slug character varying(255) NOT NULL,
    title character varying(500) NOT NULL,
    content text NOT NULL,
    type character varying(50) DEFAULT 'other'::character varying NOT NULL,
    is_published boolean DEFAULT false,
    created_by integer,
    updated_by integer,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT documents_type_check CHECK (((type)::text = ANY ((ARRAY['privacy'::character varying, 'terms'::character varying, 'cookies'::character varying, 'other'::character varying])::text[])))
);


ALTER TABLE public.documents OWNER TO emploip01_admin;

--
-- Name: documents_id_seq; Type: SEQUENCE; Schema: public; Owner: emploip01_admin
--

CREATE SEQUENCE public.documents_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.documents_id_seq OWNER TO emploip01_admin;

--
-- Name: documents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: emploip01_admin
--

ALTER SEQUENCE public.documents_id_seq OWNED BY public.documents.id;


--
-- Name: faq_categories; Type: TABLE; Schema: public; Owner: emploip01_admin
--

CREATE TABLE public.faq_categories (
    id bigint NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.faq_categories OWNER TO emploip01_admin;

--
-- Name: faq_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: emploip01_admin
--

CREATE SEQUENCE public.faq_categories_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.faq_categories_id_seq OWNER TO emploip01_admin;

--
-- Name: faq_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: emploip01_admin
--

ALTER SEQUENCE public.faq_categories_id_seq OWNED BY public.faq_categories.id;


--
-- Name: faqs; Type: TABLE; Schema: public; Owner: emploip01_admin
--

CREATE TABLE public.faqs (
    id bigint NOT NULL,
    question text NOT NULL,
    answer text NOT NULL,
    published boolean DEFAULT true,
    category text DEFAULT 'Général'::text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.faqs OWNER TO emploip01_admin;

--
-- Name: faqs_id_seq; Type: SEQUENCE; Schema: public; Owner: emploip01_admin
--

CREATE SEQUENCE public.faqs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.faqs_id_seq OWNER TO emploip01_admin;

--
-- Name: faqs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: emploip01_admin
--

ALTER SEQUENCE public.faqs_id_seq OWNED BY public.faqs.id;


--
-- Name: formations; Type: TABLE; Schema: public; Owner: emploip01_admin
--

CREATE TABLE public.formations (
    id integer NOT NULL,
    title text NOT NULL,
    description text,
    provider character varying(255),
    duration character varying(100),
    level character varying(50),
    category character varying(100),
    deadline_date timestamp without time zone,
    certification character varying(255),
    price numeric(12,2),
    published boolean DEFAULT true,
    is_closed boolean DEFAULT false,
    image_url text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.formations OWNER TO emploip01_admin;

--
-- Name: formations_id_seq; Type: SEQUENCE; Schema: public; Owner: emploip01_admin
--

CREATE SEQUENCE public.formations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.formations_id_seq OWNER TO emploip01_admin;

--
-- Name: formations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: emploip01_admin
--

ALTER SEQUENCE public.formations_id_seq OWNED BY public.formations.id;


--
-- Name: jobs; Type: TABLE; Schema: public; Owner: emploip01_admin
--

CREATE TABLE public.jobs (
    id integer NOT NULL,
    title text NOT NULL,
    company text,
    location text,
    sector text,
    type text,
    salary text,
    description text,
    image_url text,
    application_url text,
    deadline timestamp without time zone,
    published boolean DEFAULT false,
    published_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    company_id integer,
    requirements text,
    salary_min numeric(12,2),
    salary_max numeric(12,2),
    job_type character varying(100),
    experience_level character varying(100),
    is_closed boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    deadline_date timestamp without time zone,
    application_via_emploi boolean DEFAULT false NOT NULL
);


ALTER TABLE public.jobs OWNER TO emploip01_admin;

--
-- Name: jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: emploip01_admin
--

CREATE SEQUENCE public.jobs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.jobs_id_seq OWNER TO emploip01_admin;

--
-- Name: jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: emploip01_admin
--

ALTER SEQUENCE public.jobs_id_seq OWNED BY public.jobs.id;


--
-- Name: legal_document_versions; Type: TABLE; Schema: public; Owner: emploip01_admin
--

CREATE TABLE public.legal_document_versions (
    id bigint NOT NULL,
    document_id bigint NOT NULL,
    version integer NOT NULL,
    content text NOT NULL,
    updated_by bigint,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.legal_document_versions OWNER TO emploip01_admin;

--
-- Name: legal_document_versions_id_seq; Type: SEQUENCE; Schema: public; Owner: emploip01_admin
--

CREATE SEQUENCE public.legal_document_versions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.legal_document_versions_id_seq OWNER TO emploip01_admin;

--
-- Name: legal_document_versions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: emploip01_admin
--

ALTER SEQUENCE public.legal_document_versions_id_seq OWNED BY public.legal_document_versions.id;


--
-- Name: legal_documents; Type: TABLE; Schema: public; Owner: emploip01_admin
--

CREATE TABLE public.legal_documents (
    id bigint NOT NULL,
    slug text NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    version integer DEFAULT 1 NOT NULL,
    updated_by bigint,
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.legal_documents OWNER TO emploip01_admin;

--
-- Name: legal_documents_id_seq; Type: SEQUENCE; Schema: public; Owner: emploip01_admin
--

CREATE SEQUENCE public.legal_documents_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.legal_documents_id_seq OWNER TO emploip01_admin;

--
-- Name: legal_documents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: emploip01_admin
--

ALTER SEQUENCE public.legal_documents_id_seq OWNED BY public.legal_documents.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: emploip01_admin
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    user_id integer NOT NULL,
    sender_id integer,
    title text NOT NULL,
    message text,
    read boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.notifications OWNER TO emploip01_admin;

--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: emploip01_admin
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notifications_id_seq OWNER TO emploip01_admin;

--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: emploip01_admin
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: permissions; Type: TABLE; Schema: public; Owner: emploip01_admin
--

CREATE TABLE public.permissions (
    id bigint NOT NULL,
    name text NOT NULL,
    description text,
    slug text
);


ALTER TABLE public.permissions OWNER TO emploip01_admin;

--
-- Name: permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: emploip01_admin
--

CREATE SEQUENCE public.permissions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.permissions_id_seq OWNER TO emploip01_admin;

--
-- Name: permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: emploip01_admin
--

ALTER SEQUENCE public.permissions_id_seq OWNED BY public.permissions.id;


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: emploip01_admin
--

CREATE TABLE public.profiles (
    id integer NOT NULL,
    last_name character varying(100),
    first_name character varying(100),
    email character varying(255) NOT NULL,
    password text,
    role character varying(50) DEFAULT 'super_admin'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.profiles OWNER TO emploip01_admin;

--
-- Name: profiles_id_seq; Type: SEQUENCE; Schema: public; Owner: emploip01_admin
--

CREATE SEQUENCE public.profiles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.profiles_id_seq OWNER TO emploip01_admin;

--
-- Name: profiles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: emploip01_admin
--

ALTER SEQUENCE public.profiles_id_seq OWNED BY public.profiles.id;


--
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: emploip01_admin
--

CREATE TABLE public.role_permissions (
    role_id bigint NOT NULL,
    permission_id bigint NOT NULL
);


ALTER TABLE public.role_permissions OWNER TO emploip01_admin;

--
-- Name: roles; Type: TABLE; Schema: public; Owner: emploip01_admin
--

CREATE TABLE public.roles (
    id bigint NOT NULL,
    name text NOT NULL,
    description text
);


ALTER TABLE public.roles OWNER TO emploip01_admin;

--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: emploip01_admin
--

CREATE SEQUENCE public.roles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roles_id_seq OWNER TO emploip01_admin;

--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: emploip01_admin
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: service_catalogs; Type: TABLE; Schema: public; Owner: emploip01_admin
--

CREATE TABLE public.service_catalogs (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    is_visible boolean DEFAULT true,
    is_featured boolean DEFAULT false,
    display_order integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.service_catalogs OWNER TO emploip01_admin;

--
-- Name: TABLE service_catalogs; Type: COMMENT; Schema: public; Owner: emploip01_admin
--

COMMENT ON TABLE public.service_catalogs IS 'Service catalog categories/groups for admin management';


--
-- Name: service_catalogs_id_seq; Type: SEQUENCE; Schema: public; Owner: emploip01_admin
--

CREATE SEQUENCE public.service_catalogs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.service_catalogs_id_seq OWNER TO emploip01_admin;

--
-- Name: service_catalogs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: emploip01_admin
--

ALTER SEQUENCE public.service_catalogs_id_seq OWNED BY public.service_catalogs.id;


--
-- Name: service_categories; Type: TABLE; Schema: public; Owner: emploip01_admin
--

CREATE TABLE public.service_categories (
    id bigint NOT NULL,
    name text NOT NULL
);


ALTER TABLE public.service_categories OWNER TO emploip01_admin;

--
-- Name: service_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: emploip01_admin
--

CREATE SEQUENCE public.service_categories_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.service_categories_id_seq OWNER TO emploip01_admin;

--
-- Name: service_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: emploip01_admin
--

ALTER SEQUENCE public.service_categories_id_seq OWNED BY public.service_categories.id;


--
-- Name: services; Type: TABLE; Schema: public; Owner: emploip01_admin
--

CREATE TABLE public.services (
    id integer NOT NULL,
    catalog_id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    price numeric(10,2),
    rating numeric(2,1),
    is_promo boolean DEFAULT false,
    promo_text character varying(255),
    is_visible boolean DEFAULT true,
    image_url text,
    brochure_url text,
    display_order integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT services_rating_check CHECK (((rating >= (1)::numeric) AND (rating <= (5)::numeric)))
);


ALTER TABLE public.services OWNER TO emploip01_admin;

--
-- Name: TABLE services; Type: COMMENT; Schema: public; Owner: emploip01_admin
--

COMMENT ON TABLE public.services IS 'Individual services within catalogs with pricing, promotions, and ratings';


--
-- Name: COLUMN services.rating; Type: COMMENT; Schema: public; Owner: emploip01_admin
--

COMMENT ON COLUMN public.services.rating IS 'Service rating from 1 to 5 stars, set by admin';


--
-- Name: COLUMN services.is_promo; Type: COMMENT; Schema: public; Owner: emploip01_admin
--

COMMENT ON COLUMN public.services.is_promo IS 'Flag to indicate service is on promotion';


--
-- Name: COLUMN services.promo_text; Type: COMMENT; Schema: public; Owner: emploip01_admin
--

COMMENT ON COLUMN public.services.promo_text IS 'Promotional text displayed with service badge';


--
-- Name: services_catalog; Type: TABLE; Schema: public; Owner: emploip01_admin
--

CREATE TABLE public.services_catalog (
    id bigint NOT NULL,
    title text NOT NULL,
    category_id bigint,
    published boolean DEFAULT false
);


ALTER TABLE public.services_catalog OWNER TO emploip01_admin;

--
-- Name: services_catalog_id_seq; Type: SEQUENCE; Schema: public; Owner: emploip01_admin
--

CREATE SEQUENCE public.services_catalog_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.services_catalog_id_seq OWNER TO emploip01_admin;

--
-- Name: services_catalog_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: emploip01_admin
--

ALTER SEQUENCE public.services_catalog_id_seq OWNED BY public.services_catalog.id;


--
-- Name: services_id_seq; Type: SEQUENCE; Schema: public; Owner: emploip01_admin
--

CREATE SEQUENCE public.services_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.services_id_seq OWNER TO emploip01_admin;

--
-- Name: services_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: emploip01_admin
--

ALTER SEQUENCE public.services_id_seq OWNED BY public.services.id;


--
-- Name: site_notifications; Type: TABLE; Schema: public; Owner: emploip01_admin
--

CREATE TABLE public.site_notifications (
    id integer NOT NULL,
    title text NOT NULL,
    message text,
    target text DEFAULT 'all'::text,
    category text,
    image_url text,
    link text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.site_notifications OWNER TO emploip01_admin;

--
-- Name: site_notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: emploip01_admin
--

CREATE SEQUENCE public.site_notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.site_notifications_id_seq OWNER TO emploip01_admin;

--
-- Name: site_notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: emploip01_admin
--

ALTER SEQUENCE public.site_notifications_id_seq OWNED BY public.site_notifications.id;


--
-- Name: subscription_plans_id_seq; Type: SEQUENCE; Schema: public; Owner: emploip01_admin
--

CREATE SEQUENCE public.subscription_plans_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.subscription_plans_id_seq OWNER TO emploip01_admin;

--
-- Name: subscription_plans_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: emploip01_admin
--

ALTER SEQUENCE public.subscription_plans_id_seq OWNED BY public.subscription_plans.id;


--
-- Name: subscription_queue; Type: TABLE; Schema: public; Owner: emploip01_admin
--

CREATE TABLE public.subscription_queue (
    id integer NOT NULL,
    user_id integer NOT NULL,
    subscription_id integer,
    job_type character varying(50) NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    scheduled_for timestamp without time zone,
    target_date timestamp without time zone,
    attempt_count integer DEFAULT 0,
    max_attempts integer DEFAULT 3,
    next_retry_at timestamp without time zone,
    last_error text,
    priority integer DEFAULT 0,
    data jsonb,
    result jsonb,
    created_at timestamp without time zone DEFAULT now(),
    started_at timestamp without time zone,
    completed_at timestamp without time zone,
    processed_at timestamp without time zone
);


ALTER TABLE public.subscription_queue OWNER TO emploip01_admin;

--
-- Name: subscription_queue_id_seq; Type: SEQUENCE; Schema: public; Owner: emploip01_admin
--

CREATE SEQUENCE public.subscription_queue_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.subscription_queue_id_seq OWNER TO emploip01_admin;

--
-- Name: subscription_queue_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: emploip01_admin
--

ALTER SEQUENCE public.subscription_queue_id_seq OWNED BY public.subscription_queue.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: emploip01_admin
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email text NOT NULL,
    password text,
    user_type text DEFAULT 'candidate'::text NOT NULL,
    phone text,
    company_name text,
    company_address text,
    profession text,
    job_title text,
    diploma text,
    experience_years integer DEFAULT 0,
    profile_image_url text,
    skills jsonb DEFAULT '[]'::jsonb,
    is_verified boolean DEFAULT false,
    is_blocked boolean DEFAULT false,
    is_deleted boolean DEFAULT false,
    deletion_requested_at timestamp without time zone,
    deletion_scheduled_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    first_name text NOT NULL,
    last_name text NOT NULL,
    role_id bigint
);


ALTER TABLE public.users OWNER TO emploip01_admin;

--
-- Name: subscriptions_expiring_soon; Type: VIEW; Schema: public; Owner: emploip01_admin
--

CREATE VIEW public.subscriptions_expiring_soon AS
 SELECT us.id,
    us.user_id,
    u.email,
    u.first_name,
    u.last_name,
    sp.name AS plan_name,
    us.end_date,
    ((us.end_date)::timestamp with time zone - now()) AS days_until_expiry
   FROM ((public.user_subscriptions us
     JOIN public.subscription_plans sp ON ((us.plan_id = sp.id)))
     JOIN public.users u ON ((us.user_id = u.id)))
  WHERE (((us.status)::text = 'active'::text) AND (us.end_date IS NOT NULL) AND ((us.end_date >= now()) AND (us.end_date <= (now() + '7 days'::interval))))
  ORDER BY us.end_date;


ALTER VIEW public.subscriptions_expiring_soon OWNER TO emploip01_admin;

--
-- Name: trainings; Type: TABLE; Schema: public; Owner: emploip01_admin
--

CREATE TABLE public.trainings (
    id integer NOT NULL,
    title text NOT NULL,
    description text,
    provider character varying(255),
    duration character varying(100),
    level character varying(50),
    category character varying(100),
    deadline_date timestamp without time zone,
    certification character varying(255),
    cost numeric(12,2),
    is_closed boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.trainings OWNER TO emploip01_admin;

--
-- Name: trainings_id_seq; Type: SEQUENCE; Schema: public; Owner: emploip01_admin
--

CREATE SEQUENCE public.trainings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.trainings_id_seq OWNER TO emploip01_admin;

--
-- Name: trainings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: emploip01_admin
--

ALTER SEQUENCE public.trainings_id_seq OWNED BY public.trainings.id;


--
-- Name: user_documents; Type: TABLE; Schema: public; Owner: emploip01_admin
--

CREATE TABLE public.user_documents (
    id integer NOT NULL,
    user_id integer NOT NULL,
    doc_type text NOT NULL,
    title text,
    storage_url text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.user_documents OWNER TO emploip01_admin;

--
-- Name: user_documents_id_seq; Type: SEQUENCE; Schema: public; Owner: emploip01_admin
--

CREATE SEQUENCE public.user_documents_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_documents_id_seq OWNER TO emploip01_admin;

--
-- Name: user_documents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: emploip01_admin
--

ALTER SEQUENCE public.user_documents_id_seq OWNED BY public.user_documents.id;


--
-- Name: user_skills; Type: TABLE; Schema: public; Owner: emploip01_admin
--

CREATE TABLE public.user_skills (
    id integer NOT NULL,
    user_id integer NOT NULL,
    skill_name text NOT NULL,
    category text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.user_skills OWNER TO emploip01_admin;

--
-- Name: user_skills_id_seq; Type: SEQUENCE; Schema: public; Owner: emploip01_admin
--

CREATE SEQUENCE public.user_skills_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_skills_id_seq OWNER TO emploip01_admin;

--
-- Name: user_skills_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: emploip01_admin
--

ALTER SEQUENCE public.user_skills_id_seq OWNED BY public.user_skills.id;


--
-- Name: user_subscription_history; Type: TABLE; Schema: public; Owner: emploip01_admin
--

CREATE TABLE public.user_subscription_history (
    id integer NOT NULL,
    subscription_id integer NOT NULL,
    user_id integer NOT NULL,
    event_type character varying(50) NOT NULL,
    previous_status character varying(20),
    new_status character varying(20),
    reason text,
    triggered_by character varying(50),
    admin_id integer,
    details jsonb,
    created_by integer,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.user_subscription_history OWNER TO emploip01_admin;

--
-- Name: user_subscription_history_id_seq; Type: SEQUENCE; Schema: public; Owner: emploip01_admin
--

CREATE SEQUENCE public.user_subscription_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_subscription_history_id_seq OWNER TO emploip01_admin;

--
-- Name: user_subscription_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: emploip01_admin
--

ALTER SEQUENCE public.user_subscription_history_id_seq OWNED BY public.user_subscription_history.id;


--
-- Name: user_subscriptions_id_seq; Type: SEQUENCE; Schema: public; Owner: emploip01_admin
--

CREATE SEQUENCE public.user_subscriptions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_subscriptions_id_seq OWNER TO emploip01_admin;

--
-- Name: user_subscriptions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: emploip01_admin
--

ALTER SEQUENCE public.user_subscriptions_id_seq OWNED BY public.user_subscriptions.id;


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: emploip01_admin
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO emploip01_admin;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: emploip01_admin
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: visitor_interactions; Type: TABLE; Schema: public; Owner: emploip01_admin
--

CREATE TABLE public.visitor_interactions (
    id integer NOT NULL,
    user_id integer,
    service text,
    event_type text,
    payload jsonb,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.visitor_interactions OWNER TO emploip01_admin;

--
-- Name: visitor_interactions_id_seq; Type: SEQUENCE; Schema: public; Owner: emploip01_admin
--

CREATE SEQUENCE public.visitor_interactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.visitor_interactions_id_seq OWNER TO emploip01_admin;

--
-- Name: visitor_interactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: emploip01_admin
--

ALTER SEQUENCE public.visitor_interactions_id_seq OWNED BY public.visitor_interactions.id;


--
-- Name: admin_roles id; Type: DEFAULT; Schema: public; Owner: emploip01_admin
--

ALTER TABLE ONLY public.admin_roles ALTER COLUMN id SET DEFAULT nextval('public.admin_roles_id_seq'::regclass);


--
-- Name: admins id; Type: DEFAULT; Schema: public; Owner: emploip01_admin
--

ALTER TABLE ONLY public.admins ALTER COLUMN id SET DEFAULT nextval('public.admins_id_seq'::regclass);


--
-- Name: audit_logs id; Type: DEFAULT; Schema: public; Owner: emploip01_admin
--

ALTER TABLE ONLY public.audit_logs ALTER COLUMN id SET DEFAULT nextval('public.audit_logs_id_seq'::regclass);


--
-- Name: documents id; Type: DEFAULT; Schema: public; Owner: emploip01_admin
--

ALTER TABLE ONLY public.documents ALTER COLUMN id SET DEFAULT nextval('public.documents_id_seq'::regclass);


--
-- Name: faq_categories id; Type: DEFAULT; Schema: public; Owner: emploip01_admin
--

ALTER TABLE ONLY public.faq_categories ALTER COLUMN id SET DEFAULT nextval('public.faq_categories_id_seq'::regclass);


--
-- Name: faqs id; Type: DEFAULT; Schema: public; Owner: emploip01_admin
--

ALTER TABLE ONLY public.faqs ALTER COLUMN id SET DEFAULT nextval('public.faqs_id_seq'::regclass);


--
-- Name: formations id; Type: DEFAULT; Schema: public; Owner: emploip01_admin
--

ALTER TABLE ONLY public.formations ALTER COLUMN id SET DEFAULT nextval('public.formations_id_seq'::regclass);


--
-- Name: jobs id; Type: DEFAULT; Schema: public; Owner: emploip01_admin
--

ALTER TABLE ONLY public.jobs ALTER COLUMN id SET DEFAULT nextval('public.jobs_id_seq'::regclass);


--
-- Name: legal_document_versions id; Type: DEFAULT; Schema: public; Owner: emploip01_admin
--

ALTER TABLE ONLY public.legal_document_versions ALTER COLUMN id SET DEFAULT nextval('public.legal_document_versions_id_seq'::regclass);


--
-- Name: legal_documents id; Type: DEFAULT; Schema: public; Owner: emploip01_admin
--

ALTER TABLE ONLY public.legal_documents ALTER COLUMN id SET DEFAULT nextval('public.legal_documents_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: emploip01_admin
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: permissions id; Type: DEFAULT; Schema: public; Owner: emploip01_admin
--

ALTER TABLE ONLY public.permissions ALTER COLUMN id SET DEFAULT nextval('public.permissions_id_seq'::regclass);


--
-- Name: profiles id; Type: DEFAULT; Schema: public; Owner: emploip01_admin
--

ALTER TABLE ONLY public.profiles ALTER COLUMN id SET DEFAULT nextval('public.profiles_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: emploip01_admin
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Name: service_catalogs id; Type: DEFAULT; Schema: public; Owner: emploip01_admin
--

ALTER TABLE ONLY public.service_catalogs ALTER COLUMN id SET DEFAULT nextval('public.service_catalogs_id_seq'::regclass);


--
-- Name: service_categories id; Type: DEFAULT; Schema: public; Owner: emploip01_admin
--

ALTER TABLE ONLY public.service_categories ALTER COLUMN id SET DEFAULT nextval('public.service_categories_id_seq'::regclass);


--
-- Name: services id; Type: DEFAULT; Schema: public; Owner: emploip01_admin
--

ALTER TABLE ONLY public.services ALTER COLUMN id SET DEFAULT nextval('public.services_id_seq'::regclass);


--
-- Name: services_catalog id; Type: DEFAULT; Schema: public; Owner: emploip01_admin
--

ALTER TABLE ONLY public.services_catalog ALTER COLUMN id SET DEFAULT nextval('public.services_catalog_id_seq'::regclass);


--
-- Name: site_notifications id; Type: DEFAULT; Schema: public; Owner: emploip01_admin
--

ALTER TABLE ONLY public.site_notifications ALTER COLUMN id SET DEFAULT nextval('public.site_notifications_id_seq'::regclass);


--
-- Name: subscription_plans id; Type: DEFAULT; Schema: public; Owner: emploip01_admin
--

ALTER TABLE ONLY public.subscription_plans ALTER COLUMN id SET DEFAULT nextval('public.subscription_plans_id_seq'::regclass);


--
-- Name: subscription_queue id; Type: DEFAULT; Schema: public; Owner: emploip01_admin
--

ALTER TABLE ONLY public.subscription_queue ALTER COLUMN id SET DEFAULT nextval('public.subscription_queue_id_seq'::regclass);


--
-- Name: trainings id; Type: DEFAULT; Schema: public; Owner: emploip01_admin
--

ALTER TABLE ONLY public.trainings ALTER COLUMN id SET DEFAULT nextval('public.trainings_id_seq'::regclass);


--
-- Name: user_documents id; Type: DEFAULT; Schema: public; Owner: emploip01_admin
--

ALTER TABLE ONLY public.user_documents ALTER COLUMN id SET DEFAULT nextval('public.user_documents_id_seq'::regclass);


--
-- Name: user_skills id; Type: DEFAULT; Schema: public; Owner: emploip01_admin
--

ALTER TABLE ONLY public.user_skills ALTER COLUMN id SET DEFAULT nextval('public.user_skills_id_seq'::regclass);


--
-- Name: user_subscription_history id; Type: DEFAULT; Schema: public; Owner: emploip01_admin
--

ALTER TABLE ONLY public.user_subscription_history ALTER COLUMN id SET DEFAULT nextval('public.user_subscription_history_id_seq'::regclass);


--
-- Name: user_subscriptions id; Type: DEFAULT; Schema: public; Owner: emploip01_admin
--

ALTER TABLE ONLY public.user_subscriptions ALTER COLUMN id SET DEFAULT nextval('public.user_subscriptions_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: emploip01_admin
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: visitor_interactions id; Type: DEFAULT; Schema: public; Owner: emploip01_admin
--

ALTER TABLE ONLY public.visitor_interactions ALTER COLUMN id SET DEFAULT nextval('public.visitor_interactions_id_seq'::regclass);


--
-- Data for Name: admin_roles; Type: TABLE DATA; Schema: public; Owner: emploip01_admin
--

COPY public.admin_roles (id, admin_id, role_id) FROM stdin;
1	5	1
2	6	1
\.


--
-- Data for Name: admins; Type: TABLE DATA; Schema: public; Owner: emploip01_admin
--

COPY public.admins (id, last_name, first_name, email, password, phone, country, city, birth_date, avatar_url, role, is_verified, verification_token, created_at, perm_manage_users, perm_manage_roles, perm_edit_content, perm_publish_content, perm_view_audit_logs, perm_manage_services, perm_manage_faq, perm_manage_settings, perm_manage_catalog, is_active, updated_at, locked_until, perm_jobs, perm_trainings, perm_services, perm_faq, perm_users, perm_editoriale, level, department, permissions, subscription_id, role_level, status, profile_picture, activation_token, token_expires_at, reset_token, reset_token_expires, bio) FROM stdin;
7	Admin	Test	autom-test+1@localhost	$2b$10$xbG9h/eezaZ5J34A9xmNQ.a9n3dFRxlcAOd7fNLLkJCauA8C7MvZ2	\N	\N	\N	\N	https://ui-avatars.com/api/?name=Admin	super_admin	f	40e6c6fdebaf644c153d6fc8a0cc83c2e5b12e69f6ddad4a2cd5b174a22d6d41	2026-02-22 08:50:26.24575	f	f	f	f	f	f	f	f	f	t	2026-02-23 02:24:16.028905	\N	f	f	f	f	f	f	1	\N	{}	\N	1	pending	\N	\N	\N	\N	\N	\N
8	ETOKA	Francklin	francklin@emploiplus-group.com	$2b$10$CY99NuFCQFRp5xNRbB1dS.kV8tRJG5PCO.c9/qOqgFkAwc9zZ9C9y	\N	\N	\N	\N	https://ui-avatars.com/api/?name=Admin	admin	f	50488a35e1d7ab0d7859e530d6b95dee5017f1c66fe3d798812c53f6fb90b513	2026-02-23 10:16:19.094701	f	f	f	f	f	f	f	f	f	t	2026-02-23 10:16:19.094701	\N	f	f	f	f	f	f	1	\N	{}	\N	1	pending	\N	\N	\N	\N	\N	\N
9	Admin	Test	test-admin-1771881846337@test.local	$2b$12$PeIOXfycRXBsCOMUqwA2xO05KJrVOaViK5kWp1yjvrV4dz4XECSn.	\N	\N	\N	\N	https://ui-avatars.com/api/?name=Admin	super_admin	f	\N	2026-02-23 22:24:07.527381	f	f	f	f	f	f	f	f	f	t	2026-02-23 22:24:07.527381	\N	f	f	f	f	f	f	1	\N	{}	\N	1	pending	\N	\N	\N	\N	\N	\N
10	Admin	Test	test-admin-1771882727646@test.local	$2b$12$DZYVpcbNBFc1gfdPqFAFZexiZxWSF31iVl5autlEW97IfR1JfMHbe	\N	\N	\N	\N	https://ui-avatars.com/api/?name=Admin	super_admin	f	\N	2026-02-23 22:38:48.263122	f	f	f	f	f	f	f	f	f	t	2026-02-23 22:38:48.263122	\N	f	f	f	f	f	f	1	\N	{}	\N	1	pending	\N	\N	\N	\N	\N	\N
11	Admin	Test	test-admin-1771882791048@test.local	$2b$12$ODcRErxWQruIu452ZmXVoebr0/c.mlsjnOOCbeG5kx51Kr5qtJbku	\N	\N	\N	\N	https://ui-avatars.com/api/?name=Admin	super_admin	f	\N	2026-02-23 22:39:51.732569	f	f	f	f	f	f	f	f	f	t	2026-02-23 22:39:51.732569	\N	f	f	f	f	f	f	1	\N	{}	\N	1	pending	\N	\N	\N	\N	\N	\N
12	Admin	Test	test-admin-1771883089773@test.local	$2b$12$QHADT0UyujLOpyVkgh7M.erVWAj4xMxmZy.jV9d2b3mVjxnJ1wCA.	\N	\N	\N	\N	https://ui-avatars.com/api/?name=Admin	super_admin	f	\N	2026-02-23 22:44:50.407157	f	f	f	f	f	f	f	f	f	t	2026-02-23 22:44:50.407157	\N	f	f	f	f	f	f	1	\N	{}	\N	1	pending	\N	\N	\N	\N	\N	\N
13	Admin	Test	test-admin-1771883155174@test.local	$2b$12$tldbjqTDdjpFj6V3Lyd.POkuD8YEllcSvvdMeLGKUOfE5aPEYLFt6	\N	\N	\N	\N	https://ui-avatars.com/api/?name=Admin	super_admin	f	\N	2026-02-23 22:45:56.087541	f	f	f	f	f	f	f	f	f	t	2026-02-23 22:45:56.943088	\N	f	f	f	f	f	f	1	\N	{}	\N	1	pending	\N	\N	\N	\N	\N	\N
14	Admin	Test	test-admin-1771883180053@test.local	$2b$12$PShH2Ut4GRBo3Kgq6XTjNeG6slpnn6Kbhc4pu67IGJh2qCVebad02	\N	\N	\N	\N	https://ui-avatars.com/api/?name=Admin	super_admin	f	\N	2026-02-23 22:46:20.729936	f	f	f	f	f	f	f	f	f	t	2026-02-23 22:46:22.198243	\N	f	f	f	f	f	f	1	\N	{}	\N	1	pending	\N	\N	\N	\N	\N	\N
6	ETOKA	Franck	sylveretoka@gmail.com	$2b$10$oRlAPey0nbBQBcyBJ/x2ZuTs1tOUp.LuL6sbxM82Xfb9jYvBkX8B2	\N	\N	\N	\N	https://ui-avatars.com/api/?name=Admin	super_admin	t	\N	2026-02-20 18:39:22.835007	f	f	f	f	f	f	f	f	f	t	2026-02-23 23:17:09.834435	\N	f	f	f	f	f	f	1	\N	{}	\N	1	pending	\N	\N	\N	\N	\N	\N
15	Admin	Test	test-admin-1771883416955@test.local	$2b$12$Ka/vYuQV9JZf2aQhUfGaieqhaOwsQ93vG5Q71fsVUExNB7hj4a0ma	\N	\N	\N	\N	https://ui-avatars.com/api/?name=Admin	super_admin	f	\N	2026-02-23 22:50:17.568438	f	f	f	f	f	f	f	f	f	t	2026-02-23 22:50:18.331119	\N	f	f	f	f	f	f	1	\N	{}	\N	1	pending	\N	\N	\N	\N	\N	\N
16	Admin	Test	test-admin-automation@example.test	b2/wyfHG1N4fOWeoTe9/FpZOZf0IGC/HDC9oYEBUSbYDEW	\N	\N	\N	\N	https://ui-avatars.com/api/?name=Admin	super_admin	f	\N	2026-02-24 01:12:48.435108	f	f	f	f	f	f	f	f	f	t	2026-02-24 01:12:48.435108	\N	f	f	f	f	f	f	1	\N	{}	\N	1	pending	\N	\N	\N	\N	\N	\N
17	Admin	Test	test-super-admin@test.local	$2b$10$/RU.kQUdNbWB/k6KSfBluOk4qUmHT4dkTlet0xKOuMFLKecxivuTq	\N	\N	\N	\N	https://ui-avatars.com/api/?name=Admin	super_admin	f	\N	2026-02-24 14:42:59.999784	f	f	f	f	f	f	f	f	f	t	2026-02-24 14:45:20.006673	\N	f	f	f	f	f	f	1	\N	{}	\N	1	pending	\N	\N	\N	\N	\N	\N
19	Admin	Test	testadmin@test.local	$2b$10$IGz2JfceDGZPnHhZwZ.q.u5B5oNEu3oTBV0urOPJjzgbVjuyYzYu2	\N	\N	\N	\N	https://ui-avatars.com/api/?name=Admin	admin	f	\N	2026-02-25 08:25:44.068905	f	f	f	f	f	f	f	f	f	t	2026-02-25 08:25:44.068905	\N	f	f	f	f	f	f	1	\N	{}	\N	1	active	\N	\N	\N	\N	\N	\N
20	Admin	Super	superadmin@emploiplus.local	$2b$10$AJhcSP9CBtx.5BfjSsLcpeyOgo1nz/g51/WUc.gqABRbZb.pQw/Qa	\N	\N	\N	\N	https://ui-avatars.com/api/?name=Admin	super_admin	f	\N	2026-02-25 08:36:11.344736	f	f	f	f	f	f	f	f	f	t	2026-02-25 08:36:11.344736	\N	f	f	f	f	f	f	1	\N	{}	\N	1	active	\N	\N	\N	\N	\N	\N
5	Linetoka	Franck	admin@emploiplus-group.com	$2b$10$l3gFYPufj.ngYIT3uDSjdepYYjKX0hN.eRHadZqwZl.OF154g2coW	\N	\N	\N	\N	https://ui-avatars.com/api/?name=Admin	super_admin	f	b85f9aeee34f342260585e4e94c51cd26aab5fcc2863c2da55028819b6f11ce4	2026-02-20 18:24:46.405272	f	f	f	f	f	f	f	f	f	t	2026-02-25 10:12:17.882897	\N	f	f	f	f	f	f	1	\N	{}	\N	1	active	\N	\N	\N	\N	\N	\N
21	Admin	Test	newadmin@emploiplus-group.com	$2b$10$JKDxfNI0tVLbgrMTLBENXO1jsykDWJd/vAquWSlpLiyZX6sTWvcwK	\N	\N	\N	\N	https://ui-avatars.com/api/?name=Admin	admin	f	\N	2026-02-25 10:16:40.153914	f	f	f	f	f	f	f	f	f	t	2026-02-25 10:16:40.153914	\N	f	f	f	f	f	f	1	\N	{}	\N	1	active	\N	\N	\N	\N	\N	\N
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: emploip01_admin
--

COPY public.audit_logs (id, action, details, created_at) FROM stdin;
\.


--
-- Data for Name: documents; Type: TABLE DATA; Schema: public; Owner: emploip01_admin
--

COPY public.documents (id, slug, title, content, type, is_published, created_by, updated_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: faq_categories; Type: TABLE DATA; Schema: public; Owner: emploip01_admin
--

COPY public.faq_categories (id, name, slug, created_at) FROM stdin;
\.


--
-- Data for Name: faqs; Type: TABLE DATA; Schema: public; Owner: emploip01_admin
--

COPY public.faqs (id, question, answer, published, category, created_at, updated_at) FROM stdin;
2	Qu'est-ce qu'Emploi+ et quels sont ses domaines d'intervention ?	R : Emploi+ est la plateforme de référence en République du Congo dédiée au développement professionnel. Nous intervenons sur quatre piliers majeurs :\n\nRecrutement et Gestion : Nous aidons les entreprises à trouver les meilleurs talents et à gérer leurs ressources humaines.\n\nServices Numériques : Nous offrons une expertise en rédaction professionnelle, informatique et design.\n\nOffres d'Emploi : Nous centralisons les meilleures opportunités du marché local et de la sous-région.\n\nFormations : Nous proposons des programmes de montée en compétences adaptés aux besoins réels des entreprises.	t	Général	2026-02-21 10:12:36.797102	2026-02-21 10:12:36.797102
3	Q : Comment Emploi+ peut-il aider mon entreprise à mieux gérer ses employés ?	R : Au-delà du recrutement, nous proposons des services de gestion RH, incluant l'évaluation des compétences et l'optimisation des performances de vos équipes pour garantir la croissance de votre entreprise.	t	Général	2026-02-21 10:13:07.800725	2026-02-21 10:13:07.800725
4	Q : Comment devenir partenaire ou solliciter un service numérique ?	R : Vous pouvez nous contacter via le formulaire de contact en choisissant la catégorie "Partenariat" ou "Service Numérique". Notre équipe technique et commerciale vous répondra sous 24h.	t	Général	2026-02-21 10:13:39.116691	2026-02-21 10:13:39.116691
5	Q : Comment puis-je accéder aux formations proposées ?	R : Toutes nos formations sont listées dans l'onglet "Formations". Vous pouvez consulter les détails de chaque session (programme, durée, coût) et vous inscrire directement en ligne.	t	Général	2026-02-21 10:14:07.371923	2026-02-21 10:14:07.371923
6	Q : J'ai besoin d'une assistance urgente, que faire ?	R : Pour une aide immédiate, privilégiez notre WhatsApp au +242 06 731 10 33. Pour des questions liées à votre compte, envoyez un email à support@emploiplus-group.com.	t	Général	2026-02-21 10:14:38.725155	2026-02-21 10:14:38.725155
\.


--
-- Data for Name: formations; Type: TABLE DATA; Schema: public; Owner: emploip01_admin
--

COPY public.formations (id, title, description, provider, duration, level, category, deadline_date, certification, price, published, is_closed, image_url, created_at, updated_at) FROM stdin;
1	React Avancé - Hooks & Context API	Maîtrisez les Hooks React, Context API, et les patterns avancés. Idéal pour les développeurs ayant une base en React.	Emploiplus Academy	4 semaines	Intermédiaire	Web Development	\N	Certificat React Avancé	199.99	t	f	https://emploiplus-group.com/assets/react-advanced.jpg	2026-02-25 11:42:26.00803	2026-02-25 11:42:26.00803
2	Node.js & Express - API REST Complète	Créez des APIs REST scalables avec Node.js et Express. Authentification, validation, et tests inclus.	Emploiplus Academy	5 semaines	Intermédiaire	Backend Development	\N	Certificat Backend Node.js	249.99	t	f	https://emploiplus-group.com/assets/nodejs-api.jpg	2026-02-25 11:42:26.00803	2026-02-25 11:42:26.00803
3	Vue.js 3 - Composition API	Apprenez Vue.js 3 avec la Composition API pour construire des applications web modernes et réactives.	Emploiplus Academy	3 semaines	Débutant	Web Development	\N	Certificat Vue.js 3	179.99	t	f	https://emploiplus-group.com/assets/vuejs.jpg	2026-02-25 11:42:26.00803	2026-02-25 11:42:26.00803
4	Python pour l'Analyse de Données	Pandas, NumPy, Matplotlib - Tous les outils pour analyser et visualiser les données avec Python.	Emploiplus Academy	6 semaines	Intermédiaire	Data Science	\N	Certificat Data Analysis	229.99	t	f	https://emploiplus-group.com/assets/python-data.jpg	2026-02-25 11:42:26.00803	2026-02-25 11:42:26.00803
5	TypeScript Professionnel	Devenez expert en TypeScript avec les types avancés, les décorateurs, et les patterns d'architecture.	Emploiplus Academy	4 semaines	Avancé	Web Development	\N	Certificat TypeScript Expert	219.99	t	f	https://emploiplus-group.com/assets/typescript.jpg	2026-02-25 11:42:26.00803	2026-02-25 11:42:26.00803
6	Machine Learning avec Python	Scikit-learn, TensorFlow, Deep Learning. Construisez des modèles ML pour des cas réels.	Emploiplus Academy	8 semaines	Avancé	Data Science	\N	Certificat Machine Learning	299.99	t	f	https://emploiplus-group.com/assets/ml.jpg	2026-02-25 11:42:26.00803	2026-02-25 11:42:26.00803
7	Docker & Kubernetes pour DevOps	Containerisez vos applications et orchestrez-les avec Kubernetes en production.	Emploiplus Academy	5 semaines	Avancé	DevOps	\N	Certificat DevOps Pro	269.99	t	f	https://emploiplus-group.com/assets/docker-k8s.jpg	2026-02-25 11:42:26.00803	2026-02-25 11:42:26.00803
8	Sécurité Web - OWASP Top 10	Apprenez les failles web courantes et comment les sécuriser. OWASP Top 10 couvert en détail.	Emploiplus Academy	4 semaines	Intermédiaire	Security	\N	Certificat Web Security	189.99	t	f	https://emploiplus-group.com/assets/security.jpg	2026-02-25 11:42:26.00803	2026-02-25 11:42:26.00803
9	Angular - Framework Complet	Maîtrisez Angular avec RxJS, les services, et la structure des modules d'une application professionnelle.	Emploiplus Academy	6 semaines	Avancé	Web Development	\N	Certificat Angular Professional	239.99	t	f	https://emploiplus-group.com/assets/angular.jpg	2026-02-25 11:42:26.00803	2026-02-25 11:42:26.00803
10	Gestion de Projets Agile - Scrum	Apprenez les principes Agile et la méthodologie Scrum pour gérer vos projets efficacement.	Emploiplus Academy	3 semaines	Débutant	Project Management	\N	Certificat Scrum Master	149.99	t	f	https://emploiplus-group.com/assets/scrum.jpg	2026-02-25 11:42:26.00803	2026-02-25 11:42:26.00803
\.


--
-- Data for Name: jobs; Type: TABLE DATA; Schema: public; Owner: emploip01_admin
--

COPY public.jobs (id, title, company, location, sector, type, salary, description, image_url, application_url, deadline, published, published_at, created_at, company_id, requirements, salary_min, salary_max, job_type, experience_level, is_closed, updated_at, deadline_date, application_via_emploi) FROM stdin;
1	Développeur Full Stack - Test Réel	Test Company Real Inc.	Paris, France	Informatique	CDI	45000 - 65000 EUR	Offre de test pour valider l'insertion avec le vrai schéma de la table jobs.	\N	https://example.com/apply	\N	f	\N	2026-02-23 20:49:51.467745	\N	JavaScript, Node.js, React, PostgreSQL	45000.00	65000.00	full-time	Senior	f	2026-02-23 20:49:51.467745	\N	f
2	Développeur Full Stack - Test Réel	Test Company Real Inc.	Paris, France	Informatique	CDI	45000 - 65000 EUR	Offre de test pour valider l'insertion avec le vrai schéma de la table jobs.	\N	https://example.com/apply	\N	f	\N	2026-02-23 20:49:59.93468	\N	JavaScript, Node.js, React, PostgreSQL	45000.00	65000.00	full-time	Senior	f	2026-02-23 20:49:59.93468	\N	f
3	Senior Developer - Full Stack (TEST)	TechVision Solutions	Brazzaville, Congo	Informatique	CDI	1,500,000 - 2,500,000 FCFA	This is a test job offer. We are looking for an experienced Full Stack developer with React and Node.js expertise.	\N	https://techvision.cg/careers	\N	t	2026-02-23 21:12:02.967753	2026-02-23 21:12:02.885307	\N	React, Node.js, PostgreSQL, Docker, JavaScript/TypeScript	1500000.00	2500000.00	full-time	Senior	f	2026-02-23 21:12:02.967753	2026-04-30 00:00:00	t
4	Senior Developer - Full Stack (TEST)	TechVision Solutions	Brazzaville, Congo	Informatique	CDI	1,500,000 - 2,500,000 FCFA	This is a test job offer. We are looking for an experienced Full Stack developer with React and Node.js expertise.	\N	https://techvision.cg/careers	\N	t	2026-02-23 21:13:27.933446	2026-02-23 21:13:27.843052	\N	React, Node.js, PostgreSQL, Docker, JavaScript/TypeScript	1500000.00	2500000.00	full-time	Senior	f	2026-02-23 21:13:27.933446	2026-04-30 00:00:00	t
5	Développeur TypeScript Senior (TEST - 1771883181761)	Emploiplus Group	Brazzaville, Congo	Informatique & Technologie	Développement	150 000 - 200 000 XAF	\n      Nous recherchons un développeur TypeScript expérimenté pour rejoindre notre équipe.\n      \n      Responsabilités:\n      - Développer et maintenir des applications Node.js/Express\n      - Implémenter des APIs REST et GraphQL\n      - Optimiser les performances\n      - Analyser et corriger les bugs\n      \n      Test créé par le super admin depuis le portail d'administration.\n      Cette offre a été créée le: 2026-02-23T21:46:21.761Z\n    	https://emploiplus-group.com/assets/tech.jpg	https://emploiplus-group.com/apply	\N	t	\N	2026-02-23 22:46:22.133649	1	\n      - Minimum 5 ans d'expérience en TypeScript/JavaScript\n      - Très bon connaissances Node.js et Express\n      - Expérience avec PostgreSQL\n      - Maîtrise des patterns asynchrones\n      - Excellent en anglais écrit et oral\n    	150000.00	200000.00	CDI	Senior	f	2026-02-23 22:46:22.133649	2026-03-25 00:00:00	t
6	Développeur TypeScript Senior (TEST - 1771883418282)	Emploiplus Group	Brazzaville, Congo	Informatique & Technologie	Développement	150 000 - 200 000 XAF	\n      Nous recherchons un développeur TypeScript expérimenté pour rejoindre notre équipe.\n      \n      Responsabilités:\n      - Développer et maintenir des applications Node.js/Express\n      - Implémenter des APIs REST et GraphQL\n      - Optimiser les performances\n      - Analyser et corriger les bugs\n      \n      Test créé par le super admin depuis le portail d'administration.\n      Cette offre a été créée le: 2026-02-23T21:50:18.282Z\n    	https://emploiplus-group.com/assets/tech.jpg	https://emploiplus-group.com/apply	\N	t	\N	2026-02-23 22:50:18.294534	1	\n      - Minimum 5 ans d'expérience en TypeScript/JavaScript\n      - Très bon connaissances Node.js et Express\n      - Expérience avec PostgreSQL\n      - Maîtrise des patterns asynchrones\n      - Excellent en anglais écrit et oral\n    	150000.00	200000.00	CDI	Senior	f	2026-02-23 22:50:18.294534	2026-03-25 00:00:00	t
\.


--
-- Data for Name: legal_document_versions; Type: TABLE DATA; Schema: public; Owner: emploip01_admin
--

COPY public.legal_document_versions (id, document_id, version, content, updated_by, created_at) FROM stdin;
\.


--
-- Data for Name: legal_documents; Type: TABLE DATA; Schema: public; Owner: emploip01_admin
--

COPY public.legal_documents (id, slug, title, content, version, updated_by, updated_at) FROM stdin;
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: emploip01_admin
--

COPY public.notifications (id, user_id, sender_id, title, message, read, created_at) FROM stdin;
\.


--
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: emploip01_admin
--

COPY public.permissions (id, name, description, slug) FROM stdin;
1	Dashboard Access	Accès au tableau de bord	perm_dashboard
2	Users Management	Gérer les utilisateurs	perm_users
3	Services Management	Gérer les services et catalogues	perm_services
4	Jobs Management	Gérer les offres d'emploi	perm_jobs
5	Trainings Management	Gérer les formations	perm_trainings
6	FAQ Management	Gérer FAQs	perm_faq
7	Admin Management	Gérer comptes admin et logs	perm_admin_management
8	Editorial Access	Gérer pages statiques et contenu	perm_editoriale
9	Uploads Management	Gérer uploads et miniatures	perm_uploads
\.


--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: emploip01_admin
--

COPY public.profiles (id, last_name, first_name, email, password, role, created_at) FROM stdin;
\.


--
-- Data for Name: role_permissions; Type: TABLE DATA; Schema: public; Owner: emploip01_admin
--

COPY public.role_permissions (role_id, permission_id) FROM stdin;
1	1
1	2
1	3
1	4
1	5
1	6
1	7
1	8
1	9
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: emploip01_admin
--

COPY public.roles (id, name, description) FROM stdin;
1	super_admin	Full
3	admin_content	Contenu
4	admin_users	Candidats/Entreprises
5	admin_stats	Statistiques
6	admin_billing	Paiements
\.


--
-- Data for Name: service_catalogs; Type: TABLE DATA; Schema: public; Owner: emploip01_admin
--

COPY public.service_catalogs (id, name, description, is_visible, is_featured, display_order, created_at, updated_at) FROM stdin;
1	Design	Regroupe services de design	t	f	0	2026-02-23 23:50:16.089478	2026-02-23 23:50:16.089478
\.


--
-- Data for Name: service_categories; Type: TABLE DATA; Schema: public; Owner: emploip01_admin
--

COPY public.service_categories (id, name) FROM stdin;
1	Design
\.


--
-- Data for Name: services; Type: TABLE DATA; Schema: public; Owner: emploip01_admin
--

COPY public.services (id, catalog_id, name, description, price, rating, is_promo, promo_text, is_visible, image_url, brochure_url, display_order, created_at, updated_at) FROM stdin;
1	1	Création de Logo	Logo professionnel clé en main	50000.00	\N	f	\N	t	\N	\N	0	2026-02-23 23:50:16.197724	2026-02-23 23:50:16.197724
\.


--
-- Data for Name: services_catalog; Type: TABLE DATA; Schema: public; Owner: emploip01_admin
--

COPY public.services_catalog (id, title, category_id, published) FROM stdin;
\.


--
-- Data for Name: site_notifications; Type: TABLE DATA; Schema: public; Owner: emploip01_admin
--

COPY public.site_notifications (id, title, message, target, category, image_url, link, created_at) FROM stdin;
\.


--
-- Data for Name: subscription_plans; Type: TABLE DATA; Schema: public; Owner: emploip01_admin
--

COPY public.subscription_plans (id, name, slug, description, level, price, currency, billing_period, duration_days, features, active, max_users, max_jobs, max_formations, max_api_calls, created_at, updated_at) FROM stdin;
1	Free Plan	free	Basic access - perfect for getting started	1	0.00	XAF	monthly	30	{"profile": true, "featured": false, "analytics": false, "messaging": false, "api_access": false, "job_search": true, "apply_limit": 3, "job_posting": false}	t	1	0	\N	100	2026-02-22 22:34:32.6659	2026-02-22 22:34:32.6659
2	Basic Plan	basic	Essential features for professionals	2	9990.00	XAF	monthly	30	{"profile": true, "max_jobs": 5, "analytics": false, "messaging": true, "api_access": false, "job_search": true, "job_posting": true, "featured_listings": false}	t	1	5	\N	500	2026-02-22 22:34:32.6659	2026-02-22 22:34:32.6659
3	Professional Plan	professional	Advanced features for companies	3	19990.00	XAF	monthly	30	{"profile": true, "max_jobs": 20, "analytics": true, "messaging": true, "api_access": false, "job_search": true, "job_posting": true, "featured_listings": true, "candidate_database": true}	t	5	20	\N	2000	2026-02-22 22:34:32.6659	2026-02-22 22:34:32.6659
4	Enterprise Plan	enterprise	Full access with dedicated support	4	49990.00	XAF	monthly	30	{"profile": true, "max_jobs": 999, "analytics": true, "messaging": true, "api_access": true, "job_search": true, "job_posting": true, "custom_branding": true, "featured_listings": true, "candidate_database": true}	t	999	999	\N	10000	2026-02-22 22:34:32.6659	2026-02-22 22:34:32.6659
5	Lifetime Premium	lifetime	Permanent access - one time payment	5	299990.00	XAF	lifetime	36500	{"profile": true, "max_jobs": 999, "analytics": true, "messaging": true, "api_access": true, "job_search": true, "job_posting": true, "lifetime_access": true, "featured_listings": true, "candidate_database": true}	t	999	999	\N	99999	2026-02-22 22:34:32.6659	2026-02-22 22:34:32.6659
\.


--
-- Data for Name: subscription_queue; Type: TABLE DATA; Schema: public; Owner: emploip01_admin
--

COPY public.subscription_queue (id, user_id, subscription_id, job_type, status, scheduled_for, target_date, attempt_count, max_attempts, next_retry_at, last_error, priority, data, result, created_at, started_at, completed_at, processed_at) FROM stdin;
\.


--
-- Data for Name: trainings; Type: TABLE DATA; Schema: public; Owner: emploip01_admin
--

COPY public.trainings (id, title, description, provider, duration, level, category, deadline_date, certification, cost, is_closed, created_at, updated_at) FROM stdin;
1	Formation Python Avancée	Apprenez les concepts avancés de Python avec des projets réels	Coursera	8 semaines	Avancé	Programmation	2026-03-15 00:00:00	Certificat Coursera	49.99	f	2026-02-23 05:35:33.247208	2026-02-23 05:35:33.247208
2	Certificat Cloud AWS	Maîtrisez AWS et obtenez votre certification AWS Solutions Architect	Amazon	12 semaines	Intermédiaire	Cloud	2026-04-20 00:00:00	AWS Solutions Architect Associate	299.99	f	2026-02-23 05:35:33.247208	2026-02-23 05:35:33.247208
3	Développement Web Full Stack	HTML, CSS, JavaScript, Node.js, React, MongoDB - Tout ce qu'il faut savoir	Udemy	100 heures	Débutant	Développement Web	2026-05-10 00:00:00	Certificat Udemy	14.99	f	2026-02-23 05:35:33.247208	2026-02-23 05:35:33.247208
4	Data Science avec R	Analyse de données, visualisation et machine learning avec R	DataCamp	10 semaines	Intermédiaire	Data Science	2026-03-30 00:00:00	Certificat DataCamp	39.99	f	2026-02-23 05:35:33.247208	2026-02-23 05:35:33.247208
5	DevOps et Docker	Containerisation, orchestration et CI/CD avec Docker et Kubernetes	Linux Academy	6 semaines	Avancé	DevOps	2026-04-05 00:00:00	Certificat Linux Academy	79.99	f	2026-02-23 05:35:33.247208	2026-02-23 05:35:33.247208
\.


--
-- Data for Name: user_documents; Type: TABLE DATA; Schema: public; Owner: emploip01_admin
--

COPY public.user_documents (id, user_id, doc_type, title, storage_url, created_at) FROM stdin;
\.


--
-- Data for Name: user_skills; Type: TABLE DATA; Schema: public; Owner: emploip01_admin
--

COPY public.user_skills (id, user_id, skill_name, category, created_at) FROM stdin;
\.


--
-- Data for Name: user_subscription_history; Type: TABLE DATA; Schema: public; Owner: emploip01_admin
--

COPY public.user_subscription_history (id, subscription_id, user_id, event_type, previous_status, new_status, reason, triggered_by, admin_id, details, created_by, created_at) FROM stdin;
\.


--
-- Data for Name: user_subscriptions; Type: TABLE DATA; Schema: public; Owner: emploip01_admin
--

COPY public.user_subscriptions (id, user_id, plan_id, status, start_date, end_date, renewal_date, transaction_id, payment_method, amount_paid, currency, auto_renew, renew_attempts, last_renewal_attempt, renewal_count, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: emploip01_admin
--

COPY public.users (id, email, password, user_type, phone, company_name, company_address, profession, job_title, diploma, experience_years, profile_image_url, skills, is_verified, is_blocked, is_deleted, deletion_requested_at, deletion_scheduled_at, created_at, updated_at, first_name, last_name, role_id) FROM stdin;
1	test-registration@example.com	$2b$10$7QxENZEBPoeC9V1n5NdP1OpGrUQ8ffRzVcwx1gqqDDSwdijbPlfwS	candidate	\N	\N	\N	\N	\N	\N	0	\N	[]	f	f	f	\N	\N	2026-02-21 09:06:21.015296	2026-02-21 09:06:21.015296	Test	User	\N
2	company-test+1@localhost	$2b$10$VO7GcOQktY22ZT/57WCnZuzOQopmIcE7kcpA7WXXA41Gj8O0gjRjW	company	\N	\N	\N	\N	\N	\N	0	\N	[]	f	f	f	\N	\N	2026-02-22 08:51:53.96414	2026-02-22 08:51:53.96414	Comp	Tester	\N
3	zerttyuu@gmail.com	$2b$10$zVfgXpLiqhgo63ILqYfYcONcsOFmJSk5qe7X08AWoUjlSiR2h0cJm	candidate	\N	\N	\N	\N	\N	\N	0	\N	[]	f	f	f	\N	\N	2026-02-23 10:22:23.826583	2026-02-23 10:22:23.826583	Ghhuiu	Fui	\N
4	francklinetoka242@gmail.com	$2b$10$V7NIYDMt7qx2yt/9hGXCO.4Wv7W2q.qkddKOGeDST8J7FhsyxUSeu	candidate	\N	\N	\N	\N	\N	\N	0	\N	[]	f	f	f	\N	\N	2026-02-23 10:23:43.386206	2026-02-23 10:23:43.386206	Test	Test	\N
\.


--
-- Data for Name: visitor_interactions; Type: TABLE DATA; Schema: public; Owner: emploip01_admin
--

COPY public.visitor_interactions (id, user_id, service, event_type, payload, created_at) FROM stdin;
\.


--
-- Name: admin_roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: emploip01_admin
--

SELECT pg_catalog.setval('public.admin_roles_id_seq', 2, true);


--
-- Name: admins_id_seq; Type: SEQUENCE SET; Schema: public; Owner: emploip01_admin
--

SELECT pg_catalog.setval('public.admins_id_seq', 21, true);


--
-- Name: audit_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: emploip01_admin
--

SELECT pg_catalog.setval('public.audit_logs_id_seq', 1, false);


--
-- Name: documents_id_seq; Type: SEQUENCE SET; Schema: public; Owner: emploip01_admin
--

SELECT pg_catalog.setval('public.documents_id_seq', 1, false);


--
-- Name: faq_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: emploip01_admin
--

SELECT pg_catalog.setval('public.faq_categories_id_seq', 1, false);


--
-- Name: faqs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: emploip01_admin
--

SELECT pg_catalog.setval('public.faqs_id_seq', 6, true);


--
-- Name: formations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: emploip01_admin
--

SELECT pg_catalog.setval('public.formations_id_seq', 10, true);


--
-- Name: jobs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: emploip01_admin
--

SELECT pg_catalog.setval('public.jobs_id_seq', 6, true);


--
-- Name: legal_document_versions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: emploip01_admin
--

SELECT pg_catalog.setval('public.legal_document_versions_id_seq', 1, false);


--
-- Name: legal_documents_id_seq; Type: SEQUENCE SET; Schema: public; Owner: emploip01_admin
--

SELECT pg_catalog.setval('public.legal_documents_id_seq', 1, false);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: emploip01_admin
--

SELECT pg_catalog.setval('public.notifications_id_seq', 1, false);


--
-- Name: permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: emploip01_admin
--

SELECT pg_catalog.setval('public.permissions_id_seq', 9, true);


--
-- Name: profiles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: emploip01_admin
--

SELECT pg_catalog.setval('public.profiles_id_seq', 1, false);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: emploip01_admin
--

SELECT pg_catalog.setval('public.roles_id_seq', 6, true);


--
-- Name: service_catalogs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: emploip01_admin
--

SELECT pg_catalog.setval('public.service_catalogs_id_seq', 1, true);


--
-- Name: service_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: emploip01_admin
--

SELECT pg_catalog.setval('public.service_categories_id_seq', 1, true);


--
-- Name: services_catalog_id_seq; Type: SEQUENCE SET; Schema: public; Owner: emploip01_admin
--

SELECT pg_catalog.setval('public.services_catalog_id_seq', 1, false);


--
-- Name: services_id_seq; Type: SEQUENCE SET; Schema: public; Owner: emploip01_admin
--

SELECT pg_catalog.setval('public.services_id_seq', 1, true);


--
-- Name: site_notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: emploip01_admin
--

SELECT pg_catalog.setval('public.site_notifications_id_seq', 1, false);


--
-- Name: subscription_plans_id_seq; Type: SEQUENCE SET; Schema: public; Owner: emploip01_admin
--

SELECT pg_catalog.setval('public.subscription_plans_id_seq', 10, true);


--
-- Name: subscription_queue_id_seq; Type: SEQUENCE SET; Schema: public; Owner: emploip01_admin
--

SELECT pg_catalog.setval('public.subscription_queue_id_seq', 1, false);


--
-- Name: trainings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: emploip01_admin
--

SELECT pg_catalog.setval('public.trainings_id_seq', 5, true);


--
-- Name: user_documents_id_seq; Type: SEQUENCE SET; Schema: public; Owner: emploip01_admin
--

SELECT pg_catalog.setval('public.user_documents_id_seq', 1, false);


--
-- Name: user_skills_id_seq; Type: SEQUENCE SET; Schema: public; Owner: emploip01_admin
--

SELECT pg_catalog.setval('public.user_skills_id_seq', 1, false);


--
-- Name: user_subscription_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: emploip01_admin
--

SELECT pg_catalog.setval('public.user_subscription_history_id_seq', 1, false);


--
-- Name: user_subscriptions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: emploip01_admin
--

SELECT pg_catalog.setval('public.user_subscriptions_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: emploip01_admin
--

SELECT pg_catalog.setval('public.users_id_seq', 4, true);


--
-- Name: visitor_interactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: emploip01_admin
--

SELECT pg_catalog.setval('public.visitor_interactions_id_seq', 1, false);


--
-- Name: admin_roles admin_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: emploip01_admin
--

ALTER TABLE ONLY public.admin_roles
    ADD CONSTRAINT admin_roles_pkey PRIMARY KEY (id);


--
-- Name: admins admins_activation_token_key; Type: CONSTRAINT; Schema: public; Owner: emploip01_admin
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT admins_activation_token_key UNIQUE (activation_token);


--
-- Name: admins admins_email_key; Type: CONSTRAINT; Schema: public; Owner: emploip01_admin
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT admins_email_key UNIQUE (email);


--
-- Name: admins admins_pkey; Type: CONSTRAINT; Schema: public; Owner: emploip01_admin
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT admins_pkey PRIMARY KEY (id);


--
-- Name: admins admins_reset_token_key; Type: CONSTRAINT; Schema: public; Owner: emploip01_admin
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT admins_reset_token_key UNIQUE (reset_token);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: emploip01_admin
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: documents documents_pkey; Type: CONSTRAINT; Schema: public; Owner: emploip01_admin
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (id);


--
-- Name: documents documents_slug_key; Type: CONSTRAINT; Schema: public; Owner: emploip01_admin
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_slug_key UNIQUE (slug);


--
-- Name: faq_categories faq_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: emploip01_admin
--

ALTER TABLE ONLY public.faq_categories
    ADD CONSTRAINT faq_categories_pkey PRIMARY KEY (id);


--
-- Name: faq_categories faq_categories_slug_key; Type: CONSTRAINT; Schema: public; Owner: emploip01_admin
--

ALTER TABLE ONLY public.faq_categories
    ADD CONSTRAINT faq_categories_slug_key UNIQUE (slug);


--
-- Name: faqs faqs_pkey; Type: CONSTRAINT; Schema: public; Owner: emploip01_admin
--

ALTER TABLE ONLY public.faqs
    ADD CONSTRAINT faqs_pkey PRIMARY KEY (id);


--
-- Name: formations formations_pkey; Type: CONSTRAINT; Schema: public; Owner: emploip01_admin
--

ALTER TABLE ONLY public.formations
    ADD CONSTRAINT formations_pkey PRIMARY KEY (id);


--
-- Name: jobs jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: emploip01_admin
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);


--
-- Name: legal_document_versions legal_document_versions_pkey; Type: CONSTRAINT; Schema: public; Owner: emploip01_admin
--

ALTER TABLE ONLY public.legal_document_versions
    ADD CONSTRAINT legal_document_versions_pkey PRIMARY KEY (id);


--
-- Name: legal_documents legal_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: emploip01_admin
--

ALTER TABLE ONLY public.legal_documents
    ADD CONSTRAINT legal_documents_pkey PRIMARY KEY (id);


--
-- Name: legal_documents legal_documents_slug_key; Type: CONSTRAINT; Schema: public; Owner: emploip01_admin
--

ALTER TABLE ONLY public.legal_documents
    ADD CONSTRAINT legal_documents_slug_key UNIQUE (slug);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: emploip01_admin
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: permissions permissions_name_key; Type: CONSTRAINT; Schema: public; Owner: emploip01_admin
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_name_key UNIQUE (name);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: emploip01_admin
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_email_key; Type: CONSTRAINT; Schema: public; Owner: emploip01_admin
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_email_key UNIQUE (email);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: emploip01_admin
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: role_permissions role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: emploip01_admin
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (role_id, permission_id);


--
-- Name: roles roles_name_key; Type: CONSTRAINT; Schema: public; Owner: emploip01_admin
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_name_key UNIQUE (name);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: emploip01_admin
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: service_catalogs service_catalogs_pkey; Type: CONSTRAINT; Schema: public; Owner: emploip01_admin
--

ALTER TABLE ONLY public.service_catalogs
    ADD CONSTRAINT service_catalogs_pkey PRIMARY KEY (id);


--
-- Name: service_categories service_categories_name_key; Type: CONSTRAINT; Schema: public; Owner: emploip01_admin
--

ALTER TABLE ONLY public.service_categories
    ADD CONSTRAINT service_categories_name_key UNIQUE (name);


--
-- Name: service_categories service_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: emploip01_admin
--

ALTER TABLE ONLY public.service_categories
    ADD CONSTRAINT service_categories_pkey PRIMARY KEY (id);


--
-- Name: services_catalog services_catalog_pkey; Type: CONSTRAINT; Schema: public; Owner: emploip01_admin
--

ALTER TABLE ONLY public.services_catalog
    ADD CONSTRAINT services_catalog_pkey PRIMARY KEY (id);


--
-- Name: services services_pkey; Type: CONSTRAINT; Schema: public; Owner: emploip01_admin
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_pkey PRIMARY KEY (id);


--
-- Name: site_notifications site_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: emploip01_admin
--

ALTER TABLE ONLY public.site_notifications
    ADD CONSTRAINT site_notifications_pkey PRIMARY KEY (id);


--
-- Name: subscription_plans subscription_plans_name_key; Type: CONSTRAINT; Schema: public; Owner: emploip01_admin
--

ALTER TABLE ONLY public.subscription_plans
    ADD CONSTRAINT subscription_plans_name_key UNIQUE (name);


--
-- Name: subscription_plans subscription_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: emploip01_admin
--

ALTER TABLE ONLY public.subscription_plans
    ADD CONSTRAINT subscription_plans_pkey PRIMARY KEY (id);


--
-- Name: subscription_plans subscription_plans_slug_key; Type: CONSTRAINT; Schema: public; Owner: emploip01_admin
--

ALTER TABLE ONLY public.subscription_plans
    ADD CONSTRAINT subscription_plans_slug_key UNIQUE (slug);


--
-- Name: subscription_queue subscription_queue_pkey; Type: CONSTRAINT; Schema: public; Owner: emploip01_admin
--

ALTER TABLE ONLY public.subscription_queue
    ADD CONSTRAINT subscription_queue_pkey PRIMARY KEY (id);


--
-- Name: trainings trainings_pkey; Type: CONSTRAINT; Schema: public; Owner: emploip01_admin
--

ALTER TABLE ONLY public.trainings
    ADD CONSTRAINT trainings_pkey PRIMARY KEY (id);


--
-- Name: user_documents user_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: emploip01_admin
--

ALTER TABLE ONLY public.user_documents
    ADD CONSTRAINT user_documents_pkey PRIMARY KEY (id);


--
-- Name: user_skills user_skills_pkey; Type: CONSTRAINT; Schema: public; Owner: emploip01_admin
--

ALTER TABLE ONLY public.user_skills
    ADD CONSTRAINT user_skills_pkey PRIMARY KEY (id);


--
-- Name: user_subscription_history user_subscription_history_pkey; Type: CONSTRAINT; Schema: public; Owner: emploip01_admin
--

ALTER TABLE ONLY public.user_subscription_history
    ADD CONSTRAINT user_subscription_history_pkey PRIMARY KEY (id);


--
-- Name: user_subscriptions user_subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: emploip01_admin
--

ALTER TABLE ONLY public.user_subscriptions
    ADD CONSTRAINT user_subscriptions_pkey PRIMARY KEY (id);


--
-- Name: user_subscriptions user_subscriptions_transaction_id_key; Type: CONSTRAINT; Schema: public; Owner: emploip01_admin
--

ALTER TABLE ONLY public.user_subscriptions
    ADD CONSTRAINT user_subscriptions_transaction_id_key UNIQUE (transaction_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: emploip01_admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: emploip01_admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: visitor_interactions visitor_interactions_pkey; Type: CONSTRAINT; Schema: public; Owner: emploip01_admin
--

ALTER TABLE ONLY public.visitor_interactions
    ADD CONSTRAINT visitor_interactions_pkey PRIMARY KEY (id);


--
-- Name: idx_admin_jobs_company_closed_deadline; Type: INDEX; Schema: public; Owner: emploip01_admin
--

CREATE INDEX idx_admin_jobs_company_closed_deadline ON public.jobs USING btree (company_id, is_closed, deadline_date DESC);


--
-- Name: idx_admin_trainings_category_closed_deadline; Type: INDEX; Schema: public; Owner: emploip01_admin
--

CREATE INDEX idx_admin_trainings_category_closed_deadline ON public.trainings USING btree (category, is_closed, deadline_date DESC);


--
-- Name: idx_admins_activation_token; Type: INDEX; Schema: public; Owner: emploip01_admin
--

CREATE INDEX idx_admins_activation_token ON public.admins USING btree (activation_token);


--
-- Name: idx_admins_avatar_url; Type: INDEX; Schema: public; Owner: emploip01_admin
--

CREATE INDEX idx_admins_avatar_url ON public.admins USING btree (avatar_url);


--
-- Name: idx_admins_email; Type: INDEX; Schema: public; Owner: emploip01_admin
--

CREATE INDEX idx_admins_email ON public.admins USING btree (email);


--
-- Name: idx_admins_is_active; Type: INDEX; Schema: public; Owner: emploip01_admin
--

CREATE INDEX idx_admins_is_active ON public.admins USING btree (is_active);


--
-- Name: idx_admins_is_active_role; Type: INDEX; Schema: public; Owner: emploip01_admin
--

CREATE INDEX idx_admins_is_active_role ON public.admins USING btree (is_active, role);


--
-- Name: idx_admins_phone; Type: INDEX; Schema: public; Owner: emploip01_admin
--

CREATE INDEX idx_admins_phone ON public.admins USING btree (phone);


--
-- Name: idx_admins_reset_token; Type: INDEX; Schema: public; Owner: emploip01_admin
--

CREATE INDEX idx_admins_reset_token ON public.admins USING btree (reset_token);


--
-- Name: idx_admins_reset_token_expires; Type: INDEX; Schema: public; Owner: emploip01_admin
--

CREATE INDEX idx_admins_reset_token_expires ON public.admins USING btree (reset_token_expires);


--
-- Name: idx_admins_role; Type: INDEX; Schema: public; Owner: emploip01_admin
--

CREATE INDEX idx_admins_role ON public.admins USING btree (role);


--
-- Name: idx_admins_role_level; Type: INDEX; Schema: public; Owner: emploip01_admin
--

CREATE INDEX idx_admins_role_level ON public.admins USING btree (role_level);


--
-- Name: idx_admins_status; Type: INDEX; Schema: public; Owner: emploip01_admin
--

CREATE INDEX idx_admins_status ON public.admins USING btree (status);


--
-- Name: idx_admins_subscription; Type: INDEX; Schema: public; Owner: emploip01_admin
--

CREATE INDEX idx_admins_subscription ON public.admins USING btree (subscription_id);


--
-- Name: idx_admins_token_expires; Type: INDEX; Schema: public; Owner: emploip01_admin
--

CREATE INDEX idx_admins_token_expires ON public.admins USING btree (token_expires_at);


--
-- Name: idx_audit_logs_created_at; Type: INDEX; Schema: public; Owner: emploip01_admin
--

CREATE INDEX idx_audit_logs_created_at ON public.audit_logs USING btree (created_at DESC);


--
-- Name: idx_catalogs_visible; Type: INDEX; Schema: public; Owner: emploip01_admin
--

CREATE INDEX idx_catalogs_visible ON public.service_catalogs USING btree (is_visible);


--
-- Name: idx_documents_published; Type: INDEX; Schema: public; Owner: emploip01_admin
--

CREATE INDEX idx_documents_published ON public.documents USING btree (is_published);


--
-- Name: idx_documents_slug; Type: INDEX; Schema: public; Owner: emploip01_admin
--

CREATE INDEX idx_documents_slug ON public.documents USING btree (slug);


--
-- Name: idx_documents_type; Type: INDEX; Schema: public; Owner: emploip01_admin
--

CREATE INDEX idx_documents_type ON public.documents USING btree (type);


--
-- Name: idx_faqs_published; Type: INDEX; Schema: public; Owner: emploip01_admin
--

CREATE INDEX idx_faqs_published ON public.faqs USING btree (published);


--
-- Name: idx_formations_category; Type: INDEX; Schema: public; Owner: emploip01_admin
--

CREATE INDEX idx_formations_category ON public.formations USING btree (category);


--
-- Name: idx_formations_level; Type: INDEX; Schema: public; Owner: emploip01_admin
--

CREATE INDEX idx_formations_level ON public.formations USING btree (level);


--
-- Name: idx_formations_published; Type: INDEX; Schema: public; Owner: emploip01_admin
--

CREATE INDEX idx_formations_published ON public.formations USING btree (published);


--
-- Name: idx_jobs_company_created_desc; Type: INDEX; Schema: public; Owner: emploip01_admin
--

CREATE INDEX idx_jobs_company_created_desc ON public.jobs USING btree (company, created_at DESC);


--
-- Name: idx_jobs_created_at_desc; Type: INDEX; Schema: public; Owner: emploip01_admin
--

CREATE INDEX idx_jobs_created_at_desc ON public.jobs USING btree (created_at DESC);


--
-- Name: idx_jobs_deadline_date; Type: INDEX; Schema: public; Owner: emploip01_admin
--

CREATE INDEX idx_jobs_deadline_date ON public.jobs USING btree (deadline_date);


--
-- Name: idx_jobs_location_created_desc; Type: INDEX; Schema: public; Owner: emploip01_admin
--

CREATE INDEX idx_jobs_location_created_desc ON public.jobs USING btree (location, created_at DESC);


--
-- Name: idx_jobs_location_like; Type: INDEX; Schema: public; Owner: emploip01_admin
--

CREATE INDEX idx_jobs_location_like ON public.jobs USING btree (location COLLATE "C");


--
-- Name: idx_jobs_sector_created_desc; Type: INDEX; Schema: public; Owner: emploip01_admin
--

CREATE INDEX idx_jobs_sector_created_desc ON public.jobs USING btree (sector, created_at DESC);


--
-- Name: idx_jobs_type_created_desc; Type: INDEX; Schema: public; Owner: emploip01_admin
--

CREATE INDEX idx_jobs_type_created_desc ON public.jobs USING btree (type, created_at DESC);


--
-- Name: idx_legal_documents_slug; Type: INDEX; Schema: public; Owner: emploip01_admin
--

CREATE INDEX idx_legal_documents_slug ON public.legal_documents USING btree (slug);


--
-- Name: idx_queue_priority; Type: INDEX; Schema: public; Owner: emploip01_admin
--

CREATE INDEX idx_queue_priority ON public.subscription_queue USING btree (priority DESC, created_at) WHERE ((status)::text = ANY ((ARRAY['pending'::character varying, 'retry'::character varying])::text[]));


--
-- Name: idx_queue_retry; Type: INDEX; Schema: public; Owner: emploip01_admin
--

CREATE INDEX idx_queue_retry ON public.subscription_queue USING btree (next_retry_at) WHERE ((status)::text = 'retry'::text);


--
-- Name: idx_queue_scheduled; Type: INDEX; Schema: public; Owner: emploip01_admin
--

CREATE INDEX idx_queue_scheduled ON public.subscription_queue USING btree (scheduled_for) WHERE ((status)::text = 'pending'::text);


--
-- Name: idx_queue_status; Type: INDEX; Schema: public; Owner: emploip01_admin
--

CREATE INDEX idx_queue_status ON public.subscription_queue USING btree (status);


--
-- Name: idx_queue_subscription; Type: INDEX; Schema: public; Owner: emploip01_admin
--

CREATE INDEX idx_queue_subscription ON public.subscription_queue USING btree (subscription_id);


--
-- Name: idx_queue_type; Type: INDEX; Schema: public; Owner: emploip01_admin
--

CREATE INDEX idx_queue_type ON public.subscription_queue USING btree (job_type);


--
-- Name: idx_queue_user; Type: INDEX; Schema: public; Owner: emploip01_admin
--

CREATE INDEX idx_queue_user ON public.subscription_queue USING btree (user_id);


--
-- Name: idx_role_permissions_permission_id; Type: INDEX; Schema: public; Owner: emploip01_admin
--

CREATE INDEX idx_role_permissions_permission_id ON public.role_permissions USING btree (permission_id);


--
-- Name: idx_role_permissions_role_id; Type: INDEX; Schema: public; Owner: emploip01_admin
--

CREATE INDEX idx_role_permissions_role_id ON public.role_permissions USING btree (role_id);


--
-- Name: idx_service_catalogs_display_order; Type: INDEX; Schema: public; Owner: emploip01_admin
--

CREATE INDEX idx_service_catalogs_display_order ON public.service_catalogs USING btree (display_order);


--
-- Name: idx_services_catalog_id; Type: INDEX; Schema: public; Owner: emploip01_admin
--

CREATE INDEX idx_services_catalog_id ON public.services USING btree (catalog_id);


--
-- Name: idx_services_catalog_id_display_order; Type: INDEX; Schema: public; Owner: emploip01_admin
--

CREATE INDEX idx_services_catalog_id_display_order ON public.services USING btree (catalog_id, display_order);


--
-- Name: idx_services_is_promo; Type: INDEX; Schema: public; Owner: emploip01_admin
--

CREATE INDEX idx_services_is_promo ON public.services USING btree (is_promo);


--
-- Name: idx_services_promo; Type: INDEX; Schema: public; Owner: emploip01_admin
--

CREATE INDEX idx_services_promo ON public.services USING btree (is_promo);


--
-- Name: idx_services_visible; Type: INDEX; Schema: public; Owner: emploip01_admin
--

CREATE INDEX idx_services_visible ON public.services USING btree (is_visible);


--
-- Name: idx_subscription_history_created; Type: INDEX; Schema: public; Owner: emploip01_admin
--

CREATE INDEX idx_subscription_history_created ON public.user_subscription_history USING btree (created_at DESC);


--
-- Name: idx_subscription_history_event; Type: INDEX; Schema: public; Owner: emploip01_admin
--

CREATE INDEX idx_subscription_history_event ON public.user_subscription_history USING btree (event_type);


--
-- Name: idx_subscription_history_sub; Type: INDEX; Schema: public; Owner: emploip01_admin
--

CREATE INDEX idx_subscription_history_sub ON public.user_subscription_history USING btree (subscription_id);


--
-- Name: idx_subscription_history_user; Type: INDEX; Schema: public; Owner: emploip01_admin
--

CREATE INDEX idx_subscription_history_user ON public.user_subscription_history USING btree (user_id);


--
-- Name: idx_subscription_plans_active; Type: INDEX; Schema: public; Owner: emploip01_admin
--

CREATE INDEX idx_subscription_plans_active ON public.subscription_plans USING btree (active);


--
-- Name: idx_subscription_plans_level; Type: INDEX; Schema: public; Owner: emploip01_admin
--

CREATE INDEX idx_subscription_plans_level ON public.subscription_plans USING btree (level);


--
-- Name: idx_subscription_plans_slug; Type: INDEX; Schema: public; Owner: emploip01_admin
--

CREATE INDEX idx_subscription_plans_slug ON public.subscription_plans USING btree (slug);


--
-- Name: idx_trainings_category; Type: INDEX; Schema: public; Owner: emploip01_admin
--

CREATE INDEX idx_trainings_category ON public.trainings USING btree (category);


--
-- Name: idx_trainings_category_closed_deadline; Type: INDEX; Schema: public; Owner: emploip01_admin
--

CREATE INDEX idx_trainings_category_closed_deadline ON public.trainings USING btree (category, is_closed, deadline_date DESC);


--
-- Name: idx_trainings_created_at; Type: INDEX; Schema: public; Owner: emploip01_admin
--

CREATE INDEX idx_trainings_created_at ON public.trainings USING btree (created_at DESC);


--
-- Name: idx_trainings_deadline_date; Type: INDEX; Schema: public; Owner: emploip01_admin
--

CREATE INDEX idx_trainings_deadline_date ON public.trainings USING btree (deadline_date);


--
-- Name: idx_unique_active_plan_per_user; Type: INDEX; Schema: public; Owner: emploip01_admin
--

CREATE UNIQUE INDEX idx_unique_active_plan_per_user ON public.user_subscriptions USING btree (user_id, plan_id) WHERE ((status)::text = 'active'::text);


--
-- Name: idx_user_subscriptions_active; Type: INDEX; Schema: public; Owner: emploip01_admin
--

CREATE INDEX idx_user_subscriptions_active ON public.user_subscriptions USING btree (status, end_date) WHERE ((status)::text = 'active'::text);


--
-- Name: idx_user_subscriptions_expiry; Type: INDEX; Schema: public; Owner: emploip01_admin
--

CREATE INDEX idx_user_subscriptions_expiry ON public.user_subscriptions USING btree (end_date) WHERE ((status)::text = 'active'::text);


--
-- Name: idx_user_subscriptions_plan; Type: INDEX; Schema: public; Owner: emploip01_admin
--

CREATE INDEX idx_user_subscriptions_plan ON public.user_subscriptions USING btree (plan_id);


--
-- Name: idx_user_subscriptions_status; Type: INDEX; Schema: public; Owner: emploip01_admin
--

CREATE INDEX idx_user_subscriptions_status ON public.user_subscriptions USING btree (status);


--
-- Name: idx_user_subscriptions_user; Type: INDEX; Schema: public; Owner: emploip01_admin
--

CREATE INDEX idx_user_subscriptions_user ON public.user_subscriptions USING btree (user_id);


--
-- Name: idx_users_is_blocked_created_desc; Type: INDEX; Schema: public; Owner: emploip01_admin
--

CREATE INDEX idx_users_is_blocked_created_desc ON public.users USING btree (is_blocked, created_at DESC);


--
-- Name: idx_users_user_type_created_desc; Type: INDEX; Schema: public; Owner: emploip01_admin
--

CREATE INDEX idx_users_user_type_created_desc ON public.users USING btree (user_type, created_at DESC);


--
-- Name: admins trigger_admins_updated_at; Type: TRIGGER; Schema: public; Owner: emploip01_admin
--

CREATE TRIGGER trigger_admins_updated_at BEFORE UPDATE ON public.admins FOR EACH ROW EXECUTE FUNCTION public.update_timestamp_column();


--
-- Name: documents trigger_documents_updated_at; Type: TRIGGER; Schema: public; Owner: emploip01_admin
--

CREATE TRIGGER trigger_documents_updated_at BEFORE UPDATE ON public.documents FOR EACH ROW EXECUTE FUNCTION public.update_documents_updated_at();


--
-- Name: faqs trigger_faqs_updated_at; Type: TRIGGER; Schema: public; Owner: emploip01_admin
--

CREATE TRIGGER trigger_faqs_updated_at BEFORE UPDATE ON public.faqs FOR EACH ROW EXECUTE FUNCTION public.update_timestamp_column();


--
-- Name: jobs trigger_jobs_updated_at; Type: TRIGGER; Schema: public; Owner: emploip01_admin
--

CREATE TRIGGER trigger_jobs_updated_at BEFORE UPDATE ON public.jobs FOR EACH ROW EXECUTE FUNCTION public.update_timestamp_column();


--
-- Name: admin_roles admin_roles_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: emploip01_admin
--

ALTER TABLE ONLY public.admin_roles
    ADD CONSTRAINT admin_roles_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id);


--
-- Name: documents documents_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: emploip01_admin
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.admins(id) ON DELETE SET NULL;


--
-- Name: documents documents_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: emploip01_admin
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.admins(id) ON DELETE SET NULL;


--
-- Name: legal_document_versions legal_document_versions_document_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: emploip01_admin
--

ALTER TABLE ONLY public.legal_document_versions
    ADD CONSTRAINT legal_document_versions_document_id_fkey FOREIGN KEY (document_id) REFERENCES public.legal_documents(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: emploip01_admin
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: emploip01_admin
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: role_permissions role_permissions_permission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: emploip01_admin
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.permissions(id);


--
-- Name: role_permissions role_permissions_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: emploip01_admin
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id);


--
-- Name: services_catalog services_catalog_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: emploip01_admin
--

ALTER TABLE ONLY public.services_catalog
    ADD CONSTRAINT services_catalog_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.service_categories(id);


--
-- Name: services services_catalog_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: emploip01_admin
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_catalog_id_fkey FOREIGN KEY (catalog_id) REFERENCES public.service_catalogs(id) ON DELETE CASCADE;


--
-- Name: subscription_queue subscription_queue_subscription_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: emploip01_admin
--

ALTER TABLE ONLY public.subscription_queue
    ADD CONSTRAINT subscription_queue_subscription_id_fkey FOREIGN KEY (subscription_id) REFERENCES public.user_subscriptions(id) ON DELETE CASCADE;


--
-- Name: subscription_queue subscription_queue_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: emploip01_admin
--

ALTER TABLE ONLY public.subscription_queue
    ADD CONSTRAINT subscription_queue_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_subscription_history user_subscription_history_admin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: emploip01_admin
--

ALTER TABLE ONLY public.user_subscription_history
    ADD CONSTRAINT user_subscription_history_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.admins(id) ON DELETE SET NULL;


--
-- Name: user_subscription_history user_subscription_history_subscription_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: emploip01_admin
--

ALTER TABLE ONLY public.user_subscription_history
    ADD CONSTRAINT user_subscription_history_subscription_id_fkey FOREIGN KEY (subscription_id) REFERENCES public.user_subscriptions(id) ON DELETE CASCADE;


--
-- Name: user_subscription_history user_subscription_history_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: emploip01_admin
--

ALTER TABLE ONLY public.user_subscription_history
    ADD CONSTRAINT user_subscription_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_subscriptions user_subscriptions_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: emploip01_admin
--

ALTER TABLE ONLY public.user_subscriptions
    ADD CONSTRAINT user_subscriptions_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.subscription_plans(id) ON DELETE CASCADE;


--
-- Name: user_subscriptions user_subscriptions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: emploip01_admin
--

ALTER TABLE ONLY public.user_subscriptions
    ADD CONSTRAINT user_subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: users users_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: emploip01_admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE SET NULL;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT ALL ON SCHEMA public TO emploip01_admin;


--
-- PostgreSQL database dump complete
--

\unrestrict pdIJ4d1cujRcXWxWbFmYaxKZSTpy2zYsgifFvoyhQxfgOfC5AnUeFvTeQzCMykr

