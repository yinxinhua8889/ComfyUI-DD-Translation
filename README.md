# ComfyUI-DD-Translation

该项目是 [AIGODLIKE/AIGODLIKE-ComfyUI-Translation](https://github.com/AIGODLIKE/AIGODLIKE-ComfyUI-Translation) 的延续版本。

## 项目背景

由于原作者已停止更新，而 ComfyUI 原生对中文的支持进展缓慢，特别是对自定义节点的适配，因此我决定继续维护这个项目，使其能够：

1. 兼容支持 ComfyUI 的最新版本
2. 添加新的翻译内容
3. 完善翻译体验

## 使用建议

本项目主要面向使用 ComfyUI 最新版本的用户：

- 为确保最佳兼容性，项目将优先支持最新版 ComfyUI
- 可能会放弃对旧版本的兼容支持
- 建议与最新版 ComfyUI 内核一起使用

## 支持的语言

目前插件支持以下语言：
- 简体中文 (zh-CN)
- 繁体中文 (zh-TW)
- 日语 (ja-JP)
- 韩语 (ko-KR)
- 俄语 (ru-RU)
- 英语 (en-US，默认)

## 功能特点

- 界面菜单、节点名称和描述的多语言翻译
- 自动检测 ComfyUI 原生语言支持，避免重复翻译
- 在界面右上角提供便捷的语言切换功能
- 时刻保持兼容最新版 ComfyUI
- 支持大部分常用自定义节点的翻译

## 安装方法

1. 下载本项目
2. 将整个文件夹放入 ComfyUI 的 `custom_nodes` 目录下
3. 重启 ComfyUI

## 参与贡献

欢迎提交 Pull Request 或 Issue 来帮助改进翻译质量或添加新的翻译内容。

## 更新日志

### 2025-4-23
- 删除大部分过时翻译内容，重构最新节点的翻译内容。
- 对 KJNodes 节点进行补充修正，添加"中键默认添加节点"和"设定设置/获取节点菜单"的翻译
- 全面重构 rgthree-comfy 节点翻译，支持最新版本界面
- 为 Crystools 监视器界面添加缺失的翻译选项
- 重构 ComfyUI-Custom-Scripts 插件翻译，添加带有 🐍 符号的新选项翻译
- 补充 ComfyUI-Custom-Scripts 工具提示和说明文本的翻译

### 2025-4-22
- 修复了最新版本 ComfyUI 的一些兼容性问题
- 修复 MTB Crystools VHS 视频节点的翻译问题
- 修复了设置界面中的部分错位问题
- 修复语言切换按钮的显示 BUG
- 优化了插件整体性能
