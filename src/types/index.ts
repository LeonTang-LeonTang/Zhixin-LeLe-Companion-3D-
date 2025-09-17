// 核心类型定义

// 熊猫心情状态
export enum PandaMood {
  HAPPY = 'happy',
  THINKING = 'thinking',
  WORKING = 'working',
  SLEEPING = 'sleeping',
  EXCITED = 'excited',
  CONFUSED = 'confused',
  ANALYZING = 'analyzing',
  PROBLEM_SOLVING = 'problem_solving',
  SUCCESS = 'success',
  ALERT = 'alert',
  CALMING = 'calming',
  ENERGETIC = 'energetic'
}

// 熊猫状态
export interface PandaState {
  mood: PandaMood
  isAnimating: boolean
  currentAction: string
  energy: number
  lastInteraction: number
}

// 聊天消息
export interface ChatMessage {
  id: string
  content: string
  sender: 'user' | 'assistant'
  timestamp: number
  type?: 'text' | 'image' | 'file' | 'action'
  metadata?: any
}

// ADP响应
export interface ADPResponse {
  content: string
  mood?: PandaMood
  actions?: string[]
  data?: any
  suggestions?: string[]
}

// 企业功能相关类型
export interface BusinessData {
  type: 'sales' | 'finance' | 'hr' | 'project' | 'customer'
  data: any
  timestamp: number
}

export interface KPI {
  id: string
  name: string
  value: number
  target: number
  trend: 'up' | 'down' | 'stable'
  unit: string
}

export interface Project {
  id: string
  name: string
  status: 'planning' | 'active' | 'completed' | 'paused'
  progress: number
  startDate: Date
  endDate: Date
  team: string[]
  budget: number
}

export interface Email {
  id: string
  from: string
  to: string[]
  subject: string
  content: string
  timestamp: Date
  priority: 'low' | 'medium' | 'high'
  category?: string
}

export interface Contact {
  id: string
  name: string
  email: string
  phone?: string
  department?: string
  position?: string
  avatar?: string
}

// MCP插件相关
export interface MCPPlugin {
  id: string
  name: string
  version: string
  description: string
  capabilities: string[]
  config?: any
}

export interface PluginResponse {
  success: boolean
  data?: any
  error?: string
}