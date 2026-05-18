import { spawn } from 'node:child_process';

const cwd = process.cwd();
const command = 'pnpm create vite@latest react-todo-app -- --template react-ts --yes';

const child = spawn(command, {
  cwd,
  stdio: 'inherit', // 实时输出到控制台
  shell: process.platform === 'win32' ? 'powershell.exe' : true,
});

let errorMsg = '';

child.on('error', (error) => {
  errorMsg = error.message;
});

child.on('close', (code) => {
  if (code === 0) {
    process.exit(0);
  } else {
    if (errorMsg) {
      console.error(`错误: ${errorMsg}`);
    }
    process.exit(code || 1);
  }
});

