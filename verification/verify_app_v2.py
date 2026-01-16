from playwright.sync_api import sync_playwright

def verify_app_with_list(page):
    page.goto("http://localhost:3000")

    # Wait for the "My Lists" text
    page.wait_for_selector("text=My Lists")

    # Locate the button next to "My Lists" which triggers the dialog.
    # It is a button inside the div that contains "My Lists".
    # We can try selecting by the SVG inside it or just generic button in that area.

    # This selector finds the button that is a sibling of the h3 "My Lists"
    # Wait, the structure is: div > h3, button
    # So we can select the button inside that div.

    # Let's try: page.locator("aside div:has-text('My Lists') button").click()
    page.locator("aside div:has-text('My Lists') button").click()

    # Wait for dialog
    page.wait_for_selector("text=Create new list")

    # Fill form
    page.fill("input[id='name']", "Work")
    page.fill("input[id='emoji']", "💼")

    # Submit
    page.click("button:has-text('Create List')")

    # Wait for list to appear in sidebar
    page.wait_for_selector("text=Work")

    # Click on the new list
    page.click("text=Work")

    # Verify we are on the list page
    page.wait_for_selector("text=Add New Task to Work")

    # Create a task in this list
    page.fill("input[id='task-name']", "Finish Report")
    page.click("button:has-text('Add Task')")

    # Verify task appears
    page.wait_for_selector("text=Finish Report")

    # Screenshot
    page.screenshot(path="verification/app_screenshot_v2.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_app_with_list(page)
        finally:
            browser.close()
