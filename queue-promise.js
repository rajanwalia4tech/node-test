class TaskQueue {
  constructor(concurrency) {
    this.concurrency = concurrency;
    this.queue = [];
    this.activeCount = 0;
  }

  push(task) {
    return new Promise((resolve, reject) => {
      this.queue.push({ task, resolve, reject });
      this.next();
    });
  }

  next() {
    while (this.activeCount < this.concurrency && this.queue.length > 0) {
      const { task, resolve, reject } = this.queue.shift();
      this.execute(task, resolve, reject);
    }
  }

  execute(task, resolve, reject) {
    this.activeCount++;
    task()
      .then((result) => {
        resolve(result);
      })
      .catch((error) => {
        reject(error);
      })
      .finally(() => {
        this.activeCount--;
        this.next();
      });
  }
}

// Create an instance of TaskQueue with a concurrency limit of 5
const queue = new TaskQueue(3);

// Example asynchronous task
const asyncTask = (taskNumber) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`Task ${taskNumber} completed`);
      resolve(`Result from Task ${taskNumber}`);
    }, Math.random() * 2000); // Simulating asynchronous task
  });
};

// Add 500 tasks to the queue
for (let i = 1; i <= 10; i++) {
  queue.push(() => asyncTask(i))
    .then((result) => {
      console.log(result);
    })
    .catch((error) => {
      console.error(error);
    });
}
