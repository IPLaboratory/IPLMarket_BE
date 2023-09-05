import os
import json
import copy

import utils


class Calibration:
    def __init__(self) -> None:
        self.log = True


    def set_logging(self, enabled: bool = True) -> None:
        self.log = enabled


    def save(self, images_path: str, output_path: str) -> None:
        if self.log:
            print('=== Generate Transforms File ===')

        # TODO: Camera Model OPENCV? SIMPLE_RADIAL? SIMPLE_PINHOLE?
        utils.run_system(
            f'python scripts/colmap2nerf.py '
            f'--overwrite --run_colmap --aabb_scale 16 --colmap_camera_model SIMPLE_RADIAL '
            f'--images {images_path} '
            f'--out {output_path}/transforms.json'
        )

        if self.log:
            print('Splitting transforms')

        # Split transforms to train and test
        transforms_origin_path = os.path.join(output_path, 'transforms.json')
        transforms_train_path = os.path.join(output_path, 'transforms_train.json')
        transforms_test_path = os.path.join(output_path, 'transforms_test.json')

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
                # train : test = 1 : 3
                if i % 3 == 0:
                    train_transforms['frames'].append(frame)
                else:
                    test_transforms['frames'].append(frame)

            with open(transforms_train_path, 'w') as train_file:
                json.dump(train_transforms, train_file, indent=2)

            with open(transforms_test_path, 'w') as test_file:
                json.dump(test_transforms, test_file, indent=2)

        if self.log:
            print('Clean up origin transforms')

        os.remove(transforms_origin_path)

        if self.log:
            print('Done.')

