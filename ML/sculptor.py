import os
import shutil

import utils
from preprocess import Preprocess


class Sculpter:
    def __init__(self) -> None:
        self.visualize = True
        pass


    def set_visualization(self, enabled: bool = True) -> None:
        self.visualize = enabled


    def create(self, name: str, prompt: str, video_filename: str, output_path: str) -> None:
        workspace = 'data'

        preprocessor = Preprocess(name, video_filename, workspace)
        preprocessor.run(prompt)

        if self.visualize:
            utils.run_system(f'python src/nvdiffrecmc/train.py --config {workspace}/{name}.json --out-dir {output_path} --display-interval 10')
        else:
            utils.run_system(f'python src/nvdiffrecmc/train.py --config {workspace}/{name}.json --out-dir {output_path}')

        # Clean up
        extract_path = os.path.join('./data', 'extract')
        train_path = os.path.join('./data', output_path)
        config_filename = os.path.join('./data', f'{output_path}.json')
        shutil.rmtree(extract_path)
        shutil.rmtree(train_path)
        os.remove(config_filename)
        os.remove(video_filename)

        # Copy model files to Server
        ml_output_path = os.path.join('./out', output_path)
        model_output_path = os.path.join('./out', output_path, 'dmtet_mesh')
        server_output_path = os.path.join('../Server/public/models', output_path)

        utils.ensure_path(server_output_path)

        for file in os.listdir(model_output_path):
            src = os.path.join(model_output_path, file)
            dst = os.path.join(server_output_path, file)
            shutil.copyfile(src, dst)
        
        shutil.rmtree(ml_output_path, ignore_errors=True)
