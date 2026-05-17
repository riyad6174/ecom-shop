import { useState, useRef } from 'react';

function btn(label, title, className = '') {
  return { label, title, className };
}

export default function HtmlEditor({ value, onChange }) {
  const [tab, setTab] = useState('editor');
  const taRef = useRef();

  function getTA() {
    return taRef.current;
  }

  function wrapSel(open, close) {
    const ta = getTA();
    if (!ta) return;
    const s = ta.selectionStart;
    const e = ta.selectionEnd;
    const sel = ta.value.slice(s, e) || 'text';
    const next = ta.value.slice(0, s) + open + sel + close + ta.value.slice(e);
    onChange(next);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(s + open.length, s + open.length + sel.length);
    }, 10);
  }

  function insertAt(text) {
    const ta = getTA();
    if (!ta) return;
    const s = ta.selectionStart;
    const next = ta.value.slice(0, s) + text + ta.value.slice(s);
    onChange(next);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(s + text.length, s + text.length);
    }, 10);
  }

  function doImage() {
    const url = prompt('Image URL:');
    if (!url) return;
    const alt = prompt('Alt text (optional):') || '';
    insertAt(`<img src="${url}" alt="${alt}" style="max-width:100%;height:auto;" />`);
  }

  function doVideo() {
    const url = prompt('YouTube URL (watch, shorts, or youtu.be link):');
    if (!url) return;
    // Handles: watch?v=ID, youtu.be/ID, shorts/ID (including ?si= params)
    const m = url.match(/(?:v=|youtu\.be\/|shorts\/)([a-zA-Z0-9_-]{11})/);
    const id = m ? m[1] : url.trim();
    insertAt(
      `\n<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;max-width:100%;">\n` +
      `  <iframe src="https://www.youtube.com/embed/${id}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allowfullscreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe>\n` +
      `</div>\n`
    );
  }

  function doLink() {
    const url = prompt('URL (https://...):');
    if (!url) return;
    wrapSel(`<a href="${url}" target="_blank" rel="noopener noreferrer">`, '</a>');
  }

  function doTable() {
    const rows = Math.max(1, parseInt(prompt('Rows (including header):', '3') || '3'));
    const cols = Math.max(1, parseInt(prompt('Columns:', '3') || '3'));
    let t = '\n<table style="width:100%;border-collapse:collapse;margin:1em 0;">\n  <thead>\n    <tr>\n';
    for (let c = 0; c < cols; c++)
      t += `      <th style="border:1px solid #ddd;padding:8px 12px;background:#f0f0f0;text-align:left;">Header ${c + 1}</th>\n`;
    t += '    </tr>\n  </thead>\n  <tbody>\n';
    for (let r = 0; r < rows - 1; r++) {
      t += '    <tr>\n';
      for (let c = 0; c < cols; c++)
        t += `      <td style="border:1px solid #ddd;padding:8px 12px;">Cell</td>\n`;
      t += '    </tr>\n';
    }
    t += '  </tbody>\n</table>\n';
    insertAt(t);
  }

  function doDiv() {
    const cls = prompt('CSS class (optional):') || '';
    wrapSel(`<div${cls ? ` class="${cls}"` : ''}>`, '</div>');
  }

  const TOOLS = [
    { label: 'B', title: 'Bold', fn: () => wrapSel('<strong>', '</strong>'), tw: 'font-bold' },
    { label: 'I', title: 'Italic', fn: () => wrapSel('<em>', '</em>'), tw: 'italic' },
    { label: 'U', title: 'Underline', fn: () => wrapSel('<u>', '</u>'), tw: 'underline' },
    { label: 'S', title: 'Strikethrough', fn: () => wrapSel('<s>', '</s>'), tw: 'line-through' },
    '|',
    { label: 'H1', title: 'Heading 1', fn: () => wrapSel('<h1>', '</h1>') },
    { label: 'H2', title: 'Heading 2', fn: () => wrapSel('<h2>', '</h2>') },
    { label: 'H3', title: 'Heading 3', fn: () => wrapSel('<h3>', '</h3>') },
    { label: 'H4', title: 'Heading 4', fn: () => wrapSel('<h4>', '</h4>') },
    '|',
    { label: '¶', title: 'Paragraph', fn: () => wrapSel('<p>', '</p>') },
    { label: '❝', title: 'Blockquote', fn: () => wrapSel('<blockquote style="border-left:4px solid #ddd;padding:0.5em 1em;margin:1em 0;color:#555;">', '</blockquote>') },
    { label: '<>', title: 'Inline Code', fn: () => wrapSel('<code>', '</code>') },
    '|',
    { label: '•≡', title: 'Bullet List', fn: () => insertAt('\n<ul style="list-style:disc;padding-left:1.5em;margin:0.5em 0;">\n  <li>Item 1</li>\n  <li>Item 2</li>\n  <li>Item 3</li>\n</ul>\n') },
    { label: '1≡', title: 'Numbered List', fn: () => insertAt('\n<ol style="list-style:decimal;padding-left:1.5em;margin:0.5em 0;">\n  <li>Item 1</li>\n  <li>Item 2</li>\n  <li>Item 3</li>\n</ol>\n') },
    '|',
    { label: '🔗', title: 'Insert Link', fn: doLink },
    { label: 'IMG', title: 'Insert Image (URL)', fn: doImage },
    { label: '▶', title: 'Embed YouTube Video', fn: doVideo },
    { label: '⊞', title: 'Insert Table', fn: doTable },
    '|',
    { label: '──', title: 'Horizontal Rule', fn: () => insertAt('\n<hr style="border:0;border-top:1px solid #e5e7eb;margin:1.5em 0;" />\n') },
    { label: 'DIV', title: 'Wrap in div', fn: doDiv },
    { label: 'SPAN', title: 'Wrap in span', fn: () => wrapSel('<span>', '</span>') },
  ];

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
      {/* Tab bar */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-2">
        <div className="flex">
          {['editor', 'preview'].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-xs font-semibold capitalize transition-colors ${tab === t ? 'text-blue-700 border-b-2 border-blue-600 bg-white' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {t === 'editor' ? '✏️ Editor' : '👁 Preview'}
            </button>
          ))}
        </div>
        <span className="text-[10px] text-slate-400 pr-2">HTML editor</span>
      </div>

      {/* Toolbar */}
      {tab === 'editor' && (
        <div className="flex flex-wrap gap-1 p-2 bg-slate-50 border-b border-slate-100">
          {TOOLS.map((t, i) =>
            t === '|' ? (
              <span key={i} className="w-px h-5 bg-slate-300 self-center mx-0.5" />
            ) : (
              <button
                key={i}
                type="button"
                title={t.title}
                onClick={t.fn}
                className={`px-1.5 py-0.5 text-xs bg-white border border-slate-200 rounded hover:bg-slate-100 hover:border-slate-300 transition-colors min-w-[24px] text-center ${t.tw || ''}`}
              >
                {t.label}
              </button>
            )
          )}
        </div>
      )}

      {/* Content area */}
      {tab === 'editor' ? (
        <textarea
          ref={taRef}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          rows={18}
          spellCheck={false}
          className="w-full p-4 font-mono text-xs text-slate-800 focus:outline-none resize-y bg-white leading-relaxed"
          placeholder='Write HTML here... e.g. <div class="section"><h2>Features</h2><ul><li>Feature 1</li></ul></div>'
        />
      ) : (
        <div
          className="p-6 min-h-[300px] prose prose-sm max-w-none dp-html-content text-slate-800"
          dangerouslySetInnerHTML={{ __html: value || '<p class="text-slate-400 italic">Nothing to preview yet.</p>' }}
        />
      )}

      <style jsx global>{`
        .dp-html-content img { max-width: 100%; height: auto; }
        .dp-html-content h1 { font-size: 1.5em; font-weight: 700; margin: 0.75em 0 0.4em; }
        .dp-html-content h2 { font-size: 1.25em; font-weight: 700; margin: 0.75em 0 0.4em; }
        .dp-html-content h3 { font-size: 1.1em; font-weight: 700; margin: 0.75em 0 0.4em; }
        .dp-html-content h4 { font-size: 1em; font-weight: 600; margin: 0.75em 0 0.4em; }
        .dp-html-content p { margin-bottom: 0.75em; }
        .dp-html-content ul, .dp-html-content ol { padding-left: 1.5em; margin: 0.5em 0; }
        .dp-html-content li { margin-bottom: 0.2em; }
        .dp-html-content table { width: 100%; border-collapse: collapse; }
        .dp-html-content th, .dp-html-content td { border: 1px solid #ddd; padding: 8px 12px; }
        .dp-html-content blockquote { border-left: 4px solid #ddd; padding: 0.5em 1em; color: #555; }
        .dp-html-content code { background: #f3f4f6; padding: 0.1em 0.4em; border-radius: 3px; font-size: 0.9em; }
        .dp-html-content a { color: #2563eb; text-decoration: underline; }
      `}</style>
    </div>
  );
}
