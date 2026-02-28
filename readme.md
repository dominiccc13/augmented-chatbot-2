# AI Career Assistant & Portfolio API

A RAG-powered (Retrieval-Augmented Generation) chatbot and portfolio API built with FastAPI. This project serves as a career assistant, allowing hiring managers to query my professional background, technical skills, and experience through a natural language interface.

## Technical Highlights

- **RAG Implementation:** Uses `sentence-transformers` (`all-MiniLM-L6-v2`) to vectorize a custom knowledge base (`me.json`). It performs a cosine similarity search to retrieve the most relevant context before generating a response with OpenAI.
- **Production-Ready API:** Built with FastAPI, featuring asynchronous endpoints, CORS middleware for frontend integration, and structured error handling.

## Tech Stack

- **Backend:** Python, FastAPI, Uvicorn
- **AI/ML:** OpenAI API (GPT-4o/GPT-5-nano), Sentence-Transformers, Scikit-Learn (Cosine Similarity)
- **Deployment:** AWS EC2, nftables (Port forwarding), Dotenv (Environment Security)
- **Frontend:** Jinja2 Templates, Vanilla JavaScript, CSS3

## Architecture

1. **Vectorization:** On startup, the system loads professional experience from JSON and generates embeddings.
2. **Retrieval:** When a user asks a question, the system finds the most similar pre-written response.
3. **Augmentation:** The retrieved context is injected into a specialized system prompt.
4. **Generation:** OpenAI generates a refined, professional response tailored to a hiring manager's perspective.



## Security & Reliability

- **Environment Isolation:** Sensitive API keys and SMTP credentials are managed via `.env`.
