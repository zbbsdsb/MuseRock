# PowerShell 脚本用于修改 App.tsx 文件，添加 SmartTip 功能

$appFile = "E:\ceaserzhao\github projects\MuseRock\apps\web\src\App.tsx"
$content = Get-Content $appFile -Raw

# 1. 在导入部分添加 SmartTip
$importSection = "import KeyboardShortcuts from './components/KeyboardShortcuts';
import { useCreativeLoopStore } from './stores/creativeLoop.store';"

$newImportSection = "import KeyboardShortcuts from './components/KeyboardShortcuts';
import SmartTip from './components/SmartTip';
import { useCreativeLoopStore } from './stores/creativeLoop.store';"

$content = $content -replace [regex]::Escape($importSection), $newImportSection

# 2. 在导出菜单部分添加 SmartTip 组件
# 查找导出菜单的位置并在适当位置添加提示
$exportMenuSection = '<div className="relative export-menu-container">
               <button 
                 onClick={() => setIsExportMenuOpen(!IsExportMenuOpen)}'

# 首先修复 IsExportMenuOpen 的拼写错误（应为 isExportMenuOpen）
$content = $content -replace 'IsExportMenuOpen', 'isExportMenuOpen'

# 然后查找主返回部分的开始位置，在其中添加 SmartTip
# 在 main 标签后面添加 SmartTip
$mainStart = '<main className="flex-1 flex flex-col p-8 md:p-12 lg:p-16 bg-brand-paper relative overflow-hidden transition-all">'
$newMainStart = '<main className="flex-1 flex flex-col p-8 md:p-12 lg:p-16 bg-brand-paper relative overflow-hidden transition-all">
        {isExportMenuOpen && (
          <SmartTip
            id="export-consistency-tip"
            message="Deo可以帮你检查角色一致性！在导出前让AI帮你审查一下你的作品。"
            assistantName="Deo"
            position="top-right"
            delay={500}
          />
        )}'

$content = $content -replace [regex]::Escape($mainStart), $newMainStart

# 写入修改后的内容
$content | Set-Content $appFile -NoNewline

Write-Host "App.tsx 文件已成功修改！" -ForegroundColor Green
Write-Host "已添加 SmartTip 导入和导出时的智能提示。" -ForegroundColor Cyan
