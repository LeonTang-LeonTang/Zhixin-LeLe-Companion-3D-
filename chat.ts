import { getSession } from '../session';

// 配置常量
const BOT_APP_KEY = "tPFIVnKUviLCilazajGPuSWEgrSaybqPUvXnJJuyfxQEQaCCHakWTyLmVYCapKXZuJVvrSQyHXeNHgFkjMiWqjxNZxpIsfXJCfUmXKPDRiteRgtzrSyTTZmpvMyTGiZz";
const VISITOR_BIZ_ID = "202403130001";
const STREAMING_THROTTLE = 1;
const API_URL = "https://wss.lke.cloud.tencent.com/v1/qbot/chat/sse";

// 类型定义
interface ChatRequest {
    content: string;
    bot_app_key: string;
    visitor_biz_id: string;
    session_id: string;
    streaming_throttle: number;
}

interface ChatPayload {
    content: string;
    is_from_self: boolean;
    is_final: boolean;
}

interface ChatEvent {
    type: string;
    payload: ChatPayload;
}

/**
 * 修复编码问题
 * @param mojibakeStr 可能乱码的字符串
 * @returns 修复后的字符串
 */
function fixEncoding(mojibakeStr: string): string {
    try {
        // 尝试从latin1编码转换为utf-8
        const bytes = new Uint8Array(mojibakeStr.length);
        for (let i = 0; i < mojibakeStr.length; i++) {
            bytes[i] = mojibakeStr.charCodeAt(i);
        }
        const decoder = new TextDecoder('utf-8');
        return decoder.decode(bytes);
    } catch (error) {
        return mojibakeStr;
    }
}

/**
 * 发送聊天请求并处理SSE响应
 * @param content 用户输入的内容
 * @param sessionId 会话ID
 * @returns Promise<void>
 */
async function sendChatRequest(content: string, sessionId: string): Promise<void> {
    const reqData: ChatRequest = {
        content,
        bot_app_key: BOT_APP_KEY,
        visitor_biz_id: VISITOR_BIZ_ID,
        session_id: sessionId,
        streaming_throttle: STREAMING_THROTTLE
    };

    const headers = {
        "Accept": "text/event-stream",
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive"
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers,
            body: JSON.stringify(reqData),
        });

        if (!response.ok) {
            console.error(`请求失败，状态码: ${response.status}`);
            const errorText = await response.text();
            console.error(`响应内容: ${errorText}`);
            return;
        }

        if (!response.body) {
            console.error('响应体为空');
            return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        try {
            while (true) {
                const { done, value } = await reader.read();
                
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');

                for (let i = 0; i < lines.length - 1; i++) {
                    const line = lines[i].trim();
                    
                    if (line.startsWith('data:')) {
                        try {
                            const dataStr = line.substring(5).trim();
                            if (dataStr) {
                                const data: ChatEvent = JSON.parse(dataStr);
                                const eventType = data.type;

                                if (eventType === "reply") {
                                    const payload = data.payload;
                                    const content = payload.content;
                                    const isFromSelf = payload.is_from_self;
                                    const isFinal = payload.is_final;

                                    // 修复编码后再显示
                                    const fixedContent = fixEncoding(content);

                                    if (isFromSelf) {
                                        console.log(`您: ${fixedContent}`);
                                    } else {
                                        if (isFinal) {
                                            console.log(`机器人: ${fixedContent}`);
                                        } else {
                                            console.log(`机器人(部分): ${fixedContent}`);
                                        }
                                    }
                                } else if (eventType === "token_stat") {
                                    // Token统计信息，可以选择性显示
                                    // console.log(`Token统计: ${JSON.stringify(data.payload)}`);
                                }
                            }
                        } catch (jsonError) {
                            console.error(`JSON解析错误: ${jsonError}`);
                            console.error(`原始数据: ${line}`);
                        }
                    }
                }

                buffer = lines[lines.length - 1] || '';
            }
        } finally {
            reader.releaseLock();
        }

    } catch (error) {
        if (error instanceof Error) {
            console.error(`请求异常: ${error.message}`);
        } else {
            console.error(`处理响应时出错: ${error}`);
        }
    }
}

/**
 * SSE客户端主函数
 * @param sessionId 会话ID
 */
export async function sseClient(sessionId: string): Promise<void> {
    console.log('聊天客户端已启动，输入 "exit" 退出');
    console.log(`会话ID: ${sessionId}`);
    
    // 在Node.js环境中，我们需要使用readline来获取用户输入
    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const askQuestion = (): Promise<string> => {
        return new Promise((resolve) => {
            rl.question('请输入你想问的问题：', (answer: string) => {
                resolve(answer);
            });
        });
    };

    try {
        while (true) {
            const content = await askQuestion();
            
            if (content === "exit") {
                console.log('再见！');
                break;
            }

            await sendChatRequest(content, sessionId);
        }
    } catch (error) {
        console.error(`发生错误: ${error}`);
    } finally {
        rl.close();
    }
}

/**
 * 主函数
 */
async function main(): Promise<void> {
    try {
        const sessionId = getSession();
        await sseClient(sessionId);
    } catch (error) {
        console.error(`程序启动失败: ${error}`);
        process.exit(1);
    }
}

// 如果直接运行此文件，启动聊天客户端
if (require.main === module) {
    main();
}
