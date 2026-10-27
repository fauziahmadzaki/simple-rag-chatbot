"""Membangun index embedding dari dokumen knowledge."""

from __future__ import annotations

import json

import numpy as np
from google import genai
from google.genai import types

from chunking import load_chunks
from config import (
    CHUNKS_FILE,
    EMBEDDING_MODEL,
    EMBEDDINGS_FILE,
    INDEX_DIR,
    KNOWLEDGE_FILE,
    get_api_key,
)


def main() -> None:
    chunks = load_chunks()
    if not chunks:
        raise SystemExit(f'Dokumen kosong. Periksa {KNOWLEDGE_FILE}.')

    client = genai.Client(api_key=get_api_key())
    try:
        result = client.models.embed_content(
            model=EMBEDDING_MODEL,
            contents=chunks,
            config=types.EmbedContentConfig(task_type='RETRIEVAL_DOCUMENT'),
        )
    finally:
        client.close()

    vectors = np.asarray(
        [item.values for item in result.embeddings],
        dtype=np.float32,
    )
    if vectors.ndim != 2 or len(vectors) != len(chunks):
        raise SystemExit('Jumlah vektor tidak sama dengan jumlah chunk.')

    INDEX_DIR.mkdir(exist_ok=True)
    np.save(EMBEDDINGS_FILE, vectors)

    metadata = {
        'embedding_model': EMBEDDING_MODEL,
        'source': KNOWLEDGE_FILE.name,
        'chunks': [
            {'id': number, 'text': text}
            for number, text in enumerate(chunks, start=1)
        ],
    }
    CHUNKS_FILE.write_text(
        json.dumps(metadata, ensure_ascii=False, indent=2),
        encoding='utf-8',
    )

    print(
        f'Index berhasil dibuat: {len(chunks)} chunk, '
        f'dimensi vektor {vectors.shape[1]}, model {EMBEDDING_MODEL}.'
    )
    print(f'File: {CHUNKS_FILE.name} dan {EMBEDDINGS_FILE.name}')


if __name__ == '__main__':
    main()
