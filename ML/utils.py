import os
import sys
from typing_extensions import Self
import shutil
from glob import glob
from dotenv import load_dotenv


ROOT_DIR = os.path.dirname(os.path.dirname(os.path.realpath(__file__)))
SCRIPTS_DIR = os.path.join(ROOT_DIR, 'scripts')


class Singleton:
    __instance = None

    @classmethod
    def __get_instance(cls) -> Self:
        return cls.__instance

    @classmethod
    def instance(cls, *args, **kargs) -> Self:
        cls.__instance = cls(*args, **kargs)
        cls.instance = cls.__get_instance
        return cls.__instance
    

class Environments(Singleton):
    def __init__(self) -> None:
        load_dotenv()

    def get(self, key: str) -> str:
        return os.getenv(key, default='')


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
