import os
import copy
import json

import cv2
import numpy as np

import utils
import shutil

from lang_sam import LangSAM
from lang_sam.utils import load_image

import socketio
from dotenv import load_dotenv

OUT_PATH = 'data'
EXTRACT_IMAGES_PATH = f'{OUT_PATH}/extract'


def extract_images(video_in, extract_count, resize_scale=None):
    cap = cv2.VideoCapture(video_in)
    video_length = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    video_fps = float(cap.get(cv2.CAP_PROP_FPS))
    print('Total frame count :', video_length)
    print('Frame rate :', video_fps)

    ffmpeg_binary = utils.find_or_download_ffmpeg()

    # Ensure extract path
    shutil.rmtree(EXTRACT_IMAGES_PATH, ignore_errors=True)
    os.makedirs(EXTRACT_IMAGES_PATH)

    # Resize and Extract
    fps = float((extract_count - 2) / (video_length / video_fps)) or 1.0
    resize_command = f'"scale={resize_scale[0]}x{resize_scale[1]}"' if resize_scale else ''
    utils.run_system(f'{ffmpeg_binary} -loglevel error -i "{video_in}" -qscale:v 1 -qmin 1 -vf {resize_command} -r {fps} {EXTRACT_IMAGES_PATH}/%04d.png')

    print('Done.')


def generate_transforms():
    # TODO: Camera Model OPENCV? SIMPLE_RADIAL? SIMPLE_PINHOLE?
    utils.run_system(
        f'python scripts/colmap2nerf.py '
        f'--overwrite --run_colmap --aabb_scale 16 --colmap_camera_model SIMPLE_RADIAL '
        f'--images {EXTRACT_IMAGES_PATH} '
        f'--out {OUT_PATH}/transforms.json'
    )


def split_transforms(name, train_test_ratio=1/2):
    out_path = os.path.join(OUT_PATH, name)

    # Ensure output path
    shutil.rmtree(out_path, ignore_errors=True)
    os.makedirs(out_path)

    transforms_origin_path = os.path.join(OUT_PATH, 'transforms.json')
    transforms_train_path = os.path.join(OUT_PATH, name, 'transforms_train.json')
    transforms_test_path = os.path.join(OUT_PATH, name, 'transforms_test.json')

    with open(transforms_origin_path, 'r') as origin_file:
        origin_transforms = json.load(origin_file)

        for frame in origin_transforms['frames']:
            frame['file_path'] = './images/' + os.path.splitext(os.path.basename(frame['file_path']))[0]
            frame['rotation'] = 0.012566370614359171

        train_transforms = copy.deepcopy(origin_transforms)
        train_transforms['frames'] = []
        test_transforms = copy.deepcopy(origin_transforms)
        test_transforms['frames'] = []

        for i, frame in enumerate(origin_transforms['frames']):
            if i % 3 == 0:
                train_transforms['frames'].append(frame)
            else:
                test_transforms['frames'].append(frame)

        with open(transforms_train_path, 'w') as train_file:
            json.dump(train_transforms, train_file, indent=2)

        with open(transforms_test_path, 'w') as test_file:
            json.dump(test_transforms, test_file, indent=2)

    os.remove(transforms_origin_path)


def generate_configuration(name):
    config = {}
    config['ref_mesh'] = f'{OUT_PATH}/{name}'
    # config['spp'] = 1
    config['random_textures'] = True
    config['iter'] = 3000 # 5000
    config['save_interval'] = 100
    config['texture_res'] = [1024, 1024]
    config['train_res'] = [640, 640]
    config['batch'] = 4
    config['learning_rate'] = [0.03, 0.01]
    config['dmtet_grid'] = 64 # 128
    config['mesh_scale'] = 2.4
    config['validate'] = False
    config['lambda_nrm'] = 0.05
    config['n_samples'] = 8
    config['denoiser'] = 'bilateral'
    config['laplace_scale'] = 8000.0
    config['display'] = [{'latlong': True}, {'bsdf': 'kd'}, {'bsdf': 'ks'}, {'bsdf': 'normal'}]
    config['background'] = 'white'
    config['out_dir'] = f'{name}'

    config_path = os.path.join(OUT_PATH, f'{name}.json')
    with open(config_path, 'w') as file:
        json.dump(config, file, indent=2)


def mask_image_from_prompt(name, prompt):
    model = LangSAM()
    out_path = f'{OUT_PATH}/{name}/images'

    # ensure output path
    shutil.rmtree(out_path, ignore_errors=True)
    os.makedirs(out_path)

    # mask images
    for filename in os.listdir(EXTRACT_IMAGES_PATH):
        image_path = os.path.join(EXTRACT_IMAGES_PATH, filename)
        image = load_image(image_path)
        mask, _, _, _ = model.predict(image, prompt)

        for i in range(mask.shape[0]):
            h, w = mask.shape[-2:]
            mask_image = mask[i].reshape(h, w, 1) * 255
            mask_image = mask_image.detach().cpu().numpy()
            mask_image = mask_image.astype(np.uint8).copy()

            origin_image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
            masked_image = cv2.copyTo(origin_image, mask_image)

            b, g, r = cv2.split(masked_image)
            masked_image = cv2.merge([b, g, r, mask_image], 4)
            masked_image_path = os.path.join(out_path, os.path.splitext(filename)[0] + '.png')
            cv2.imwrite(masked_image_path, masked_image)

        print(f'{filename} was masked')

    print('Done.')


sio = socketio.Client()
local_path = os.path.dirname(__file__)


@sio.event
def connect():
    print('connected')
    sio.emit('client registration', {'device': 'ml'})


@sio.on('ml test')
def test(data):
    name = data['job_id']
    prompt = data['prompt']

    extract_images('input/totoro2.MOV', 180, resize_scale=(800, 800))
    generate_transforms()
    split_transforms(name)
    generate_configuration(name)
    mask_image_from_prompt(name, prompt)
    utils.run_system(f'python src/nvdiffrecmc/train.py --config data/{name}.json --display-interval 10')

    sio.emit('ml message', {
        'status': 'job finished',
        'path': os.path.join(local_path, 'out', name)
    })


@sio.event
def disconnect():
    print('disconnected')


if __name__ == '__main__':
    load_dotenv()
    server_address = os.getenv('SERVER_ADDRESS')

    sio.connect(server_address)
