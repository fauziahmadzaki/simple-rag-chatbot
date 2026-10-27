"""Pemecahan dokumen menjadi chunk.

Dipakai oleh skrip `preview_chunks.py` dan `build_index.py` supaya aturan
pemecahan chunk hanya didefinisikan sekali.
"""

from __future__ import annotations

from pathlib import Path

from config import KNOWLEDGE_FILE


def split_into_chunks(text: str) -> list[str]:
    """Pecah teks berdasarkan baris kosong, buang bagian yang kosong."""
    return [part.strip() for part in text.split('\n\n') if part.strip()]


def load_chunks(path: Path = KNOWLEDGE_FILE) -> list[str]:
    """Baca dokumen knowledge lalu kembalikan daftar chunk."""
    text = path.read_text(encoding='utf-8')
    return split_into_chunks(text)
