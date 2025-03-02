from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import google.generativeai as genai
import os
from dotenv import load_dotenv
import json
import io
from PIL import Image, ImageDraw, ImageFont
import base64
import re
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import logging

# Load environment variables
load_dotenv()

# Configure the API key
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY environment variable not set")

genai.configure(api_key=api_key)

# Initialize the model
model = genai.GenerativeModel('gemini-2.0-flash')
vision_model = genai.GenerativeModel('gemini-1.5-pro')  # Better for vision tasks

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.get("/")
def read_root():
    return {"message": "Recipe Generator API"}

def draw_bounding_boxes(image_bytes, items_with_boxes):
    """Draw bounding boxes and labels on the image for detected food items."""
    try:
        # Open the image
        image = Image.open(io.BytesIO(image_bytes))
        draw = ImageDraw.Draw(image)
        
        # Try to load a font, use default if not available
        try:
            font = ImageFont.truetype("arial.ttf", 16)
        except IOError:
            font = ImageFont.load_default()
        
        width, height = image.size
        
        # Draw boxes and labels
        for item, box in items_with_boxes:
            try:
                if len(box) == 4:
                    ymin, xmin, ymax, xmax = box
                    
                    # Ensure values are in the valid range (0-1)
                    xmin = max(0, min(1, xmin))
                    ymin = max(0, min(1, ymin))
                    xmax = max(0, min(1, xmax))
                    ymax = max(0, min(1, ymax))
                    
                    # Convert normalized coordinates to pixel coordinates
                    xmin_px = int(xmin * width)
                    ymin_px = int(ymin * height)
                    xmax_px = int(xmax * width)
                    ymax_px = int(ymax * height)
                    
                    # Ensure box has reasonable dimensions (not too small or too large)
                    if (xmax_px > xmin_px and ymax_px > ymin_px and 
                        (xmax_px - xmin_px) < 0.9 * width and 
                        (ymax_px - ymin_px) < 0.9 * height):
                        
                        # Draw rectangle with thicker width for visibility
                        draw.rectangle([(xmin_px, ymin_px), (xmax_px, ymax_px)], outline="red", width=3)
                        
                        # Draw label with background for better visibility
                        text_position = (xmin_px + 5, ymin_px + 5)
                        text_size = draw.textbbox(text_position, item, font=font)
                        draw.rectangle([(text_position[0]-2, text_position[1]-2), 
                                       (text_size[2]+2, text_size[3]+2)], fill="red")
                        draw.text(text_position, item, fill="white", font=font)
            except Exception as e:
                print(f"Error drawing box for {item}: {str(e)}")
                continue
        
        # Save the image to a bytes buffer
        img_byte_arr = io.BytesIO()
        image.save(img_byte_arr, format=image.format if image.format else 'JPEG')
        img_byte_arr.seek(0)
        
        return img_byte_arr.getvalue()
    except Exception as e:
        print(f"Error drawing bounding boxes: {str(e)}")
        # Return original image if labeling fails
        return image_bytes

def parse_food_items_with_boxes(response_text):
    """Parse the food items and their bounding boxes from Gemini's response."""
    try:
        # Clean up the response text to handle potential formatting issues
        cleaned_text = response_text.strip()
        # If the response starts with backticks (markdown code block), remove them
        if cleaned_text.startswith("```") and cleaned_text.endswith("```"):
            cleaned_text = cleaned_text[3:-3].strip()
            if cleaned_text.startswith("json"):
                cleaned_text = cleaned_text[4:].strip()
        
        # Try to parse the entire response as JSON first
        response_json = json.loads(cleaned_text)
        items_with_boxes = []
        food_items = []
        
        # Handle nested structure with 'items' key if present
        if 'items' in response_json and isinstance(response_json['items'], list):
            for item_obj in response_json['items']:
                if 'name' in item_obj and 'box' in item_obj and isinstance(item_obj['box'], list) and len(item_obj['box']) == 4:
                    item_name = item_obj['name']
                    box = [float(val) for val in item_obj['box']]
                    items_with_boxes.append((item_name, box))
                    if item_name not in food_items:
                        food_items.append(item_name)
            return food_items, items_with_boxes
        
        # Handle flat structure with item names as keys
        for item, box in response_json.items():
            if isinstance(box, list) and len(box) == 4:
                # Convert all values to float
                box = [float(val) for val in box]
                items_with_boxes.append((item, box))
                if item not in food_items:
                    food_items.append(item)
        
        return food_items, items_with_boxes
    except json.JSONDecodeError:
        # If not valid JSON, try regex pattern matching
        items_with_boxes = []
        food_items = []
        
        # Look for patterns like: "item": [0.1, 0.2, 0.3, 0.4]
        pattern = r'"([^"]+)":\s*\[([0-9.]+),\s*([0-9.]+),\s*([0-9.]+),\s*([0-9.]+)\]'
        matches = re.findall(pattern, response_text)
        
        for match in matches:
            item = match[0]
            box = [float(match[1]), float(match[2]), float(match[3]), float(match[4])]
            items_with_boxes.append((item, box))
            if item not in food_items:
                food_items.append(item)
        
        return food_items, items_with_boxes

@app.post("/analyze-image/")
async def analyze_image(file: UploadFile = File(...)):
    try:
        # Read the image file
        contents = await file.read()
        
        # Create a unified prompt that asks for both food items and bounding boxes
        unified_prompt = """
        Analyze this image carefully and identify each individual food item or ingredient visible.
        
        For EACH SPECIFIC ITEM (not categories or shelves), provide a tight bounding box in normalized [ymin, xmin, ymax, xmax] format:
        - ymin: the top edge (0 = top of image, 1 = bottom of image)
        - xmin: the left edge (0 = left of image, 1 = right of image)
        - ymax: the bottom edge (0 = top of image, 1 = bottom of image)
        - xmax: the right edge (0 = left of image, 1 = right of image)
        
        Important rules:
        1. Identify INDIVIDUAL ITEMS, not categories or shelves
        2. Draw TIGHT boxes around each specific product
        3. If you see multiple instances of the same item, create a separate box for each
        4. Be specific with item names (e.g., "strawberry jam" instead of just "jam")
        5. Boxes can overlap if items are close to each other
        
        Return a JSON object where:
        - Each key is the name of a specific food item
        - Each value is an array of coordinates [ymin, xmin, ymax, xmax]
        
        Example response:
        {
            "strawberry jam jar": [0.1, 0.2, 0.3, 0.4],
            "milk bottle": [0.5, 0.6, 0.7, 0.8],
            "cheddar cheese": [0.2, 0.3, 0.4, 0.5]
        }
        
        OR alternatively, you can return a structure with an 'items' array:
        
        {
            "items": [
                {"name": "strawberry jam jar", "box": [0.1, 0.2, 0.3, 0.4]},
                {"name": "milk bottle", "box": [0.5, 0.6, 0.7, 0.8]},
                {"name": "cheddar cheese", "box": [0.2, 0.3, 0.4, 0.5]}
            ]
        }
        
        Only include food items that are clearly visible and identifiable in the image.
        Return only the JSON object without any additional text or explanations.
        """
        
        # Prepare the image for the model
        image_parts = [
            {
                "mime_type": file.content_type,
                "data": contents
            }
        ]
        
        # First try with the more powerful vision model
        try:
            response = vision_model.generate_content([unified_prompt, *image_parts])
            text_response = response.text
            food_items, items_with_boxes = parse_food_items_with_boxes(text_response)
            
            # If no items detected with the pro model, try with the flash model as backup
            if not items_with_boxes:
                response = model.generate_content([unified_prompt, *image_parts])
                text_response = response.text
                food_items, items_with_boxes = parse_food_items_with_boxes(text_response)
        except Exception as e:
            # If the pro model fails, fall back to the flash model
            print(f"Error with vision_model: {str(e)}")
            response = model.generate_content([unified_prompt, *image_parts])
            text_response = response.text
            food_items, items_with_boxes = parse_food_items_with_boxes(text_response)
        
        # Draw bounding boxes on the image
        labeled_image = draw_bounding_boxes(contents, items_with_boxes)
        
        # Convert the labeled image to base64 for sending to frontend
        base64_image = base64.b64encode(labeled_image).decode('utf-8')
        
        return {
            "food_items": food_items,
            "labeled_image": base64_image
        }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")

@app.post("/generate-recipe/")
async def generate_recipe(request_data: dict):
    try:
        # Log that the endpoint was hit
        logger.info("Generate recipe endpoint hit!")
        logger.info(f"Request data: {request_data}")
        
        # Extract ingredients and preferences from the request
        ingredients = request_data.get("ingredients", [])
        logger.info(f"Ingredients: {ingredients}")
        
        preferences = request_data.get("preferences", {})
        logger.info(f"Preferences: {preferences}")
        
        # Extract specific preferences
        allergies = preferences.get("allergies", [])
        dietary_restrictions = preferences.get("dietaryRestrictions", [])
        meal_type = preferences.get("mealType")
        cuisine_types = preferences.get("cuisineTypes", [])
        prep_time = preferences.get("prepTime")
        cooking_methods = preferences.get("cookingMethods", [])
        preferred_ingredients = preferences.get("preferredIngredients", [])
        avoid_ingredients = preferences.get("avoidIngredients", [])
        
        # Create a text-only model for recipe generation
        text_model = genai.GenerativeModel('gemini-2.0-flash')
        
        # Join ingredients into a comma-separated string
        ingredients_text = ", ".join(ingredients)
        
        # Build preference constraints
        constraints = []
        
        if allergies:
            constraints.append(f"DO NOT include these allergens: {', '.join(allergies)}.")
        
        if dietary_restrictions:
            constraints.append(f"Follow these dietary restrictions: {', '.join(dietary_restrictions)}.")
        
        if meal_type:
            constraints.append(f"The recipe should be for a {meal_type}.")
        
        if cuisine_types:
            constraints.append(f"The recipe should be in the style of {', '.join(cuisine_types)} cuisine.")
        
        if prep_time:
            constraints.append(f"The preparation time should be around {prep_time}.")
        
        if cooking_methods:
            constraints.append(f"Use these cooking methods: {', '.join(cooking_methods)}.")
        
        if preferred_ingredients:
            constraints.append(f"Try to include these preferred ingredients if possible: {', '.join(preferred_ingredients)}.")
        
        if avoid_ingredients:
            constraints.append(f"DO NOT use these ingredients: {', '.join(avoid_ingredients)}.")
        
        constraints_text = " ".join(constraints)
        
        # Prompt for recipe generation
        prompt = f"""
        Generate THREE different recipes using only the ingredients listed: {ingredients_text}.

        You don't have to use all the ingredients, but use a subset of them for each recipe.
        Make each recipe unique and different from the others.

        {constraints_text}

        Format the response as a JSON object with the following structure:
        {{
            "recipes": [
                {{
                    "title": "Recipe 1 Name",
                    "ingredients": ["ingredient 1", "ingredient 2", ...],
                    "instructions": ["step 1", "step 2", ...],
                    "prep_time": "X minutes",
                    "cook_time": "Y minutes",
                    "servings": Z
                }},
                {{
                    "title": "Recipe 2 Name",
                    "ingredients": ["ingredient 1", "ingredient 2", ...],
                    "instructions": ["step 1", "step 2", ...],
                    "prep_time": "X minutes",
                    "cook_time": "Y minutes",
                    "servings": Z
                }},
                {{
                    "title": "Recipe 3 Name",
                    "ingredients": ["ingredient 1", "ingredient 2", ...],
                    "instructions": ["step 1", "step 2", ...],
                    "prep_time": "X minutes",
                    "cook_time": "Y minutes",
                    "servings": Z
                }}
            ]
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

@app.get("/test/")
async def test_endpoint():
    logger.info("Test endpoint hit!")
    return {"message": "API is working!"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="localhost", port=8000)