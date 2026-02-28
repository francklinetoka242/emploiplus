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

\unrestrict joOM884lnY5ADDL40WLrcdtT8LJlY5wcqMLy0OhHhoztVxFZTUmpOdg4yngFEpp

emplo1205@vps118258:~$ 