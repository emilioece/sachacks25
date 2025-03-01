import os
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables
load_dotenv()

# Get API key
api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
    raise ValueError("GOOGLE_API_KEY environment variable is not set")

print(f"API Key found: {api_key[:5]}...{api_key[-5:]}")

# Configure the Gemini API
genai.configure(api_key=api_key)

# List available models
print("\nListing available models:")
for model in genai.list_models():
    print(f"- {model.name}: {model.supported_generation_methods}")

# Try with the full model name
try:
    print("\nTrying with gemini-1.0-pro...")
    model = genai.GenerativeModel('gemini-1.0-pro')
    response = model.generate_content("Hello, how are you?")
    print("Text response:")
    print(response.text)
    print("\nGemini API is working correctly!")
except Exception as e:
    print(f"Error with gemini-1.0-pro: {str(e)}")
    
    # Try with the alternative model name
    try:
        print("\nTrying with gemini-pro...")
        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content("Hello, how are you?")
        print("Text response:")
        print(response.text)
        print("\nGemini API is working correctly!")
    except Exception as e:
        print(f"Error with gemini-pro: {str(e)}")
        
        # Try with another alternative
        try:
            print("\nTrying with models/gemini-pro...")
            model = genai.GenerativeModel('models/gemini-pro')
            response = model.generate_content("Hello, how are you?")
            print("Text response:")
            print(response.text)
            print("\nGemini API is working correctly!")
        except Exception as e:
            print(f"Error with models/gemini-pro: {str(e)}")
            print("\nAll model attempts failed. Please check your API key permissions and available models.")

# Note: To test with images, you would need to run this in a context where you can load an image file
# This script only tests the basic API connectivity and authentication 