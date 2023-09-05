# IPLMarket_BE ML

## Requirements
Python 3.9+  
torch (Tested 1.13.1+cu116)  
torchvision (Tested 0.14.1+cu116)

## Installation

### Create Conda Environment
```
conda create -n ml python=3.9
conda activate ml
pip install torch==1.13.1+cu116 torchvision==0.14.1+cu116 torchaudio==0.13.1 --extra-index-url https://download.pytorch.org/whl/cu116
```

### Install lang-segment-anything
```
pip install -U git+https://github.com/luca-medeiros/lang-segment-anything.git
```

If you have build error about GroundingDINO, follow this [issue](https://github.com/luca-medeiros/lang-segment-anything/issues/13#issuecomment-1623660430).

### Install nvdiffrecmc
```
pip install ninja imageio PyOpenGL glfw xatlas gdown
pip install git+https://github.com/NVlabs/nvdiffrast/
pip install --global-option="--no-networks" git+https://github.com/NVlabs/tiny-cuda-nn#subdirectory=bindings/torch
imageio_download_bin freeimage
```
```
cd ML
mkdir src && cd src
git clone https://github.com/NVlabs/nvdiffrecmc.git
```

### Install Project Dependencies
```
pip install python-dotenv
pip install python-socketio
```

### Make Environment File
Make `.env` file in `ML` Directory
```
SERVER_ADDRESS="YOUR IP ADDRESS"
```

## Run
```
python main.py
```

## Acknowledgements
This project is based on the following repositories:
- [lang-segment-anything](https://github.com/luca-medeiros/lang-segment-anything)
- [nvdiffrecmc](https://github.com/NVlabs/nvdiffrecmc)
