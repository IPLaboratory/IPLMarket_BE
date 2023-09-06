from typing import Callable

from threading import Thread
from queue import Queue

class Scheduler:
    def __init__(self, target: Callable[[dict[str, str]], None]) -> None:
        self.controller = None
        self.works = Queue()
        self.target = target

    def enqueue(self, args: dict[str, str]) -> None:
        print('Job enqueued: ', args)
        self.works.put(args)

    def worker(self) -> None:
        while True:
            args = self.works.get()
            if args:
                print('Working: ', args)
                self.target(args)

    def run(self) -> None:
        if not self.controller:
            self.controller = Thread(target=self.worker)
            self.controller.start()
            self.controller.join()