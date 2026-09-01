'use client';

import { useState } from 'react';
import Link from 'next/link';

export type NoteItem = { id: string; title: string; content: string; context: string; createdAt: string; updatedAt: string };

export default function NotesWidget({ context = '全局随手记' }: { context?: string }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    if (!content.trim()) return;
    setSaving(true);
    const now = new Date().toISOString();
    await fetch('/api/state', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ type: 'save-note', id: crypto.randomUUID(), title: title.trim() || content.trim().slice(0, 24), content: content.trim(), context, createdAt: now }),
    });
    setTitle(''); setContent(''); setSaving(false); setSaved(true);
    window.dispatchEvent(new CustomEvent('notes:updated'));
    window.setTimeout(() => setSaved(false), 1800);
  }

  return <div className={`notes-widget ${open ? 'open' : ''}`}>
    {open ? <section className="notes-popover" aria-label="随手笔记">
      <div className="notes-popover-head"><div><span className="eyebrow">随手记</span><b>{context}</b></div><button onClick={() => setOpen(false)} aria-label="收起笔记">×</button></div>
      <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="标题（可选）" />
      <textarea rows={7} value={content} onChange={(event) => setContent(event.target.value)} placeholder="记下概念、疑问、代码线索或实验想法…" />
      <div><Link href="/?view=notes">查看全部笔记 ↗</Link><button disabled={!content.trim() || saving} onClick={save}>{saving ? '保存中…' : saved ? '已保存 ✓' : '保存笔记'}</button></div>
    </section> : null}
    <button className="notes-fab" onClick={() => setOpen(!open)} aria-label={open ? '收起随手记' : '打开随手记'}><span>{open ? '×' : '✎'}</span><b>{open ? '收起' : '随手记'}</b></button>
  </div>;
}
