"""Uji kualitas retrieval tanpa memanggil model generatif."""

from __future__ import annotations

import sys

from rag_core import RagError, retrieve

DEFAULT_QUESTION = 'Bagaimana melaporkan komputer laboratorium yang rusak?'


def main() -> None:
    question = ' '.join(sys.argv[1:]).strip() or DEFAULT_QUESTION
    print('Pertanyaan:', question)

    try:
        matches = retrieve(question, top_k=3)
    except (RagError, ValueError) as exc:
        raise SystemExit(f'Gagal mengambil chunk: {exc}')

    for item in matches:
        print(f"\n[D{item['id']}] Skor kemiripan: {item['score']:.3f}")
        print(item['text'][:240])


if __name__ == '__main__':
    main()
