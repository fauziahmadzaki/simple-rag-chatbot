import { ChatComposer } from './components/ChatComposer';
import { ChatHeader } from './components/ChatHeader';
import { MessageList } from './components/MessageList';
import { Sidebar } from './components/Sidebar';
import { useBackendHealth } from './hooks/useBackendHealth';
import { useChat } from './hooks/useChat';
import './App.css';

function App() {
  const backendStatus = useBackendHealth();
  const {
    messages,
    isLoading,
    hasMessages,
    canRetry,
    send,
    retry,
    stop,
    clear,
  } = useChat();

  return (
    <div className="app-shell">
      <div className="app-grid">
        <Sidebar
          disabled={isLoading}
          backendStatus={backendStatus}
          onPickQuestion={send}
        />

        <main className="chat-card">
          <ChatHeader canClear={hasMessages || isLoading} onClear={clear} />

          <MessageList
            messages={messages}
            isLoading={isLoading}
            canRetry={canRetry}
            onSend={send}
            onRetry={retry}
          />

          <ChatComposer isLoading={isLoading} onSend={send} onStop={stop} />
        </main>
      </div>

      <p className="app-footnote">
        Dokumen yang dipakai adalah data contoh praktikum. Jangan gunakan
        sebagai acuan resmi kampus.
      </p>
    </div>
  );
}

export default App;
