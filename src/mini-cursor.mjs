import 'dotenv/config';
import chalk from 'chalk';
import { ChatOpenAI } from'@langchain/openai';
import { HumanMessage, SystemMessage, ToolMessage } from'@langchain/core/messages';
import { executeCommandTool, listDirectoryTool, readFileTool, writeFileTool } from'./all-tools.mjs';

const model = new ChatOpenAI({ 
    modelName: "deepseek-v4-pro",

    apiKey: process.env.OPENAI_API_KEY,

    temperature: 0,

    configuration: {
        baseURL: process.env.OPENAI_BASE_URL,
    },

    modelKwargs: {
        thinking: {
            type: 'disabled',
        },
    },
});

const tools = [
    readFileTool,
    writeFileTool,
    executeCommandTool,
    listDirectoryTool,
];

// 绑定工具到模型
const modelWithTools = model.bindTools(tools);

// Agent 执行函数
async function runAgentWithTools(query, maxIterations = 30) {
    const messages = [
        new SystemMessage(`你是一个项目管理助手，使用工具完成任务。
      

当前工作目录: ${process.cwd()}

工具：
1. read_file: 读取文件
2. write_file: 写入文件
3. execute_command: 执行命令（支持 workingDirectory 参数）
4. list_directory: 列出目录

重要规则 - execute_command：
- workingDirectory 参数会自动切换到指定目录
- 当使用 workingDirectory 时，绝对不要在 command 中使用 cd
- 错误示例: { command: "cd react-todo-app && pnpm install", workingDirectory: "react-todo-app" }
这是错误的！因为 workingDirectory 已经在 react-todo-app 目录了，再 cd react-todo-app 会找不到目录
- 正确示例: { command: "pnpm install", workingDirectory: "react-todo-app" }
这样就对了！workingDirectory 已经切换到 react-todo-app，直接执行命令即可

回复要简洁，只说做了什么`),
            
        new HumanMessage(query)
    ];

    for (let i = 0; i < maxIterations; i++) {
        console.log(chalk.bgGreen(`⏳ 正在等待 AI 思考...`));
        const response = await modelWithTools.invoke(messages);
        messages.push(response);

        // 检查是否有工具调用
        if (!response.tool_calls || response.tool_calls.length === 0) {
            console.log(`\n✨ AI 最终回复:\n${response.content}\n`);
            return response.content;
        }

        // 执行工具调用
        for (const toolCall of response.tool_calls) {
            const foundTool = tools.find(t => t.name === toolCall.name);
            if (foundTool) {
                const toolResult = await foundTool.invoke(toolCall.args);
                messages.push(new ToolMessage({
                    content: toolResult,
                    tool_call_id: toolCall.id,
                }));
            }
        }
    }

    return messages[messages.length - 1].content;
}
const case1 = `创建少女心手帐风React TodoList网页应用：
1. 创建项目：pnpm create vite@latest react-todo-app --template react-ts --yes
2. 修改src/App.tsx，实现完整手帐风格TodoList功能：
 - 添加、删除、编辑、勾选完成状态
 - 分类筛选（全部/未完成/已完成）
 - 数据统计数量展示
 - localStorage本地数据持久化存储
 - 专属标签标记：🎸弹吉他、🎨画画学PS设计重要事项
3. 定制高颜值手帐样式：
 - 粉糯蜜桃渐变温柔背景
 - 软萌圆角便签卡片、柔和立体阴影
 - 可爱图标装饰、清爽配色
 - 按钮与列表悬浮灵动效果
4. 增添治愈系动画：
 - 新增/删除待办顺滑过渡入场离场动画
 - 全局使用CSS transitions流畅动效
5. 整理项目目录结构确认

注意统一使用pnpm管理依赖，完整实现全部功能，贴合少女手帐氛围感，元素融入吉他、绘画、设计相关可爱标识

后续在react-handbook-todo项目内执行：
1. 使用pnpm install快速安装项目依赖
2. 使用pnpm run dev启动本地开发服务器
`;

try {
  await runAgentWithTools(case1);
} catch (error) {
  console.error(`\n❌ 错误: ${error.message}\n`);
}