# main.py
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import base64
import pdfplumber
from PIL import Image
import io
import os
import json
import openai
from dotenv import load_dotenv

load_dotenv()
app = FastAPI(title="Requirement Validator")

# Allow CORS for frontend testing
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Stub for AI model call
openai.api_key = os.getenv("OPENAI_API_KEY")

def call_model(payload: dict):
    """
    payload = {
        "type": "text" or "image" or "multimodal",
        "content": text string OR base64 image OR {"text": str, "image": base64 str}
    }
    Returns JSON:
    {
        "score": int,
        "issues": [str],
        "suggestions": [str]
    }
    """

    try:
        messages = []
        import ipdb; ipdb.set_trace()

        if payload["type"] == "text":
            messages.append({
                "role": "user",
                "content": payload["content"]
            })
        elif payload["type"] == "image":
            messages.append({
                "role": "user",
                "content": f"Please extract text from this image and validate requirements:\n{payload['content']}"
            })
        elif payload["type"] == "multimodal":
            # multimodal: both text + image
            content_text = payload["content"].get("text", "")
            content_image = payload["content"].get("image", "")
            messages.append({
                "role": "user",
                "content": f"Validate the following requirements document:\nText:\n{content_text}\nImage:\n{content_image}"
            })
        else:
            return {
                "score": 0,
                "issues": ["❌ Unsupported payload type"],
                "suggestions": ["Use 'text', 'image', or 'multimodal'"]
            }
        
        messages.append({
            "role": "user",
            "content": (
                "You are a Requirements Validator. Do NOT use markdown or code blocks. Respond ONLY with valid JSON.\n"
                "Check the following requirements document and provide a JSON object with exactly these keys:\n"
                "{\n"
                '  "score": int (0-100),\n'
                '  "issues": list of strings,\n'
                '  "suggestions": list of strings\n'
                "}\n"
                "- Check if acceptance criteria are mentioned.\n"
                "- Detect conflicting statements.\n"
                "- Check if design is attached and referenced.\n"
                "- Identify dependencies (API, data, third-party) mentioned.\n\n"
                "Here is the requirements document:\n"
                f"{payload['content']}\n\n"
                "Return JSON ONLY, no explanations, no markdown, no backticks."
            )
        })

        # Send to GPT-4o (multimodal capable)
        response = openai.chat.completions.create(
            model="gpt-4o",
            messages=messages,
            temperature=0
        )

        # Extract text
        ai_content = response.choices[0].message.content

        # Try to parse JSON
        try:
            result = json.loads(ai_content)
            # Ensure required keys exist
            for key in ["score", "issues", "suggestions"]:
                if key not in result:
                    raise ValueError(f"Missing key: {key}")
            return result
        except Exception:
            # Fallback if AI response cannot be parsed
            return {
                "score": 0,
                "issues": ["❌ Unable to parse requirements document"],
                "suggestions": ["Check if the input is a proper SRS / requirements document"]
            }

    except Exception as e:
        return {
            "score": 0,
            "issues": [f"❌ Model call failed: {str(e)}"],
            "suggestions": ["Check API key, model availability, and payload"]
        }

# Helper to extract text from PDF
def extract_text_from_pdf(file: UploadFile) -> str:
    try:
        with pdfplumber.open(file.file) as pdf:
            text = "\n".join(page.extract_text() or "" for page in pdf.pages)
        return text
    except Exception:
        raise ValueError("Failed to extract text from PDF.")

# Helper to process uploaded file
async def process_file(file: UploadFile) -> dict:
    filename = file.filename.lower()
    if filename.endswith(".txt"):
        content = (await file.read()).decode("utf-8")
        return {"type": "text", "content": content}
    elif filename.endswith(".pdf"):
        content = extract_text_from_pdf(file)
        return {"type": "text", "content": content}
    elif filename.endswith((".png", ".jpg", ".jpeg")):
        contents = await file.read()
        b64_image = base64.b64encode(contents).decode()
        image_data = f"data:image/png;base64,{b64_image}"
        return {"type": "image", "content": image_data}
    else:
        raise ValueError("Unsupported file type.")

@app.post("/validate")
async def validate(
    input_text: str = Form(None),
    file: UploadFile = File(None)
):
    if not input_text and not file:
        return JSONResponse(
            status_code=400,
            content={"error": "Provide either input_text or file."}
        )
    try:
        payload_parts = []
        # Process text
        if input_text:
            payload_parts.append(input_text)
        # Process file
        payload_file = None
        if file:
            payload_file = await process_file(file)
            if payload_file["type"] == "text":
                payload_parts.append(payload_file["content"])

        # Determine payload type and structure for AI model
        if input_text and file and payload_file and payload_file["type"] == "image":
            # Both text + image -> multimodal
            payload = {
                "type": "multimodal",
                "content": {
                    "text": "\n\n".join(payload_parts),
                    "image": payload_file["content"]
                }
            }
        elif payload_file and payload_file["type"] == "image":
            # Image only
            payload = payload_file
        elif payload_parts:
            # Text only (from input_text and/or file)
            payload = {
                "type": "text", 
                "content": "\n\n".join(payload_parts)
            }
        else:
            # Fallback case
            payload = {"type": "text", "content": ""}

        # Call AI model for validation
        try:
            result = call_model(payload)
            return result
        except Exception as model_error:
            return JSONResponse(
                status_code=500, 
                content={"error": f"Model processing failed: {str(model_error)}"}
            )

    except ValueError as ve:
        return JSONResponse(status_code=415, content={"error": str(ve)})
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": f"Server error: {str(e)}"})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

