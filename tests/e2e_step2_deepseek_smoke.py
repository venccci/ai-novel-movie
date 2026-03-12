from __future__ import annotations

import datetime as dt
from pathlib import Path

from playwright.sync_api import TimeoutError as PlaywrightTimeoutError
from playwright.sync_api import sync_playwright


BASE_URL = "http://127.0.0.1:5189"
ARTIFACT_DIR = Path("test-artifacts/flow-smoke")
NOVEL_TEXT = """卡尔文握紧剑，雨夜里他对井里的笑声说：上来。\n井边的人群沉默后再度逼近，钟声在远处回响。"""


def wait_for_generation_result(page, timeout_ms: int = 120000) -> tuple[str, str]:
    deadline = dt.datetime.now().timestamp() + timeout_ms / 1000

    while dt.datetime.now().timestamp() < deadline:
      # Success signal: generated scene cards are visible.
      if page.locator("text=场景").count() > 0:
          return "success", "检测到已生成场景卡片"

      # Failure signal: visible error block from UI.
      err = page.locator("div.bg-red-900\\/50").first
      if err.count() > 0 and err.is_visible():
          return "error", err.inner_text().strip()

      page.wait_for_timeout(800)

    return "timeout", "等待 AI 生成超时"


def run() -> None:
    timestamp = dt.datetime.now().strftime("%Y%m%d-%H%M%S")
    run_dir = ARTIFACT_DIR / timestamp
    run_dir.mkdir(parents=True, exist_ok=True)

    project_name = f"DeepSeek联调-{timestamp}"

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 900})

        try:
            page.goto(BASE_URL, wait_until="domcontentloaded")
            page.wait_for_load_state("networkidle")
            page.screenshot(path=str(run_dir / "01-dashboard.png"), full_page=True)

            create_btn = page.get_by_role("button", name="创建项目")
            if create_btn.count() == 0:
                create_btn = page.get_by_role("button", name="新建项目")
            create_btn.first.click()

            # New modal flow.
            if page.get_by_text("创建新项目").count() > 0:
                page.get_by_text("创建新项目").first.wait_for(timeout=5000)
                page.get_by_placeholder("输入新项目名称").fill(project_name)
                page.get_by_role("button", name="创建").last.click()
            else:
                # Legacy dashboard flow.
                name_input = page.get_by_placeholder("请输入项目名称")
                if name_input.count() > 0:
                    name_input.fill(project_name)
                    page.get_by_role("button", name="确认创建").first.click()

            page.wait_for_timeout(1200)
            page.screenshot(path=str(run_dir / "02-after-create-attempt.png"), full_page=True)

            # If creation did not navigate, open the first existing project card.
            if page.get_by_role("button", name="返回首页").count() == 0:
                first_card = page.locator("h3").first
                if first_card.count() > 0:
                    first_card.click()
                    page.wait_for_timeout(800)

            # Modern editor flow.
            if page.get_by_role("button", name="返回首页").count() > 0:
                page.get_by_role("button", name="返回首页").first.wait_for(timeout=10000)
                page.get_by_placeholder("例如：星际迷航：最后的边疆").fill(project_name)
                page.get_by_role("button", name="确认设定并进入下一步").click()
            else:
                # Legacy flow: enter project then go to script generation.
                if page.get_by_role("button", name="进入项目").count() > 0:
                    page.get_by_role("button", name="进入项目").first.click()
                if page.get_by_text("剧本生成").count() > 0:
                    page.get_by_text("剧本生成").first.click()

            page.get_by_role("button", name="一键提取剧本").wait_for(timeout=10000)
            page.get_by_placeholder("在此粘贴小说章节内容...").fill(NOVEL_TEXT)
            page.screenshot(path=str(run_dir / "03-step2-before-generate.png"), full_page=True)

            page.get_by_role("button", name="一键提取剧本").click()
            status, detail = wait_for_generation_result(page)
            page.screenshot(path=str(run_dir / "04-step2-after-generate.png"), full_page=True)

            if status == "success":
                print("PASS: Step2 剧本提取成功")
            elif status == "error":
                print(f"FAIL: Step2 剧本提取失败 -> {detail}")
                raise AssertionError(detail)
            else:
                print(f"FAIL: {detail}")
                raise PlaywrightTimeoutError(detail)

            print(f"Artifacts: {run_dir.resolve()}")

        finally:
            browser.close()


if __name__ == "__main__":
    run()
