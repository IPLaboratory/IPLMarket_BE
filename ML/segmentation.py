import os
import shutil

import cv2
import numpy as np

from lang_sam import LangSAM
from lang_sam.utils import load_image


class Segmentation:
    def __init__(self) -> None:
        self.model: LangSAM = LangSAM()
        self.log = True


    def set_logging(self, enabled: bool = True) -> None:
        self.log = enabled


    def save(self, prompt: str, image_filename: str, output_path: str) -> None:
        image = load_image(image_filename)
        mask, _, _, logits = self.model.predict(image, prompt)
        logits = logits.tolist()

        # Skip if failed to predict
        if not mask.tolist() or not logits:
            return
        
        # Find most confidence mask
        candidate = logits.index(max(logits))

        # Convert mask tensor to OpenCV image
        h, w = mask.shape[-2:]
        mask_image = mask[candidate].reshape(h, w, 1) * 255
        mask_image = mask_image.detach().cpu().numpy()
        mask_image = mask_image.astype(np.uint8).copy()

        # Remove background
        origin_image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        masked_image = cv2.copyTo(origin_image, mask_image)

        # Save masked image
        b, g, r = cv2.split(masked_image)
        masked_image = cv2.merge([b, g, r, mask_image], 4)
        masked_image_filename = f'{os.path.splitext(os.path.basename(image_filename))[0]}.png'
        masked_image_filename = os.path.join(output_path, masked_image_filename)
        cv2.imwrite(masked_image_filename, masked_image)

        if self.log:
            print(f'{image_filename} was masked. index {candidate}({logits[candidate]}) was selected from {logits}')
