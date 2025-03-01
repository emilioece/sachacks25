from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai
import os
from dotenv import load_dotenv
import json

# Load environment variables
load_dotenv()

# Configure the API key
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY environment variable not set")

genai.configure(api_key=api_key)

# Initialize the model
model = genai.GenerativeModel('gemini-pro-vision')

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Recipe Generator API"}

@app.post("/analyze-image/")
async def analyze_image(file: UploadFile = File(...)):
    try:
        # Read the image file
        contents = await file.read()
        
        # Prepare the image for the model
        image_parts = [
            {
                "mime_type": file.content_type,
                "data": contents
            }
        ]
        
        # Prompt to extract food items in a structured format
        prompt = """
        Analyze this image and identify all food items or ingredients visible.
        Return ONLY a JSON array of strings with the names of the food items.
        For example: ["apple", "bread", "cheese"]
        Do not include any explanations or additional text, just the JSON array.
        """
        
        # Generate content
        response = model.generate_content([prompt, *image_parts])
        
        # Extract the text response
        text_response = response.text
        
        # Try to parse as JSON
        try:
            # Find JSON array in the response if it's not a clean JSON
            import re
            json_match = re.search(r'\[.*\]', text_response, re.DOTALL)
            if json_match:
                text_response = json_match.group(0)
            
            food_items = json.loads(text_response)
            
            # Ensure it's a list
            if not isinstance(food_items, list):
                food_items = [str(food_items)]
                
            return {"food_items": food_items}
        except json.JSONDecodeError:
            # If JSON parsing fails, return the raw text in a list
            return {"food_items": [text_response.strip()]}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")

@app.post("/generate-recipe/")
async def generate_recipe(ingredients: list[str]):
    try:
        # Create a text-only model for recipe generation
        text_model = genai.GenerativeModel('gemini-pro')
        
        # Join ingredients into a comma-separated string
        ingredients_text = ", ".join(ingredients)
        
        # Prompt for recipe generation
        prompt = f"""
        Generate a recipe using some or all of these ingredients: {ingredients_text}.
        
        Format the response as a JSON object with the following structure:
        {{
            "title": "Recipe Name",
            "ingredients": ["ingredient 1", "ingredient 2", ...],
            "instructions": ["step 1", "step 2", ...],
            "prep_time": "X minutes",
            "cook_time": "Y minutes",
            "servings": Z
        }}
        
        Return only the JSON object without any additional text.
        """
        
        # Generate content
        response = text_model.generate_content(prompt)
        
        # Extract the text response
        text_response = response.text
        
        # Try to parse as JSON
        try:
            # Find JSON object in the response if it's not a clean JSON
            import re
            json_match = re.search(r'\{.*\}', text_response, re.DOTALL)
            if json_match:
                text_response = json_match.group(0)
                
            recipe = json.loads(text_response)
            return recipe
        except json.JSONDecodeError:
            # If JSON parsing fails, return the raw text
            return {"error": "Failed to parse recipe", "raw_response": text_response}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating recipe: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)