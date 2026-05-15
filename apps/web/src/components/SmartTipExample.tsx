/**
 * SmartTip 智能提示组件使用示例
 * 
 * 这个文件展示了如何在关键流程节点添加智能提示
 */

import SmartTip from './SmartTip';
import { useState } from 'react';

/**
 * 导出前提示组件示例
 * 在用户点击导出按钮时显示一致性检查提示
 */
export function ExportWithSmartTip() {
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  
  return (
    <div className="p-4">
      <button 
        onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
        className="px-4 py-2 bg-gray-100 rounded"
      >
        导出菜单
      </button>
      
      {isExportMenuOpen && (
        <SmartTip
          id="export-consistency-tip"
          message="Deo可以帮你检查角色一致性！在导出前让AI帮你审查一下你的作品。"
          assistantName="Deo"
          position="top-right"
          delay={500}
        />
      )}
    </div>
  );
}

/**
 * 所有智能提示的位置配置
 * 这里列出了应该添加提示的关键流程节点
 */
export const SMART_TIP_LOCATIONS = [
  {
    id: 'prime-character-tip',
    location: 'PrimeBrief 组件',
    trigger: '页面加载后2秒',
    message: 'Deo可以帮你完善角色设定！当你准备好创建角色时，它会提供深度的人物塑造建议。',
    assistant: 'Deo'
  },
  {
    id: 'element-timeline-tip',
    location: 'ElementOrganization 组件',
    trigger: '添加超过2个元素后',
    message: 'Dia可以帮你构思时代背景！在构建故事世界时，它能提供历史背景、文化元素等丰富的设定建议。',
    assistant: 'Dia'
  },
  {
    id: 'export-consistency-tip',
    location: 'App 组件（导出菜单）',
    trigger: '打开导出菜单时',
    message: 'Deo可以帮你检查角色一致性！在导出前让AI帮你审查一下你的作品。',
    assistant: 'Deo'
  }
];

export default function SmartTipGuide() {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">智能提示组件使用指南</h1>
      
      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-4">组件功能</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>非侵入式提示，用户可随时关闭</li>
            <li>本地存储记住用户的关闭决定</li>
            <li>支持延迟显示，不影响用户正常操作</li>
            <li>支持 Deo 和 Dia 两个助手角色</li>
            <li>可自定义位置（四个角落）</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-4">关键流程节点提示</h2>
          <div className="space-y-4">
            {SMART_TIP_LOCATIONS.map(tip => (
              <div key={tip.id} className="border p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                    {tip.assistant}
                  </span>
                  <h3 className="font-semibold">{tip.location}</h3>
                </div>
                <p className="text-gray-600 mb-2">{tip.message}</p>
                <p className="text-sm text-gray-400">触发条件：{tip.trigger}</p>
              </div>
            ))}
          </div>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-4">使用示例</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
{`import SmartTip from './SmartTip';

// 在你的组件中使用
function YourComponent() {
  return (
    <div>
      <SmartTip
        id="your-unique-tip-id"
        message="提示信息内容"
        assistantName="Deo" // 或 "Dia"
        position="bottom-right" // 可选位置
        delay={2000} // 延迟显示（毫秒）
      />
      {/* 其余组件内容 */}
    </div>
  );
}`}
          </pre>
        </section>
      </div>
    </div>
  );
}
