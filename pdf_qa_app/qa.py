from langchain.chains import RetrievalQA
from langchain_community.chat_models import ChatOpenAI
from langchain_community.embeddings import OpenAIEmbeddings
from langchain_community.vectorstores.pgvector import PGVector
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

PGVECTOR_CONNECTION_STRING = os.getenv("PGVECTOR_CONNECTION_STRING")

def get_date_context():
    now = datetime.now()
    day = now.strftime("%A")        # e.g., "Wednesday"
    date = now.strftime("%B %d, %Y")  # e.g., "June 19, 2025"
    return f"Today is {day}, {date}."

def answer_question(question: str, namespace: str):
    # Add current date and day to provide context to the LLM
    date_context = get_date_context()
    question_with_date = f"{date_context}\nUser question: {question}"

    embeddings = OpenAIEmbeddings()
    vectorstore = PGVector(
        connection_string=PGVECTOR_CONNECTION_STRING,
        embedding_function=embeddings,
        collection_name=namespace
    )

    retriever = vectorstore.as_retriever(search_kwargs={"k": 5})
    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.3)

    qa_chain = RetrievalQA.from_chain_type(
        llm=llm,
        retriever=retriever,
        return_source_documents=False
    )

    return qa_chain.run(question_with_date)