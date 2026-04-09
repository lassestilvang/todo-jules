import fs from 'fs';

const filePath = 'src/app/api/tasks/[id]/route.ts';
let code = fs.readFileSync(filePath, 'utf8');

// Ensure sql and notInArray are imported from drizzle-orm
if (!code.includes('notInArray')) {
    code = code.replace("import { eq, inArray } from 'drizzle-orm';", "import { eq, inArray, notInArray, sql, and } from 'drizzle-orm';");
}

const targetBlock = `      // Handle subtasks
      if (validatedBody.subtasks) {
        const existingSubtasks = await tx.select().from(subtasks).where(eq(subtasks.taskId, taskId));

        const incomingIds = validatedBody.subtasks.map((st) => st.id).filter((id) => id !== undefined);
        const existingIds = existingSubtasks.map((st) => st.id);

        const toDeleteIds = existingIds.filter((id) => !incomingIds.includes(id));
        const toInsert = validatedBody.subtasks.filter((st) => st.id === undefined).map((st) => ({
          name: st.name,
          completed: st.completed,
          taskId: taskId,
        }));
        const toUpdate = validatedBody.subtasks.filter((st) => st.id !== undefined);

        if (toDeleteIds.length > 0) {
          await tx.delete(subtasks).where(inArray(subtasks.id, toDeleteIds));
        }
        if (toInsert.length > 0) {
          await tx.insert(subtasks).values(toInsert);
        }
        for (const st of toUpdate) {
          await tx.update(subtasks)
            .set({ name: st.name, completed: st.completed })
            .where(eq(subtasks.id, st.id!));
        }
      }`;

const newBlock = `      // Handle subtasks
      if (validatedBody.subtasks) {
        const incomingIds = validatedBody.subtasks
          .map((st) => st.id)
          .filter((id) => id !== undefined) as number[];

        if (incomingIds.length > 0) {
          await tx.delete(subtasks).where(
            and(
              eq(subtasks.taskId, taskId),
              notInArray(subtasks.id, incomingIds)
            )
          );
        } else {
          await tx.delete(subtasks).where(eq(subtasks.taskId, taskId));
        }

        const toInsert = validatedBody.subtasks
          .filter((st) => st.id === undefined)
          .map((st) => ({
            name: st.name,
            completed: st.completed,
            taskId: taskId,
          }));

        const toUpdate = validatedBody.subtasks.filter((st) => st.id !== undefined);

        if (toInsert.length > 0) {
          await tx.insert(subtasks).values(toInsert);
        }

        if (toUpdate.length > 0) {
          const CHUNK_SIZE = 100;
          for (let i = 0; i < toUpdate.length; i += CHUNK_SIZE) {
            const chunk = toUpdate.slice(i, i + CHUNK_SIZE);

            const nameChunks: any[] = [];
            const completedChunks: any[] = [];
            const ids: number[] = [];

            for (const item of chunk) {
              nameChunks.push(sql\`when \${item.id} then \${item.name}\`);
              completedChunks.push(sql\`when \${item.id} then \${item.completed ? 1 : 0}\`);
              ids.push(item.id!);
            }

            const nameCaseStatement = sql\`case \${subtasks.id} \${sql.join(nameChunks, sql\` \`)} else \${subtasks.name} end\`;
            const completedCaseStatement = sql\`case \${subtasks.id} \${sql.join(completedChunks, sql\` \`)} else \${subtasks.completed} end\`;

            await tx
              .update(subtasks)
              .set({
                name: nameCaseStatement,
                completed: completedCaseStatement,
              })
              .where(inArray(subtasks.id, ids));
          }
        }
      }`;

code = code.replace(targetBlock, newBlock);
fs.writeFileSync(filePath, code);
console.log('done');
