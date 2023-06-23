const { Worker } = require('worker_threads');

const maxNumber = 1000000000;
const concurrency = 10;
const numbersPerThread = Math.ceil(maxNumber / concurrency);

let primeCount = 0;
let completedThreads = 0;

function processThread(start, end) {
  return new Promise((resolve, reject) => {
    const worker = new Worker('./worker.js', { workerData: { start, end } });
    worker.on('message', ({ count }) => {
      primeCount += count;
      completedThreads++;
      if (completedThreads === concurrency) {
        console.log('Total prime count:', primeCount);
      }
      resolve();
    });
    worker.on('error', (err) => {
      reject(err);
    });
  });
}

async function runThreads() {
  console.time("runThreads");
  const threads = [];
  let currentNumber = 1;

  for (let i = 0; i < concurrency; i++) {
    const start = currentNumber;
    const end = Math.min(start + numbersPerThread - 1, maxNumber);
    currentNumber = end + 1;
    threads.push(processThread(start, end));
  }

  await Promise.all(threads);
  console.timeEnd("runThreads");
}

runThreads().catch(console.error);
