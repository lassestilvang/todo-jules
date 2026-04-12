
function baseline(existingIds: number[], incomingIds: number[]) {
  return existingIds.filter((id) => !incomingIds.includes(id));
}

function optimized(existingIds: number[], incomingIds: number[]) {
  const incomingIdsSet = new Set(incomingIds);
  return existingIds.filter((id) => !incomingIdsSet.has(id));
}

function runBenchmark() {
  const sizes = [10, 100, 1000, 5000];

  for (const size of sizes) {
    const existingIds = Array.from({ length: size }, (_, i) => i);
    const incomingIds = Array.from({ length: size }, (_, i) => i % 2 === 0 ? i : -1).filter(i => i !== -1);

    console.log(`--- Size: ${size} ---`);

    // Warmup
    for(let i=0; i<100; i++) {
        baseline(existingIds, incomingIds);
        optimized(existingIds, incomingIds);
    }

    const startBaseline = performance.now();
    for (let i = 0; i < 100; i++) {
      baseline(existingIds, incomingIds);
    }
    const endBaseline = performance.now();
    console.log(`Baseline: ${(endBaseline - startBaseline).toFixed(4)}ms (total for 100 iterations)`);

    const startOptimized = performance.now();
    for (let i = 0; i < 100; i++) {
      optimized(existingIds, incomingIds);
    }
    const endOptimized = performance.now();
    console.log(`Optimized: ${(endOptimized - startOptimized).toFixed(4)}ms (total for 100 iterations)`);

    const speedup = (endBaseline - startBaseline) / (endOptimized - startOptimized);
    console.log(`Speedup: ${speedup.toFixed(2)}x`);
  }
}

runBenchmark();
