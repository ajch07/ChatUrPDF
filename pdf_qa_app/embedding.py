from langchain_core.documents import Document
from langchain_community.embeddings import OpenAIEmbeddings
from langchain_community.vectorstores.pgvector import PGVector
import os
from dotenv import load_dotenv

load_dotenv()

PGVECTOR_CONNECTION_STRING = os.getenv("PGVECTOR_CONNECTION_STRING")  # e.g. "postgresql://user:password@host:port/dbname"

def embed_and_store(chunks, namespace):
    embeddings = OpenAIEmbeddings()
    doc_objs = [Document(page_content=chunk, metadata={"namespace": namespace}) for chunk in chunks]
    vectorstore = PGVector.from_documents(
        documents=doc_objs,
        embedding=embeddings,
        connection_string=PGVECTOR_CONNECTION_STRING,
        collection_name=namespace  # Use namespace as collection name
    )
    return vectorstore