const { Worker, isMainThread, parentPort, workerData, threadId,AtomicInt32Array } = require('worker_threads');

const maxNumber = 1000000;
const concurrency = 10;
const numbersPerThread = Math.ceil(maxNumber / concurrency);
const primeCount = new Int32Array(new SharedArrayBuffer(4));

if (isMainThread) {
  let completedThreads = 0;

  function processThread(start, end) {
    return new Promise((resolve, reject) => {
      const worker = new Worker(__filename, {
        workerData: { start, end, primeCount }
      });
      worker.on('message', ({ count }) => {
        completedThreads++;
        if (completedThreads === concurrency) {
          console.log('Total prime count:', primeCount[0]);
        }
        resolve();
      });
      worker.on('error', (err) => {
        reject(err);
      });
    });
  }

  async function runThreads() {
    const threads = [];
    let currentNumber = 1;

    for (let i = 0; i < concurrency; i++) {
      const start = currentNumber;
      const end = Math.min(start + numbersPerThread - 1, maxNumber);
      currentNumber = end + 1;
      threads.push(processThread(start, end));
    }

    await Promise.all(threads);
  }

  runThreads().catch(console.error);
} else {
  const { start, end, primeCount } = workerData;
  const count = countPrimes(start, end);

  primeCount.atomicAdd(count);
  parentPort.postMessage({ count });
}
