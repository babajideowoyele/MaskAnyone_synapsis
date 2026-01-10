"""
FFmpeg video conversion utilities.

Provides safe subprocess execution with timeouts and proper error handling.
"""
import subprocess
import os
import logging

logger = logging.getLogger(__name__)

# Maximum time for video conversion operations (2 hours)
FFMPEG_TIMEOUT_SECONDS = 7200


class FFmpegConversionError(Exception):
    """Raised when FFmpeg conversion fails."""
    pass


class FFmpegConverter:
    def __init__(self):
        self.ffmpeg_path = "ffmpeg"
        self.crf = 23
        self.preset = "medium"

    def convert_video_in_place(self, input_video: str):
        """Convert video to H.264 format in place."""
        temp_output = f"{input_video}.temp.mp4"
        command = [
            self.ffmpeg_path,
            "-y",  # Overwrite output files without asking
            "-i", input_video,
            "-c:v", "libx264",
            "-crf", str(self.crf),
            "-preset", self.preset,
            "-c:a", "copy",
            temp_output
        ]
        self.run_command(command)
        self.replace_file(temp_output, input_video)

    def convert_video_with_audio_in_place(self, input_video: str, audio_video: str):
        """Convert video and merge audio from another source."""
        temp_output = f"{input_video}.temp.mp4"
        command = [
            self.ffmpeg_path,
            "-y",  # Overwrite output files without asking
            "-i", input_video,
            "-i", audio_video,
            "-map", "0:v",
            "-map", "1:a?",
            "-c:v", "libx264",
            "-crf", str(self.crf),
            "-preset", self.preset,
            "-c:a", "copy",
            temp_output
        ]
        self.run_command(command)
        self.replace_file(temp_output, input_video)

    @staticmethod
    def run_command(command: list, timeout: int = FFMPEG_TIMEOUT_SECONDS):
        """
        Run an FFmpeg command with timeout and proper error handling.

        Args:
            command: The command to run as a list of strings
            timeout: Maximum execution time in seconds (default: 2 hours)

        Raises:
            FFmpegConversionError: If the command fails or times out
        """
        # Don't log full command as it may contain sensitive paths
        cmd_name = command[0] if command else "unknown"
        logger.info(f"Starting {cmd_name} conversion")

        try:
            result = subprocess.run(
                command,
                check=True,
                timeout=timeout,
                capture_output=True,
                text=True
            )
            logger.info(f"{cmd_name} conversion completed successfully")
        except subprocess.TimeoutExpired:
            logger.error(f"{cmd_name} conversion timed out after {timeout} seconds")
            raise FFmpegConversionError(f"Conversion timed out after {timeout} seconds")
        except subprocess.CalledProcessError as e:
            logger.error(f"{cmd_name} conversion failed with exit code {e.returncode}")
            # Log stderr but truncate if too long
            stderr_preview = (e.stderr[:500] + '...') if len(e.stderr) > 500 else e.stderr
            logger.error(f"FFmpeg stderr: {stderr_preview}")
            raise FFmpegConversionError(f"Conversion failed: {stderr_preview}")
        except FileNotFoundError:
            logger.error(f"{cmd_name} not found - is FFmpeg installed?")
            raise FFmpegConversionError("FFmpeg not found. Please install FFmpeg.")

    @staticmethod
    def replace_file(src: str, dst: str):
        """
        Safely replace a file with another.

        Args:
            src: Source file path
            dst: Destination file path

        Raises:
            FFmpegConversionError: If the file replacement fails
        """
        try:
            os.replace(src, dst)
            logger.debug(f"Replaced file successfully")
        except OSError as e:
            logger.error(f"Failed to replace file: {e}")
            # Clean up temp file if replacement failed
            if os.path.exists(src):
                try:
                    os.remove(src)
                except OSError:
                    pass
            raise FFmpegConversionError(f"Failed to finalize conversion: {e}")
