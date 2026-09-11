from playwright.sync_api import sync_playwright

def run_cuj(page):
    page.goto("http://localhost:3000/not-a-real-page")
    page.wait_for_timeout(1000)

    page.screenshot(path="/app/verification.png")
    page.wait_for_timeout(1000)

    page.get_by_role("link", name="Return to Inbox").click()
    page.wait_for_timeout(1000)

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            record_video_dir="/app/videos"
        )
        page = context.new_page()
        try:
            run_cuj(page)
        finally:
            context.close()
            browser.close()
