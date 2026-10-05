export interface TocItem {
  id: string;
  text: string;
  level: number;
}

/**
 * Strips LaTeX math, inline code, links, formatting and HTML tags from heading text.
 */
export function cleanHeadingText(raw: string): string {
  return raw
    .replace(/\$\$[\s\S]*?\$\$/g, '')
    .replace(/\$[^$]*\$/g, '')
    .replace(/\\[a-zA-Z]+/g, '')
    .replace(/[{}]/g, '')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/[*_`~#]/g, '')
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extracts table of contents items from raw markdown text, ignoring code blocks.
 * Uses deterministic line-number IDs (heading-l${line}) matching ReactMarkdown AST.
 */
export function extractToc(markdown: string): TocItem[] {
  if (!markdown) return [];
  const lines = markdown.split('\n');
  const items: TocItem[] = [];
  let inCodeBlock = false;

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (trimmed.startsWith('```') || trimmed.startsWith('~~~')) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;

    const match = trimmed.match(/^(#{1,4})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const cleanText = cleanHeadingText(match[2]);
      if (!cleanText) continue;

      items.push({
        id: `heading-l${i + 1}`,
        text: cleanText,
        level,
      });
    }
  }

  return items;
}
