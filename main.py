from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
from openai import OpenAI

from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import json

#
# Global
#

load_dotenv(override=True)
client = OpenAI()

prompts = []
responses = []
with open("./misc/me.json") as f:
    data = json.load(f)
    for msg in data:
        if msg["role"] == "user":
            prompts.append(msg["content"])
        else:
            responses.append(msg["content"])

model = SentenceTransformer("all-MiniLM-L6-v2")
embeddings = np.load("./misc/embeddings.npy")

def retrieve_response(prompt):
    embedding = model.encode([prompt])
    similarities = cosine_similarity(embedding, embeddings)[0]
    idx = np.argmax(similarities)
    return prompts[idx], responses[idx]

# 
# API
# 

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5500"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)
templates = Jinja2Templates(directory="templates")
app.mount("/static", StaticFiles(directory="static"), name="static")

class ChatRequest(BaseModel):
    prompt: str
    history: list[dict[str, str]]

@app.post("/prompt")
def prompt(chatRequest: ChatRequest):
    prompt = chatRequest.prompt
    history = chatRequest.history

    print("endpoint hit")
    print(prompt)

    my_prompt, my_response = retrieve_response(prompt)
    system_message = {
        "role": "system",
        "content": "You are a retrieval augmented chatbot responding to hiring managers. Use the prompt-response pair I will attach at the end of this message \
            to construct a natural response to the user's actual prompt. Include as much of my response as possible while sounding natural. \
            If the user prompt is a personal question, respond without including technical details. \
            If the user prompt is technical, but the prompt-response pair does not contain many details relevant to the user prompt, extract as many relevant details from \
            the prompt-response pair as possible and also from my strengths and interests found in my self-description here: \
            I'm a computer science student and aspiring software engineer with a strong interest in building practical, user-focused applications that integrate \
            modern backend systems and AI technologies. I enjoy working across the stack, from designing APIs and authentication flows to building interfaces that \
            allow users to interact naturally with intelligent systems. I've developed full-stack web applications using Flask, FastAPI, OAuth2, JWTs, and \
            PostgreSQL, as well as AI-powered tools that leverage locally hosted large language models for editing, transforming, and generating text."
    }
    context_message = {
        "role": "system",
        "content": f"Relevant context from portfolio: {my_prompt} -> {my_response}"
    }
    messages = [system_message, context_message] + history + [{"role": "user", "content": prompt}]

    completion = client.chat.completions.create(model="gpt-5-nano", messages=messages)
    return {"response": completion.choices[0].message.content}

@app.get("/", response_class=HTMLResponse)
def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/resume", response_class=HTMLResponse)
def resume(request: Request):
    return templates.TemplateResponse("resume.html", {"request": request})

@app.get("/chatbot-readme", response_class=HTMLResponse)
def resume(request: Request):
    return templates.TemplateResponse("chatbot-readme.html", {"request": request})