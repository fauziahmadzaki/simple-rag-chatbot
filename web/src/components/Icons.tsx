interface IconProps {
  className?: string;
  size?: number;
}

function iconProps({ className, size = 20 }: IconProps) {
  return {
    className,
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
    focusable: false,
  };
}

export function ChatLogoIcon({ className, size }: IconProps) {
  return (
    <svg {...iconProps({ className, size })} strokeWidth={1.6}>
      <path d="M21 11.5a8.4 8.4 0 0 1-8.5 8.4 9 9 0 0 1-3.5-.7L4 21l1.7-4.6a8.2 8.2 0 0 1-1.2-4.9C4.7 6.8 8.2 3.5 12.5 3.5A8.4 8.4 0 0 1 21 11.5Z" />
      <path d="M12.5 8.2v6.4M9.3 11.4h6.4" />
    </svg>
  );
}

export function SendIcon({ className, size }: IconProps) {
  return (
    <svg {...iconProps({ className, size })}>
      <path d="M4.8 12 20 4.5 12.9 20l-1.9-6.1L4.8 12Z" />
    </svg>
  );
}

export function StopIcon({ className, size }: IconProps) {
  return (
    <svg {...iconProps({ className, size })}>
      <rect x="7" y="7" width="10" height="10" rx="2" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function TrashIcon({ className, size }: IconProps) {
  return (
    <svg {...iconProps({ className, size })}>
      <path d="M4 7h16M9.5 7V5.5A1.5 1.5 0 0 1 11 4h2a1.5 1.5 0 0 1 1.5 1.5V7M6.5 7l.8 11.2A2 2 0 0 0 9.3 20h5.4a2 2 0 0 0 2-1.8L17.5 7" />
      <path d="M10.5 11v5M13.5 11v5" />
    </svg>
  );
}

export function RefreshIcon({ className, size }: IconProps) {
  return (
    <svg {...iconProps({ className, size })}>
      <path d="M20 11a8 8 0 1 0-2.3 6.3" />
      <path d="M20 4v7h-7" />
    </svg>
  );
}

export function AlertIcon({ className, size }: IconProps) {
  return (
    <svg {...iconProps({ className, size })}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5v5M12 16.2v.3" />
    </svg>
  );
}

export function BotIcon({ className, size }: IconProps) {
  return (
    <svg {...iconProps({ className, size })}>
      <rect x="4" y="8" width="16" height="11" rx="3.5" />
      <path d="M12 8V5M9.5 13v1.5M14.5 13v1.5M4 12.5H2.5M21.5 12.5H20" />
    </svg>
  );
}

export function UserIcon({ className, size }: IconProps) {
  return (
    <svg {...iconProps({ className, size })}>
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </svg>
  );
}

export function DocumentIcon({ className, size }: IconProps) {
  return (
    <svg {...iconProps({ className, size })}>
      <path d="M14 3.5H7.5A2.5 2.5 0 0 0 5 6v12a2.5 2.5 0 0 0 2.5 2.5h9A2.5 2.5 0 0 0 19 18V8.5L14 3.5Z" />
      <path d="M14 3.5V8.5H19M8.5 13h7M8.5 16.5h4.5" />
    </svg>
  );
}

export function SparkIcon({ className, size }: IconProps) {
  return (
    <svg {...iconProps({ className, size })}>
      <path d="M12 3.5 13.9 9 19.5 11 13.9 13 12 18.5 10.1 13 4.5 11 10.1 9 12 3.5Z" />
    </svg>
  );
}

export function ChevronIcon({ className, size }: IconProps) {
  return (
    <svg {...iconProps({ className, size })}>
      <path d="m8.5 5 7 7-7 7" />
    </svg>
  );
}
