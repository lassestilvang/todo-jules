from playwright.sync_api import sync_playwright

def run_cuj(page):
    page.goto("http://localhost:3000/today")
    page.wait_for_timeout(2000)

    # Focus the input and type enough text to trigger the color change
    page.get_by_label("Description").fill("a" * 450)
    page.wait_for_timeout(500)

    # Take screenshot at the key moment showing the new color and text
    page.screenshot(path="/app/verification.png")
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
