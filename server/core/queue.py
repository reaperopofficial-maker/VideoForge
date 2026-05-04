import asyncio
import traceback
from typing import Callable, Any, Dict

class TaskQueueWorker:
    def __init__(self, concurrency: int = 1):
        self.queue = asyncio.Queue()
        self.concurrency = concurrency
        self.workers = []
        self.tasks_status: Dict[str, Dict[str, Any]] = {}
        
    async def _worker(self):
        while True:
            task_id, func, args, kwargs, retries = await self.queue.get()
            
            self.tasks_status[task_id]["status"] = "processing"
            
            try:
                result = await func(*args, **kwargs)
                self.tasks_status[task_id]["status"] = "completed"
                self.tasks_status[task_id]["result"] = result
            except Exception as e:
                if self.tasks_status[task_id]["attempts"] < retries:
                    self.tasks_status[task_id]["attempts"] += 1
                    await self.queue.put((task_id, func, args, kwargs, retries))
                else:
                    self.tasks_status[task_id]["status"] = "failed"
                    self.tasks_status[task_id]["error"] = str(e)
                    self.tasks_status[task_id]["traceback"] = traceback.format_exc()
            finally:
                self.queue.task_done()

    def start(self):
        if not self.workers:
            for _ in range(self.concurrency):
                task = asyncio.create_task(self._worker())
                self.workers.append(task)

    async def add_task(self, task_id: str, func: Callable, *args, retries: int = 3, **kwargs):
        self.tasks_status[task_id] = {
            "status": "pending",
            "attempts": 0,
            "result": None,
            "error": None
        }
        await self.queue.put((task_id, func, args, kwargs, retries))

    def get_status(self, task_id: str) -> Dict[str, Any]:
        return self.tasks_status.get(task_id, {"status": "not_found"})

image_queue = TaskQueueWorker(concurrency=3)
video_queue = TaskQueueWorker(concurrency=1)
