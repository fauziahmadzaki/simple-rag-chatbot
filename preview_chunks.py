"""Pratinjau chunk dokumen sebelum proses embedding."""

from chunking import load_chunks


def main() -> None:
    chunks = load_chunks()

    print(f'Jumlah chunk: {len(chunks)}')
    for number, chunk in enumerate(chunks, start=1):
        print(f'\n[D{number}] ({len(chunk)} karakter)')
        print(chunk[:200])


if __name__ == '__main__':
    main()
