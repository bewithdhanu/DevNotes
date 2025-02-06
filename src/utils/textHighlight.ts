interface HighlightedText {
  text: string;
  isHighlight: boolean;
}

export const highlightText = (text: string, query: string): HighlightedText[] => {
  if (!query.trim()) return [{ text, isHighlight: false }];

  const parts = text.split(new RegExp(`(${query})`, 'gi'));
  return parts.map(part => ({
    text: part,
    isHighlight: part.toLowerCase() === query.toLowerCase()
  }));
}; 