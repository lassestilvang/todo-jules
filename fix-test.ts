import fs from 'fs';

const filePath = 'src/components/task-history.test.tsx';
let code = fs.readFileSync(filePath, 'utf8');

// The test is looking for "Task created" but the mock returns "Task 1 created" and "Task 2 created"
code = code.replace(/expect\(screen\.getByText\('Task created'\)\)\.toBeInTheDocument\(\);/g, (match, offset, str) => {
    // Only replace the ones in the third test
    if (offset > 3000) {
        if (str.substring(0, offset).includes("expect(historyActions.getTaskHistory).toHaveBeenCalledWith(1);")) {
            return "expect(screen.getByText('Task 1 created')).toBeInTheDocument();";
        } else if (str.substring(0, offset).includes("expect(historyActions.getTaskHistory).toHaveBeenCalledWith(2);")) {
            return "expect(screen.getByText('Task 2 created')).toBeInTheDocument();";
        }
    }
    return match;
});

// Since the regex replace is tricky with offset, let's just do it manually

code = code.replace(
    "expect(screen.getByText('Task created')).toBeInTheDocument();",
    "expect(screen.getByText('Task 1 created')).toBeInTheDocument();"
);

code = code.replace(
    "expect(screen.getByText('Task created')).toBeInTheDocument();",
    "expect(screen.getByText('Task 2 created')).toBeInTheDocument();"
);

fs.writeFileSync(filePath, code);
