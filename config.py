"""Konfigurasi terpusat untuk aplikasi chatbot RAG.

Semua path, nama model, dan batas input dibaca dari satu tempat agar skrip
indeks, API, dan pengujian selalu memakai nilai yang sama.
"""

from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / '.env')

KNOWLEDGE_DIR = BASE_DIR / 'knowledge'
KNOWLEDGE_FILE = KNOWLEDGE_DIR / 'panduan_layanan.txt'

INDEX_DIR = BASE_DIR / 'index'
CHUNKS_FILE = INDEX_DIR / 'chunks.json'
EMBEDDINGS_FILE = INDEX_DIR / 'embeddings.npy'

EMBEDDING_MODEL = 'gemini-embedding-001'
DEFAULT_CHAT_MODEL = 'gemini-3.5-flash-lite'
MAX_QUESTION_LENGTH = 500
DEFAULT_TOP_K = 3
MAX_REQUEST_BYTES = 16 * 1024

PLACEHOLDER_API_KEY = 'GANTI_DENGAN_API_KEY_ANDA'


def get_api_key() -> str:
    """Ambil API key Gemini dari environment dan pastikan sudah diisi."""
    api_key = os.getenv('GEMINI_API_KEY', '').strip()
    if not api_key or api_key == PLACEHOLDER_API_KEY:
        raise RuntimeError(
            'GEMINI_API_KEY belum diisi pada file .env. '
            'Salin .env.example menjadi .env lalu isi API key Anda.'
        )
    return api_key


def get_chat_model() -> str:
    """Model Gemini untuk menyusun jawaban akhir."""
    return os.getenv('GEMINI_MODEL', '').strip() or DEFAULT_CHAT_MODEL


def get_cors_origin() -> str | None:
    """Origin yang diizinkan memanggil API langsung dari browser.

    Kosongkan saat memakai proxy Vite/Apache karena request dianggap
    satu origin.
    """
    origin = os.getenv('CORS_ORIGIN', '').strip()
    return origin or None


def get_host() -> str:
    return os.getenv('HOST', '').strip() or '127.0.0.1'


def get_port() -> int:
    raw = os.getenv('PORT', '').strip()
    try:
        port = int(raw)
    except ValueError:
        return 5000
    return port if 1 <= port <= 65535 else 5000


def is_debug() -> bool:
    return os.getenv('FLASK_DEBUG', '').strip().lower() in {
        '1',
        'true',
        'yes',
        'on',
    }
