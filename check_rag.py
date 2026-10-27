"""Uji end-to-end pipeline RAG dari terminal."""

from rag_core import RagError, answer_with_rag


def main() -> None:
    question = input('Tuliskan pertanyaan tentang dokumen: ').strip()
    if not question:
        raise SystemExit('Pertanyaan tidak boleh kosong.')

    try:
        result = answer_with_rag(question)
    except (RagError, ValueError) as exc:
        raise SystemExit(f'Gagal menjawab: {exc}')

    print('\nJawaban chatbot RAG:\n', result['answer'])
    print(
        '\nChunk yang digunakan:',
        [f"D{item['id']}" for item in result['sources']],
    )
    for item in result['sources']:
        print(f"  [D{item['id']}] skor kemiripan: {item['score']:.3f}")


if __name__ == '__main__':
    main()
