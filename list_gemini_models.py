import requests
import json

API_KEY = "AIzaSyAfIyZYEU4lbM1ogOD8ziCBDCQGl_KNEpU"

# List available models
print("Fetching available Gemini models...\n")

urls = [
    f"https://generativelanguage.googleapis.com/v1beta/models?key={API_KEY}",
    f"https://generativelanguage.googleapis.com/v1/models?key={API_KEY}",
]

for url in urls:
    api_version = "v1beta" if "v1beta" in url else "v1"
    print(f"=" * 70)
    print(f"API Version: {api_version}")
    print("=" * 70)

    try:
        response = requests.get(url, timeout=10)

        if response.status_code == 200:
            result = response.json()
            models = result.get('models', [])

            print(f"\nFound {len(models)} models:\n")

            for model in models:
                model_name = model.get('name', '')
                display_name = model.get('displayName', '')
                supported_methods = model.get('supportedGenerationMethods', [])

                # Extract just the model ID
                model_id = model_name.replace('models/', '')

                if 'generateContent' in supported_methods:
                    print(f"  Model ID: {model_id}")
                    print(f"  Display Name: {display_name}")
                    print(f"  Methods: {', '.join(supported_methods)}")
                    print()

        else:
            print(f"Error: {response.status_code}")
            print(response.text)

    except Exception as e:
        print(f"Error: {e}")

    print()
