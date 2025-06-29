ComfyUI 中文翻译插件

本项目是基于 [AIGODLIKE-ComfyUI-Translation](https://github.com/AIGODLIKE/AIGODLIKE-ComfyUI-Translation) 的衍生分支，在此特别感谢原项目的开发者们对开源社区的杰出贡献。正是因为有人愿意成为先驱者，后人才能继承前人的薪火.

==视频展示==

https://github.com/user-attachments/assets/1ec662ba-da6c-4712-8be7-61168b08940e

## 项目背景

由于原作者已停止更新，而 ComfyUI 原生对中文的支持进展缓慢，特别是对自定义节点的适配，因此我决定继续维护这个项目，使其能够：

1. 兼容支持 ComfyUI 的最新版本
2. 添加新的翻译内容
3. 完善翻译体验

## 功能特点

- 更强大的简体中文汉化，暂不考虑多语言支持，个人精力有限只支持翻译中文。
- 在官方汉化的基础上嵌入额外的翻译内容，实现更完整的翻译。
- 在界面上提供便捷的翻译功能切换按钮，可以选择使用附加翻译和官方实现
（使用官方实现的意思就是关闭插件，翻译插件就不生效了，使用官方已经翻译的中文内容）
- 支持大部分常用自定义节点的翻译

## 使用建议

本项目主要面向使用 ComfyUI 最新版本的用户：

- 为确保最佳兼容性，项目将优先支持最新版 ComfyUI
- 可能会放弃对旧版本的兼容支持，推荐用以下内容：
【最新版 ComfyUI 内核】
【最新版本ComfyUI 前端依赖】
【最新版本整合包（至少半年内）或官方桌面版】
【整合包用户推荐使用谷歌或Edge浏览器确保最佳前端兼容性】

## 安装方法
方法1:
1. 下载本项目
2. 将整个文件夹放入 ComfyUI 的 `custom_nodes` 目录下
3. 重启 ComfyUI

方法2（推荐）：
直接在Manager或启动器中使用git进行安装
`https://github.com/1761696257/ComfyUI-DD-Translation.git`

方法3（推荐）：
直接在Manager中搜索插件名称安装

## 参与贡献

欢迎提交 Pull Request 或 Issue 来帮助改进翻译质量或添加新的翻译内容。

Github贡献者名单：msola-ht

## 更新日志

### v1.8.0 (2025-5-27)
更新ComfyUI-WanVideoWrapper KJ系列节点的完整翻译

### v1.7.1 (2025-5-21)
- 删除了ComfyUI-Manager的重启按钮的翻译，因为它会导致一直请求UI更新，与ComfyUI-Manager抢夺UI更新权限，现在修复了这个问题。
- 修复了模型侧边栏的一些显示BUG

### v1.7.0 (2025-5-20)
- 审查并合并 msola-ht贡献者给ComfyUI_LayerStyle_Advance 插件>Joy Beta系列节点的翻译
- 添加ComfyUI-GGUF完整翻译
- 进一步优化界面翻译
- 完善翻译贡献文档

### v1.6.0 (2025-5-12)
- 重构插件cg-use-everywhere 6.1最新版本的翻译内容

### v1.5.0 (2025-4-28)
- 新增 Comfyui-LG_GroupExecutor 插件的节点翻译补充，包括"🎈图像发送器"、"🎈图像接收器"、"🎈列表图像分割器"、"🎈列表蒙版分割器"、"🎈列表图像重复器"、"🎈列表蒙版重复器"和"🎈累积预览"等节点
- 修正了部分节点标题匹配问题，确保翻译正确应用到界面

### v1.4.1 (2025-4-27)
- 完善MTB面板的翻译覆盖率，修复部分切换选项卡时翻译丢失的问题

### v1.4.0 (2025-4-26)
- 移除了RG节点标签节点Label (rgthree)的翻译，避免功能异常和重复刷新问题
- 注意：标签节点现在将显示原始英文名称，用户需要通过搜索"Label"来找到此节点
- 补充完善 CG-Use-Everywhere 最新节点的翻译
- 新增 Comfyui-LG_GroupExecutor 插件的完整翻译，包括"🎈组执行器"、"🎈单次组执行器"、"🎈组重复执行器"和"🎈组发送器"四个节点

### v1.3.0 (2025-4-25) 【重大更新！！完全重构插件，性能提升巨大】
- 补充完善ComfyUI-Manager管理器界面翻译，包括筛选选项和表格标题
- 新增ComfyUI-Detail-Daemon插件的完整翻译，包括"细节魔灵图表Sigma值"、"细节魔灵采样器"、"倍增Sigma值"和"谎言Sigma采样器"四个节点
- 新增PixelOE插件的完整翻译，包括"预调整尺寸"、"轮廓扩展"和"像素轮廓增强"三个节点
- 完全重构代码结构，引入模块化设计，显著提高执行效率
- 新增utils.js工具模块，将通用功能抽离，减少代码重复
- 将XMLHttpRequest同步请求替换为异步Fetch API，避免主线程阻塞
- 优化MutationObserver使用方式，减少观察者数量，降低内存占用
- 重写DOM处理逻辑，减少不必要的重复处理
- 新增翻译数据缓存机制，基于localStorage存储翻译结果，减少重复加载，显著提升页面响应速度
- 【提供了详细的开发文档，便于社区贡献新的翻译内容】

### v1.2.0 (2025-4-24)
- 删除了ComfyUI-Easy-Use插件的所有类别和面板翻译，转为使用官方原生中文实现，并补充了ComfyUI-Easy-Use插件节点的额外翻译内容
- 删除了除简体中文以外的所有语言支持，简化插件结构
- 移除了设置面板中的语言选择选项，只保留顶部的语言切换按钮，使用更加直观
- 修复了ComfyUI-VideoHelperSuite的部分节点翻译问题，补充了VideoHelperSuite插件中视频加载和保存节点的额外翻译内容
- 完全重构翻译切换功能，改为"附加翻译"和"官方实现"两种模式切换

### v1.1.0 (2025-4-23)
- 删除大部分过时翻译内容，重构最新节点的翻译内容
- 对 KJNodes 节点进行补充修正，添加"中键默认添加节点"和"设定设置/获取节点菜单"的翻译
- 全面重构 rgthree-comfy 节点翻译，支持最新版本界面
- 为 Crystools 监视器界面添加缺失的翻译选项
- 重构 ComfyUI-Custom-Scripts 插件翻译，添加带有 🐍 符号的新选项翻译，补充工具提示和说明文本的翻译
- 修复了右键菜单中部分翻译失效的BUG，并添加了更多右键菜单项的翻译

### v1.0.0 (2025-4-22)
- 修复了最新版本 ComfyUI 的一些兼容性问题
- 修复 MTB Crystools VHS 视频节点的翻译问题
- 修复了设置界面中的部分错位问题
- 修复语言切换按钮的显示 BUG
