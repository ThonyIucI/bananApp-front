/**
 * Type for a parsed inline node (bold, code, italic, plain text).
 * Used by MarkdownText to render styled spans without a React dependency in this file.
 */
export type TInlineNode =
  | { type: 'text'; content: string }
  | { type: 'bold'; content: string }
  | { type: 'italic'; content: string }
  | { type: 'code'; content: string };

/**
 * Removes markdown syntax from a string so TTS reads clean spoken text.
 * Strips: **bold**, *italic*, `code`, # headings, - bullets, numbered lists, [text](url) links.
 */
export const stripMarkdown = (text: string): string =>
  text
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/#{1,6}\s+/g, '')
    .replace(/^[-*•]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[_~]+/g, '')
    .trim();

/**
 * Parses inline markdown into a structured AST — bold, italic, code and plain text.
 * Returns an array of nodes that a renderer can turn into styled React elements.
 */
export const parseInlineAst = (text: string): TInlineNode[] => {
  const nodes: TInlineNode[] = [];
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push({ type: 'text', content: text.slice(lastIndex, match.index) });
    }
    const m = match[0];
    if (m.startsWith('**')) {
      nodes.push({ type: 'bold', content: m.slice(2, -2) });
    } else if (m.startsWith('`')) {
      nodes.push({ type: 'code', content: m.slice(1, -1) });
    } else {
      nodes.push({ type: 'italic', content: m.slice(1, -1) });
    }
    lastIndex = match.index + m.length;
  }

  if (lastIndex < text.length) {
    nodes.push({ type: 'text', content: text.slice(lastIndex) });
  }

  return nodes;
};
