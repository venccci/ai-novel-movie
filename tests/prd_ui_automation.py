from __future__ import annotations

import datetime as dt
from pathlib import Path

from playwright.sync_api import TimeoutError as PlaywrightTimeoutError
from playwright.sync_api import sync_playwright


BASE_URL = "http://127.0.0.1:5189"
ARTIFACT_DIR = Path("test-artifacts/prd-ui")


def expect(condition: bool, message: str) -> None:
    if not condition:
        raise AssertionError(message)


def run() -> None:
    timestamp = dt.datetime.now().strftime("%Y%m%d-%H%M%S")
    run_dir = ARTIFACT_DIR / timestamp
    run_dir.mkdir(parents=True, exist_ok=True)

    project_name = f"PRD自动化-{timestamp}"

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 900})

        try:
            # Accept all browser dialogs (alert/confirm) raised by save/delete flows.
            def _on_dialog(dialog) -> None:  # type: ignore[no-untyped-def]
                try:
                    dialog.accept()
                except Exception:
                    pass

            page.on("dialog", _on_dialog)

            page.goto(BASE_URL, wait_until="domcontentloaded")
            page.wait_for_load_state("networkidle")

            expect(page.get_by_text("项目管理中心").is_visible(), "首页未显示项目管理中心")
            page.screenshot(path=str(run_dir / "01-dashboard.png"), full_page=True)

            create_btn = page.get_by_role("button", name="创建项目")
            create_btn.click()
            page.get_by_text("创建新项目").wait_for(timeout=5000)
            page.screenshot(path=str(run_dir / "02-create-modal.png"), full_page=True)

            modal_create_btn = page.get_by_role("button", name="创建").last
            expect(modal_create_btn.is_disabled(), "空项目名时创建按钮应禁用")

            name_input = page.get_by_placeholder("输入新项目名称")
            name_input.fill(project_name)
            modal_create_btn.click()

            page.get_by_role("button", name="返回首页").wait_for(timeout=10000)
            expect(
                page.get_by_text(f"当前工程:").is_visible(),
                "进入项目编辑页后未显示顶部项目栏",
            )
            expect(page.get_by_text(project_name).first.is_visible(), "顶部未显示新建项目名称")
            page.screenshot(path=str(run_dir / "03-editor-opened.png"), full_page=True)

            step_btn = page.get_by_role("button", name="确认设定并进入下一步")
            title_input = page.get_by_placeholder("例如：星际迷航：最后的边疆")
            title_input.fill("")
            expect(step_btn.is_disabled(), "清空项目名后下一步按钮应禁用")

            title_input.fill(project_name)
            expect(step_btn.is_enabled(), "填写项目名后下一步按钮应可用")
            page.screenshot(path=str(run_dir / "04-step-gate.png"), full_page=True)

            page.get_by_role("button", name="保存").click()
            page.wait_for_timeout(600)

            page.get_by_role("button", name="返回首页").click()
            page.get_by_text("项目管理中心").wait_for(timeout=10000)
            page.screenshot(path=str(run_dir / "05-back-dashboard.png"), full_page=True)

            card = page.locator("h3", has_text=project_name).first
            expect(card.is_visible(), "返回首页后未找到新建项目卡片")

            card.click()
            page.get_by_role("button", name="返回首页").wait_for(timeout=10000)
            expect(page.get_by_text(project_name).first.is_visible(), "点击项目卡片后未打开对应项目")

            page.get_by_role("button", name="返回首页").click()
            page.get_by_text("项目管理中心").wait_for(timeout=10000)

            # Delete created project.
            project_card = page.locator("div", has=page.locator("h3", has_text=project_name)).first
            project_card.hover()
            project_card.get_by_title("删除").click()
            page.wait_for_timeout(800)
            expect(
                page.locator("h3", has_text=project_name).count() == 0,
                "删除项目后卡片仍存在",
            )
            page.screenshot(path=str(run_dir / "06-delete-verified.png"), full_page=True)

            print("PASS")
            print(f"Artifacts: {run_dir.resolve()}")
            print("Validated cases:")
            print("1) 首页显示项目管理中心")
            print("2) 创建项目弹窗与禁用态")
            print("3) 创建后自动进入项目")
            print("4) 项目设定必填门禁（项目名为空禁用下一步）")
            print("5) 返回首页可用，卡片可点击打开")
            print("6) 删除项目成功")

        except (AssertionError, PlaywrightTimeoutError) as exc:
            page.screenshot(path=str(run_dir / "failure.png"), full_page=True)
            print(f"FAIL: {exc}")
            print(f"Artifacts: {run_dir.resolve()}")
            raise
        finally:
            browser.close()


if __name__ == "__main__":
    run()
