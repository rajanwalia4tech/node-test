const { parentPort, workerData, AtomicInt32Array } = require('worker_threads');

function isPrime(number) {
  if (number < 2) return false;
  for (let i = 2; i <= Math.sqrt(number); i++) {
    if (number % i === 0) return false;
  }
  return true;
}

function countPrimes(start, end) {
  let count = 0;
  for (let number = start; number <= end; number++) {
    if (isPrime(number)) {
      count++;
    }
  }
  return count;
}

const { start, end, primeCount } = workerData;
const count = countPrimes(start, end);

primeCount.atomicAdd(count);
parentPort.postMessage({ count });
