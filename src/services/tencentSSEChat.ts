// 轻量SSE聊天客户端（前端可用）

export const BOT_APP_KEY = "tPFIVnKUviLCilazajGPuSWEgrSaybqPUvXnJJuyfxQEQaCCHakWTyLmVYCapKXZuJVvrSQyHXeNHgFkjMiWqjxNZxpIsfXJCfUmXKPDRiteRgtzrSyTTZmpvMyTGiZz";
export const VISITOR_BIZ_ID = "202503130001";
export const STREAMING_THROTTLE = 1;
export const API_URL = "https://wss.lke.cloud.tencent.com/v1/qbot/chat/sse";

export type ChatRequest = {
    content: string;
    bot_app_key: string;
    visitor_biz_id: string;
    session_id: string;
    streaming_throttle: number;
};

export type ChatPayload = {
    content: string;
    is_from_self: boolean;
    is_final: boolean;
};

export type ChatEvent = {
    type: string;
    payload: ChatPayload;
};

export function generateSessionId(): string {
    if (crypto && 'randomUUID' in crypto) {
        return crypto.randomUUID();
    }
    const arr = new Uint8Array(16);
    (crypto as Crypto).getRandomValues(arr);
    arr[6] = (arr[6] & 0x0f) | 0x40;
    arr[8] = (arr[8] & 0x3f) | 0x80;
    const hex = Array.from(arr).map(b => b.toString(16).padStart(2, '0'));
    return `${hex.slice(0,4).join('')}-${hex.slice(4,6).join('')}-${hex.slice(6,8).join('')}-${hex.slice(8,10).join('')}-${hex.slice(10,16).join('')}`;
}

export function fixEncoding(mojibakeStr: string): string {
    try {
        return mojibakeStr;
    } catch (e) {
        return mojibakeStr;
    }
}

export type SSECallbacks = {
    onPartial?: (text: string) => void;
    onFinal?: (text: string, audioUrl?: string) => void;
    onSelf?: (text: string) => void;
    onError?: (err: string) => void;
};

// 提取 START...END 之间的 URL，并返回 { cleanText, audioUrl }
export function extractAudioUrlFromText(text: string): { cleanText: string; audioUrl?: string } {
    const startIdx = text.indexOf('START');
    const endIdx = text.indexOf('END');
    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
        const url = text.substring(startIdx + 5, endIdx).trim();
        const cleanText = (text.substring(0, startIdx) + text.substring(endIdx + 3)).trim();
        return { cleanText, audioUrl: url };
    }
    return { cleanText: text };
}

// 下载并播放音频（浏览器环境）
export async function downloadAndPlayAudio(url: string): Promise<HTMLAudioElement> {
    // 优先直接播放远程URL，避免fetch触发CORS
    try {
        const direct = new Audio(url);
        direct.preload = 'auto';
        // 某些环境需要用户手势触发播放；此处假设调用来自点击事件链
        await direct.play();
        return direct;
    } catch (e) {
        // 回退到通过blob播放（如果目标允许跨域）
        try {
            const resp = await fetch(url, { method: 'GET' });
            if (!resp.ok) throw new Error(`音频下载失败: ${resp.status}`);
            const blob = await resp.blob();
            const objectUrl = URL.createObjectURL(blob);
            const audio = new Audio(objectUrl);
            audio.preload = 'auto';
            await audio.play();
            return audio;
        } catch (err) {
            throw err instanceof Error ? err : new Error(String(err));
        }
    }
}

export async function sendTencentChat(content: string, sessionId: string, callbacks: SSECallbacks = {}): Promise<void> {
    const reqData: ChatRequest = {
        content,
        bot_app_key: BOT_APP_KEY,
        visitor_biz_id: VISITOR_BIZ_ID,
        session_id: sessionId,
        streaming_throttle: STREAMING_THROTTLE
    };

    const headers: HeadersInit = {
        "Accept": "text/event-stream",
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive"
    };

    const resp = await fetch(API_URL, {
        method: "POST",
        headers,
        body: JSON.stringify(reqData)
    });

    if (!resp.ok) {
        const text = await resp.text();
        callbacks.onError?.(`HTTP ${resp.status}: ${text}`);
        return;
    }

    if (!resp.body) {
        callbacks.onError?.("响应体为空");
        return;
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        for (let i = 0; i < lines.length - 1; i++) {
            const line = lines[i].trim();
            if (!line.startsWith('data:')) continue;
            try {
                const dataStr = line.slice(5).trim();
                if (!dataStr) continue;
                const data = JSON.parse(dataStr) as ChatEvent;
                if (data.type === 'reply') {
                    const payload = data.payload;
                    const text = fixEncoding(payload.content);
                    if (payload.is_from_self) {
                        callbacks.onSelf?.(text);
                    } else if (payload.is_final) {
                        const { cleanText, audioUrl } = extractAudioUrlFromText(text);
                        callbacks.onFinal?.(cleanText, audioUrl);
                    } else {
                        const { cleanText, audioUrl } = extractAudioUrlFromText(text);
                        callbacks.onPartial?.(cleanText);
                    }
                }
            } catch (e) {
                callbacks.onError?.(`JSON解析错误: ${String(e)} | 原始: ${line}`);
            }
        }
        buffer = lines[lines.length - 1] || "";
    }
}


