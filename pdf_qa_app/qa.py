from langchain.chains import RetrievalQA
from langchain_community.chat_models import ChatOpenAI
from langchain_community.embeddings import OpenAIEmbeddings
from langchain_community.vectorstores.pgvector import PGVector
import os
from dotenv import load_dotenv

load_dotenv()

PGVECTOR_CONNECTION_STRING = os.getenv("PGVECTOR_CONNECTION_STRING")  # e.g. "postgresql://user:password@host:port/dbname"

def answer_question(question: str, namespace: str):
    embeddings = OpenAIEmbeddings()
    vectorstore = PGVector(
        connection_string=PGVECTOR_CONNECTION_STRING,
        embedding_function=embeddings,
        collection_name=namespace  # You can use namespace as collection_name
    )

    retriever = vectorstore.as_retriever(search_kwargs={"k": 5})
    llm = ChatOpenAI(model="gpt-4o-mini",temperature=0.3)

    qa_chain = RetrievalQA.from_chain_type(
        llm=llm,
        retriever=retriever,
        return_source_documents=False
    )

    return qa_chain.run(question)