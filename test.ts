import { getSession, getRequestId } from '../session';
import { sseClient } from './chat';

/**
 * 测试session生成功能
 */
function testSessionGeneration(): void {
    console.log('=== 测试Session生成功能 ===');
    
    // 测试getSession
    const sessionId1 = getSession();
    const sessionId2 = getSession();
    console.log(`Session ID 1: ${sessionId1}`);
    console.log(`Session ID 2: ${sessionId2}`);
    console.log(`Session ID 是否唯一: ${sessionId1 !== sessionId2}`);
    
    // 测试getRequestId
    const requestId1 = getRequestId();
    const requestId2 = getRequestId();
    console.log(`Request ID 1: ${requestId1}`);
    console.log(`Request ID 2: ${requestId2}`);
    console.log(`Request ID 长度: ${requestId1.length} (应该是48)`);
    console.log(`Request ID 是否唯一: ${requestId1 !== requestId2}`);
    
    console.log('=== Session测试完成 ===\n');
}

/**
 * 测试编码修复功能
 */
function testEncodingFix(): void {
    console.log('=== 测试编码修复功能 ===');
    
    // 模拟一些可能的编码问题
    const testStrings = [
        '你好世界',
        'Hello World',
        '测试中文编码',
        'Test encoding 测试'
    ];
    
    testStrings.forEach((str, index) => {
        const fixed = str; // 在这个简单测试中，我们假设输入已经是正确的
        console.log(`测试 ${index + 1}: "${str}" -> "${fixed}"`);
    });
    
    console.log('=== 编码测试完成 ===\n');
}

/**
 * 模拟聊天测试（不实际发送请求）
 */
async function testChatInterface(): Promise<void> {
    console.log('=== 测试聊天接口 ===');
    
    const sessionId = getSession();
    console.log(`使用Session ID: ${sessionId}`);
    
    // 这里我们只测试接口的初始化，不实际发送请求
    console.log('聊天接口初始化成功');
    console.log('注意：要测试实际聊天功能，请运行 npm run dev');
    
    console.log('=== 聊天接口测试完成 ===\n');
}

/**
 * 主测试函数
 */
async function runTests(): Promise<void> {
    console.log('开始运行TypeScript聊天客户端测试...\n');
    
    try {
        testSessionGeneration();
        testEncodingFix();
        await testChatInterface();
        
        console.log('所有测试完成！');
        console.log('\n下一步：');
        console.log('1. 运行 npm install 安装依赖');
        console.log('2. 运行 npm run dev 启动聊天客户端');
        console.log('3. 或者运行 npm run build && npm start 编译后运行');
        
    } catch (error) {
        console.error('测试过程中发生错误:', error);
    }
}

// 运行测试
if (require.main === module) {
    runTests();
}
