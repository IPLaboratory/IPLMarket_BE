import os
from typing import Optional, Tuple

import cv2
import json
import utils
from camera import Calibration
from segmentation import Segmentation


class Preprocess:
    def __init__(self, name: str, video_filename: str, output_path: str) -> None:
        self.name = name
        self.input_filename = video_filename
        self.output_path = output_path
        self.images_path = os.path.join(output_path, 'extract')
        self.transforms_path = os.path.join(output_path, name)
        self.dataset_path = os.path.join(output_path, name, 'images')

        self.calibration_model = Calibration()
        self.segmentation_model = Segmentation()

        self.log = True


    def set_logging(self, enabled: bool = True) -> None:
        self.log = enabled
        self.segmentation_model.set_logging(enabled)


    def run(self, prompt: str) -> None:
        self.extract_images(180, resize_scale=(800, 800))
        self.generate_transforms()
        self.generate_configuration()
        self.mask_images(prompt)


    def extract_images(self, extract_count: int, resize_scale: Optional[Tuple[int, int]]) -> None:
        cap = cv2.VideoCapture(self.input_filename)
        video_length = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        video_fps = float(cap.get(cv2.CAP_PROP_FPS))

        if self.log:
            print('=== Extract Images from Video ===')
            print('Total frame count :', video_length)
            print('Frame rate :', video_fps)

        # Ensure extract path
        utils.ensure_path(self.images_path)

        # Get ffmpeg binary name
        ffmpeg_binary = utils.find_or_download_ffmpeg()

        # Resize and Extract
        fps = float((extract_count - 2) / (video_length / video_fps)) or 1.0
        resize_command = f'"scale={resize_scale[0]}x{resize_scale[1]}"' if resize_scale else ''
        utils.run_system(f'{ffmpeg_binary} -loglevel error '
                         f'-i "{self.input_filename}" '
                         f'-qscale:v 1 -qmin 1 -vf {resize_command} '
                         f'-r {fps} {self.images_path}/%04d.png')

        if self.log:
            print('Done.')


    def generate_transforms(self) -> None:
        # Ensure transforms path
        utils.ensure_path(self.transforms_path)

        self.calibration_model.save(self.images_path, self.transforms_path)


    def generate_configuration(self) -> None:
        if self.log:
            print('=== Generate Configuration File ===')

        config = {}
        config['ref_mesh'] = self.transforms_path
        # config['spp'] = 1
        config['random_textures'] = True
        config['iter'] = 3000 # For better quality: 5000
        config['save_interval'] = 100
        config['texture_res'] = [1024, 1024]
        config['train_res'] = [640, 640]
        config['batch'] = 4
        config['learning_rate'] = [0.03, 0.01]
        config['dmtet_grid'] = 64 # For more expression: 128
        config['mesh_scale'] = 2.4
        config['validate'] = False
        config['lambda_nrm'] = 0.05
        config['n_samples'] = 8
        config['denoiser'] = 'bilateral'
        config['laplace_scale'] = 8000.0
        config['display'] = [{'latlong': True}, {'bsdf': 'kd'}, {'bsdf': 'ks'}, {'bsdf': 'normal'}]
        config['background'] = 'white'
        config['out_dir'] = self.name

        config_file_path = os.path.join(self.output_path, f'{self.name}.json')
        with open(config_file_path, 'w') as file:
            json.dump(config, file, indent=2)

        if self.log:
            print('Done.')

    
    def mask_images(self, prompt: str) -> None:
        # Ensure dataset path
        utils.ensure_path(self.dataset_path)

        # Mask extracted images
        for filename in os.listdir(self.images_path):
            image_file_path = os.path.join(self.images_path, filename)
            self.segmentation_model.save(prompt, image_file_path, self.dataset_path)