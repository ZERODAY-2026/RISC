import React from 'react';
import { AlertTriangle, Scale, CheckCircle2, FileText, ChevronRight, HelpCircle } from 'lucide-react';

/**
 * Lightweight, zero-dependency, safe Markdown renderer tailored for legal triage output.
 * Renders headings, callout blockquotes, bold/italic inline text, clause pills, and numbered lists.
 */
export default function FormattedMarkdown({ text }) {
  if (!text) return null;

  // Helper to parse inline bold, italics, and clause tags
  const renderInline = (str) => {
    if (!str) return null;

    // Tokenize **bold**, *italic*, and [CL-XXX] tags
    const tokens = [];
    let remaining = str;
    let keyIdx = 0;

    // Pattern to match **bold**, `code`, or [CL-XXX]
    const regex = /(\*\*[^*]+\*\*|`[^`]+`|\[CL-\d+[^\]]*\])/g;
    let match;
    let lastIndex = 0;

    while ((match = regex.exec(str)) !== null) {
      if (match.index > lastIndex) {
        tokens.push(str.substring(lastIndex, match.index));
      }

      const m = match[0];
      if (m.startsWith('**') && m.endsWith('**')) {
        tokens.push(
          <strong key={keyIdx++} className="font-extrabold text-stone-900">
            {m.slice(2, -2)}
          </strong>
        );
      } else if (m.startsWith('`') && m.endsWith('`')) {
        tokens.push(
          <code key={keyIdx++} className="px-1.5 py-0.5 rounded bg-stone-100 font-mono text-[11px] text-stone-800">
            {m.slice(1, -1)}
          </code>
        );
      } else if (m.startsWith('[CL-')) {
        tokens.push(
          <span key={keyIdx++} className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-mono font-bold text-[10.5px] border border-emerald-300 mx-1">
            {m.slice(1, -1)}
          </span>
        );
      }
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < str.length) {
      tokens.push(str.substring(lastIndex));
    }

    return tokens;
  };

  // Split raw markdown into paragraph blocks
  const blocks = text.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);

  return (
    <div className="space-y-3.5 text-xs text-stone-800 leading-relaxed font-sans">
      {blocks.map((block, bIdx) => {
        // 1. Heading 3 / 2 (### or ##)
        if (block.startsWith('### ') || block.startsWith('## ') || block.startsWith('# ')) {
          const title = block.replace(/^#+\s*/, '');
          const isSecurityAlert =
            title.toLowerCase().includes('security') ||
            title.toLowerCase().includes('injection') ||
            title.toLowerCase().includes('quarantin');
          const isSafeEscalation =
            !isSecurityAlert && (title.toLowerCase().includes('safe escalation') || title.toLowerCase().includes('refusal'));

          return (
            <div
              key={bIdx}
              className={`pb-2 border-b flex items-center gap-2 ${
                isSecurityAlert
                  ? 'border-rose-300 text-rose-950'
                  : isSafeEscalation
                  ? 'border-amber-200 text-amber-950'
                  : 'border-stone-200 text-stone-900'
              }`}
            >
              {isSecurityAlert ? (
                <div className="w-6 h-6 rounded-lg bg-rose-100 border border-rose-300 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-700" />
                </div>
              ) : isSafeEscalation ? (
                <div className="w-6 h-6 rounded-lg bg-amber-100 border border-amber-300 flex items-center justify-center flex-shrink-0">
                  <Scale className="w-3.5 h-3.5 text-amber-800" />
                </div>
              ) : (
                <div className="w-6 h-6 rounded-lg bg-emerald-100 border border-emerald-300 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-800" />
                </div>
              )}
              <h4 className="text-sm font-extrabold tracking-tight">{title}</h4>
            </div>
          );
        }

        // 2. Blockquote (> Callout)
        if (block.startsWith('>')) {
          const content = block
            .split('\n')
            .map((line) => line.replace(/^>\s*/, ''))
            .join(' ');

          const isSecurity =
            content.toLowerCase().includes('security') ||
            content.toLowerCase().includes('quarantin') ||
            content.toLowerCase().includes('injection');
          const isAlert =
            !isSecurity && (content.toLowerCase().includes('notice') || content.toLowerCase().includes('non-lawyer'));

          return (
            <div
              key={bIdx}
              className={`p-3.5 rounded-xl border flex items-start gap-2.5 shadow-2xs ${
                isSecurity
                  ? 'bg-gradient-to-r from-rose-50 to-rose-100/60 border-rose-300 text-rose-950'
                  : isAlert
                  ? 'bg-gradient-to-r from-amber-50/90 to-amber-100/50 border-amber-300/80 text-amber-950'
                  : 'bg-stone-50 border-stone-200 text-stone-800'
              }`}
            >
              {isSecurity ? (
                <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              ) : (
                isAlert && <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="text-xs leading-relaxed">{renderInline(content)}</div>
            </div>
          );
        }

        // 3. Numbered List (1. 2. 3.)
        const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
        const isNumberedList = lines.length > 0 && lines.every((l) => /^\d+\.\s+/.test(l));

        if (isNumberedList) {
          return (
            <ol key={bIdx} className="space-y-2 my-2">
              {lines.map((line, lIdx) => {
                const itemContent = line.replace(/^\d+\.\s+/, '');
                return (
                  <li
                    key={lIdx}
                    className="flex items-start gap-2.5 p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/70 text-xs text-stone-800 shadow-2xs"
                  >
                    <span className="w-5 h-5 rounded-full bg-amber-200/90 text-amber-900 font-extrabold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs">
                      {lIdx + 1}
                    </span>
                    <div className="leading-relaxed">{renderInline(itemContent)}</div>
                  </li>
                );
              })}
            </ol>
          );
        }

        // 4. Bullet List (- or *)
        const isBulletList = lines.length > 0 && lines.every((l) => /^[-*]\s+/.test(l));

        if (isBulletList) {
          return (
            <ul key={bIdx} className="space-y-2 my-2">
              {lines.map((line, lIdx) => {
                const itemContent = line.replace(/^[-*]\s+/, '');
                return (
                  <li
                    key={lIdx}
                    className="flex items-start gap-2.5 p-2.5 rounded-xl bg-stone-50/80 border border-stone-200/70 text-xs text-stone-800 shadow-2xs"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 flex-shrink-0 mt-1.5" />
                    <div className="leading-relaxed">{renderInline(itemContent)}</div>
                  </li>
                );
              })}
            </ul>
          );
        }

        // 5. Section subheaders e.g. **Title:**
        if (block.startsWith('**') && block.endsWith('**') && !block.includes('\n')) {
          return (
            <div key={bIdx} className="pt-2 text-xs font-extrabold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
              <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
              <span>{block.slice(2, -2)}</span>
            </div>
          );
        }

        // 6. Regular Paragraph
        return (
          <p key={bIdx} className="leading-relaxed text-stone-800">
            {renderInline(block)}
          </p>
        );
      })}
    </div>
  );
}
