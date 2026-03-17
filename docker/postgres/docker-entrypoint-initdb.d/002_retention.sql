--
-- Data retention schema additions for GDPR compliance.
-- Adds timestamps to tables missing them and foreign key constraints
-- with CASCADE deletes so that removing a video cleans up all related data.
--
-- NOTE: This script runs only on fresh database initialization.
-- For existing deployments, run these statements manually or wipe the volume.
--

\connect prototype

-- ============================================================
-- 1. Add created_at / updated_at to tables that lack timestamps
-- ============================================================

-- videos: no timestamps at all
ALTER TABLE public.videos
    ADD COLUMN IF NOT EXISTS created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    ADD COLUMN IF NOT EXISTS updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL;

-- presets: no timestamps
ALTER TABLE public.presets
    ADD COLUMN IF NOT EXISTS created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    ADD COLUMN IF NOT EXISTS updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL;

-- result_audio_files: no timestamps
ALTER TABLE public.result_audio_files
    ADD COLUMN IF NOT EXISTS created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL;

-- result_blendshapes: no timestamps
ALTER TABLE public.result_blendshapes
    ADD COLUMN IF NOT EXISTS created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL;

-- result_extra_files: no timestamps
ALTER TABLE public.result_extra_files
    ADD COLUMN IF NOT EXISTS created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL;

-- result_mp_kinematics: no timestamps
ALTER TABLE public.result_mp_kinematics
    ADD COLUMN IF NOT EXISTS created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL;

-- ============================================================
-- 2. Foreign key constraints with ON DELETE CASCADE
-- ============================================================

-- jobs.video_id -> videos.id
ALTER TABLE public.jobs
    ADD CONSTRAINT fk_jobs_video
    FOREIGN KEY (video_id) REFERENCES public.videos(id) ON DELETE CASCADE;

-- result_videos.video_id -> videos.id
ALTER TABLE public.result_videos
    ADD CONSTRAINT fk_result_videos_video
    FOREIGN KEY (video_id) REFERENCES public.videos(id) ON DELETE CASCADE;

-- result_videos.job_id -> jobs.id
ALTER TABLE public.result_videos
    ADD CONSTRAINT fk_result_videos_job
    FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;

-- result_audio_files.result_video_id -> result_videos.id
ALTER TABLE public.result_audio_files
    ADD CONSTRAINT fk_result_audio_files_result_video
    FOREIGN KEY (result_video_id) REFERENCES public.result_videos(id) ON DELETE CASCADE;

-- result_blendshapes.result_video_id -> result_videos.id
ALTER TABLE public.result_blendshapes
    ADD CONSTRAINT fk_result_blendshapes_result_video
    FOREIGN KEY (result_video_id) REFERENCES public.result_videos(id) ON DELETE CASCADE;

-- result_extra_files.result_video_id -> result_videos.id
ALTER TABLE public.result_extra_files
    ADD CONSTRAINT fk_result_extra_files_result_video
    FOREIGN KEY (result_video_id) REFERENCES public.result_videos(id) ON DELETE CASCADE;

-- result_mp_kinematics.result_video_id -> result_videos.id
ALTER TABLE public.result_mp_kinematics
    ADD CONSTRAINT fk_result_mp_kinematics_result_video
    FOREIGN KEY (result_video_id) REFERENCES public.result_videos(id) ON DELETE CASCADE;
