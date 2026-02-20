
import sqlite3
import time
import os

def benchmark(db_name='bench.db', use_index=False):
    if os.path.exists(db_name):
        os.remove(db_name)

    conn = sqlite3.connect(db_name)
    cursor = conn.cursor()

    # Setup tables
    cursor.execute("""
    CREATE TABLE tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        priority TEXT DEFAULT 'None'
    )
    """)

    cursor.execute("""
    CREATE TABLE subtasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        completed INTEGER DEFAULT 0,
        task_id INTEGER,
        FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
    )
    """)

    if use_index:
        cursor.execute("CREATE INDEX subtasks_task_id_idx ON subtasks (task_id)")

    # Seeding
    num_tasks = 1000
    subtasks_per_task = 100

    print(f"Seeding {num_tasks} tasks and {num_tasks * subtasks_per_task} subtasks (Index: {use_index})...")

    # Batch insert tasks
    task_data = [(f"Task {i}",) for i in range(num_tasks)]
    cursor.executemany("INSERT INTO tasks (name) VALUES (?)", task_data)

    # Get all task IDs
    cursor.execute("SELECT id FROM tasks")
    task_ids = [row[0] for row in cursor.fetchall()]

    # Batch insert subtasks
    all_subtasks = []
    for task_id in task_ids:
        for j in range(subtasks_per_task):
            all_subtasks.append((f"Subtask {task_id}-{j}", task_id))

    # Insert in chunks to avoid memory issues
    chunk_size = 10000
    for i in range(0, len(all_subtasks), chunk_size):
        cursor.executemany("INSERT INTO subtasks (name, task_id) VALUES (?, ?)", all_subtasks[i:i+chunk_size])

    conn.commit()
    print("Seeding complete.")

    # Benchmark
    test_task_ids = task_ids[::100] # 10 tasks spread across
    iterations = 100

    print(f"Running benchmark with {len(test_task_ids)} tasks and {iterations} iterations...")

    start_time = time.time()
    for _ in range(iterations):
        for task_id in test_task_ids:
            cursor.execute("SELECT * FROM subtasks WHERE task_id = ?", (task_id,))
            cursor.fetchall()

    end_time = time.time()
    total_queries = iterations * len(test_task_ids)
    avg_time_ms = ((end_time - start_time) / total_queries) * 1000

    print(f"Total time for {total_queries} queries: {end_time - start_time:.4f}s")
    print(f"Average query time: {avg_time_ms:.4f}ms")

    conn.close()
    return avg_time_ms

if __name__ == "__main__":
    print("--- Baseline (No Index) ---")
    baseline = benchmark('bench_baseline.db', use_index=False)

    print("\n--- Optimized (With Index) ---")
    optimized = benchmark('bench_optimized.db', use_index=True)

    improvement = ((baseline - optimized) / baseline) * 100
    print(f"\nImprovement: {improvement:.2f}%")
    print(f"Speedup: {baseline / optimized:.2f}x")
