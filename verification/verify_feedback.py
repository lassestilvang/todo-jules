from playwright.sync_api import sync_playwright

def verify_app_with_feedback_changes(page):
    page.goto("http://localhost:3000")

    # Verify Create List Dialog Accessible Button
    # We added aria-label="Create new list"
    page.wait_for_selector("text=My Lists")

    # Try to click the button by label
    page.click('button[aria-label="Create new list"]')

    # Verify Dialog Opens
    page.wait_for_selector("text=Create new list")

    # Create List with validation
    # Try empty
    page.click("button:has-text('Create List')")

    # Should see error toast or simple failure.
    # The current implementation shows toast.error on failure.
    # We can't easily assert the toast presence in headless easily without waiting,
    # but we can check if the dialog is still open (it should be).
    page.wait_for_selector("text=Create new list") # Still open

    # Fill correctly
    page.fill("input[id='name']", "Valid List")
    page.fill("input[id='emoji']", "✅")
    page.click("button:has-text('Create List')")

    # Wait for list to appear
    page.wait_for_selector("text=Valid List")

    # Click it
    page.click("text=Valid List")

    # Verify Task Creation with Toast
    page.fill("input[id='task-name']", "Validated Task")
    page.click("button:has-text('Add Task')")

    # Wait for task
    page.wait_for_selector("text=Validated Task")

    # Screenshot to confirm UI integrity
    page.screenshot(path="verification/app_feedback_verified.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_app_with_feedback_changes(page)
        finally:
            browser.close()
