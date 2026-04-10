import fs from 'fs';

const filePath = 'src/components/task-history.test.tsx';
let code = fs.readFileSync(filePath, 'utf8');

const conflictedBlock = `<<<<<<< HEAD
      expect(screen.getByText('Task 1 created')).toBeInTheDocument();
=======
      expect(screen.getByText('Task 2 created')).toBeDefined();
>>>>>>> origin/main`;

// 'Task 2 created' is the correct text when opening for taskId 2,
// and 'toBeDefined()' avoids the Chai testing library error.
code = code.replace(conflictedBlock, "      expect(screen.getByText('Task 2 created')).toBeDefined();");

fs.writeFileSync(filePath, code);
