import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface SmartPandaFeaturesProps {
  onWorkflowTrigger: (workflow: string) => void
  onRagQuery: (query: string) => void
  onMcpAction: (action: string) => void
}

export const SmartPandaFeatures: React.FC<SmartPandaFeaturesProps> = ({
  onWorkflowTrigger,
  onRagQuery,
  onMcpAction
}) => {
  const [showSmartMenu, setShowSmartMenu] = useState(false)
  const [currentFeature, setCurrentFeature] = useState<string>('')

  // 腾讯云智能体功能菜单
  const smartFeatures = [
    {
      id: 'workflow',
      name: '工作流助手',
      icon: '⚡',
      description: '执行自动化工作流',
      actions: [
        { name: '文件整理', workflow: 'file_organization' },
        { name: '代码检查', workflow: 'code_review' },
        { name: '数据备份', workflow: 'data_backup' },
        { name: '系统优化', workflow: 'system_optimization' }
      ]
    },
    {
      id: 'rag',
      name: '知识问答',
      icon: '🧠',
      description: '基于RAG的智能问答',
      actions: [
        { name: '技术问题', query: '请帮我解决技术问题' },
        { name: '代码解释', query: '请解释这段代码的功能' },
        { name: '最佳实践', query: '请推荐最佳实践' },
        { name: '故障排查', query: '请帮我排查问题' }
      ]
    },
    {
      id: 'mcp',
      name: 'MCP工具',
      icon: '🔧',
      description: '模型控制协议工具',
      actions: [
        { name: '文件操作', action: 'file_operations' },
        { name: '网络请求', action: 'http_requests' },
        { name: '数据库查询', action: 'database_query' },
        { name: 'API调用', action: 'api_integration' }
      ]
    }
  ]

  const handleFeatureAction = (feature: any, action: any) => {
    setCurrentFeature(`${feature.name} - ${action.name}`)
    
    switch (feature.id) {
      case 'workflow':
        onWorkflowTrigger(action.workflow)
        break
      case 'rag':
        onRagQuery(action.query)
        break
      case 'mcp':
        onMcpAction(action.action)
        break
    }
    
    setShowSmartMenu(false)
  }

  return (
    <div className="smart-features">
      {/* 智能功能按钮 */}
      <motion.button
        className="smart-feature-button"
        onClick={() => setShowSmartMenu(!showSmartMenu)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        🤖 智能助手
      </motion.button>

      {/* 智能功能菜单 */}
      <AnimatePresence>
        {showSmartMenu && (
          <motion.div
            className="smart-features-menu"
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <div className="smart-menu-header">
              <h3>腾讯云智能体功能</h3>
              <button 
                className="close-button"
                onClick={() => setShowSmartMenu(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="smart-features-grid">
              {smartFeatures.map((feature) => (
                <div key={feature.id} className="smart-feature-card">
                  <div className="feature-header">
                    <span className="feature-icon">{feature.icon}</span>
                    <h4>{feature.name}</h4>
                  </div>
                  <p className="feature-description">{feature.description}</p>
                  
                  <div className="feature-actions">
                    {feature.actions.map((action, index) => (
                      <button
                        key={index}
                        className="feature-action-button"
                        onClick={() => handleFeatureAction(feature, action)}
                      >
                        {action.name}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 当前功能状态显示 */}
      <AnimatePresence>
        {currentFeature && (
          <motion.div
            className="current-feature-status"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="status-content">
              <span className="status-icon">⚡</span>
              <span className="status-text">正在执行: {currentFeature}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default SmartPandaFeatures
