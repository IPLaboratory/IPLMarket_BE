from preprocess import Preprocess
import utils


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
            utils.run_system(f'python src/nvdiffrecmc/train.py --config {workspace}/{name}.json -o {output_path} --display-interval 10')
        else:
            utils.run_system(f'python src/nvdiffrecmc/train.py --config {workspace}/{name}.json -o {output_path}')
