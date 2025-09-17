import { randomBytes } from 'crypto';

/**
 * 生成一个UUID作为session ID
 * @returns {string} 生成的session ID
 */
export function getSession(): string {
    // 生成一个 UUID
    const newUuid = crypto.randomUUID();
    return newUuid;
}

/**
 * 生成一个48位的request ID
 * @returns {string} 生成的request ID
 */
export function getRequestId(): string {
    // 生成 24 个字节的随机数据
    const randomBytes = crypto.getRandomValues(new Uint8Array(24));
    
    // 将随机数据转换为十六进制字符串
    const requestId = Array.from(randomBytes)
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join('');
    
    return requestId;
}

// 如果直接运行此文件，测试功能
if (require.main === module) {
    const sid = getRequestId();
    console.log('Generated Request ID:', sid);
    
    const sessionId = getSession();
    console.log('Generated Session ID:', sessionId);
}
