from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title='embeddings-service')

class EmbeddingRequest(BaseModel):
    text: str

class EmbeddingResponse(BaseModel):
    id: str
    vector: list[float]

@app.get('/health')
async def health():
    return {'ok': True, 'service': 'embeddings-service'}

@app.post('/v1/ai/embeddings', response_model=EmbeddingResponse)
async def embeddings(req: EmbeddingRequest):
    # Stub: return random small vector -- replace with sentence-transformers or external API
    import uuid, random
    vec = [random.random() for _ in range(64)]
    return EmbeddingResponse(id=str(uuid.uuid4()), vector=vec)

