import os
import shutil

import socketio

from utils import Environments
from schedule import Scheduler
from sculptor import Sculpter


def sculpt(data: dict[str, str]) -> None:
    video_filename = f'./data/{os.path.basename(data["video"])}'
    output_path = os.path.join(data['name'])

    shutil.copyfile(data['video'], video_filename)

    sculpter = Sculpter()
    sculpter.create(data['name'], data['prompt'], video_filename, output_path)

    sio.emit('ml message', {
        'status': 'modeling finished',
        'path': output_path
    })


sio = socketio.Client()
scheduler = Scheduler(sculpt)


@sio.event
def connect():
    print('connected')
    sio.emit('client registration', {'device': 'ml'})


@sio.on('start modeling')
def on_start_modeling(data):
    args = {
        'name': str(os.path.splitext(data['name'])[0]),
        'prompt': str(data['prompt']),
        'video': str(data['path']),
    }
    scheduler.enqueue(args)


@sio.event
def disconnect():
    print('disconnected')


if __name__ == '__main__':
    server_address = Environments.instance().get('SERVER_ADDRESS')
    sio.connect(server_address)
    scheduler.run()
