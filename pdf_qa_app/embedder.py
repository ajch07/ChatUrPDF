import os
from langchain_community.embeddings import OpenAIEmbeddings
from langchain_community.vectorstores import SupabaseVectorStore
from supabase_client import get_supabase_client
from langchain_core.documents import Document  # <-- Add this import

from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase = get_supabase_client()

def embed_and_store(chunks, namespace):
    embeddings = OpenAIEmbeddings()
    doc_objs = [Document(page_content=chunk, metadata={"namespace": namespace}) for chunk in chunks]  # <-- Use Document

    vectorstore = SupabaseVectorStore.from_documents(
        documents=doc_objs,
        embedding=embeddings,
        client=supabase,
        table_name="documents"
    )

    return vectorstore