from fastapi import FastAPI, UploadFile, File, Header, Depends
import os
import uuid
import tempfile

from parser import extract_text_from_pdf
from chunker import split_text
from embedding import embed_and_store
from qa import answer_question

from fastapi.middleware.cors import CORSMiddleware
from utils.google_auth import verify_google_token
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://chat-ur-pdf.vercel.app"],  # frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to verify user from Google OAuth token
def get_current_user(authorization: str = Header(...)):
    token = authorization.split("Bearer ")[-1]
    return verify_google_token(token)

# Upload PDF endpoint
@app.post("/upload/")
async def upload_pdf(file: UploadFile = File(...), user=Depends(get_current_user)):
    file_id = str(uuid.uuid4())

    # Create a temporary file in /tmp (safe for deployment)
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf", dir="/tmp") as tmp:
        temp_path = tmp.name
        tmp.write(await file.read())

    try:
        text = extract_text_from_pdf(temp_path)
        chunks = split_text(text)
        embed_and_store(chunks, namespace=file_id)
    finally:
        # Clean up temp file
        if os.path.exists(temp_path):
            os.remove(temp_path)

    return {"message": "PDF uploaded and processed", "file_id": file_id}

# Request model for asking question
class AskRequest(BaseModel):
    question: str
    file_id: str

# Ask a question endpoint
@app.post("/ask/")
async def ask_question(request: AskRequest, user=Depends(get_current_user)):
    answer = answer_question(request.question, namespace=request.file_id)
    return {"question": request.question, "answer": answer}