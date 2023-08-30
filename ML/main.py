import os

import socketio
from dotenv import load_dotenv

from sculptor import Sculpter


sio = socketio.Client()
local_path = os.path.dirname(__file__)


@sio.event
def connect():
    print('connected')
    sio.emit('client registration', {'device': 'ml'})


@sio.on('start modeling')
def test(data):
    name = data['name']
    prompt = data['prompt']
    video = data['path']

    sculpter = Sculpter()
    sculpter.create(name, prompt, video)

    sio.emit('ml message', {
        'status': 'modeling finished',
        'path': os.path.join(local_path, 'out', name)
    })


@sio.event
def disconnect():
    print('disconnected')



if __name__ == '__main__':
    load_dotenv()
    server_address = os.getenv('SERVER_ADDRESS')

    sio.connect(server_address)
