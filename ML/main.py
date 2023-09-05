import os
import shutil

import socketio

from utils import Environments
from sculptor import Sculpter


sio = socketio.Client()


@sio.event
def connect():
    print('connected')
    sio.emit('client registration', {'device': 'ml'})


@sio.on('start modeling')
def sculpt(data):
    name = os.path.splitext(data['name'])[0]
    prompt = data['prompt']
    video = data['path']

    video_filename = f'./data/{os.path.basename(video)}'
    output_path = os.path.join('../Server', name)

    shutil.copyfile(video, video_filename)

    sculpter = Sculpter()
    sculpter.create(name, prompt, video_filename, output_path)

    sio.emit('ml message', {
        'status': 'modeling finished',
        'path': output_path
    })


@sio.event
def disconnect():
    print('disconnected')


if __name__ == '__main__':
    server_address = Environments.instance().get('SERVER_ADDRESS')
    sio.connect(server_address)
