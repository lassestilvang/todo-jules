import fs from 'fs';

const filePath = 'src/app/api/tasks/[id]/route.test.ts';
let code = fs.readFileSync(filePath, 'utf8');

code = code.replace(/mockResolvedValueOnce\({ id: 1 }\ as any\)/g, "mockResolvedValueOnce([{ id: 1 }] as any)");

fs.writeFileSync(filePath, code);
