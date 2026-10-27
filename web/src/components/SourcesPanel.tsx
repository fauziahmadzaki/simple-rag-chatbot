import type { CSSProperties } from 'react';
import type { ChatSource } from '../api/chat';
import { DocumentIcon } from './Icons';

interface SourcesPanelProps {
  sources: ChatSource[];
}

export function SourcesPanel({ sources }: SourcesPanelProps) {
  if (sources.length === 0) {
    return null;
  }

  const hasDetails = sources.some((source) => source.text !== '');

  if (!hasDetails) {
    return (
      <div className="sources sources--compact">
        <span className="sources__label">
          <DocumentIcon size={15} />
          Sumber
        </span>
        <div className="sources__tags">
          {sources.map((source) => (
            <span className="source-tag" key={source.id}>
              D{source.id}
            </span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <details className="sources">
      <summary className="sources__summary">
        <DocumentIcon size={16} />
        <span>Lihat {sources.length} sumber dokumen</span>
        <span className="sources__chevron" aria-hidden="true" />
      </summary>

      <ul className="sources__list">
        {sources.map((source) => {
          const score = Math.max(0, Math.min(1, source.score));

          return (
            <li className="source" key={source.id}>
              <div className="source__meta">
                <span className="source__id">D{source.id}</span>
                {source.score > 0 ? (
                  <span className="source__score">
                    kemiripan {(score * 100).toFixed(0)}%
                  </span>
                ) : null}
              </div>
              <p className="source__text">{source.text}</p>
              {source.score > 0 ? (
                <span
                  className="source__meter"
                  role="presentation"
                  style={{ '--score': `${score * 100}%` } as CSSProperties}
                />
              ) : null}
            </li>
          );
        })}
      </ul>
    </details>
  );
}
