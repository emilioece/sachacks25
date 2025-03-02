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
        
        # # If still no valid boxes found, try with a different prompt format
        # if not items_with_boxes:
        #     alternate_prompt = """
        #     For each individual food item in this image, provide:
        #     1. The specific name of the item
        #     2. A tight bounding box around only that item
            
        #     Return a JSON array with this structure:
        #     {
        #         "items": [
        #             {
        #                 "name": "specific food name",
        #                 "box": [ymin, xmin, ymax, xmax]
        #             },
        #             {
        #                 "name": "another food item",
        #                 "box": [ymin, xmin, ymax, xmax]
        #             }
        #         ]
        #     }
            
        #     IMPORTANT: 
        #     - Each box should tightly bound a single item, not shelves or categories
        #     - Coordinates should be normalized between 0 and 1
        #     - Be precise with item names
        #     - Return only valid JSON with no additional text
        #     """
            
        #     try:
        #         alt_response = vision_model.generate_content([alternate_prompt, *image_parts])
        #         alt_text = alt_response.text
        #         food_items, items_with_boxes = parse_food_items_with_boxes(alt_text)
        #     except Exception as e:
        #         print(f"Error with alternate approach: {str(e)}")
        
        # # If still no bounding boxes, generate artificial ones based on items
        # if not items_with_boxes:
        #     # First get just the food items
        #     items_prompt = """
        #     Analyze this image and identify each individual food item or ingredient visible.
        #     Be specific (e.g., "strawberry jam" not just "jam").
        #     Return ONLY a JSON array of strings with the names of the specific food items.
        #     For example: ["strawberry jam jar", "milk bottle", "cheddar cheese block"]
        #     Do not include general categories or shelves.
        #     """
            
        #     items_response = model.generate_content([items_prompt, *image_parts])
        #     items_text = items_response.text
            
        #     try:
        #         # Find JSON array in the response if it's not a clean JSON
        #         json_match = re.search(r'\[.*\]', items_text, re.DOTALL)
        #         if json_match:
        #             items_text = json_match.group(0)
                
        #         food_items = json.loads(items_text)
                
        #         # Ensure it's a list
        #         if not isinstance(food_items, list):
        #             food_items = [str(food_items)]
                
        #         # Generate simulated bounding boxes
        #         # This time with a more random distribution to avoid grid-like appearance
        #         import random
        #         for i, item in enumerate(food_items):
        #             # Create a reasonably sized box at a semi-random position
        #             box_width = random.uniform(0.15, 0.3)
        #             box_height = random.uniform(0.15, 0.3)
                    
        #             # Distribute across the image with some randomness
        #             x_pos = (i % 3) * 0.33 + random.uniform(0.02, 0.1)
        #             y_pos = (i // 3) * 0.33 + random.uniform(0.02, 0.1)
                    
        #             # Ensure the box stays within image bounds
        #             xmin = min(0.95 - box_width, max(0.05, x_pos))
        #             ymin = min(0.95 - box_height, max(0.05, y_pos))
        #             xmax = xmin + box_width
        #             ymax = ymin + box_height
                    
        #             items_with_boxes.append((item, [ymin, xmin, ymax, xmax]))
        #     except json.JSONDecodeError:
        #         # If parsing fails, create at least one item
        #         food_items = ["Unknown food item"]
        #         items_with_boxes = [("Unknown food item", [0.1, 0.1, 0.4, 0.4])]
        
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
async def generate_recipe(ingredients: list[str]):
    try:
        # Create a text-only model for recipe generation
        text_model = genai.GenerativeModel('gemini-2.0-flash')
        
        # Join ingredients into a comma-separated string
        ingredients_text = ", ".join(ingredients)
        
        # Prompt for recipe generation
        prompt = f"""
        Generate a recipe using only the ingredients listed: {ingredients_text}.

        You don't have to use all the ingredients, but use a subset of them.

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
    uvicorn.run(app, host="localhost", port=8000)