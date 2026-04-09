import fs from 'fs';

const filePath = 'src/app/api/tasks/[id]/route.ts';
let code = fs.readFileSync(filePath, 'utf8');

code = code.replace(/const nameChunks: any\[\] = \[\];/g, "const nameChunks: import('drizzle-orm').SQL[] = [];");
code = code.replace(/const completedChunks: any\[\] = \[\];/g, "const completedChunks: import('drizzle-orm').SQL[] = [];");

fs.writeFileSync(filePath, code);
