/**
 * 腾讯云智能体开发平台集成服务
 * 整合RAG、MCP、LLM功能
 */

import { ragService } from './rag/ragService'
import { mcpService } from './mcp/mcpService'
import { llmService } from './llm/llmService'
import { PandaMood } from '../types'

export interface TencentCloudConfig {
  secretId: string
  secretKey: string
  region: string
  ragEndpoint: string
  mcpEndpoint: string
  llmEndpoint: string
}

export interface IntelligentResponse {
  content: string
  mood: PandaMood
  actions: string[]
  context: string
  tools: string[]
}

class TencentCloudService {
  private config: TencentCloudConfig | null = null
  private isInitialized = false

  constructor() {
    this.loadConfig()
  }

  private loadConfig() {
    this.config = {
      secretId: process.env.TENCENT_SECRET_ID || '',
      secretKey: process.env.TENCENT_SECRET_KEY || '',
      region: process.env.TENCENT_REGION || 'ap-beijing',
      ragEndpoint: process.env.TENCENT_RAG_ENDPOINT || 'https://rag.tencentcloud.com',
      mcpEndpoint: process.env.TENCENT_MCP_ENDPOINT || 'wss://mcp.tencentcloud.com',
      llmEndpoint: process.env.TENCENT_LLM_ENDPOINT || 'https://hunyuan.tencentcloudapi.com'
    }
  }

  async initialize(): Promise<boolean> {
    try {
      if (this.isInitialized) return true

      console.log('初始化腾讯云智能体开发平台集成服务...')

      // 初始化各个子服务
      const ragInit = await ragService.initialize()
      const mcpInit = await mcpService.initialize()
      const llmInit = await llmService.initialize()

      if (!ragInit || !mcpInit || !llmInit) {
        throw new Error('子服务初始化失败')
      }

      // 注册MCP工具处理器
      this.registerMCPHandlers()

      this.isInitialized = true
      console.log('腾讯云智能体开发平台集成服务初始化成功')
      return true
    } catch (error) {
      console.error('腾讯云智能体开发平台集成服务初始化失败:', error)
      return false
    }
  }

  private registerMCPHandlers() {
    // 注册熊猫动作工具处理器
    mcpService.registerHandler('panda_action', async (message) => {
      const { action, duration = 2000 } = message.params?.arguments || {}
      
      // 这里应该触发前端的熊猫动作
      console.log(`执行熊猫动作: ${action}, 持续时间: ${duration}ms`)
      
      return {
        success: true,
        action,
        duration,
        message: `已执行${action}动作`
      }
    })

    // 注册心情设置工具处理器
    mcpService.registerHandler('panda_mood', async (message) => {
      const { mood, message: moodMessage } = message.params?.arguments || {}
      
      console.log(`设置熊猫心情: ${mood}, 消息: ${moodMessage}`)
      
      return {
        success: true,
        mood,
        message: moodMessage || `心情已设置为${mood}`
      }
    })

    // 注册知识搜索工具处理器
    mcpService.registerHandler('knowledge_search', async (message) => {
      const { query, maxResults = 5 } = message.params?.arguments || {}
      
      const results = await ragService.search(query, maxResults)
      
      return {
        success: true,
        query,
        results: results.map(r => ({
          title: r.document.title,
          snippet: r.snippet,
          score: r.score
        }))
      }
    })

    // 注册窗口控制工具处理器
    mcpService.registerHandler('window_control', async (message) => {
      const { action, x, y } = message.params?.arguments || {}
      
      console.log(`窗口控制: ${action}, 位置: (${x}, ${y})`)
      
      return {
        success: true,
        action,
        position: { x, y },
        message: `窗口${action}操作完成`
      }
    })
  }

  async processUserInput(userInput: string, sessionId?: string): Promise<IntelligentResponse> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    try {
      // 1. 使用RAG搜索相关知识
      const ragContext = await ragService.getContextForQuery(userInput)
      
      // 2. 使用MCP调用相关工具
      const toolResults = await this.callRelevantTools(userInput)
      
      // 3. 使用LLM生成智能回复
      const currentSessionId = sessionId || await llmService.createSession()
      const llmResponse = await llmService.intelligentChat(currentSessionId, userInput)
      
      // 4. 分析回复内容，确定熊猫的心情和动作
      const analysis = this.analyzeResponse(llmResponse.content, userInput)
      
      return {
        content: llmResponse.content,
        mood: analysis.mood,
        actions: analysis.actions,
        context: ragContext,
        tools: analysis.tools
      }
    } catch (error) {
      console.error('处理用户输入失败:', error)
      return {
        content: '抱歉，我遇到了一些问题，请稍后再试。',
        mood: PandaMood.THINKING,
        actions: [],
        context: '',
        tools: []
      }
    }
  }

  private async callRelevantTools(userInput: string): Promise<string> {
    const tools = mcpService.getAvailableTools()
    const results: string[] = []

    try {
      // 根据用户输入判断需要调用哪些工具
      if (userInput.includes('动作') || userInput.includes('行为')) {
        const result = await mcpService.callTool('panda_action', { action: 'normal' })
        results.push(`动作工具: ${result.message}`)
      }

      if (userInput.includes('心情') || userInput.includes('状态')) {
        const result = await mcpService.callTool('panda_mood', { mood: 'happy' })
        results.push(`心情工具: ${result.message}`)
      }

      if (userInput.includes('搜索') || userInput.includes('查找')) {
        const result = await mcpService.callTool('knowledge_search', { query: userInput })
        results.push(`搜索工具: 找到${result.results.length}个结果`)
      }

      if (userInput.includes('窗口') || userInput.includes('移动')) {
        const result = await mcpService.callTool('window_control', { action: 'move' })
        results.push(`窗口工具: ${result.message}`)
      }
    } catch (error) {
      console.error('工具调用失败:', error)
    }

    return results.join('; ')
  }

  private analyzeResponse(content: string, userInput: string): {
    mood: PandaMood
    actions: string[]
    tools: string[]
  } {
    const contentLower = content.toLowerCase()
    const inputLower = userInput.toLowerCase()

    // 分析心情
    let mood = PandaMood.HAPPY
    if (contentLower.includes('困') || contentLower.includes('睡觉')) {
      mood = PandaMood.SLEEPY
    } else if (contentLower.includes('兴奋') || contentLower.includes('开心')) {
      mood = PandaMood.EXCITED
    } else if (contentLower.includes('思考') || contentLower.includes('想想')) {
      mood = PandaMood.THINKING
    } else if (contentLower.includes('满足') || contentLower.includes('饱')) {
      mood = PandaMood.SATISFIED
    } else if (contentLower.includes('好奇') || contentLower.includes('看看')) {
      mood = PandaMood.CURIOUS
    }

    // 分析动作
    const actions: string[] = []
    if (contentLower.includes('吃') || contentLower.includes('竹子')) {
      actions.push('eating')
    }
    if (contentLower.includes('哈欠') || contentLower.includes('困')) {
      actions.push('yawning')
    }
    if (contentLower.includes('玩') || contentLower.includes('游戏')) {
      actions.push('playing')
    }
    if (contentLower.includes('走') || contentLower.includes('散步')) {
      actions.push('walking')
    }
    if (contentLower.includes('伸') || contentLower.includes('懒腰')) {
      actions.push('stretching')
    }
    if (contentLower.includes('看') || contentLower.includes('环顾')) {
      actions.push('looking')
    }

    // 分析工具
    const tools: string[] = []
    if (inputLower.includes('搜索') || inputLower.includes('查找')) {
      tools.push('knowledge_search')
    }
    if (inputLower.includes('窗口') || inputLower.includes('移动')) {
      tools.push('window_control')
    }
    if (inputLower.includes('动作') || inputLower.includes('行为')) {
      tools.push('panda_action')
    }
    if (inputLower.includes('心情') || inputLower.includes('状态')) {
      tools.push('panda_mood')
    }

    return { mood, actions, tools }
  }

  async addKnowledge(document: {
    title: string
    content: string
    metadata?: Record<string, any>
  }): Promise<string> {
    return await ragService.addDocument(document)
  }

  async searchKnowledge(query: string, maxResults: number = 5) {
    return await ragService.search(query, maxResults)
  }

  async getChatSession(sessionId: string) {
    return await llmService.getSession(sessionId)
  }

  async createChatSession(context?: string) {
    return await llmService.createSession(context)
  }

  async getAvailableTools() {
    return mcpService.getAvailableTools()
  }

  async callTool(toolName: string, parameters: any) {
    return await mcpService.callTool(toolName, parameters)
  }

  isServiceReady(): boolean {
    return this.isInitialized && 
           mcpService.isConnected() && 
           ragService && 
           llmService
  }

  async getServiceStatus() {
    return {
      initialized: this.isInitialized,
      rag: !!ragService,
      mcp: mcpService.isConnected(),
      llm: !!llmService,
      tools: mcpService.getAvailableTools().length
    }
  }
}

export const tencentCloudService = new TencentCloudService()
export default tencentCloudService
