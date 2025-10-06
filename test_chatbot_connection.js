// Test chatbot WebSocket connection and Gemini integration
const WebSocket = require('ws');

let sessionId = null;
const ws = new WebSocket('ws://localhost:8083/chat');

ws.on('open', function open() {
    console.log('✅ Connected to chatbot WebSocket');
});

ws.on('message', function message(data) {
    const response = JSON.parse(data.toString());
    console.log('\n📨 Received:', JSON.stringify(response, null, 2));

    if (response.type === 'connection') {
        sessionId = response.sessionId;
        console.log(`\n✅ Session created: ${sessionId}`);
        console.log(`Welcome message: ${response.message}\n`);

        // Test 1: Platform question (Knowledge Base)
        setTimeout(() => testPlatformQuestion(), 1000);
    } else if (response.type === 'bot_response') {
        console.log(`\n🤖 Bot Response: ${response.content}`);
        if (response.suggestions) {
            console.log(`💡 Suggestions: ${response.suggestions.join(', ')}`);
        }
    } else if (response.type === 'typing') {
        console.log('⌨️  Bot is typing...');
    } else if (response.type === 'error') {
        console.log(`❌ Error: ${response.message}`);
    }
});

ws.on('error', function error(err) {
    console.error('❌ WebSocket error:', err.message);
});

ws.on('close', function close() {
    console.log('🔌 Connection closed');
});

function sendMessage(content, testName) {
    console.log(`\n📤 [${testName}] Asking: "${content}"`);
    const message = {
        type: 'user_message',
        content: content,
        sessionId: sessionId,
        userId: 'test-user-123'
    };
    ws.send(JSON.stringify(message));
}

function testPlatformQuestion() {
    console.log('\n========== TEST 1: Platform Question (Knowledge Base) ==========');
    sendMessage('What is CircularSync?', 'PLATFORM INFO');

    setTimeout(() => testWasteTypes(), 8000);
}

function testWasteTypes() {
    console.log('\n========== TEST 2: Waste Types Question ==========');
    sendMessage('What waste types do you accept?', 'WASTE TYPES');

    setTimeout(() => testPricing(), 8000);
}

function testPricing() {
    console.log('\n========== TEST 3: Pricing Information ==========');
    sendMessage('What are your fees?', 'PRICING');

    setTimeout(() => testGeneralQuestion(), 8000);
}

function testGeneralQuestion() {
    console.log('\n========== TEST 4: General Question (Gemini AI) ==========');
    sendMessage('How does quality assessment work?', 'QUALITY PROCESS');

    setTimeout(() => testComplexQuestion(), 8000);
}

function testComplexQuestion() {
    console.log('\n========== TEST 5: Complex Question (Gemini AI) ==========');
    sendMessage('Tell me about the auction process and how bidding works', 'AUCTION INFO');

    setTimeout(() => {
        console.log('\n========== ALL TESTS COMPLETED ==========');
        ws.close();
    }, 8000);
}

// Handle process termination
process.on('SIGINT', () => {
    console.log('\n\n⚠️  Interrupted. Closing connection...');
    ws.close();
    process.exit(0);
});
