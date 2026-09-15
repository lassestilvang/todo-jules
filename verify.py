from playwright.sync_api import sync_playwright

def verify():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto("http://localhost:3000")

        page.wait_for_selector('textarea[id="description"]')
        page.fill('textarea[id="description"]', 'test')
        page.wait_for_timeout(1000)
        page.screenshot(path="verification.png")

        browser.close()

if __name__ == "__main__":
    verify()
