from playwright.sync_api import sync_playwright

def verify_app(page):
    page.goto("http://localhost:3000")
    page.wait_for_selector("text=Inbox")

    # Create a task
    page.fill("input[id='task-name']", "Verify Frontend Task")
    page.click("button:has-text('Add Task')")

    # Wait for task to appear
    page.wait_for_selector("text=Verify Frontend Task")

    # Screenshot the inbox with the new task and sidebar
    page.screenshot(path="verification/app_screenshot.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_app(page)
        finally:
            browser.close()
