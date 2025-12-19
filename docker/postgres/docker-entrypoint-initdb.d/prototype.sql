--
-- PostgreSQL database dump
--

-- Dumped from database version 15.3
-- Dumped by pg_dump version 15.3

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
-- Name: prototype; Type: DATABASE; Schema: -; Owner: -
--

CREATE DATABASE prototype WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.utf8';


\connect prototype

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: jobs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.jobs (
    id uuid NOT NULL,
    video_id uuid NOT NULL,
    result_video_id uuid NOT NULL,
    type character varying NOT NULL,
    status character varying NOT NULL,
    data jsonb NOT NULL,
    created_at timestamp without time zone NOT NULL,
    started_at timestamp without time zone,
    finished_at timestamp without time zone,
    progress integer DEFAULT 0 NOT NULL,
    user_id uuid NOT NULL
);


--
-- Name: presets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.presets (
    id uuid NOT NULL,
    name character varying NOT NULL,
    description text NOT NULL,
    data jsonb NOT NULL,
    user_id uuid NOT NULL
);


--
-- Name: result_audio_files; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.result_audio_files (
    id uuid NOT NULL,
    result_video_id uuid NOT NULL,
    video_id uuid NOT NULL,
    job_id uuid NOT NULL,
    data bytea NOT NULL
);


--
-- Name: result_blendshapes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.result_blendshapes (
    id uuid NOT NULL,
    result_video_id uuid NOT NULL,
    video_id uuid NOT NULL,
    job_id uuid NOT NULL,
    data jsonb NOT NULL
);


--
-- Name: result_extra_files; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.result_extra_files (
    id uuid NOT NULL,
    result_video_id uuid NOT NULL,
    video_id uuid NOT NULL,
    job_id uuid NOT NULL,
    type character varying NOT NULL,
    data bytea NOT NULL
);


--
-- Name: result_mp_kinematics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.result_mp_kinematics (
    id uuid NOT NULL,
    result_video_id uuid NOT NULL,
    video_id uuid NOT NULL,
    job_id uuid NOT NULL,
    type character varying NOT NULL,
    data jsonb NOT NULL
);


--
-- Name: result_videos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.result_videos (
    id uuid NOT NULL,
    video_id uuid NOT NULL,
    job_id uuid NOT NULL,
    video_info jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    name character varying DEFAULT 'Result'::character varying NOT NULL
);


--
-- Name: videos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.videos (
    id uuid NOT NULL,
    name character varying NOT NULL,
    status character varying NOT NULL,
    video_info jsonb,
    user_id uuid NOT NULL
);


--
-- Name: workers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.workers (
    id uuid NOT NULL,
    job_id uuid,
    last_activity timestamp without time zone,
    type character varying NOT NULL
);


--
-- Name: jobs jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);


--
-- Name: presets presets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.presets
    ADD CONSTRAINT presets_pkey PRIMARY KEY (id);


--
-- Name: result_audio_files result_audio_files_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.result_audio_files
    ADD CONSTRAINT result_audio_files_pkey PRIMARY KEY (id);


--
-- Name: result_blendshapes result_blendshapes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.result_blendshapes
    ADD CONSTRAINT result_blendshapes_pkey PRIMARY KEY (id);


--
-- Name: result_extra_files result_extra_files_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.result_extra_files
    ADD CONSTRAINT result_extra_files_pkey PRIMARY KEY (id);


--
-- Name: result_mp_kinematics result_mp_kinematics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.result_mp_kinematics
    ADD CONSTRAINT result_mp_kinematics_pkey PRIMARY KEY (id);


--
-- Name: result_videos result_videos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.result_videos
    ADD CONSTRAINT result_videos_pkey PRIMARY KEY (id);


--
-- Name: jobs unique_result_video_id; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT unique_result_video_id UNIQUE (result_video_id);


--
-- Name: videos videos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.videos
    ADD CONSTRAINT videos_pkey PRIMARY KEY (id);


--
-- Name: workers workers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workers
    ADD CONSTRAINT workers_pkey PRIMARY KEY (id);


--
-- PostgreSQL database dump complete
--

--
-- Performance Indexes (added for query optimization)
--

-- Jobs table indexes
-- Critical: status is queried every 5 seconds by workers polling for next job
CREATE INDEX idx_jobs_status ON public.jobs(status);
-- User queries for their jobs list
CREATE INDEX idx_jobs_user_id ON public.jobs(user_id);
-- Lookup by video_id
CREATE INDEX idx_jobs_video_id ON public.jobs(video_id);
-- Composite index for user's jobs ordered by creation time
CREATE INDEX idx_jobs_user_created ON public.jobs(user_id, created_at DESC);

-- Videos table indexes
-- User queries for their video list
CREATE INDEX idx_videos_user_id ON public.videos(user_id);
-- Composite index for user's videos by status
CREATE INDEX idx_videos_user_status ON public.videos(user_id, status);

-- Result videos table indexes
-- Lookup by source video
CREATE INDEX idx_result_videos_video_id ON public.result_videos(video_id);
-- Lookup by job
CREATE INDEX idx_result_videos_job_id ON public.result_videos(job_id);

-- Result tables indexes (for lookups by result_video_id)
CREATE INDEX idx_result_mp_kinematics_result_video_id ON public.result_mp_kinematics(result_video_id);
CREATE INDEX idx_result_blendshapes_result_video_id ON public.result_blendshapes(result_video_id);
CREATE INDEX idx_result_audio_files_result_video_id ON public.result_audio_files(result_video_id);
CREATE INDEX idx_result_extra_files_result_video_id ON public.result_extra_files(result_video_id);

-- Presets table index
CREATE INDEX idx_presets_user_id ON public.presets(user_id);

-- Workers table index
CREATE INDEX idx_workers_job_id ON public.workers(job_id);

