import requests
import json

# Gemini API configuration
API_KEY = "AIzaSyAfIyZYEU4lbM1ogOD8ziCBDCQGl_KNEpU"

# Test different model names and API versions
test_configs = [
    {
        "name": "v1beta + gemini-1.5-flash-latest",
        "url": f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key={API_KEY}",
    },
    {
        "name": "v1beta + gemini-1.5-flash",
        "url": f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={API_KEY}",
    },
    {
        "name": "v1beta + gemini-pro",
        "url": f"https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={API_KEY}",
    },
    {
        "name": "v1 + gemini-1.5-flash",
        "url": f"https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key={API_KEY}",
    },
]

# Test payload
payload = {
    "contents": [
        {
            "parts": [
                {
                    "text": "Say hello in one word"
                }
            ]
        }
    ]
}

print("Testing Gemini API configurations...\n")
print("=" * 70)

for config in test_configs:
    print(f"\nTesting: {config['name']}")
    print("-" * 70)

    try:
        response = requests.post(
            config['url'],
            headers={"Content-Type": "application/json"},
            json=payload,
            timeout=10
        )

        print(f"Status Code: {response.status_code}")

        if response.status_code == 200:
            result = response.json()
            if 'candidates' in result and len(result['candidates']) > 0:
                text = result['candidates'][0]['content']['parts'][0]['text']
                print(f"SUCCESS! Response: {text.strip()}")
                print(f"\nWORKING CONFIGURATION:")
                print(f"  Model: {config['name']}")
                print(f"  URL: {config['url']}")
                break
            else:
                print(f"ERROR: Unexpected response format")
                print(f"Response: {json.dumps(result, indent=2)[:200]}")
        else:
            error = response.json()
            print(f"FAILED: {error.get('error', {}).get('message', 'Unknown error')}")

    except Exception as e:
        print(f"ERROR: {str(e)}")

print("\n" + "=" * 70)
print("Test complete!")
