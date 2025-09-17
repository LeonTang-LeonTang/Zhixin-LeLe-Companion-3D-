import { ADPResponse, ChatMessage, PandaMood } from '../types'
import { tencentCloudService } from './tencentCloudService'

// 腾讯云ADP配置
const ADP_CONFIG = {
  apiEndpoint: import.meta.env.VITE_ADP_API_ENDPOINT || 'https://your-adp-instance.tencentcloud.com',
  apiKey: import.meta.env.VITE_ADP_API_KEY || '',
  agentId: import.meta.env.VITE_ADP_AGENT_ID || '',
  websocketUrl: import.meta.env.VITE_ADP_WS_URL || 'wss://your-adp-instance.tencentcloud.com/ws'
}

class ADPService {
  private ws: WebSocket | null = null
  private sessionId: string = ''
  private messageHandlers: ((data: any) => void)[] = []
  private isInitialized = false

  constructor() {
    this.sessionId = this.generateSessionId()
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // 初始化服务
  async initialize(): Promise<void> {
    try {
      if (this.isInitialized) return

      console.log('初始化ADP服务...')
      
      // 初始化腾讯云智能体开发平台集成服务
      await tencentCloudService.initialize()
      
      // 初始化WebSocket连接
      await this.initializeWebSocket()
      
      this.isInitialized = true
      console.log('ADP服务初始化完成')
    } catch (error) {
      console.error('初始化ADP服务失败:', error)
    }
  }

  // 初始化WebSocket连接
  private async initializeWebSocket(): Promise<void> {
    try {
      if (!ADP_CONFIG.websocketUrl) {
        console.warn('ADP WebSocket URL not configured, using mock mode')
        return
      }

      this.ws = new WebSocket(ADP_CONFIG.websocketUrl)
      
      this.ws.onopen = () => {
        console.log('ADP WebSocket连接已建立')
        this.sendWebSocketMessage({
          type: 'init',
          sessionId: this.sessionId,
          agentId: ADP_CONFIG.agentId
        })
      }
      
      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          this.handleADPMessage(data)
        } catch (error) {
          console.error('解析WebSocket消息失败:', error)
        }
      }
      
      this.ws.onerror = (error) => {
        console.error('WebSocket连接错误:', error)
      }
      
      this.ws.onclose = () => {
        console.log('WebSocket连接已关闭')
        // 自动重连
        setTimeout(() => this.initializeWebSocket(), 5000)
      }
    } catch (error) {
      console.error('初始化WebSocket失败:', error)
    }
  }

  // 发送消息到ADP - 集成RAG、MCP、LLM
  async sendMessage(message: string, context?: any): Promise<ADPResponse> {
    try {
      if (!this.isInitialized) {
        await this.initialize()
      }

      // 使用腾讯云智能体开发平台集成服务处理消息
      const intelligentResponse = await tencentCloudService.processUserInput(message, this.sessionId)
      
      // 转换为ADP响应格式
      const adpResponse: ADPResponse = {
        content: intelligentResponse.content,
        mood: intelligentResponse.mood,
        actions: intelligentResponse.actions,
        suggestions: this.generateSuggestions(intelligentResponse)
      }

      return adpResponse
    } catch (error) {
      console.error('发送消息到ADP失败:', error)
      return this.getMockResponse(message)
    }
  }

  // 查询知识库 - 使用RAG服务
  async queryKnowledge(query: string, domain?: string): Promise<any> {
    try {
      if (!this.isInitialized) {
        await this.initialize()
      }

      const results = await tencentCloudService.searchKnowledge(query, 5)
      
      return {
        success: true,
        query,
        results: results.map(r => ({
          title: r.document.title,
          content: r.snippet,
          confidence: r.score,
          source: r.document.metadata?.source || '企业知识库',
          metadata: r.document.metadata
        }))
      }
    } catch (error) {
      console.error('查询知识库失败:', error)
      return this.getMockKnowledgeResponse(query)
    }
  }

  // 执行工作流 - 使用MCP服务
  async executeWorkflow(workflowId: string, params: any): Promise<any> {
    try {
      if (!this.isInitialized) {
        await this.initialize()
      }

      // 根据工作流ID调用相应的MCP工具
      const toolName = this.getToolNameFromWorkflowId(workflowId)
      if (toolName) {
        const result = await tencentCloudService.callTool(toolName, params)
        return {
          success: true,
          workflowId,
          status: 'completed',
          result,
          data: params
        }
      }

      return this.getMockWorkflowResponse(workflowId, params)
    } catch (error) {
      console.error('执行工作流失败:', error)
      return this.getMockWorkflowResponse(workflowId, params)
    }
  }

  // 添加知识到RAG系统
  async addKnowledge(document: {
    title: string
    content: string
    metadata?: Record<string, any>
  }): Promise<string> {
    try {
      if (!this.isInitialized) {
        await this.initialize()
      }

      return await tencentCloudService.addKnowledge(document)
    } catch (error) {
      console.error('添加知识失败:', error)
      throw error
    }
  }

  // 获取可用的MCP工具
  async getAvailableTools(): Promise<any[]> {
    try {
      if (!this.isInitialized) {
        await this.initialize()
      }

      return tencentCloudService.getAvailableTools()
    } catch (error) {
      console.error('获取可用工具失败:', error)
      return []
    }
  }

  // 调用MCP工具
  async callTool(toolName: string, parameters: any): Promise<any> {
    try {
      if (!this.isInitialized) {
        await this.initialize()
      }

      return await tencentCloudService.callTool(toolName, parameters)
    } catch (error) {
      console.error('调用工具失败:', error)
      throw error
    }
  }

  // 获取服务状态
  async getServiceStatus(): Promise<any> {
    try {
      if (!this.isInitialized) {
        await this.initialize()
      }

      return await tencentCloudService.getServiceStatus()
    } catch (error) {
      console.error('获取服务状态失败:', error)
      return { initialized: false, error: error.message }
    }
  }

  // 添加消息处理器
  addMessageHandler(handler: (data: any) => void): void {
    this.messageHandlers.push(handler)
  }

  // 处理来自ADP的消息
  private handleADPMessage(data: any): void {
    console.log('收到ADP消息:', data)
    
    // 通知所有处理器
    this.messageHandlers.forEach(handler => {
      try {
        handler(data)
      } catch (error) {
        console.error('消息处理器执行失败:', error)
      }
    })
  }

  // 发送WebSocket消息
  private sendWebSocketMessage(message: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    }
  }

  // 根据工作流ID获取工具名称
  private getToolNameFromWorkflowId(workflowId: string): string | null {
    const workflowMap: Record<string, string> = {
      'panda_action': 'panda_action',
      'panda_mood': 'panda_mood',
      'knowledge_search': 'knowledge_search',
      'window_control': 'window_control'
    }
    return workflowMap[workflowId] || null
  }

  // 生成建议
  private generateSuggestions(intelligentResponse: any): string[] {
    const suggestions: string[] = []
    
    if (intelligentResponse.actions.includes('eating')) {
      suggestions.push('让我吃竹子')
    }
    if (intelligentResponse.actions.includes('walking')) {
      suggestions.push('去散步')
    }
    if (intelligentResponse.actions.includes('playing')) {
      suggestions.push('一起玩耍')
    }
    if (intelligentResponse.tools.includes('knowledge_search')) {
      suggestions.push('搜索知识库')
    }
    if (intelligentResponse.tools.includes('window_control')) {
      suggestions.push('移动窗口')
    }

    return suggestions.length > 0 ? suggestions : ['查看帮助', '切换状态', '打开菜单']
  }

  // 模拟响应（用于开发和演示）
  private getMockResponse(message: string): ADPResponse {
    const lowerMessage = message.toLowerCase()
    
    if (lowerMessage.includes('数据') || lowerMessage.includes('分析')) {
      return {
        content: '我来帮你分析数据！让我查看一下最新的业务指标...',
        mood: PandaMood.ANALYZING,
        actions: ['show_dashboard', 'generate_report'],
        suggestions: ['查看销售趋势', '分析客户数据', '生成财务报告']
      }
    }
    
    if (lowerMessage.includes('项目') || lowerMessage.includes('管理')) {
      return {
        content: '好的，我来帮你管理项目进度。让我检查一下当前的项目状态...',
        mood: PandaMood.WORKING,
        actions: ['show_projects', 'create_task'],
        suggestions: ['查看项目进度', '分配任务', '更新里程碑']
      }
    }
    
    if (lowerMessage.includes('邮件') || lowerMessage.includes('email')) {
      return {
        content: '我来处理你的邮件！检测到3封新邮件，其中1封标记为重要。',
        mood: PandaMood.WORKING,
        actions: ['show_emails', 'compose_email'],
        suggestions: ['查看重要邮件', '回复客户', '整理邮件']
      }
    }
    
    return {
      content: `你好！我是小竹子，你的智能助手。我听到你说："${message}"，有什么可以帮助你的吗？`,
      mood: PandaMood.HAPPY,
      actions: ['show_help'],
      suggestions: ['数据分析', '项目管理', '邮件处理', '联系人管理']
    }
  }

  private getMockKnowledgeResponse(query: string): any {
    return {
      success: true,
      results: [
        {
          title: `关于"${query}"的知识`,
          content: `这是关于${query}的详细信息...`,
          confidence: 0.95,
          source: '企业知识库'
        }
      ]
    }
  }

  private getMockWorkflowResponse(workflowId: string, params: any): any {
    return {
      success: true,
      workflowId,
      status: 'completed',
      result: `工作流 ${workflowId} 执行成功`,
      data: params
    }
  }
}

export const adpService = new ADPService()
