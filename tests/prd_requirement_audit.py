from __future__ import annotations

import datetime as dt
import json
import re
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Any

from playwright.sync_api import sync_playwright


FRONTEND_URL = "http://127.0.0.1:5189"
BACKEND_URL = "http://127.0.0.1:4000"
ARTIFACT_ROOT = Path("test-artifacts/prd-audit")


@dataclass
class Finding:
    id: str
    severity: str
    title: str
    evidence: str
    source: str


class Auditor:
    def __init__(self) -> None:
        self.findings: list[Finding] = []
        self.passes: list[str] = []

    def fail(self, fid: str, severity: str, title: str, evidence: str, source: str) -> None:
        self.findings.append(Finding(fid, severity, title, evidence, source))

    def ok(self, message: str) -> None:
        self.passes.append(message)


def api_request(method: str, path: str, body: dict[str, Any] | None = None) -> tuple[int, Any]:
    url = f"{BACKEND_URL}{path}"
    data = None
    headers = {}
    if body is not None:
        data = json.dumps(body).encode("utf-8")
        headers["Content-Type"] = "application/json"
    req = urllib.request.Request(url, data=data, method=method, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            text = resp.read().decode("utf-8")
            return resp.getcode(), (json.loads(text) if text else None)
    except urllib.error.HTTPError as err:
        payload = err.read().decode("utf-8")
        parsed: Any
        try:
            parsed = json.loads(payload) if payload else None
        except Exception:
            parsed = payload
        return err.code, parsed


def run_api_checks(a: Auditor) -> None:
    status, _ = api_request("POST", "/api/projects", {})
    if status != 400:
        a.fail(
            "API-001",
            "high",
            "项目创建缺少标题时未返回 400",
            f"expected=400 actual={status}",
            "README + projects API",
        )
    else:
        a.ok("API: 创建项目标题必填校验正常")

    status, p = api_request("POST", "/api/projects", {"title": "Audit-API-Project"})
    project_id = p.get("id") if isinstance(p, dict) else None
    if status != 201 or not project_id:
        a.fail(
            "API-002",
            "critical",
            "无法创建测试项目",
            f"status={status} body={p}",
            "projects API",
        )
        return
    a.ok("API: 项目创建成功")

    status, fetched = api_request("GET", f"/api/projects/{project_id}")
    if status != 200 or not isinstance(fetched, dict):
        a.fail(
            "API-003",
            "high",
            "按 ID 获取项目失败",
            f"status={status} body={fetched}",
            "projects API",
        )
    else:
        a.ok("API: 按 ID 获取项目成功")

    payload = {
        "title": "Audit-API-Project",
        "projectData": {"title": "Audit-API-Project", "style": "anime", "ratio": "16:9"},
        "novel": "test novel",
        "scriptData": [{"id": 1, "location": "测试地", "time": "DAY", "characters": "甲", "description": "desc"}],
        "characters": [{"id": 1, "name": "甲", "role": "主角", "appearance": "短发", "background": "学生", "status": "ready", "img": None}],
        "shots": [{"id": 1, "description": "镜头1", "shotType": "中景", "cameraMove": "固定", "audio": "旁白", "tags": ["tag"], "prompt": "prompt"}],
    }
    status, _ = api_request("PUT", f"/api/projects/{project_id}", payload)
    if status != 200:
        a.fail(
            "API-004",
            "high",
            "更新项目失败",
            f"status={status}",
            "projects API",
        )
    else:
        a.ok("API: 项目更新成功")

    status, _ = api_request("POST", "/api/scripts", {"projectId": project_id})
    if status != 400:
        a.fail(
            "API-005",
            "medium",
            "scripts 接口缺少 novelText 时未返回 400",
            f"expected=400 actual={status}",
            "DEVELOPMENT.md scripts API",
        )
    else:
        a.ok("API: scripts 参数校验正常")

    status, script = api_request("POST", "/api/scripts", {"projectId": project_id, "novelText": "abc"})
    if status != 201 or not isinstance(script, dict) or "scriptId" not in script:
        a.fail(
            "API-006",
            "high",
            "scripts 接口生成失败",
            f"status={status} body={script}",
            "DEVELOPMENT.md scripts API",
        )
    else:
        a.ok("API: scripts 生成成功")

    status, _ = api_request("POST", "/api/characters", {})
    if status != 400:
        a.fail(
            "API-007",
            "medium",
            "characters 接口缺少 scriptId 时未返回 400",
            f"expected=400 actual={status}",
            "DEVELOPMENT.md characters API",
        )
    else:
        a.ok("API: characters 参数校验正常")

    status, chars = api_request("POST", "/api/characters", {"scriptId": "script_v1"})
    if status != 201 or not isinstance(chars, list) or not chars:
        a.fail(
            "API-008",
            "high",
            "characters 生成失败",
            f"status={status} body={chars}",
            "DEVELOPMENT.md characters API",
        )
    else:
        a.ok("API: characters 生成成功")

    status, _ = api_request("POST", "/api/shotlists", {})
    if status != 400:
        a.fail(
            "API-009",
            "medium",
            "shotlists 接口缺少 scriptId 时未返回 400",
            f"expected=400 actual={status}",
            "DEVELOPMENT.md shotlists API",
        )
    else:
        a.ok("API: shotlists 参数校验正常")

    status, shots = api_request("POST", "/api/shotlists", {"scriptId": "script_v1"})
    if status != 201 or not isinstance(shots, list) or not shots:
        a.fail(
            "API-010",
            "high",
            "shotlists 生成失败",
            f"status={status} body={shots}",
            "DEVELOPMENT.md shotlists API",
        )
    else:
        a.ok("API: shotlists 生成成功")

    # Cleanup test project
    api_request("DELETE", f"/api/projects/{project_id}")


def run_ui_checks(a: Auditor, run_dir: Path) -> None:
    t = dt.datetime.now().strftime("%H%M%S")
    test_name = f"PRD-UI-{t}"

    # Seed a project with full data to quickly reach step4 and verify edit behavior.
    _, seeded = api_request("POST", "/api/projects", {"title": f"{test_name}-seed"})
    seeded_id = seeded["id"]
    api_request(
        "PUT",
        f"/api/projects/{seeded_id}",
        {
            "title": f"{test_name}-seed",
            "projectData": {"title": f"{test_name}-seed", "style": "anime", "ratio": "16:9", "language": "zh"},
            "novel": "novel",
            "scriptData": [{"id": 1, "location": "A", "time": "DAY", "characters": "甲", "description": "剧情"}],
            "characters": [{"id": 1, "name": "甲", "role": "主角", "appearance": "短发", "background": "学生", "status": "ready", "img": None}],
            "shots": [{"id": 1, "description": "镜头一", "shotType": "中景", "cameraMove": "固定", "audio": "旁白", "tags": ["x"], "prompt": "p"}],
            "locks": {"script": True, "characters": True, "storyboard": False},
        },
    )

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        console_errors: list[str] = []
        page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)
        page.on("dialog", lambda dialog: dialog.accept())

        page.goto(FRONTEND_URL, wait_until="domcontentloaded")
        page.wait_for_load_state("networkidle")
        page.screenshot(path=str(run_dir / "ui-01-dashboard.png"), full_page=True)

        if not page.get_by_text("项目管理中心").is_visible():
            a.fail("UI-001", "critical", "首页未显示项目管理中心", "dashboard missing", "README 项目管理")
        else:
            a.ok("UI: 首页项目管理中心可见")

        # Create new project
        page.get_by_role("button", name="创建项目").click()
        page.get_by_placeholder("输入新项目名称").fill(test_name)
        page.get_by_role("button", name="创建").last.click()
        page.get_by_role("button", name="返回首页").wait_for(timeout=10000)
        page.screenshot(path=str(run_dir / "ui-02-editor.png"), full_page=True)

        # Required-field gate check
        next_btn = page.get_by_role("button", name="确认设定并进入下一步")
        title_input = page.get_by_placeholder("例如：星际迷航：最后的边疆")
        title_input.fill("")
        if not next_btn.is_disabled():
            a.fail("UI-002", "high", "项目名为空时仍可进入下一步", "next button enabled", "README 强制设定流程")
        else:
            a.ok("UI: 项目名为空时下一步禁用")

        title_input.fill(test_name)
        if not next_btn.is_enabled():
            a.fail("UI-003", "high", "项目名填写后仍无法进入下一步", "next button disabled", "步骤1流程")
        else:
            a.ok("UI: 项目名填写后可进入下一步")

        # Step2
        next_btn.click()
        page.get_by_role("button", name="一键提取剧本").wait_for(timeout=8000)
        page.get_by_role("button", name="一键提取剧本").click()
        page.wait_for_timeout(300)
        if not page.get_by_text("请输入小说内容").is_visible():
            a.fail("UI-004", "medium", "空小说触发提取时未出现错误提示", "error message not found", "步骤2输入校验")
        else:
            a.ok("UI: 步骤2空输入校验正常")

        page.get_by_role("button", name="添加场次").click()
        scene_box = page.locator("text=场景 1").first
        if not scene_box.is_visible():
            a.fail("UI-005", "high", "添加场次失败", "scene card missing", "步骤2手动编辑")
        else:
            a.ok("UI: 步骤2可手动添加场次")

        # fill required scene inputs and proceed
        page.locator("input[placeholder='场景地点']").first.fill("图书馆")
        page.locator("input[placeholder='出场角色']").first.fill("甲")
        page.locator("textarea[placeholder='剧情描述...']").first.fill("主角发现秘密")
        page.get_by_role("button", name=re.compile("进入角色设计|锁定并进入角色设计")).click()

        # Step3
        page.get_by_role("button", name="手动添加").wait_for(timeout=8000)
        page.get_by_role("button", name="手动添加").click()
        if page.get_by_text("外貌描述").count() == 0 or page.get_by_text("角色背景").count() == 0:
            a.fail("UI-006", "high", "角色卡缺少外貌/背景字段", "field labels missing", "README 角色设计优化")
        else:
            a.ok("UI: 角色卡包含外貌与背景字段")

        page.get_by_text("生成立绘").first.click()
        page.wait_for_timeout(2300)
        if page.locator("img[alt='新角色']").count() == 0:
            a.fail("UI-007", "medium", "角色立绘未成功生成", "image not rendered after 2.3s", "步骤3角色视觉生成")
        else:
            a.ok("UI: 角色立绘可生成")

        page.get_by_role("button", name=re.compile("进入分镜脚本|锁定并进入分镜脚本")).click()
        page.get_by_role("button", name="生成分镜表").wait_for(timeout=8000)
        page.screenshot(path=str(run_dir / "ui-03-step4-empty.png"), full_page=True)

        # Back home and open seeded project to validate step4 editing persistence.
        page.get_by_role("button", name="返回首页").click()
        page.get_by_text("项目管理中心").wait_for(timeout=8000)
        page.locator("h3", has_text=f"{test_name}-seed").first.click()
        page.get_by_role("button", name="分镜脚本").click()
        page.wait_for_timeout(400)
        page.screenshot(path=str(run_dir / "ui-04-step4-seeded.png"), full_page=True)

        # Try changing shot parameters in UI then save.
        shot_type_select = page.locator("select").first
        shot_type_select.select_option(label="特写")
        camera_move_select = page.locator("select").nth(1)
        camera_move_select.select_option(label="推轨")
        page.get_by_role("button", name="保存").click()
        page.wait_for_timeout(500)

        # Verify persisted data from backend.
        _, reloaded = api_request("GET", f"/api/projects/{seeded_id}")
        persisted_shot = (reloaded.get("shots") or [{}])[0]
        if persisted_shot.get("shotType") != "特写" or persisted_shot.get("cameraMove") != "推轨":
            a.fail(
                "UI-008",
                "high",
                "分镜参数下拉框改动未保存到数据模型",
                f"saved={persisted_shot}",
                "README 分镜参数设置可编辑",
            )
        else:
            a.ok("UI: 分镜参数编辑可持久化")

        # Check if huge requirement gap exists: there is no lock-state controls in UI.
        if page.get_by_text("锁定").count() == 0:
            a.fail(
                "REQ-001",
                "medium",
                "未发现剧本/角色/分镜“锁定”相关交互",
                "UI 搜索不到 锁定 入口",
                "交互说明 + RFC 阻断规则",
            )

        if console_errors:
            a.fail(
                "UI-009",
                "low",
                "页面存在 console.error 输出",
                "; ".join(console_errors[:4]),
                "运行时稳定性",
            )

        browser.close()

    # Cleanup seeded and created projects if present
    status, projects = api_request("GET", "/api/projects")
    if status == 200 and isinstance(projects, list):
        for project in projects:
            title = project.get("title", "")
            if title.startswith(test_name):
                api_request("DELETE", f"/api/projects/{project.get('id')}")


def main() -> None:
    ts = dt.datetime.now().strftime("%Y%m%d-%H%M%S")
    run_dir = ARTIFACT_ROOT / ts
    run_dir.mkdir(parents=True, exist_ok=True)

    auditor = Auditor()
    run_api_checks(auditor)
    run_ui_checks(auditor, run_dir)

    report = {
        "result": "PASS_WITH_FINDINGS" if auditor.findings else "PASS",
        "run_at": ts,
        "passes": auditor.passes,
        "findings": [asdict(f) for f in auditor.findings],
        "artifact_dir": str(run_dir.resolve()),
    }
    report_path = run_dir / "report.json"
    report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")

    print(json.dumps(report, ensure_ascii=False, indent=2))
    print(f"Report: {report_path.resolve()}")


if __name__ == "__main__":
    main()
