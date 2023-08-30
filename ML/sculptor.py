from preprocess import Preprocess
import utils


class Sculpter:
    def __init__(self) -> None:
        self.visualize = True
        pass


    def set_visualization(self, enabled: bool = True) -> None:
        self.visualize = enabled


    def create(self, name: str, prompt: str, video_filename: str) -> None:
        output_path = 'data'

        preprocessor = Preprocess(name, video_filename, output_path)
        preprocessor.run(prompt)

        if self.visualize:
            utils.run_system(f'python src/nvdiffrecmc/train.py --config {output_path}/{name}.json --display-interval 10')
        else:
            utils.run_system(f'python src/nvdiffrecmc/train.py --config {output_path}/{name}.json')
