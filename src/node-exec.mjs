import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const cwd = process.cwd();

const projectName = 'react-todo-app';

const targetPath = path.join(cwd, projectName);

// 如果目录存在，自动删除
if (fs.existsSync(targetPath)) {
  console.log(`删除已有目录: ${projectName}`);

  fs.rmSync(targetPath, {
    recursive: true,
    force: true,
  });
}

const command =
  'pnpm create vite@latest react-todo-app --template react-ts --yes';

const child = spawn(command, {
  cwd,
  stdio: 'inherit',
  shell: true,
});

child.on('close', (code) => {
  process.exit(code || 0);
});