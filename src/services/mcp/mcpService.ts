/**
 * MCP (Model Context Protocol) 服务
 * 实现与腾讯云智能体开发平台的MCP协议通信
 */

export interface MCPMessage {
  id: string
  type: 'request' | 'response' | 'notification'
  method: string
  params?: any
  result?: any
  error?: {
    code: number
    message: string
    data?: any
  }
  timestamp: number
}

export interface MCPTool {
  name: string
  description: string
  parameters: {
    type: 'object'
    properties: Record<string, any>
    required?: string[]
  }
}

export interface MCPConfig {
  tencentCloud: {
    secretId: string
    secretKey: string
    region: string
    endpoint: string
  }
  localServer: {
    port: number
    host: string
  }
  tools: MCPTool[]
}

class MCPService {
  private config: MCPConfig | null = null
  private isInitialized = false
  private messageHandlers: Map<string, (message: MCPMessage) => Promise<any>> = new Map()
  private wsConnection: WebSocket | null = null

  constructor() {
    this.loadConfig()
    this.registerDefaultTools()
  }

  private loadConfig() {
    this.config = {
      tencentCloud: {
        secretId: process.env.TENCENT_SECRET_ID || '',
        secretKey: process.env.TENCENT_SECRET_KEY || '',
        region: process.env.TENCENT_REGION || 'ap-beijing',
        endpoint: process.env.TENCENT_MCP_ENDPOINT || 'wss://mcp.tencentcloud.com'
      },
      localServer: {
        port: 3001,
        host: 'localhost'
      },
      tools: []
    }
  }

  private registerDefaultTools() {
    // 注册默认工具
    this.registerTool({
      name: 'panda_action',
      description: '控制小竹子执行特定动作',
      parameters: {
        type: 'object',
        properties: {
          action: {
            type: 'string',
            enum: ['walk', 'yawn', 'eat', 'play', 'stretch', 'look_around'],
            description: '要执行的动作'
          },
          duration: {
            type: 'number',
            description: '动作持续时间（毫秒）',
            default: 2000
          }
        },
        required: ['action']
      }
    })

    this.registerTool({
      name: 'panda_mood',
      description: '设置小竹子的心情状态',
      parameters: {
        type: 'object',
        properties: {
          mood: {
            type: 'string',
            enum: ['happy', 'excited', 'sleepy', 'thinking', 'satisfied', 'curious'],
            description: '心情状态'
          },
          message: {
            type: 'string',
            description: '伴随的心情消息'
          }
        },
        required: ['mood']
      }
    })

    this.registerTool({
      name: 'knowledge_search',
      description: '搜索知识库信息',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: '搜索查询'
          },
          maxResults: {
            type: 'number',
            description: '最大结果数量',
            default: 5
          }
        },
        required: ['query']
      }
    })

    this.registerTool({
      name: 'window_control',
      description: '控制窗口位置和状态',
      parameters: {
        type: 'object',
        properties: {
          action: {
            type: 'string',
            enum: ['move', 'show', 'hide', 'minimize'],
            description: '窗口操作'
          },
          x: {
            type: 'number',
            description: 'X坐标'
          },
          y: {
            type: 'number',
            description: 'Y坐标'
          }
        },
        required: ['action']
      }
    })
  }

  async initialize(): Promise<boolean> {
    try {
      if (this.isInitialized) return true

      // 初始化MCP服务器
      await this.startMCPServer()
      
      // 连接到腾讯云MCP服务
      await this.connectToTencentCloud()
      
      this.isInitialized = true
      console.log('MCP服务初始化成功')
      return true
    } catch (error) {
      console.error('MCP服务初始化失败:', error)
      return false
    }
  }

  private async startMCPServer(): Promise<void> {
    // 启动本地MCP服务器
    console.log('启动MCP服务器...')
    // 实际实现应该启动WebSocket服务器
  }

  private async connectToTencentCloud(): Promise<void> {
    if (!this.config) return

    try {
      // 连接到腾讯云MCP服务
      this.wsConnection = new WebSocket(this.config.tencentCloud.endpoint)
      
      this.wsConnection.onopen = () => {
        console.log('已连接到腾讯云MCP服务')
        this.sendHandshake()
      }

      this.wsConnection.onmessage = (event) => {
        this.handleIncomingMessage(JSON.parse(event.data))
      }

      this.wsConnection.onclose = () => {
        console.log('与腾讯云MCP服务连接断开')
        this.wsConnection = null
      }

      this.wsConnection.onerror = (error) => {
        console.error('MCP连接错误:', error)
      }
    } catch (error) {
      console.error('连接腾讯云MCP服务失败:', error)
    }
  }

  private sendHandshake(): void {
    if (!this.wsConnection) return

    const handshakeMessage: MCPMessage = {
      id: `handshake_${Date.now()}`,
      type: 'request',
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {
          tools: this.config?.tools || []
        },
        clientInfo: {
          name: 'xiaozhuzi-desktop',
          version: '1.0.0'
        }
      },
      timestamp: Date.now()
    }

    this.wsConnection.send(JSON.stringify(handshakeMessage))
  }

  private async handleIncomingMessage(message: MCPMessage): Promise<void> {
    try {
      switch (message.type) {
        case 'request':
          await this.handleRequest(message)
          break
        case 'response':
          await this.handleResponse(message)
          break
        case 'notification':
          await this.handleNotification(message)
          break
      }
    } catch (error) {
      console.error('处理MCP消息失败:', error)
    }
  }

  private async handleRequest(message: MCPMessage): Promise<void> {
    const handler = this.messageHandlers.get(message.method)
    if (handler) {
      try {
        const result = await handler(message)
        await this.sendResponse(message.id, result)
      } catch (error) {
        await this.sendError(message.id, error)
      }
    } else {
      await this.sendError(message.id, new Error(`未知的方法: ${message.method}`))
    }
  }

  private async handleResponse(message: MCPMessage): Promise<void> {
    // 处理响应消息
    console.log('收到MCP响应:', message)
  }

  private async handleNotification(message: MCPMessage): Promise<void> {
    // 处理通知消息
    console.log('收到MCP通知:', message)
  }

  private async sendResponse(requestId: string, result: any): Promise<void> {
    if (!this.wsConnection) return

    const response: MCPMessage = {
      id: `response_${Date.now()}`,
      type: 'response',
      method: 'response',
      result,
      timestamp: Date.now()
    }

    this.wsConnection.send(JSON.stringify(response))
  }

  private async sendError(requestId: string, error: any): Promise<void> {
    if (!this.wsConnection) return

    const errorResponse: MCPMessage = {
      id: `error_${Date.now()}`,
      type: 'response',
      method: 'error',
      error: {
        code: error.code || -1,
        message: error.message || '未知错误',
        data: error.data
      },
      timestamp: Date.now()
    }

    this.wsConnection.send(JSON.stringify(errorResponse))
  }

  registerTool(tool: MCPTool): void {
    if (this.config) {
      this.config.tools.push(tool)
    }
  }

  registerHandler(method: string, handler: (message: MCPMessage) => Promise<any>): void {
    this.messageHandlers.set(method, handler)
  }

  async callTool(toolName: string, parameters: any): Promise<any> {
    if (!this.wsConnection) {
      throw new Error('MCP连接未建立')
    }

    const message: MCPMessage = {
      id: `tool_call_${Date.now()}`,
      type: 'request',
      method: 'tools/call',
      params: {
        name: toolName,
        arguments: parameters
      },
      timestamp: Date.now()
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('工具调用超时'))
      }, 10000)

      const handleResponse = (event: MessageEvent) => {
        const response = JSON.parse(event.data)
        if (response.id === message.id) {
          clearTimeout(timeout)
          this.wsConnection?.removeEventListener('message', handleResponse)
          
          if (response.error) {
            reject(new Error(response.error.message))
          } else {
            resolve(response.result)
          }
        }
      }

      this.wsConnection?.addEventListener('message', handleResponse)
      this.wsConnection?.send(JSON.stringify(message))
    })
  }

  async sendMessage(message: MCPMessage): Promise<void> {
    if (!this.wsConnection) {
      throw new Error('MCP连接未建立')
    }

    this.wsConnection.send(JSON.stringify(message))
  }

  async disconnect(): Promise<void> {
    if (this.wsConnection) {
      this.wsConnection.close()
      this.wsConnection = null
    }
  }

  getAvailableTools(): MCPTool[] {
    return this.config?.tools || []
  }

  isConnected(): boolean {
    return this.wsConnection?.readyState === WebSocket.OPEN
  }
}

export const mcpService = new MCPService()
export default mcpService
