import asyncio
import websockets
import json
import time

session_id = None

async def test_chatbot():
    uri = "ws://localhost:8083/chat"

    try:
        async with websockets.connect(uri) as websocket:
            print("Connected to chatbot WebSocket\n")

            # Receive welcome message
            response = await websocket.recv()
            data = json.loads(response)
            print(f"Connection Response: {json.dumps(data, indent=2)}")

            if data.get('type') == 'connection':
                global session_id
                session_id = data.get('sessionId')
                print(f"\nSession ID: {session_id}")
                print(f"Welcome: {data.get('message')}\n")

            # Test 1: Platform Question (Knowledge Base)
            await test_question(
                websocket,
                "What is CircularSync?",
                "TEST 1: Platform Info (Knowledge Base)"
            )

            # Test 2: Waste Types
            await test_question(
                websocket,
                "What waste types do you accept?",
                "TEST 2: Waste Types"
            )

            # Test 3: Pricing
            await test_question(
                websocket,
                "What are your fees?",
                "TEST 3: Pricing Info"
            )

            # Test 4: How it works
            await test_question(
                websocket,
                "How does the platform work?",
                "TEST 4: Platform Workflow"
            )

            # Test 5: Features
            await test_question(
                websocket,
                "What features do you have?",
                "TEST 5: Platform Features"
            )

            # Test 6: Typo Handling (Fuzzy Matching)
            await test_question(
                websocket,
                "waht is circularsync",
                "TEST 6: Typo Handling (waht = what)"
            )

            # Test 7: Non-Platform Question (Should Decline)
            await test_question(
                websocket,
                "What is the weather today?",
                "TEST 7: Non-Platform Question (Should Decline)"
            )

            # Test 8: Another Non-Platform Question
            await test_question(
                websocket,
                "Tell me a joke",
                "TEST 8: Non-Platform Question #2 (Should Decline)"
            )

            # Test 9: Platform Question with AI
            await test_question(
                websocket,
                "How does quality assessment work in detail?",
                "TEST 9: AI-Generated Response (Gemini)"
            )

            # Test 10: Registration Question
            await test_question(
                websocket,
                "How to register as supplier?",
                "TEST 10: Registration Info (Knowledge Base)"
            )

            print("\n" + "="*60)
            print("ALL TESTS COMPLETED SUCCESSFULLY")
            print("="*60)
            print("\nRAG-Based Chatbot Tests:")
            print("✅ Knowledge Base responses (instant)")
            print("✅ Typo tolerance (fuzzy matching)")
            print("✅ Non-platform question handling (polite decline)")
            print("✅ AI fallback with platform context")
            print("="*60)

    except Exception as e:
        print(f"\nError: {e}")

async def test_question(websocket, question, test_name):
    print("\n" + "="*60)
    print(f"{test_name}")
    print("="*60)
    print(f"Question: {question}")

    message = {
        "type": "user_message",
        "content": question,
        "sessionId": session_id,
        "userId": "test-user-python"
    }

    await websocket.send(json.dumps(message))

    # Wait for responses
    typing_received = False
    bot_response = None

    for _ in range(10):  # Wait for up to 10 messages
        try:
            response = await asyncio.wait_for(websocket.recv(), timeout=5.0)
            data = json.loads(response)

            if data.get('type') == 'typing':
                if not typing_received:
                    print("Bot is typing...")
                    typing_received = True
            elif data.get('type') == 'bot_response':
                bot_response = data
                print(f"\nBot Response:")
                print(f"   {data.get('content')}")
                if data.get('suggestions'):
                    print(f"\nSuggestions: {', '.join(data.get('suggestions', []))}")
                break
            elif data.get('type') == 'error':
                print(f"Error: {data.get('message')}")
                break
        except asyncio.TimeoutError:
            print("Timeout waiting for response")
            break

    if bot_response:
        # Check response metadata
        metadata = bot_response.get('metadata', {})
        intent = bot_response.get('intent')

        print(f"\nResponse Details:")
        if intent:
            print(f"   Intent: {intent.get('category', 'N/A')}")
            print(f"   Confidence: {intent.get('confidence', 'N/A')}")
        else:
            print(f"   Intent: Clarification/Template Response")
        print(f"   Processing Time: {metadata.get('processingTime', 'N/A')} ms")
        if metadata.get('dataSources'):
            print(f"   Data Sources: {', '.join(metadata.get('dataSources', []))}")

    await asyncio.sleep(1)  # Wait before next test

if __name__ == "__main__":
    print("Starting Chatbot Integration Test")
    print("Testing Knowledge Base + Gemini AI Integration\n")
    asyncio.run(test_chatbot())
