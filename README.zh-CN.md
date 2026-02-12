# PaperView Zotero 插件

英文版: [README.md](README.md)

## Demo 行为

- 在 Zotero 文献列表右键菜单增加 `Query` / `Concat Query` / `OCR Cache` / `Query History`
- 向本地服务 `/ingest` 发送元信息与 PDF 路径（仅存储型附件）
- 调用 `/query` 并打开返回的 `result_url`
- 查询过程中显示进度条（轮询 `/status/<job_id>`）
- 右键操作会自动探活并启动本地服务（若服务未运行）
- `OCR Cache` 仅处理当前选中的条目，并将结果增量合并回缓存
- 设置页提供运行时诊断与连通性检查（`Check Runtime`、`Test Connection`、`Restart Service`）

## 安装（打包成 .xpi）

1. 在仓库根目录执行：

```bash
./scripts/build_xpi.sh
```

2. 在 Zotero 插件管理器中拖入 `paperview-query.xpi` 安装

## 环境与依赖

- Zotero 8.x
- Python 3.10+（需在 PATH 中可用，用于创建 venv）

## 服务启动/停止（插件内）

- Zotero 顶部菜单：`Tools` -> `PaperView: Start Service` / `PaperView: Stop Service`
- 插件加载时会自动准备 Python 环境（首次可能较慢）
- Zotero 退出时会自动停止服务
- 右键执行 Query/OCR/History 时，若服务未启动会自动拉起

## Python 环境位置

- venv 路径：`<ZoteroProfile>/paperview/venv`

## 设置页（Zotero Settings -> PaperView）

- 打开 `Zotero Settings`，选择 `PaperView`
- 配置 `Service Base URL`、`API Key`、`LLM Base URL`、`Model` 和运行参数
- 修改后点击 `Save`
- 使用 `Check Runtime` 检查运行时可见性与 key 来源
- 使用 `Test Connection` 校验 `base_url` / `model` / `api_key` 的远程连通性
- 当本地服务正在运行时，使用 `Restart Service` 立即应用新配置

## LLM 配置（设置页 + 文件）

- 配置主入口：`Zotero Settings` -> `PaperView`
- 配置文件：`<ZoteroProfile>/paperview/llm_config.json`（基于保存的设置自动生成）

## LLM 配置字段

- `base_url`
- `model`
- `api_key`
- `temperature`
- `max_output_tokens`
- `concurrency`
- `retry_on_429`
- `retry_wait_s`
- `ocr_concurrency` 默认 `4`，用于控制 OCR（PDF->MD）并发数

## 支持的 API 风格

- OpenAI-compatible Chat Completions（`/chat/completions`）

## 日志位置（便于调试）

- 服务输出：`<ZoteroProfile>/paperview/logs/service.log`
- 环境安装：`<ZoteroProfile>/paperview/logs/env-install.log`
- pip 详细日志：`<ZoteroProfile>/paperview/logs/pip-install.log`

## 手动启动后端服务（可选）

```bash
python service/local_service.py --port 20341
```

## 查询输入格式

- 默认全文：`请总结方法`
- 指定章节：`[method] 总结方法`
- 支持多行输入（`Ctrl/Cmd + Enter` 提交，`Esc` 取消）

## 结果页增强

- 回答支持 Markdown 渲染/原文切换
- 历史查询支持删除当前记录与清空全部记录
