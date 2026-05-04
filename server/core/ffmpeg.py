import os
import asyncio
import tempfile
import ffmpeg
from typing import List

async def merge_videos(video_paths: List[str], output_path: str) -> str:
    """Join multiple video clips using FFmpeg."""
    if not video_paths:
        raise ValueError("No video paths provided for merging.")
    
    def _merge():
        with tempfile.NamedTemporaryFile('w', delete=False, suffix='.txt') as f:
            for path in video_paths:
                abs_path = os.path.abspath(path).replace('\\', '/')
                f.write(f"file '{abs_path}'\n")
            list_file_path = f.name
            
        try:
            (
                ffmpeg
                .input(list_file_path, format='concat', safe=0)
                .output(output_path, c='copy')
                .overwrite_output()
                .run(capture_stdout=True, capture_stderr=True)
            )
        except ffmpeg.Error as e:
            raise RuntimeError(f"FFmpeg error: {e.stderr.decode('utf8')}")
        finally:
            if os.path.exists(list_file_path):
                os.remove(list_file_path)
                
        return output_path
        
    return await asyncio.to_thread(_merge)

async def add_subtitles(video_path: str, subtitles: str) -> str:
    """Add subtitles (SRT content) to video."""
    def _add_subs():
        with tempfile.NamedTemporaryFile('w', delete=False, suffix='.srt') as f:
            f.write(subtitles)
            srt_path = f.name
            
        output_path = video_path.replace('.mp4', '_subbed.mp4')
        try:
            (
                ffmpeg
                .input(video_path)
                .output(output_path, vf=f"subtitles={srt_path}")
                .overwrite_output()
                .run(capture_stdout=True, capture_stderr=True)
            )
        except ffmpeg.Error as e:
            raise RuntimeError(f"FFmpeg error: {e.stderr.decode('utf8')}")
        finally:
            if os.path.exists(srt_path):
                os.remove(srt_path)
                
        return output_path
        
    return await asyncio.to_thread(_add_subs)

async def get_video_duration(video_path: str) -> float:
    """Return video duration in seconds."""
    def _get_duration():
        try:
            probe = ffmpeg.probe(video_path)
            duration = float(probe['format']['duration'])
            return duration
        except ffmpeg.Error as e:
            raise RuntimeError(f"FFmpeg probe error: {e.stderr.decode('utf8')}")
            
    return await asyncio.to_thread(_get_duration)
