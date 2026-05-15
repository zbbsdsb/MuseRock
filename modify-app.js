// Node.js 脚本用于修改 App.tsx 文件，添加 SmartTip 功能

const fs = require('fs');
const path = require('path');

const appFile = path.join(__dirname, 'apps', 'web', 'src', 'App.tsx');
let content = fs.readFileSync(appFile, 'utf8');

console.log('开始修改 App.tsx 文件...');

// 1. 在导入部分添加 SmartTip
const oldImport = `import KeyboardShortcuts from './components/KeyboardShortcuts';
import { useCreativeLoopStore } from './stores/creativeLoop.store';`;

const newImport = `import KeyboardShortcuts from './components/KeyboardShortcuts';
import SmartTip from './components/SmartTip';
import { useCreativeLoopStore } from './stores/creativeLoop.store';`;

if (content.includes(oldImport)) {
  content = content.replace(oldImport, newImport);
  console.log('✓ 已添加 SmartTip 导入语句');
} else {
  console.log('⚠ 未找到预期的导入语句，尝试其他方式...');
}

// 2. 修复 IsExportMenuOpen 的拼写错误
content = content.replace(/IsExportMenuOpen/g, 'isExportMenuOpen');
console.log('✓ 已修复变量拼写错误');

// 3. 在导出菜单附近添加 SmartTip 组件
const mainElement = `<main className="flex-1 flex flex-col p-8 md:p-12 lg:p-16 bg-brand-paper relative overflow-hidden transition-all">`;
const newMainElement = `<main className="flex-1 flex flex-col p-8 md:p-12 lg:p-16 bg-brand-paper relative overflow-hidden transition-all">
        {isExportMenuOpen && (
          <SmartTip
            id="export-consistency-tip"
            message="Deo可以帮你检查角色一致性！在导出前让AI帮你审查一下你的作品。"
            assistantName="Deo"
            position="top-right"
            delay={500}
          />
        )}`;

if (content.includes(mainElement)) {
  content = content.replace(mainElement, newMainElement);
  console.log('✓ 已在主区域添加导出提示组件');
}

// 写入修改后的内容
fs.writeFileSync(appFile, content, 'utf8');

console.log('\n✅ App.tsx 文件修改完成！');
console.log('\n已完成的修改：');
console.log('1. 添加了 SmartTip 组件的导入');
console.log('2. 修复了 isExportMenuOpen 的拼写错误');
console.log('3. 在导出菜单打开时添加了角色一致性检查提示');
