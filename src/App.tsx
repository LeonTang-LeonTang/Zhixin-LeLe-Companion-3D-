import React, { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getCurrentWindow } from '@tauri-apps/api/window'
// import { EnterpriseManager, defaultConfig } from './enterprise/EnterpriseManager'
import { sendTencentChat, generateSessionId, downloadAndPlayAudio } from './services/tencentSSEChat'
import './App.css'

// 导入图片资源 - 更新为心理健康陪伴人物
import leleNormal from './assets/images/lele-normal.png'
import leleWalking from './assets/images/lele-walking.png'
import leleSmile from './assets/images/lele-smile.png'
// 心理健康陪伴人物状态类型
type CompanionState = 'normal' | 'walking' | 'smile' | 'meditating' | 'sleeping' | 'reading' | 'breathing' | 'happy' | 'calm' | 'encouraging' | 'listening'

// 心理健康功能类型
type MentalHealthFunction = 'chat' | 'meditation' | 'breathing' | 'mood' | 'journal' | 'reminder' | 'music' | 'settings'

// 字幕消息类型
interface SubtitleMessage {
  id: string
  text: string
  duration: number
  type: 'normal' | 'mental_health' | 'mood' | 'encouragement'
}

function App() {
  const [companionState, setCompanionState] = useState<CompanionState>('normal')
  const [isDragging, setIsDragging] = useState(false)
  const [showContextMenu, setShowContextMenu] = useState(false)
  const [showFunctionWindow, setShowFunctionWindow] = useState<MentalHealthFunction | null>(null)
  const [position, setPosition] = useState({ x: 525, y: 325 }) // 居中位置
  const [isAnimating, setIsAnimating] = useState(false)
  const [currentSubtitle, setCurrentSubtitle] = useState<SubtitleMessage | null>(null)
  const [mood, setMood] = useState<'happy' | 'calm' | 'anxious' | 'sad' | 'excited' | 'peaceful'>('calm')
  const [isAutoChanging, setIsAutoChanging] = useState(true)
  // const [enterpriseManager] = useState(() => new EnterpriseManager(defaultConfig))
  const [chatMessages, setChatMessages] = useState<Array<{id: string, text: string, type: 'user' | 'ai', timestamp: Date}>>([])
  const [chatInput, setChatInput] = useState('')
  const [currentMood, setCurrentMood] = useState<'anxious' | 'sad' | 'stressed' | 'lonely' | 'overwhelmed' | 'okay'>('okay')
  const sseSessionIdRef = useRef<string>(generateSessionId())
  
  const dragRef = useRef<HTMLDivElement>(null)
  const autoChangeInterval = useRef<NodeJS.Timeout | null>(null)
  const subtitleTimeout = useRef<NodeJS.Timeout | null>(null)
  // const longPressTimer = useRef<NodeJS.Timeout | null>(null)
  const lastClickTime = useRef<number>(0)
  const randomMoveInterval = useRef<NodeJS.Timeout | null>(null)
  const dragStart = useRef<{ x: number, y: number }>({ x: 0, y: 0 })
  const [screenSize, setScreenSize] = useState({ width: 1200, height: 800 })

  // 心理健康陪伴人物状态配置
  const companionStates = {
    normal: { image: leleNormal, name: '陪伴中', description: '我在这里陪伴你' },
    walking: { image: leleWalking, name: '散步中', description: '一起走走吧，放松一下' },
    smile: { image: leleSmile, name: '微笑中', description: '你的笑容让我也很开心' },
    meditating: { image: leleNormal, name: '冥想中', description: '让我们静下心来' },
    sleeping: { image: leleNormal, name: '休息中', description: '好好休息，我会守护你' },
    reading: { image: leleNormal, name: '阅读中', description: '一起学习心理健康知识' },
    breathing: { image: leleNormal, name: '呼吸练习', description: '跟着我一起深呼吸' },
    happy: { image: leleNormal, name: '开心', description: '看到你开心我也很开心' },
    calm: { image: leleNormal, name: '平静', description: '保持内心的平静' },
    encouraging: { image: leleNormal, name: '鼓励中', description: '你很棒，继续加油' },
    listening: { image: leleNormal, name: '倾听中', description: '我在认真听你说话' }
  }

  // 心理健康功能配置
  const mentalHealthFunctions = {
    chat: { 
      icon: '💬', 
      name: '心理陪伴对话', 
      description: '与乐乐进行心理健康相关的对话，获得情感支持和专业建议' 
    },
    meditation: { 
      icon: '🧘', 
      name: '冥想引导', 
      description: '跟随乐乐进行正念冥想，缓解压力和焦虑' 
    },
    breathing: { 
      icon: '🌬️', 
      name: '呼吸练习', 
      description: '进行深呼吸练习，帮助放松身心' 
    },
    mood: { 
      icon: '😊', 
      name: '心情记录', 
      description: '记录和分析你的情绪变化，了解自己的心理状态' 
    },
    journal: { 
      icon: '📝', 
      name: '情绪日记', 
      description: '写下你的想法和感受，释放内心压力' 
    },
    reminder: { 
      icon: '⏰', 
      name: '健康提醒', 
      description: '设置心理健康提醒，保持良好习惯' 
    },
    music: { 
      icon: '🎵', 
      name: '治愈音乐', 
      description: '播放舒缓音乐，营造放松氛围' 
    },
    settings: { 
      icon: '⚙️', 
      name: '个性化设置', 
      description: '自定义陪伴体验和心理健康目标' 
    }
  }

  // 心理健康鼓励语句
  const encouragementMessages = [
    '你很棒，今天又进步了一点！',
    '每个人都有自己的节奏，不要着急',
    '你的感受是真实的，值得被重视',
    '困难只是暂时的，你比想象中更坚强',
    '给自己一些时间，慢慢来也没关系',
    '你已经做得很好了，为自己骄傲吧',
    '每一次尝试都是成长，你很勇敢',
    '你的努力我都看在眼里，继续加油',
    '相信自己，你有无限的可能',
    '今天也要好好照顾自己哦'
  ]

  // 显示字幕
  const showSubtitle = (message: SubtitleMessage) => {
    setCurrentSubtitle(message)
    if (subtitleTimeout.current) {
      clearTimeout(subtitleTimeout.current)
    }
    subtitleTimeout.current = setTimeout(() => {
      setCurrentSubtitle(null)
    }, message.duration)
  }

  // 自动状态变化 - 心理健康相关
  const autoChangeState = () => {
    if (isDragging) return
    
    const states: CompanionState[] = ['normal', 'walking', 'smile', 'meditating', 'breathing', 'listening', 'encouraging']
    const currentIndex = states.indexOf(companionState)
    const nextIndex = (currentIndex + 1) % states.length
    const nextState = states[nextIndex]
    
    setCompanionState(nextState)
    setIsAnimating(true)
    
    setTimeout(() => setIsAnimating(false), 600)
    
    showSubtitle({
      id: Date.now().toString(),
      text: companionStates[nextState].description,
      duration: 3000,
      type: 'mental_health'
    })
  }

  // 随机移动陪伴人物
  const randomMoveCompanion = () => {
    if (isDragging) return
    
    const newX = Math.random() * (screenSize.width - 150)
    const newY = Math.random() * (screenSize.height - 150)
    setPosition({ x: newX, y: newY })
    
    showSubtitle({
      id: Date.now().toString(),
      text: '我换个位置陪伴你...',
      duration: 2000,
      type: 'mood'
    })
  }

  // 鼠标按下开始拖拽
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y }
    setIsDragging(true)
    setShowContextMenu(false)
    setShowFunctionWindow(null)
  }

  // 鼠标移动拖拽
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    
    const newX = Math.max(0, Math.min(e.clientX - dragStart.current.x, screenSize.width - 150))
    const newY = Math.max(0, Math.min(e.clientY - dragStart.current.y, screenSize.height - 150))
    setPosition({ x: newX, y: newY })
  }

  // 鼠标释放结束拖拽
  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // 右键菜单
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    setShowContextMenu(!showContextMenu)
    setShowFunctionWindow(null)
  }

  // 点击陪伴人物
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    const now = Date.now()
    
    if (now - lastClickTime.current < 300) {
      // 双击打开心理陪伴对话
      openMentalHealthFunction('chat')
    } else {
      // 单击切换状态
      const states: CompanionState[] = ['normal', 'walking', 'smile', 'meditating', 'breathing', 'listening', 'encouraging']
      const currentIndex = states.indexOf(companionState)
      const nextIndex = (currentIndex + 1) % states.length
      const nextState = states[nextIndex]
      
      setCompanionState(nextState)
      setIsAnimating(true)
      
      setTimeout(() => setIsAnimating(false), 600)
      
      showSubtitle({
        id: Date.now().toString(),
        text: companionStates[nextState].description,
        duration: 3000,
        type: 'mental_health'
      })
    }
    
    lastClickTime.current = now
  }

  // 打开心理健康功能
  const openMentalHealthFunction = (func: MentalHealthFunction) => {
    setShowFunctionWindow(func)
    setShowContextMenu(false)
    
    showSubtitle({
      id: Date.now().toString(),
      text: `打开${mentalHealthFunctions[func].name}`,
      duration: 2000,
      type: 'mental_health'
    })
  }

  // 改变心情
  const changeMood = (newMood: 'happy' | 'calm' | 'anxious' | 'sad' | 'excited' | 'peaceful') => {
    setMood(newMood)
    setShowContextMenu(false)
    
    const moodTexts = {
      happy: '我很开心！看到你开心我也很开心！',
      calm: '我很平静，让我们一起保持内心的宁静',
      anxious: '我感受到你的焦虑，让我来陪伴你',
      sad: '我感受到你的悲伤，我会一直陪在你身边',
      excited: '我很兴奋！让我们一起分享这份喜悦',
      peaceful: '我很平和，让我们享受这份宁静'
    }
    
    showSubtitle({
      id: Date.now().toString(),
      text: moodTexts[newMood],
      duration: 3000,
      type: 'mood'
    })
  }

  // 切换自动状态变化
  const toggleAutoChange = () => {
    setIsAutoChanging(!isAutoChanging)
    setShowContextMenu(false)
    
    showSubtitle({
      id: Date.now().toString(),
      text: isAutoChanging ? '停止自动陪伴' : '开始自动陪伴',
      duration: 2000,
      type: 'normal'
    })
  }

  // 发送聊天消息 - 使用腾讯云SSE接口流式回复
  const sendChatMessage = async () => {
    if (!chatInput.trim()) return
    
    const userMessage = {
      id: Date.now().toString(),
      text: chatInput,
      type: 'user' as const,
      timestamp: new Date()
    }
    
    setChatMessages(prev => [...prev, userMessage])
    setChatInput('')
    
    try {
      await sendTencentChat(userMessage.text, sseSessionIdRef.current, {
        onPartial: (t) => {
          setChatMessages(prev => {
            const last = prev[prev.length - 1]
            if (last && last.type === 'ai') {
              const copy = [...prev]
              copy[copy.length - 1] = { ...last, text: t }
              return copy
            }
            return [
              ...prev,
              { id: (Date.now() + 1).toString(), text: t, type: 'ai' as const, timestamp: new Date() }
            ]
          })
        },
        onFinal: async (t, audioUrl) => {
          setChatMessages(prev => {
            const last = prev[prev.length - 1]
            if (last && last.type === 'ai') {
              const copy = [...prev]
              copy[copy.length - 1] = { ...last, text: t }
              return copy
            }
            return [
              ...prev,
              { id: (Date.now() + 2).toString(), text: t, type: 'ai' as const, timestamp: new Date() }
            ]
          })
          try {
            if (audioUrl) {
              await downloadAndPlayAudio(audioUrl)
            }
          } catch (e) {
            console.error('音频播放失败:', e)
          }
        },
        onError: (err) => {
          console.error('SSE chat failed:', err)
          const errorMessage = {
            id: (Date.now() + 3).toString(),
            text: `抱歉，出错了：${err}`,
            type: 'ai' as const,
            timestamp: new Date()
          }
          setChatMessages(prev => [...prev, errorMessage])
        }
      })
    } catch (error) {
      console.error('SSE chat exception:', error)
      const errorMessage = {
        id: (Date.now() + 4).toString(),
        text: '抱歉，请求异常，请稍后再试。',
        type: 'ai' as const,
        timestamp: new Date()
      }
      setChatMessages(prev => [...prev, errorMessage])
    }
  }

  // 开始冥想练习
  const startMeditation = () => {
    setCompanionState('meditating')
    showSubtitle({
      id: Date.now().toString(),
      text: '让我们开始冥想吧，闭上眼睛，专注于呼吸...',
      duration: 5000,
      type: 'mental_health'
    })
  }

  // 开始呼吸练习
  const startBreathing = () => {
    setCompanionState('breathing')
    showSubtitle({
      id: Date.now().toString(),
      text: '跟着我的节奏，吸气...呼气...慢慢来...',
      duration: 5000,
      type: 'mental_health'
    })
  }

  // 随机鼓励
  const randomEncouragement = () => {
    const message = encouragementMessages[Math.floor(Math.random() * encouragementMessages.length)]
    showSubtitle({
      id: Date.now().toString(),
      text: message,
      duration: 4000,
      type: 'encouragement'
    })
  }

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (_event: MouseEvent) => {
      setShowContextMenu(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // 自动状态变化定时器
  useEffect(() => {
    if (isAutoChanging) {
      autoChangeInterval.current = setInterval(autoChangeState, 10000) // 每10秒变化一次
    } else {
      if (autoChangeInterval.current) {
        clearInterval(autoChangeInterval.current)
        autoChangeInterval.current = null
      }
    }
    
    return () => {
      if (autoChangeInterval.current) {
        clearInterval(autoChangeInterval.current)
      }
    }
  }, [isAutoChanging, companionState])

  // 随机移动定时器
  useEffect(() => {
    randomMoveInterval.current = setInterval(randomMoveCompanion, 20000) // 每20秒随机移动一次
    
    return () => {
      if (randomMoveInterval.current) {
        clearInterval(randomMoveInterval.current)
      }
    }
  }, [isDragging, screenSize])

  // 随机鼓励定时器
  useEffect(() => {
    const encouragementInterval = setInterval(() => {
      if (Math.random() < 0.3) { // 30%概率显示鼓励
        randomEncouragement()
      }
    }, 30000) // 每30秒检查一次
    
    return () => clearInterval(encouragementInterval)
  }, [])

  // 初始化
  useEffect(() => {
    console.log('🚀 乐乐心理健康陪伴桌宠启动中...')
    

    
    const initializeApp = async () => {
      try {
        const window = getCurrentWindow()
        await window.setAlwaysOnTop(true)
        await window.show()
        await window.setFocus()
        
        // 获取实际窗口尺寸
        const size = await window.innerSize()
        setScreenSize({ width: size.width, height: size.height })
        
        // 设置初始位置在窗口中央
        setPosition({ 
          x: (size.width - 150) / 2, 
          y: (size.height - 150) / 2 
        })
        
        console.log('✅ 窗口已设置为可见，尺寸:', size)
        
        // 显示欢迎字幕
        showSubtitle({
          id: 'welcome',
          text: '你好！我是乐乐，你的心理健康陪伴伙伴！',
          duration: 5000,
          type: 'mental_health'
        })
      } catch (error) {
        console.error('❌ 设置窗口可见性失败:', error)
      }
    }
    
    // 监听窗口尺寸变化
    const handleResize = async () => {
      try {
        const window = getCurrentWindow()
        const size = await window.innerSize()
        setScreenSize({ width: size.width, height: size.height })
      } catch (error) {
        console.error('❌ 获取窗口尺寸失败:', error)
      }
    }
    
    initializeApp()
    
    // 监听窗口尺寸变化
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // 计算UI元素位置 - 优化字幕位置在人物正上方
  const getSubtitlePosition = () => {
    const left = Math.max(10, Math.min(position.x + 75 - 150, screenSize.width - 310)) // 居中对齐人物
    const top = Math.max(10, position.y - 60) // 直接在人物上方
    return { left, top }
  }

  const getContextMenuPosition = () => {
    const left = Math.max(10, Math.min(position.x + 160, screenSize.width - 210))
    const top = Math.max(10, Math.min(position.y + 50, screenSize.height - 250))
    return { left, top }
  }

  const getFunctionWindowPosition = () => {
    const left = Math.max(10, Math.min(position.x - 200, screenSize.width - 410))
    const top = Math.max(10, Math.min(position.y - 200, screenSize.height - 450))
    return { left, top }
  }

  return (
    <div className="app-container">
      {/* 乐乐心理健康陪伴人物主体 */}
      <div 
        className="companion-container"
        ref={dragRef}
        style={{
          position: 'absolute',
          left: position.x,
          top: position.y,
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onContextMenu={handleContextMenu}
        onClick={handleClick}
      >
        <motion.img 
          src={companionStates[companionState].image}
          alt="乐乐心理健康陪伴伙伴"
          className="companion-image"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ 
            opacity: 1, 
            scale: isAnimating ? 1.2 : 1,
            rotate: isAnimating ? [0, 10, -10, 0] : 0
          }}
          transition={{ 
            duration: isAnimating ? 0.6 : 1,
            rotate: { duration: 0.6 }
          }}
        />
        
        {/* 状态指示器 */}
        <div className="state-indicator">
          {companionStates[companionState].name}
        </div>
        
        {/* 心情指示器 */}
        <div className={`mood-indicator mood-${mood}`}>
          {mood === 'happy' && '😊'}
          {mood === 'calm' && '😌'}
          {mood === 'anxious' && '😰'}
          {mood === 'sad' && '😢'}
          {mood === 'excited' && '🎉'}
          {mood === 'peaceful' && '🧘'}
        </div>

        {/* 拖拽提示 */}
        <div className="drag-hint">
          拖拽移动
        </div>
      </div>

      {/* 字幕显示 */}
      <AnimatePresence>
        {currentSubtitle && (
          <motion.div 
            className="subtitle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: 'absolute',
              left: getSubtitlePosition().left,
              top: getSubtitlePosition().top,
              zIndex: 1000
            }}
          >
            <div className={`subtitle-content ${currentSubtitle.type}`}>
              {currentSubtitle.text}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 右键菜单 */}
      <AnimatePresence>
        {showContextMenu && (
          <motion.div 
            className="context-menu"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            style={{
              position: 'absolute',
              left: getContextMenuPosition().left,
              top: getContextMenuPosition().top,
              zIndex: 1001
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="menu-section">基本设置</div>
            <div className="menu-item" onClick={(e) => { e.stopPropagation(); toggleAutoChange(); }}>
              {isAutoChanging ? '⏸️ 停止自动陪伴' : '▶️ 开始自动陪伴'}
            </div>
            <div className="menu-item" onClick={(e) => { e.stopPropagation(); setCompanionState('normal'); }}>
              💚 重置状态
            </div>
            
            <div className="menu-separator" />
            <div className="menu-section">心情设置</div>
            <div className="menu-item" onClick={(e) => { e.stopPropagation(); changeMood('happy'); }}>
              😊 开心
            </div>
            <div className="menu-item" onClick={(e) => { e.stopPropagation(); changeMood('calm'); }}>
              😌 平静
            </div>
            <div className="menu-item" onClick={(e) => { e.stopPropagation(); changeMood('anxious'); }}>
              😰 焦虑
            </div>
            <div className="menu-item" onClick={(e) => { e.stopPropagation(); changeMood('sad'); }}>
              😢 悲伤
            </div>
            <div className="menu-item" onClick={(e) => { e.stopPropagation(); changeMood('excited'); }}>
              🎉 兴奋
            </div>
            <div className="menu-item" onClick={(e) => { e.stopPropagation(); changeMood('peaceful'); }}>
              🧘 平和
            </div>
            
            <div className="menu-separator" />
            <div className="menu-section">心理健康功能</div>
            {Object.entries(mentalHealthFunctions).map(([key, func]) => (
              <div 
                key={key}
                className="menu-item"
                onClick={(e) => { e.stopPropagation(); openMentalHealthFunction(key as MentalHealthFunction); }}
              >
                {func.icon} {func.name}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 心理健康功能窗口 */}
      <AnimatePresence>
        {showFunctionWindow && (
          <motion.div 
            className="function-window"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            style={{
              position: 'absolute',
              left: getFunctionWindowPosition().left,
              top: getFunctionWindowPosition().top,
              zIndex: 1002
            }}
          >
            <div className="function-header">
              <h3>{mentalHealthFunctions[showFunctionWindow].icon} {mentalHealthFunctions[showFunctionWindow].name}</h3>
              <button 
                className="close-btn"
                onClick={() => setShowFunctionWindow(null)}
              >
                ×
              </button>
            </div>
            <div className="function-content">
              <p>{mentalHealthFunctions[showFunctionWindow].description}</p>
              
              {showFunctionWindow === 'chat' ? (
                <div className="chat-interface">
                  <div className="chat-messages">
                    {chatMessages.map((message) => (
                      <div key={message.id} className={`message ${message.type}`}>
                        <div className="message-content">{message.text}</div>
                        <div className="message-time">
                          {message.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="chat-input-container">
                    <input
                      type="text"
                      className="chat-input"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                      placeholder="告诉我你的感受..."
                    />
                    <button 
                      className="send-btn"
                      onClick={sendChatMessage}
                      disabled={!chatInput.trim()}
                    >
                      发送
                    </button>
                  </div>
                </div>
              ) : showFunctionWindow === 'meditation' ? (
                <div className="meditation-interface">
                  <div className="meditation-guide">
                    <h4>🧘 冥想引导</h4>
                    <p>选择一个舒适的姿势，闭上眼睛，跟随乐乐的引导进行冥想。</p>
                    <button className="action-btn" onClick={startMeditation}>
                      开始冥想
                    </button>
                  </div>
                </div>
              ) : showFunctionWindow === 'breathing' ? (
                <div className="breathing-interface">
                  <div className="breathing-guide">
                    <h4>🌬️ 呼吸练习</h4>
                    <p>通过深呼吸练习来放松身心，缓解压力和焦虑。</p>
                    <button className="action-btn" onClick={startBreathing}>
                      开始呼吸练习
                    </button>
                  </div>
                </div>
              ) : showFunctionWindow === 'mood' ? (
                <div className="mood-interface">
                  <div className="mood-tracker">
                    <h4>😊 心情记录</h4>
                    <p>记录你当前的心情状态，帮助了解自己的情绪变化。</p>
                    <div className="mood-options">
                      {['anxious', 'sad', 'stressed', 'lonely', 'overwhelmed', 'okay'].map((moodType) => (
                        <button 
                          key={moodType}
                          className={`mood-btn ${currentMood === moodType ? 'active' : ''}`}
                          onClick={() => setCurrentMood(moodType as any)}
                        >
                          {moodType === 'anxious' && '😰 焦虑'}
                          {moodType === 'sad' && '😢 悲伤'}
                          {moodType === 'stressed' && '😤 压力'}
                          {moodType === 'lonely' && '😔 孤独'}
                          {moodType === 'overwhelmed' && '😵 不知所措'}
                          {moodType === 'okay' && '😌 还好'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="function-placeholder">
                  <p>🚧 功能开发中...</p>
                  <p>这里将集成更多心理健康功能</p>
                  <p>包括情绪日记、健康提醒、治愈音乐等</p>
                  <div className="integration-status">
                    <div className="status-item">
                      <span className="status-icon">💚</span>
                      <span>心理健康陪伴</span>
                      <span className="status-badge">已集成</span>
                    </div>
                    <div className="status-item">
                      <span className="status-icon">🧘</span>
                      <span>冥想引导</span>
                      <span className="status-badge">已集成</span>
                    </div>
                    <div className="status-item">
                      <span className="status-icon">🌬️</span>
                      <span>呼吸练习</span>
                      <span className="status-badge">已集成</span>
                    </div>
                    <div className="status-item">
                      <span className="status-icon">📝</span>
                      <span>情绪日记</span>
                      <span className="status-badge">开发中</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
