const { Worker, Atomics } = require('worker_threads');

const maxNumber = 1000000;
const concurrency = 10;
const numbersPerThread = Math.ceil(maxNumber / concurrency);

let primeCount = 0;
let completedThreads = 0;
const nextNumber = new Int32Array(new SharedArrayBuffer(4));

function isPrime(number) {
  if (number < 2) return false;
  for (let i = 2; i <= Math.sqrt(number); i++) {
    if (number % i === 0) return false;
  }
  return true;
}

function countPrimes() {
  let count = 0;
  let number = 0;
  while ((number = Atomics.add(nextNumber, 0, 1)) <= maxNumber) {
    if (isPrime(number)) {
      count++;
    }
  }
  return count;
}

function processThread() {
  const count = countPrimes();
  Atomics.add(primeCount, 0, count);
  completedThreads++;
  if (completedThreads === concurrency) {
    console.log('Total prime count:', primeCount[0]);
  }
}

for (let i = 0; i < concurrency; i++) {
  const worker = new Worker(processThread);
  worker.on('exit', () => {
    console.log(`Thread ${worker.threadId} exited`);
  });
  worker.on('error', (err) => {
    console.error(err);
  });
}

