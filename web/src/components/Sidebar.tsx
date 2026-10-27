import { SUGGESTED_QUESTIONS } from '../data/suggestions';
import type { BackendStatus } from '../hooks/useBackendHealth';
import { ChatLogoIcon, SparkIcon } from './Icons';

interface SidebarProps {
  disabled: boolean;
  backendStatus: BackendStatus;
  onPickQuestion: (question: string) => void;
}

const STATUS_TEXT: Record<BackendStatus, { title: string; note: string }> = {
  checking: {
    title: 'Memeriksa Flask…',
    note: 'Menunggu respons /api/health',
  },
  online: {
    title: 'Flask API aktif',
    note: '127.0.0.1:5000 · via proxy Vite',
  },
  offline: {
    title: 'Flask API offline',
    note: 'Jalankan `python app.py` lalu coba lagi',
  },
};

export function Sidebar({
  disabled,
  backendStatus,
  onPickQuestion,
}: SidebarProps) {
  const status = STATUS_TEXT[backendStatus];

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <span className="brand-mark" aria-hidden="true">
          <ChatLogoIcon size={26} />
        </span>
        <div>
          <p className="sidebar__eyebrow">Praktikum Kecerdasan Buatan</p>
          <h1 className="sidebar__title">Asisten Layanan Mahasiswa</h1>
        </div>
      </div>

      <p className="sidebar__lead">
        Chatbot RAG yang menjawab pertanyaan seputar layanan kampus berdasarkan
        dokumen contoh praktikum — bukan aturan resmi kampus.
      </p>

      <div className="sidebar__section">
        <h2 className="sidebar__heading">Cara kerja singkat</h2>
        <ul className="steps">
          <li>
            <span className="steps__index">1</span>
            Pertanyaanmu diubah menjadi embedding.
          </li>
          <li>
            <span className="steps__index">2</span>
            Sistem mengambil 3 potongan dokumen paling relevan.
          </li>
          <li>
            <span className="steps__index">3</span>
            Gemini menyusun jawaban hanya dari potongan tersebut.
          </li>
        </ul>
      </div>

      <div className="sidebar__section sidebar__section--suggestions">
        <h2 className="sidebar__heading">Contoh pertanyaan</h2>
        <div className="sidebar__suggestions">
          {SUGGESTED_QUESTIONS.map((question) => (
            <button
              className="suggestion"
              type="button"
              key={question}
              disabled={disabled}
              onClick={() => onPickQuestion(question)}
            >
              <SparkIcon size={15} />
              <span>{question}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="sidebar__footer">
        <span
          className={`status-dot status-dot--${backendStatus}`}
          aria-hidden="true"
        />
        <div>
          <p className="sidebar__footer-title">{status.title}</p>
          <p className="sidebar__footer-note">{status.note}</p>
        </div>
      </div>
    </aside>
  );
}
