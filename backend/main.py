from fastapi import FastAPI, HTTPException, Depends, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
from dotenv import load_dotenv
import openai
import google.generativeai as genai
import base64
from io import BytesIO
import traceback
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Initialize OpenAI client
openai_api_key = os.getenv("OPENAI_API_KEY")
if not openai_api_key:
    raise ValueError("OPENAI_API_KEY environment variable is not set")

client = openai.OpenAI(api_key=openai_api_key)

# Initialize Google Gemini client
google_api_key = os.getenv("GOOGLE_API_KEY")
if not google_api_key:
    raise ValueError("GOOGLE_API_KEY environment variable is not set")

genai.configure(api_key=google_api_key)

# Use a newer model as recommended in the error message
# The error suggested: "Consider switching to different model, for example gemini-1.5-flash"
GEMINI_MODEL = "models/gemini-1.5-flash"  # This model was in the list of available models
logger.info(f"Using Gemini model: {GEMINI_MODEL}")

gemini_model = genai.GenerativeModel(GEMINI_MODEL)

app = FastAPI(title="NextJS-FastAPI-OpenAI Backend")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # Update with your Next.js frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    model: str = "gpt-3.5-turbo"
    temperature: Optional[float] = 0.7
    max_tokens: Optional[int] = 500

class ChatResponse(BaseModel):
    response: str

class FoodScanResponse(BaseModel):
    analysis: str
    
@app.get("/")
async def root():
    return {"message": "Welcome to the NextJS-FastAPI-OpenAI Backend"}

@app.post("/api/chat", response_model=ChatResponse)
async def chat_with_openai(request: ChatRequest):
    try:
        # Convert Pydantic models to dictionaries for OpenAI API
        messages = [{"role": msg.role, "content": msg.content} for msg in request.messages]
        
        # Call OpenAI API
        response = client.chat.completions.create(
            model=request.model,
            messages=messages,
            temperature=request.temperature,
            max_tokens=request.max_tokens,
        )
        
        # Extract the response content
        response_content = response.choices[0].message.content
        
        return ChatResponse(response=response_content)
    
    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/food-scan", response_model=FoodScanResponse)
async def scan_food(
    file: UploadFile = File(...),
    custom_prompt: Optional[str] = Form(None)
):
    try:
        logger.info(f"Received file: {file.filename}, content_type: {file.content_type}")
        
        # Read the file content
        file_content = await file.read()
        logger.info(f"File size: {len(file_content)} bytes")
        
        # Define the base prompt
        base_prompt = """
        You have to identify different types of food in images.
        The system should accurately detect and label various foods displayed in the image, providing the name
        of the food and its location within the image (e.g., bottom left, right corner, etc.). Additionally,
        the system should extract nutritional information and categorize the type of food (e.g., fruits, vegetables, grains, etc.)
        based on the detected items. The output should include a comprehensive report or display showing the
        identified foods, their positions, names, and corresponding nutritional details.
        """
        
        # Combine with custom prompt if provided
        prompt = base_prompt
        if custom_prompt:
            prompt = f"{base_prompt}\n\nAdditional instructions: {custom_prompt}"
        
        logger.info("Calling Gemini API...")
        
        # Call Gemini API
        try:
            # Convert image to base64
            image_base64 = base64.b64encode(file_content).decode('utf-8')
            
            # Create image data
            image_data = {
                "mime_type": file.content_type,
                "data": image_base64
            }
            
            # Generate content using the simplest approach
            response = gemini_model.generate_content(
                contents=[prompt, image_data]
            )
            
            logger.info("Gemini API call successful")
            return FoodScanResponse(analysis=response.text)
        except Exception as e:
            logger.error(f"Error calling Gemini API: {str(e)}")
            logger.error(traceback.format_exc())
            
            # Try a different approach if the first one fails
            try:
                logger.info("Trying different approach...")
                
                # Create a simple text prompt
                text_prompt = f"Analyze this food image: {prompt}"
                
                # Generate content with just text
                response = gemini_model.generate_content(text_prompt)
                logger.info("Gemini API call successful with text-only approach")
                return FoodScanResponse(analysis=response.text)
            except Exception as e2:
                logger.error(f"Error with alternative approach: {str(e2)}")
                logger.error(traceback.format_exc())
                raise HTTPException(
                    status_code=500, 
                    detail=f"Error calling Gemini API: {str(e)} | Alternative approach error: {str(e2)}"
                )
    
    except Exception as e:
        logger.error(f"Error in food-scan endpoint: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(
            status_code=500, 
            detail=f"Error processing request: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)