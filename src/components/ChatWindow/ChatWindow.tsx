import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Mic, Paperclip, MoreHorizontal } from 'lucide-react'
import { useAppStore } from '../../stores/appStore'
import { adpService } from '../../services/adpService'
import { ChatMessage, PandaMood } from '../../types'
import './ChatWindow.css'

interface ChatWindowProps {
  isVisible: boolean
  onClose?: () => void
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ isVisible, onClose }) => {
  const [inputValue, setInputValue] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { 
    messages, 
    isTyping, 
    addMessage, 
    setTyping, 
    setPandaMood, 
    updatePandaAction,
    setAnimating 
  } = useAppStore()

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  // 发送消息
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      content: inputValue,
      sender: 'user',
      timestamp: Date.now(),
      type: 'text'
    }

    addMessage(userMessage)
    setInputValue('')
    setTyping(true)
    setAnimating(true)
    updatePandaAction('思考中...')

    try {
      // 发送到ADP服务
      const response = await adpService.sendMessage(inputValue)
      
      // 更新熊猫状态
      if (response.mood) {
        setPandaMood(response.mood)
      }

      // 添加助手回复
      const assistantMessage: ChatMessage = {
        id: `msg_${Date.now() + 1}`,
        content: response.content,
        sender: 'assistant',
        timestamp: Date.now(),
        type: 'text',
        metadata: {
          actions: response.actions,
          suggestions: response.suggestions
        }
      }

      setTimeout(() => {
        addMessage(assistantMessage)
        setTyping(false)
        setAnimating(false)
        updatePandaAction('已回复')
      }, 1000) // 模拟思考时间

    } catch (error) {
      console.error('发送消息失败:', error)
      setTyping(false)
      setAnimating(false)
      setPandaMood(PandaMood.CONFUSED)
      updatePandaAction('出错了...')
    }
  }

  // 处理键盘事件
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // 处理建议点击
  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion)
    inputRef.current?.focus()
  }

  // 语音录制（模拟）
  const handleVoiceRecord = () => {
    setIsRecording(!isRecording)
    if (!isRecording) {
      updatePandaAction('听你说话...')
      setPandaMood(PandaMood.THINKING)
      // 这里可以集成语音识别API
      setTimeout(() => {
        setIsRecording(false)
        updatePandaAction('处理语音中...')
      }, 3000)
    }
  }

  if (!isVisible) return null

  return (
    <motion.div
      className="chat-window"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
    >
      {/* 聊天头部 */}
      <div className="chat-header">
        <div className="chat-title">
          <h3>与小竹子对话</h3>
          <span className="chat-status">
            {isTyping ? '正在输入...' : '在线'}
          </span>
        </div>
        {onClose && (
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        )}
      </div>

      {/* 消息列表 */}
      <div className="messages-container">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              className={`message ${message.sender}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="message-content">
                {message.content}
              </div>
              <div className="message-time">
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
              
              {/* 显示建议按钮 */}
              {message.sender === 'assistant' && message.metadata?.suggestions && (
                <div className="suggestions">
                  {message.metadata.suggestions.map((suggestion: string, index: number) => (
                    <button
                      key={index}
                      className="suggestion-button"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* 输入指示器 */}
        {isTyping && (
          <motion.div
            className="typing-indicator"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      <div className="chat-input-container">
        <div className="chat-input">
          <button 
            className="attachment-button"
            title="附件"
          >
            <Paperclip size={18} />
          </button>
          
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="输入消息..."
            className="message-input"
          />
          
          <button
            className={`voice-button ${isRecording ? 'recording' : ''}`}
            onClick={handleVoiceRecord}
            title={isRecording ? '停止录音' : '语音输入'}
          >
            <Mic size={18} />
          </button>
          
          <button
            className="send-button"
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
            title="发送"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </motion.div>
  )
}