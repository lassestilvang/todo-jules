import { performance } from 'perf_hooks';

// Simulate Task type
type Task = { id: number; title: string };

function generateTasks(count: number): Task[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    title: `Task ${i}`
  }));
}

function originalUpdate(newItems: Task[], optimisticTasks: Task[]) {
  return newItems
    .map((task, index) => ({
      id: task.id,
      order: index
    }))
    .filter((update, index) => update.id !== optimisticTasks[index].id);
}

function optimizedUpdate(newItems: Task[], optimisticTasks: Task[]) {
  return newItems.reduce((acc, task, index) => {
    if (task.id !== optimisticTasks[index].id) {
      acc.push({
        id: task.id,
        order: index
      });
    }
    return acc;
  }, [] as { id: number; order: number }[]);
}

function runBenchmark(taskCount: number, iterations: number = 1000) {
  console.log(`\nBenchmarking with ${taskCount} tasks, ${iterations} iterations`);

  const optimisticTasks = generateTasks(taskCount);

  // Simulate moving one item from index 0 to middle
  const newItems = [...optimisticTasks];
  const item = newItems.splice(0, 1)[0];
  newItems.splice(Math.floor(taskCount / 2), 0, item);

  // Warmup
  for (let i = 0; i < 100; i++) {
    originalUpdate(newItems, optimisticTasks);
    optimizedUpdate(newItems, optimisticTasks);
  }

  // Test original
  const startOriginal = performance.now();
  for (let i = 0; i < iterations; i++) {
    originalUpdate(newItems, optimisticTasks);
  }
  const timeOriginal = performance.now() - startOriginal;

  // Test optimized
  const startOptimized = performance.now();
  for (let i = 0; i < iterations; i++) {
    optimizedUpdate(newItems, optimisticTasks);
  }
  const timeOptimized = performance.now() - startOptimized;

  console.log(`Original map+filter: ${timeOriginal.toFixed(2)}ms`);
  console.log(`Optimized reduce:    ${timeOptimized.toFixed(2)}ms`);
  console.log(`Improvement:         ${((timeOriginal - timeOptimized) / timeOriginal * 100).toFixed(2)}% faster`);
}

runBenchmark(10, 10000);
runBenchmark(100, 10000);
runBenchmark(1000, 1000);
runBenchmark(10000, 100);
