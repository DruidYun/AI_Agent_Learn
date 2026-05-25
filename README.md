# AI Agent 开发踩坑记录

## 1. 换电脑环境后代码跑不起来

家里电脑能正常运行。

到了公司电脑后：

- npm/pnpm 无法执行
- PowerShell 权限问题
- shell 命令报错
- Runtime 不一致
- 同样代码环境直接炸

发现 AI Agent 最大问题之一其实不是代码。

而是：

# Runtime 环境。

---

## 2. Windows PowerShell 坑

报错：

```bash
npm.ps1 cannot be loaded because running scripts is disabled
```

原因：

PowerShell 默认禁止脚本执行。

而 npm/pnpm 实际会调用：

```powershell
npm.ps1
pnpm.ps1
```

所以被系统拦截。

---

### 解决方案

不要：

```js
shell: 'powershell.exe'
```

改成：

```js
shell: true
```

或者直接统一 Git Bash。

---

## 3. execute_command 工具设计问题

最开始：

```js
const [cmd, ...args] = command.split(' ');
```

后来发现这是大坑。

比如：

```bash
git commit -m "hello world"
```

会被错误拆分。

---

### 修复

直接：

```js
spawn(command, {
  shell: true
})
```

不要手动 split。

---

## 4. Shell Runtime 混乱

AI 一会儿：

```bash
ls -la
```

一会儿：

```powershell
dir /a
```

导致：

- cmd
- powershell
- bash

命令全部混乱。

最后决定：

# 统一 bash runtime。

---

### 最终方案

```js
shell:
  process.platform === 'win32'
    ? 'C:/Program Files/Git/bin/bash.exe'
    : true
```

之后 AI 统一：

```bash
ls
pwd
rm
mkdir
cat
```

---

## 5. Vite CLI 交互卡死

执行：

```bash
pnpm create vite@latest
```

会出现：

```text
Install with pnpm and start now?
```

还有：

```text
Target directory already exists
```

导致 Agent 卡死。

---

### 解决方案

AI Runtime 不应该操作交互菜单。

而应该：

# 提前处理环境。

比如：

### 自动删除目录

```js
fs.rmSync(targetPath, {
  recursive: true,
  force: true,
});
```

### 添加：

```bash
--yes
```

避免 CLI 交互。

---

## 6. dotenv 问题

报错：

```bash
ERR_MODULE_NOT_FOUND
Cannot find package 'dotenv'
```

解决：

```bash
pnpm add dotenv
```
# AI Agent 开发踩坑记录

## 1. 换电脑环境后代码跑不起来

家里电脑能正常运行。

到了公司电脑后：

- npm/pnpm 无法执行
- PowerShell 权限问题
- shell 命令报错
- Runtime 不一致
- 同样代码环境直接炸

发现 AI Agent 最大问题之一其实不是代码。

而是：

# Runtime 环境。

---

## 2. Windows PowerShell 坑

报错：

```bash
npm.ps1 cannot be loaded because running scripts is disabled
```

原因：

PowerShell 默认禁止脚本执行。

而 npm/pnpm 实际会调用：

```powershell
npm.ps1
pnpm.ps1
```

所以被系统拦截。

---

### 解决方案

不要：

```js
shell: 'powershell.exe'
```

改成：

```js
shell: true
```

或者直接统一 Git Bash。

---

## 3. execute_command 工具设计问题

最开始：

```js
const [cmd, ...args] = command.split(' ');
```

后来发现这是大坑。

比如：

```bash
git commit -m "hello world"
```

会被错误拆分。

---

### 修复

直接：

```js
spawn(command, {
  shell: true
})
```

不要手动 split。

---

## 4. Shell Runtime 混乱

AI 一会儿：

```bash
ls -la
```

一会儿：

```powershell
dir /a
```

导致：

- cmd
- powershell
- bash

命令全部混乱。

最后决定：

# 统一 bash runtime。

---

### 最终方案

```js
shell:
  process.platform === 'win32'
    ? 'C:/Program Files/Git/bin/bash.exe'
    : true
```

之后 AI 统一：

```bash
ls
pwd
rm
mkdir
cat
```

---

## 5. Vite CLI 交互卡死

执行：

```bash
pnpm create vite@latest
```

会出现：

```text
Install with pnpm and start now?
```

还有：

```text
Target directory already exists
```

导致 Agent 卡死。

---

### 解决方案

AI Runtime 不应该操作交互菜单。

而应该：

# 提前处理环境。

比如：

### 自动删除目录

```js
fs.rmSync(targetPath, {
  recursive: true,
  force: true,
});
```

### 添加：

```bash
--yes
```

避免 CLI 交互。

---

## 6. dotenv 问题

报错：

```bash
ERR_MODULE_NOT_FOUND
Cannot find package 'dotenv'
```

解决：

```bash
pnpm add dotenv
```

然后：

```js
import 'dotenv/config';
```

---

## 7. .env 坑

Windows 隐藏扩展名。

导致：

```text
.env.txt
```

误以为：

```text
.env
```

---

### 正确结构

```text
project/
├── .env
├── package.json
├── src/
```

---

## 8. OpenAI API Key 鉴权问题

报错：

```text
401 Invalid API Key
```

后来发现：

# ChatGPT Plus ≠ OpenAI API

完全不是一个东西。

---

## 9. 小米 MiMo 模型接入

一开始配置：

```env
OPENAI_BASE_URL=https://token-plan-cn.xiaomimimo.com/v1
```

一直：

```text
401
MODEL_AUTHENTICATION
```

后来发现：

BaseURL 写错了。

---

### 正确：

```env
OPENAI_BASE_URL=https://api.xiaomimimo.com/v1
```

---

## 10. 小米 MiMo 生成网页失败

尝试：

```text
mimo-v2.5-pro
```

生成 React Todo 网页。

效果一般。

复杂 Tool Calling 不稳定。

网页生成过程中容易中断。

后面切换：

```text
deepseek-v4-pro
```

继续测试。

---

## 11. DeepSeek Thinking 模型问题

使用：

```js
modelName: "deepseek-v4-pro"
```

出现报错：

```text
The `reasoning_content` in the thinking mode must be passed back to the API.
```

---

### 原因

`deepseek-v4-pro`

属于：

# Reasoning / Thinking 模型

会返回：

```json
reasoning_content
```

下一轮对话必须原样带回。

---

### 问题本质

LangChain Agent Loop：

```js
messages.push(response)
```

没有正确处理：

```js
additional_kwargs.reasoning_content
```

导致：

- Tool Calling 中断
- Agent 状态丢失
- Runtime 报错

---

### 临时解决方案

关闭 thinking：

```js
modelKwargs: {
  thinking: {
    type: 'disabled',
  },
},
```

---

## 12. 逐渐理解 AI Agent 真正难点

以前以为：

# AI Agent = GPT API

后来发现真正难的是：

- Runtime
- Shell
- Tool Calling
- Terminal 控制
- CLI 自动化
- 文件系统
- Cross-platform
- Recovery
- Sandbox
- Reasoning State

GPT 可能只占 20%。

---

## 13. 当前项目本质

现在已经不只是：

# 学 JavaScript

而是在做：

# Mini Cursor / Mini Claude Code Runtime

包括：

- Tool Orchestration
- Shell Agent
- File Agent
- AI Runtime
- 自动化工程
然后：

```js
import 'dotenv/config';
```

---

## 7. .env 坑

Windows 隐藏扩展名。

导致：

```text
.env.txt
```

误以为：

```text
.env
```

---

### 正确结构

```text
project/
├── .env
├── package.json
├── src/
```

---

## 8. OpenAI API Key 鉴权问题

报错：

```text
401 Invalid API Key
```

后来发现：

# ChatGPT Plus ≠ OpenAI API

完全不是一个东西。

---

## 9. 小米 MiMo 模型接入

一开始配置：

```env
OPENAI_BASE_URL=https://token-plan-cn.xiaomimimo.com/v1
```

一直：

```text
401
MODEL_AUTHENTICATION
```

后来发现：

BaseURL 写错了。

---

### 正确：

```env
OPENAI_BASE_URL=https://api.xiaomimimo.com/v1
```

---

## 10. 小米 MiMo 生成网页失败

尝试：

```text
mimo-v2.5-pro
```

生成 React Todo 网页。

效果一般。

复杂 Tool Calling 不稳定。

网页生成过程中容易中断。

后面切换：

```text
deepseek-v4-pro
```

继续测试。

---

## 11. DeepSeek Thinking 模型问题

使用：

```js
modelName: "deepseek-v4-pro"
```

出现报错：

```text
The `reasoning_content` in the thinking mode must be passed back to the API.
```

---

### 原因

`deepseek-v4-pro`

属于：

# Reasoning / Thinking 模型

会返回：

```json
reasoning_content
```

下一轮对话必须原样带回。

---

### 问题本质

LangChain Agent Loop：

```js
messages.push(response)
```

没有正确处理：

```js
additional_kwargs.reasoning_content
```

导致：

- Tool Calling 中断
- Agent 状态丢失
- Runtime 报错

---

### 临时解决方案

关闭 thinking：

```js
modelKwargs: {
  thinking: {
    type: 'disabled',
  },
},
```

---

## 12. 逐渐理解 AI Agent 真正难点

以前以为：

# AI Agent = GPT API

后来发现真正难的是：

- Runtime
- Shell
- Tool Calling
- Terminal 控制
- CLI 自动化
- 文件系统
- Cross-platform
- Recovery
- Sandbox
- Reasoning State

GPT 可能只占 20%。

---

## 13. 当前项目本质

现在已经不只是：

# 学 JavaScript

而是在做：

# Mini Cursor / Mini Claude Code Runtime

包括：

- Tool Orchestration
- Shell Agent
- File Agent
- AI Runtime
- 自动化工程