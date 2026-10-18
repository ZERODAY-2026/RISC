/**
 * Zero-dependency Markdown-to-HTML converter for legal assistant responses.
 * Supports headings, bold/italic, blockquotes, lists, inline code, and line breaks.
 */
export function markdownToHtml(md) {
  if (!md) return '';
  const lines = String(md).split('\n');
  const out = [];
  let inUl = false;
  let inOl = false;

  const flushLists = () => {
    if (inUl) {
      out.push('</ul>');
      inUl = false;
    }
    if (inOl) {
      out.push('</ol>');
      inOl = false;
    }
  };

  const inlineFormat = (text) => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-violet-700 font-mono text-xs">$1</code>');
  };

  lines.forEach((line) => {
    // Heading 3
    if (/^###\s+/.test(line)) {
      flushLists();
      out.push(`<h3 class="text-sm font-bold text-slate-800 mt-3 mb-1.5 tracking-tight">${inlineFormat(line.replace(/^###\s+/, ''))}</h3>`);
      return;
    }
    // Heading 2
    if (/^##\s+/.test(line)) {
      flushLists();
      out.push(`<h2 class="text-base font-bold text-slate-900 mt-4 mb-2 pb-1 border-b border-slate-200">${inlineFormat(line.replace(/^##\s+/, ''))}</h2>`);
      return;
    }
    // Heading 1
    if (/^#\s+/.test(line)) {
      flushLists();
      out.push(`<h2 class="text-base font-bold text-slate-900 mt-4 mb-2 pb-1 border-b border-slate-200">${inlineFormat(line.replace(/^#\s+/, ''))}</h2>`);
      return;
    }
    // Blockquote
    if (/^>\s?/.test(line)) {
      flushLists();
      out.push(`<blockquote class="border-l-4 border-violet-400 bg-violet-50 text-violet-900 my-2 px-3.5 py-2 rounded-r-md text-xs leading-relaxed">${inlineFormat(line.replace(/^>\s?/, ''))}</blockquote>`);
      return;
    }
    // Horizontal Rule
    if (/^---+$/.test(line.trim())) {
      flushLists();
      out.push('<hr class="my-3 border-t border-dashed border-slate-200">');
      return;
    }
    // Ordered list
    if (/^\d+\.\s+/.test(line)) {
      if (inUl) {
        out.push('</ul>');
        inUl = false;
      }
      if (!inOl) {
        out.push('<ol class="list-decimal list-inside my-2 space-y-1 text-slate-700 text-xs pl-2">');
        inOl = true;
      }
      out.push(`<li>${inlineFormat(line.replace(/^\d+\.\s+/, ''))}</li>`);
      return;
    }
    // Unordered list
    if (/^[-*]\s+/.test(line)) {
      if (inOl) {
        out.push('</ol>');
        inOl = false;
      }
      if (!inUl) {
        out.push('<ul class="list-disc list-inside my-2 space-y-1 text-slate-700 text-xs pl-2">');
        inUl = true;
      }
      out.push(`<li>${inlineFormat(line.replace(/^[-*]\s+/, ''))}</li>`);
      return;
    }
    // Empty line
    if (line.trim() === '') {
      flushLists();
      out.push('<div class="h-1.5"></div>');
      return;
    }
    // Normal paragraph
    flushLists();
    out.push(`<p class="text-xs text-slate-700 leading-relaxed mb-1.5">${inlineFormat(line)}</p>`);
  });

  flushLists();
  return out.join('\n');
}
