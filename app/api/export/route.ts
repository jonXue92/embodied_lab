import { env } from 'cloudflare:workers';
import { interviewItems } from '@/app/content';

function markdownResponse(body: string, filename: string) {
  return new Response(`\uFEFF${body}`, {
    headers: {
      'content-type': 'text/markdown; charset=utf-8',
      'content-disposition': `attachment; filename="${filename}"`,
      'cache-control': 'no-store',
    },
  });
}

export async function GET(request: Request) {
  const type = new URL(request.url).searchParams.get('type');

  if (type === 'interviews') {
    const rows = interviewItems.map((item) => [
      `## ${item.q}`,
      '',
      `- 分类：${item.cat}`,
      `- 近期提及：${item.freq} 次`,
      `- 来源：${item.source}`,
      `- 优先级：${item.level}`,
      '',
    ].join('\n')).join('\n');
    return markdownResponse(`# 面试情报汇总\n\n> 导出时间：${new Date().toISOString()}\n> 说明：来源已去重归类，频次是学习优先级信号，不是统计学意义上的全量样本。\n\n${rows}`, 'zhixing-interviews.md');
  }

  if (type === 'qa') {
    await env.DB.prepare('CREATE TABLE IF NOT EXISTS qa_conversations (id TEXT PRIMARY KEY, question TEXT NOT NULL, answer TEXT NOT NULL, created_at TEXT NOT NULL)').run();
    const result = await env.DB.prepare('SELECT question, answer, created_at AS createdAt FROM qa_conversations ORDER BY created_at DESC').all<{ question: string; answer: string; createdAt: string }>();
    const rows = result.results.map((item) => [`## ${item.question}`, '', item.answer, '', `_${item.createdAt}_`, ''].join('\n')).join('\n');
    return markdownResponse(`# 知行工坊·学习答疑归档\n\n> 导出时间：${new Date().toISOString()}\n\n${rows || '暂无答疑记录。\n'}`, 'zhixing-qa.md');
  }

  if (type === 'notes') {
    await env.DB.prepare('CREATE TABLE IF NOT EXISTS notes (id TEXT PRIMARY KEY, title TEXT NOT NULL, content TEXT NOT NULL, context TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)').run();
    const result = await env.DB.prepare('SELECT title, content, context, updated_at AS updatedAt FROM notes ORDER BY updated_at DESC').all<{ title: string; content: string; context: string; updatedAt: string }>();
    const rows = result.results.map((item) => [`## ${item.title}`, '', `> 上下文：${item.context}`, '', item.content, '', `_更新于 ${item.updatedAt}_`, ''].join('\n')).join('\n');
    return markdownResponse(`# 知行工坊·学习笔记\n\n> 导出时间：${new Date().toISOString()}\n\n${rows || '暂无学习笔记。\n'}`, 'zhixing-notes.md');
  }

  return Response.json({ error: '不支持的导出类型' }, { status: 400 });
}
