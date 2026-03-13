
import sqlite3
import time
import os

def benchmark_reorder(num_total_tasks=1000, num_updated_tasks=10):
    db_name = 'bench_reorder.db'
    if os.path.exists(db_name):
        os.remove(db_name)

    conn = sqlite3.connect(db_name)
    cursor = conn.cursor()

    # Setup table
    cursor.execute("""
    CREATE TABLE tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        "order" INTEGER DEFAULT 0
    )
    """)

    # Seeding
    print(f"Seeding {num_total_tasks} tasks...")
    task_data = [(f"Task {i}", i) for i in range(num_total_tasks)]
    cursor.executemany("INSERT INTO tasks (name, \"order\") VALUES (?, ?)", task_data)
    conn.commit()

    def run_update(items_to_update):
        if not items_to_update:
            return 0

        # Simulating the CASE statement update in reorder.ts
        case_parts = []
        ids = []
        for id_, new_order in items_to_update:
            case_parts.append(f"WHEN {id_} THEN {new_order}")
            ids.append(str(id_))

        case_stmt = "CASE id " + " ".join(case_parts) + " END"
        where_clause = f"id IN ({','.join(ids)})"
        sql = f"UPDATE tasks SET \"order\" = {case_stmt} WHERE {where_clause}"

        start = time.time()
        cursor.execute(sql)
        conn.commit()
        return (time.time() - start) * 1000

    # Benchmark "Current" (Updating all tasks)
    print(f"Benchmarking update of ALL {num_total_tasks} tasks...")
    all_items = [(i+1, num_total_tasks - i) for i in range(num_total_tasks)]
    current_time = 0
    for _ in range(5): # average over 5 runs
        current_time += run_update(all_items)
    current_time /= 5

    # Benchmark "Optimized" (Updating only few tasks)
    print(f"Benchmarking update of {num_updated_tasks} tasks...")
    subset_items = [(i+1, num_total_tasks + i) for i in range(num_updated_tasks)]
    optimized_time = 0
    for _ in range(5): # average over 5 runs
        optimized_time += run_update(subset_items)
    optimized_time /= 5

    print(f"\nResults for {num_total_tasks} total tasks:")
    print(f"Current (update all): {current_time:.2f}ms")
    print(f"Optimized (update {num_updated_tasks}): {optimized_time:.2f}ms")
    print(f"Improvement: {((current_time - optimized_time) / current_time) * 100:.2f}%")
    print(f"Payload Reduction: {((num_total_tasks - num_updated_tasks) / num_total_tasks) * 100:.2f}%")

    conn.close()
    if os.path.exists(db_name):
        os.remove(db_name)

if __name__ == "__main__":
    benchmark_reorder(1000, 10)
    print("-" * 30)
    benchmark_reorder(100, 2)
