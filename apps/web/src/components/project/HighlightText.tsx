import React from 'react';

interface HighlightTextProps {
  text: string;
  query: string;
  className?: string;
  highlightClassName?: string;
}

export function HighlightText({
  text,
  query,
  className = '',
  highlightClassName = 'bg-yellow-200 text-yellow-900',
}: HighlightTextProps) {
  if (!query.trim()) {
    return <span className={className}>{text}</span>;
  }

  const parts = text.split(new RegExp(`(${query})`, 'gi'));
  return (
    <span className={className}>
      {parts.map((part, index) => (
        part.toLowerCase() === query.toLowerCase() ? (
          <span key={index} className={`px-0.5 rounded ${highlightClassName}`}>
            {part}
          </span>
        ) : (
          <span key={index}>{part}</span>
        )
      ))}
    </span>
  );
}
