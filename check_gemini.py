"""Uji cepat Gemini tanpa RAG sebagai pembanding hasil chatbot."""

from __future__ import annotations

from google import genai

from config import get_api_key, get_chat_model

QUESTION = 'Berapa lama proses surat aktif kuliah di Akademik Demo?'


def main() -> None:
    client = genai.Client(api_key=get_api_key())
    try:
        response = client.models.generate_content(
            model=get_chat_model(),
            contents=QUESTION,
        )
    finally:
        client.close()

    print('Pertanyaan:', QUESTION)
    print('Jawaban tanpa RAG:', response.text or '(Tidak ada teks jawaban)')


if __name__ == '__main__':
    main()
