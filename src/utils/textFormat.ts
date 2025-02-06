export const formatText = (text: string): string => {
  return text
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Italic
    // eslint-disable-next-line no-useless-escape
    .replace(/_(.*?)_/g, '<em>$1</em>')
    // Underline
    // eslint-disable-next-line no-useless-escape
    .replace(/~(.*?)~/g, '<u>$1</u>')
    // Bullet points
    .replace(/^[-*•]\s(.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/gs, '<ul class="list-disc ml-4">$1</ul>');
};

export const isTaskContent = (text: string): boolean => {
  return text.trim().startsWith('- [ ]') || text.trim().startsWith('- [x]');
}; 