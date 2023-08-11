# IPLMarket_BE ML

## Requirements
Python 3.9+
torch (Tested 1.13.1+cu116)
torchvision (Tested 0.14.1+cu116)

## Installation

### Create Conda Environment
```
cd ML
conda create -n ml python=3.9
conda activate ml
pip install torch==1.13.1+cu116 torchvision==0.14.1+cu116 torchaudio==0.13.1 --extra-index-url https://download.pytorch.org/whl/cu116
```

### Install Project Dependencies & Make Config File
```
pip install python-dotenv
pip install python-socketio
```

Make `.env` file
```
SERVER_ADDRESS="YOUR IP ADDRESS"
```


### Create Directory for Dependencies
```
mkdir src && cd src
```

### Install lang-segment-anything
```
pip install -U git+https://github.com/luca-medeiros/lang-segment-anything.git
```

If you have build error on GroundingDINO, follow this commands.

```
git clone https://github.com/IDEA-Research/GroundingDINO.git && cd GroundingDINO
pip install -e .
cd ../
```

```
git clone https://github.com/luca-medeiros/lang-segment-anything && cd lang-segment-anything
```

Remove groundingdino line from pyproject.toml [tool.poetry.dependencies] and run `pip install -e .`

```
pip install -e .
cd ../
```

### Install nvdiffrecmc
```
pip install ninja imageio PyOpenGL glfw xatlas gdown
pip install git+https://github.com/NVlabs/nvdiffrast/
pip install --global-option="--no-networks" git+https://github.com/NVlabs/tiny-cuda-nn#subdirectory=bindings/torch
imageio_download_bin freeimage
git clone https://github.com/NVlabs/nvdiffrecmc.git
```

## Run


## Acknowledgements
This project is based on the following repositories:
- lang-segment-anything
- nvdiffrecmc