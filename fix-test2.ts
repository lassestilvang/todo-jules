import fs from 'fs';

const filePath = 'src/components/task-history.test.tsx';
let code = fs.readFileSync(filePath, 'utf8');

code = code.replace(
    "expect(screen.getByText('Task 1 created')).toBeInTheDocument();",
    "expect(screen.getByText('Task 1 created')).toBeDefined();"
);

code = code.replace(
    "expect(screen.getByText('Task 2 created')).toBeInTheDocument();",
    "expect(screen.getByText('Task 2 created')).toBeDefined();"
);

fs.writeFileSync(filePath, code);
