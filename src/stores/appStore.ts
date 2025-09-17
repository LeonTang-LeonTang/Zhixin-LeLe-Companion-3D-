import { create } from 'zustand'
import { PandaMood, PandaState, ChatMessage, Email, Contact, Project, KPI } from '../types'

interface AppState {
  // 熊猫状态
  panda: PandaState
  
  // 聊天状态
  messages: ChatMessage[]
  isTyping: boolean
  
  // 企业功能状态
  emails: Email[]
  contacts: Contact[]
  projects: Project[]
  kpis: KPI[]
  
  // UI状态
  activePanel: 'chat' | 'email' | 'contacts' | 'projects' | 'dashboard' | null
  isLoading: boolean
  
  // 动作
  setPandaMood: (mood: PandaMood) => void
  setAnimating: (animating: boolean) => void
  updatePandaAction: (action: string) => void
  
  addMessage: (message: ChatMessage) => void
  setTyping: (typing: boolean) => void
  clearMessages: () => void
  
  setActivePanel: (panel: AppState['activePanel']) => void
  setLoading: (loading: boolean) => void
  
  // 企业功能动作
  addEmail: (email: Email) => void
  addContact: (contact: Contact) => void
  addProject: (project: Project) => void
  updateKPIs: (kpis: KPI[]) => void
}

export const useAppStore = create<AppState>((set, get) => ({
  // 初始状态
  panda: {
    mood: PandaMood.HAPPY,
    isAnimating: false,
    currentAction: '等待中...',
    energy: 100,
    lastInteraction: Date.now()
  },
  
  messages: [],
  isTyping: false,
  
  emails: [],
  contacts: [],
  projects: [],
  kpis: [],
  
  activePanel: null,
  isLoading: false,
  
  // 熊猫相关动作
  setPandaMood: (mood) => set((state) => ({
    panda: { ...state.panda, mood, lastInteraction: Date.now() }
  })),
  
  setAnimating: (animating) => set((state) => ({
    panda: { ...state.panda, isAnimating: animating }
  })),
  
  updatePandaAction: (action) => set((state) => ({
    panda: { ...state.panda, currentAction: action, lastInteraction: Date.now() }
  })),
  
  // 聊天相关动作
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message]
  })),
  
  setTyping: (typing) => set({ isTyping: typing }),
  
  clearMessages: () => set({ messages: [] }),
  
  // UI相关动作
  setActivePanel: (panel) => set({ activePanel: panel }),
  setLoading: (loading) => set({ isLoading: loading }),
  
  // 企业功能动作
  addEmail: (email) => set((state) => ({
    emails: [...state.emails, email]
  })),
  
  addContact: (contact) => set((state) => ({
    contacts: [...state.contacts, contact]
  })),
  
  addProject: (project) => set((state) => ({
    projects: [...state.projects, project]
  })),
  
  updateKPIs: (kpis) => set({ kpis })
}))

// 自动化熊猫行为
setInterval(() => {
  const state = useAppStore.getState()
  const timeSinceLastInteraction = Date.now() - state.panda.lastInteraction
  
  // 5分钟无交互后进入休息状态
  if (timeSinceLastInteraction > 5 * 60 * 1000 && state.panda.mood !== PandaMood.SLEEPING) {
    useAppStore.getState().setPandaMood(PandaMood.SLEEPING)
    useAppStore.getState().updatePandaAction('休息中...')
  }
}, 30000) // 每30秒检查一次