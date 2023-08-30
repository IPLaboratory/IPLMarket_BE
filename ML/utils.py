import os
import sys
import shutil
from glob import glob


ROOT_DIR = os.path.dirname(os.path.dirname(os.path.realpath(__file__)))
SCRIPTS_DIR = os.path.join(ROOT_DIR, 'scripts')


def run_system(command) -> None:
    error = os.system(command)
    if error:
        print(f'FATAL: Execute command failed "{command}"')
        sys.exit(error)


def find_or_download_ffmpeg() -> str:
    ffmpeg_binary = 'ffmpeg'

    if os.system(f'where ffmpeg >nul 2>nul') != 0:
        ffmpeg_glob = os.path.join(ROOT_DIR, "external", "ffmpeg", "*", "bin", "ffmpeg.exe")
        candidates = glob(ffmpeg_glob)
        if not candidates:
            print("FFmpeg not found. Attempting to download FFmpeg from the internet.")
            run_system(os.path.join(SCRIPTS_DIR, "download_ffmpeg.bat"))
            candidates = glob(ffmpeg_glob)

        if candidates:
            ffmpeg_binary = candidates[0]

    return ffmpeg_binary


def ensure_path(path: str) -> None:
    shutil.rmtree(path, ignore_errors=True)
    os.makedirs(path)
