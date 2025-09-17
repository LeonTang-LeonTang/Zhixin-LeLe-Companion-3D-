import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PandaMood } from '../../types'
import './PandaAvatar.css'

interface PandaAvatarProps {
  mood: PandaMood
  isAnimating?: boolean
  currentAction?: string
  onClick?: () => void
  size?: 'small' | 'medium' | 'large'
}

export const PandaAvatar: React.FC<PandaAvatarProps> = ({ 
  mood, 
  isAnimating = false, 
  currentAction = '',
  onClick,
  size = 'large'
}) => {
  const [currentFrame, setCurrentFrame] = useState(0)
  const [showActionBubble, setShowActionBubble] = useState(false)

  // 不同心情的动画配置
  const moodAnimations = {
    [PandaMood.HAPPY]: {
      emoji: '😊',
      color: '#4CAF50',
      bounce: true,
      frames: ['😊', '😄', '😊'],
      duration: 800
    },
    [PandaMood.THINKING]: {
      emoji: '🤔',
      color: '#FF9800',
      bounce: false,
      frames: ['🤔', '💭', '🤔'],
      duration: 1500
    },
    [PandaMood.WORKING]: {
      emoji: '💼',
      color: '#2196F3',
      bounce: false,
      frames: ['💼', '⚙️', '💼'],
      duration: 1000
    },
    [PandaMood.SLEEPING]: {
      emoji: '😴',
      color: '#9C27B0',
      bounce: false,
      frames: ['😴', '💤', '😴'],
      duration: 2000
    },
    [PandaMood.EXCITED]: {
      emoji: '🎉',
      color: '#E91E63',
      bounce: true,
      frames: ['🎉', '✨', '🎉'],
      duration: 600
    },
    [PandaMood.CONFUSED]: {
      emoji: '😕',
      color: '#795548',
      bounce: false,
      frames: ['😕', '❓', '😕'],
      duration: 1200
    },
    [PandaMood.ANALYZING]: {
      emoji: '📊',
      color: '#00BCD4',
      bounce: false,
      frames: ['📊', '📈', '📉', '📊'],
      duration: 800
    },
    [PandaMood.PROBLEM_SOLVING]: {
      emoji: '🔧',
      color: '#FF5722',
      bounce: false,
      frames: ['🔧', '⚡', '🔧'],
      duration: 700
    },
    [PandaMood.SUCCESS]: {
      emoji: '🎯',
      color: '#4CAF50',
      bounce: true,
      frames: ['🎯', '✅', '🎯'],
      duration: 500
    },
    [PandaMood.ALERT]: {
      emoji: '⚠️',
      color: '#F44336',
      bounce: true,
      frames: ['⚠️', '🚨', '⚠️'],
      duration: 400
    },
    [PandaMood.CALMING]: {
      emoji: '🧘',
      color: '#8BC34A',
      bounce: false,
      frames: ['🧘', '🌸', '🧘'],
      duration: 2000
    },
    [PandaMood.ENERGETIC]: {
      emoji: '⚡',
      color: '#FFEB3B',
      bounce: true,
      frames: ['⚡', '🔥', '⚡'],
      duration: 300
    }
  }

  const animation = moodAnimations[mood]
  const sizeClasses = {
    small: 'panda-small',
    medium: 'panda-medium',
    large: 'panda-large'
  }

  // 动画帧切换
  useEffect(() => {
    if (!isAnimating) return

    const interval = setInterval(() => {
      setCurrentFrame(prev => (prev + 1) % animation.frames.length)
    }, animation.duration)

    return () => clearInterval(interval)
  }, [mood, isAnimating, animation])

  // 显示动作气泡
  useEffect(() => {
    if (currentAction && currentAction !== '等待中...') {
      setShowActionBubble(true)
      const timer = setTimeout(() => setShowActionBubble(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [currentAction])

  const handleClick = () => {
    if (onClick) {
      onClick()
    }
  }

  return (
    <div className={`panda-container ${sizeClasses[size]}`}>
      {/* 动作气泡 */}
      <AnimatePresence>
        {showActionBubble && currentAction && (
          <motion.div
            className="action-bubble"
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            {currentAction}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 熊猫头像 */}
      <motion.div
        className="panda-avatar"
        onClick={handleClick}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={animation.bounce && isAnimating ? {
          y: [0, -10, 0],
          transition: { 
            duration: 0.6, 
            repeat: Infinity, 
            repeatType: "reverse" 
          }
        } : {}}
        style={{ 
          backgroundColor: animation.color,
          cursor: onClick ? 'pointer' : 'default'
        }}
      >
        {/* 熊猫表情 */}
        <motion.div
          className="panda-face"
          animate={isAnimating ? {
            rotate: [0, 5, -5, 0],
            transition: { duration: 1, repeat: Infinity }
          } : {}}
        >
          <span className="panda-emoji">
            {isAnimating ? animation.frames[currentFrame] : animation.emoji}
          </span>
        </motion.div>

        {/* 心情指示器 */}
        <div className="mood-indicator" style={{ backgroundColor: animation.color }}>
          <div className="mood-pulse" />
        </div>
      </motion.div>

      {/* 心情标签 */}
      <div className="mood-label">
        {mood.replace('_', ' ')}
      </div>
    </div>
  )
}