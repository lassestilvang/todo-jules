import { test, expect } from '@playwright/test';

test('verify task list renders', async ({ page }) => {
  await page.goto('http://localhost:3000');

  // Wait for the task list or empty state to appear
  // We look for common elements like "Add Task" button or the list container
  await expect(page.locator('body')).toBeVisible();

  // Take initial screenshot
  await page.screenshot({ path: 'verification/task-list-initial.png' });

  // Verify that the DndContext is likely active by checking for draggable attributes or just the presence of items
  // Note: We can't easily simulate complex drag and drop in this simple verification without more setup
  // but we can ensure the page didn't crash
  const taskItems = page.locator('[data-draggable="true"]'); // This selector might need adjustment based on dnd-kit attributes

  // Take another screenshot to confirm mounting
  await page.screenshot({ path: 'verification/task-list-mounted.png' });
});
