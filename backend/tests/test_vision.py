import os
import base64
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

# Use the newer model as recommended in the error message
GEMINI_MODEL = "models/gemini-1.5-flash"
print(f"Using Gemini model: {GEMINI_MODEL}")

# Function to encode image to base64
def encode_image_from_file(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

# Test with a sample image if provided
def test_with_image(image_path):
    try:
        # Read the image file
        with open(image_path, "rb") as f:
            image_data = f.read()
        
        # Create the model
        model = genai.GenerativeModel(GEMINI_MODEL)
        
        # Define the prompt
        prompt = "Describe what you see in this image in detail."
        
        # Convert image to base64
        image_base64 = base64.b64encode(image_data).decode('utf-8')
        
        # Create image data
        image_dict = {
            "mime_type": "image/jpeg",  # Adjust based on your image type
            "data": image_base64
        }
        
        print("Trying with base64 encoded image...")
        try:
            # Generate content using the simplest approach
            response = model.generate_content(
                contents=[prompt, image_dict]
            )
            
            print("\nImage analysis:")
            print(response.text)
            print("\nGemini API is working correctly with base64 approach!")
            return True
        except Exception as e:
            print(f"Error with base64 approach: {str(e)}")
            
            print("\nTrying text-only approach...")
            try:
                # Create a simple text prompt
                text_prompt = f"Analyze this image (base64 encoded, not visible to you): {prompt}"
                
                # Generate content with just text
                response = model.generate_content(text_prompt)
                print("\nText-only response:")
                print(response.text)
                print("\nText-only approach worked, but image analysis won't be accurate.")
                return True
            except Exception as e2:
                print(f"Error with text-only approach: {str(e2)}")
                return False
    except Exception as e:
        print(f"Error testing vision model: {str(e)}")
        return False

if __name__ == "__main__":
    # Check if an image path is provided as a command line argument
    import sys
    
    if len(sys.argv) > 1:
        image_path = sys.argv[1]
        print(f"Testing with image: {image_path}")
        test_with_image(image_path)
    else:
        print("\nNo image path provided. To test with an image, run:")
        print("python test_vision.py path/to/your/image.jpg")
        
        # List available models for reference
        print("\nAvailable models:")
        for model in genai.list_models():
            if 'vision' in model.name.lower() or 'gemini-1.5' in model.name.lower():
                print(f"- {model.name}: {model.supported_generation_methods}") 