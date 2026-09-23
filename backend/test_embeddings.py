from langchain_google_genai import GoogleGenerativeAIEmbeddings
from sklearn.metrics.pairwise import cosine_similarity

from app.core.config import settings


embeddings = GoogleGenerativeAIEmbeddings(
    model="models/gemini-embedding-001",
    google_api_key=settings.google_api_key,
)

skills = [
    "LangChain",
    "LangGraph",
    "FastAPI",
    "Flask",
    "ReactJS",
    "PostgreSQL",
    "Docker",
    "Kubernetes",
    "Redis",
    "MongoDB",
    "Java",
    "Spring Boot",
]


vectors = embeddings.embed_documents(skills)


def similarity(skill_a: str, skill_b: str) -> float:
    index_a = skills.index(skill_a)
    index_b = skills.index(skill_b)

    score = cosine_similarity(
        [vectors[index_a]],
        [vectors[index_b]],
    )[0][0]

    return round(float(score), 4)


pairs = [
    ("LangChain", "LangGraph"),
    ("FastAPI", "Flask"),
    ("Docker", "Kubernetes"),
    ("MongoDB", "PostgreSQL"),
    ("Java", "Spring Boot"),

    # deliberately unrelated
    ("ReactJS", "PostgreSQL"),
    ("LangGraph", "PostgreSQL"),
    ("Docker", "ReactJS"),
    ("Redis", "Java"),
]


for a, b in pairs:
    print(f"{a} <-> {b}: {similarity(a, b)}")