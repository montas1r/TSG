
'use client';

import type { FuseResultMatch } from 'fuse.js';
import React from 'react';

interface HighlightProps {
  text: string;
  matches?: readonly FuseResultMatch[];
}

export function Highlight({ text, matches }: HighlightProps) {
  if (!matches || matches.length === 0) {
    return <>{text}</>;
  }

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  // Assuming we only care about the first match for simplicity here,
  // as Fuse.js can return multiple matches for a single item.
  const allIndices = matches.flatMap(match => match.indices);
  allIndices.sort((a, b) => a[0] - b[0]);

  let currentIndex = 0;
  for (const [start, end] of allIndices) {
    // Add the text before the current match
    if (start > currentIndex) {
      parts.push(text.substring(currentIndex, start));
    }
    // Add the highlighted match
    parts.push(
      <mark key={start} className="bg-primary/20 text-primary-foreground rounded-sm px-0.5">
        {text.substring(start, end + 1)}
      </mark>
    );
    currentIndex = end + 1;
  }

  // Add the remaining text after the last match
  if (currentIndex < text.length) {
    parts.push(text.substring(currentIndex));
  }

  return <>{parts}</>;
}
