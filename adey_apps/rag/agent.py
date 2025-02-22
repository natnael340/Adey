import openai

from langchain.document_loaders import DirectoryLoader, TextLoader
from langchain.schema import Document
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.vectorstores.chroma import Chroma
from langchain.vectorstores.pgvector import PGVector
from langchain.prompts import PromptTemplate
from langchain.chat_models.openai import ChatOpenAI
from langchain.chains import ConversationalRetrievalChain, LLMChain
from langchain.memory import ConversationBufferMemory, ChatMessageHistory, PostgresChatMessageHistory
from adey_apps.rag.models import Chat
from django.utils.encoding import force_str
from django.conf import settings

openai.api_key = settings.OPENAI_API_KEY


class Agent:
    def __init__(self, chat: Chat):
        self.chat = chat
        PROMPT_TEMPLATE = """You are helpful customer support assistant for {company_name}, named {assistant_name}. 
        Your role is to reply for users enquiry with quick and accurate information about {company_name} and its services,
        which are outlined in context. 
        Your responses should be crafted in a single, coherent paragraph that directly addresses 
        the user’s inquiry based on the provided context and chat history. If the information needed to answer 
        a question is unavailable, respond with an apology and offer to help with another query.

        Keep the conversation engaging and informative and only reply the question you're asked.
        For complex queries that require further investigation or expertise, escalate them to the appropriate channels, ensuring a seamless handover.

        Never fabricate information or provide unverified answers.

        For simple greeting like hi don't mention the the company name

        Don't be verbose.
        
        Context:
        {context}

        Chat History:
        {chat_history}

        Human: {question}
        AI: """
        self.prompt = PromptTemplate(
            template=PROMPT_TEMPLATE, 
            input_variables=[
                "context", "chat_history", "question", "company_name", "company_description", "assistant_name"
            ])

    def build_agent(self):
        resources = self.chat.resource_set.all()
        documents: Document = []
        for resource in resources:
            loader = TextLoader(resource.document.path)
            text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
            docs = loader.load_and_split(text_splitter)
            documents.extend(docs)
        embedding = OpenAIEmbeddings()
        db = PGVector.from_documents(
                    embedding=embedding,
                    documents=docs,
                    collection_name=force_str(self.chat.identifier),
                    connection_string="postgresql://adey_backend:secret@db:5432/adey_backend",
            )
        if db:
            return {"status": "SUCCESS"}
        
        return {"status": "FAILURE"}
    
    def get_db_from_collection(self):
        return PGVector(
            collection_name=force_str(self.chat.identifier),
            connection_string=settings.PG_VECTOR_DB_URL,
            embedding_function=OpenAIEmbeddings()
        )
    
    def setup_chain(self, user_session_id: str, new_chat: bool = False):
        db = self.get_db_from_collection()
        self.chain = ConversationalRetrievalChain.from_llm(
            llm= ChatOpenAI(), 
            retriever=db.as_retriever(search_kwargs={'k': 3}), 
            combine_docs_chain_kwargs={"prompt": self.prompt},
        )
        self.history = PostgresChatMessageHistory(
            connection_string="postgresql://adey_backend:secret@db:5432/adey_backend",
            session_id=user_session_id,
        )
        if new_chat:
            self.history.add_ai_message("Hello! How can I assist you today?")

    def query(self, question: str):
        if not self.chain:
            raise ValueError("Chain not initialized.")
        response = self.chain({
            "question": question, 
            "chat_history": self.history.messages, 
            "company_name": self.chat.business_name,
            "company_description": self.chat.business_description,
            "assistant_name": self.chat.assistant_name,
            })  
        self.history.add_user_message(question)
        self.history.add_ai_message(response["answer"])

        return response["answer"]
        

        

    