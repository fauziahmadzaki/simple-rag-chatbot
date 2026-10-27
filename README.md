# Chatbot RAG Layanan Mahasiswa

Chatbot tanya-jawab untuk dokumen contoh layanan mahasiswa. Jawaban disusun
dari potongan dokumen yang relevan (Retrieval-Augmented Generation), bukan dari
pengetahuan umum model, dan setiap jawaban menyertakan penanda sumber `[D...]`.

## Arsitektur

```
Browser (React + Vite :5173)
        │  POST /api/chat  (satu origin, tanpa CORS)
        ▼
Vite dev proxy  ──►  Flask API :5000
                        │
                        ├── embedding query  ──►  Gemini Embedding
                        ├── cosine similarity ──►  index/chunks.json + embeddings.npy
                        └── generate answer   ──►  Gemini (GEMINI_MODEL)
```

Tidak ada PHP/Apache pada alur ini. Bila memakai versi PHP lama, `chat.php`
hanya menjadi proxy tipis ke Flask dengan peran yang sama seperti proxy Vite.

## Struktur proyek

```
.
├── app.py                 # API Flask: /api/health, /api/chat
├── config.py              # path, model, batas input, env
├── rag_core.py            # embedding, retrieval, prompt, generate
├── chunking.py            # aturan pemecahan dokumen
├── knowledge/             # dokumen sumber (teks)
├── index/                 # hasil generate: chunks.json + embeddings.npy
├── preview_chunks.py      # pratinjau chunk
├── build_index.py         # bangun index embedding
├── check_retrieval.py     # uji retrieval (tanpa model generatif)
├── check_rag.py           # uji pipeline RAG end-to-end
├── check_gemini.py        # pembanding: Gemini tanpa RAG
└── web/                   # frontend React + TypeScript + Vite
```

## Persiapan

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt

Copy-Item .env.example .env
# edit .env lalu isi GEMINI_API_KEY
```

Membuat index (wajib sebelum chat pertama):

```powershell
python build_index.py
```

## Menjalankan

Terminal 1 — backend:

```powershell
.\.venv\Scripts\python.exe -m flask --app app run --port 5000
```

Terminal 2 — frontend:

```powershell
cd web
npm install
npm run dev
```

Buka <http://127.0.0.1:5173>. Indikator di sidebar menunjukkan status backend
(memeriksa / aktif / offline) berdasarkan `/api/health`.

Build produksi frontend: `npm run build` (hasil di `web/dist/`). Pada produksi,
arahkan reverse proxy `/api` ke Flask atau set `VITE_API_BASE_URL` dan
`CORS_ORIGIN`.

## Endpoint

| Metode | Path          | Keterangan |
| ------ | ------------- | ---------- |
| GET    | `/api/health` | Status server, model aktif, kesiapan index. Murah, tanpa Gemini. |
| POST   | `/api/chat`   | Body `{"question": "..."}` → `{"answer": "...", "sources": [...]}`. |

Contoh:

```powershell
curl.exe -X POST http://127.0.0.1:5000/api/chat `
  -H "Content-Type: application/json" `
  -d "{\"question\":\"Bagaimana cara meminjam laboratorium?\"}"
```

Kesalahan dikembalikan sebagai JSON `{"error": "..."}` dengan status `400`
(input tidak valid), `503` (index/API key/Gemini bermasalah), atau `500`
(kesalahan tak terduga).

## Konfigurasi `.env`

| Variabel        | Default                  | Keterangan |
| --------------- | ------------------------ | ---------- |
| `GEMINI_API_KEY`| —                        | Wajib diisi. |
| `GEMINI_MODEL`  | `gemini-3.5-flash-lite`  | Model penyusun jawaban. |
| `HOST` / `PORT` | `127.0.0.1` / `5000`     | Alamat server Flask. |
| `FLASK_DEBUG`   | mati                     | `1` untuk mode debug lokal. |
| `CORS_ORIGIN`   | kosong                   | Isi hanya bila browser memanggil Flask langsung. |

## Merawat index

Jalankan ulang `python build_index.py` bila:

- isi `knowledge/` berubah,
- aturan chunking berubah,
- model embedding berganti,
- file index hilang atau tidak konsisten.

Perubahan prompt, model chat, atau tampilan tidak perlu rebuild index. Index
di-cache di memori dan otomatis dimuat ulang saat file index berubah.

## Keamanan

- API key dan dokumen sumber berada di luar web root; `.env` dan `index/`
  diabaikan Git.
- Frontend tidak pernah memanggil Gemini langsung.
- Input dibatasi 500 karakter dan body request 16 KB.
- Prompt melarang mengikuti instruksi yang tertulis di dalam dokumen.

## Troubleshooting

| Gejala | Penyebab / solusi |
| --- | --- |
| `Index belum dibuat` | Jalankan `python build_index.py`. |
| `client has been closed` | Jangan membuat `genai.Client` sementara; gunakan `rag_core.get_client()`. |
| Frontend menampilkan "Flask API offline" | Backend belum jalan atau port berbeda; cek `/api/health`. |
| `Dimensi embedding tidak cocok` | Index dibuat dengan model lain; rebuild index. |
| Jawaban selalu "tidak ditemukan" | Index/chunk tidak memuat topik tersebut; cek `check_retrieval.py`. |
