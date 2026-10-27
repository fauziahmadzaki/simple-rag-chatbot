# Asisten Layanan Mahasiswa — Web (React + TypeScript + Vite)

Frontend chatbot RAG untuk praktikum Kecerdasan Buatan. Aplikasi ini
menggantikan `api/chat.php`: request `POST /api/chat` diteruskan ke Flask
(`http://127.0.0.1:5000`) lewat proxy Vite, jadi tidak perlu Apache/PHP dan
tidak ada masalah CORS saat development. Panduan lengkap ada di
[`../README.md`](../README.md).

Backend mengirim `sources` sebagai objek `{id, text, score}`, sehingga panel
sumber menampilkan isi chunk dan skor kemiripan. Format lama berupa string
(`"D3"`) tetap didukung dan ditampilkan sebagai tag sumber ringkas.

## Menjalankan

1. Jalankan backend Flask (dari folder induk proyek):

   ```bash
   .venv\Scripts\python.exe -m flask --app app run --port 5000
   ```

2. Jalankan frontend:

   ```bash
   npm install
   npm run dev
   ```

3. Buka <http://127.0.0.1:5173>. Status backend tampil di sidebar
   (`Flask API aktif`), dan semua request masuk ke `/api/chat` melalui proxy.

### Konfigurasi

- `vite.config.ts` → ubah `server.proxy['/api'].target` bila port Flask berbeda.
- `VITE_API_BASE_URL` (opsional) → isi bila frontend dan API berada di origin
  berbeda, misalnya `VITE_API_BASE_URL=http://127.0.0.1:5000`. Untuk mode ini
  backend perlu mengaktifkan CORS.
- Build produksi: `npm run build` (hasil di `dist/`). Karena tidak ada proxy
  Vite di produksi, arahkan reverse proxy (Nginx/Apache) `/api` ke Flask atau
  set `VITE_API_BASE_URL` + CORS.

## Struktur

```
src/
  api/chat.ts               # klien fetch + timeout + normalisasi error
  hooks/useChat.ts          # state percakapan, abort, retry, clear
  hooks/useBackendHealth.ts # polling status /api/health
  components/               # Sidebar, header, daftar pesan, sumber, composer
  data/suggestions.ts       # contoh pertanyaan
```

---

## React + TypeScript + Vite (template)

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```

You can also install [eslint-plugin-react-x](https://npmx.dev/package/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://npmx.dev/package/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```
