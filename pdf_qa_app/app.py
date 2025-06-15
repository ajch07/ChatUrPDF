import streamlit as st
import requests
import uuid

BACKEND_URL = "http://127.0.0.1:8000"  # Or your deployed FastAPI backend

st.title("📄 PDF Q&A App")

# File uploader
pdf_file = st.file_uploader("Upload a PDF (max 10 pages)", type=["pdf"])

if pdf_file:
    st.success("PDF uploaded. Processing...")

    # Upload to FastAPI backend
    files = {"file": (pdf_file.name, pdf_file, "application/pdf")}
    response = requests.post(f"{BACKEND_URL}/upload/", files=files)

    if response.status_code == 200:
        file_id = response.json().get("file_id")
        st.session_state["file_id"] = file_id
        st.success(f"File processed! File ID: {file_id}")
    else:
        st.error("Upload failed.")

# Ask questions
if "file_id" in st.session_state:
    st.subheader("Ask Questions")
    question = st.text_input("Enter your question:")
    if question:
        payload = {"question": question, "file_id": st.session_state["file_id"]}
        answer = requests.post(f"{BACKEND_URL}/ask/", json=payload)
        if answer.status_code == 200:
            st.write("### 💬 Answer:")
            st.write(answer.json()["answer"])
        else:
            st.error("Error getting answer.")