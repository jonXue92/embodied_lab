import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const progress = sqliteTable('progress', {
  itemId: text('item_id').primaryKey(),
  completed: integer('completed', { mode: 'boolean' }).notNull().default(false),
  updatedAt: text('updated_at').notNull(),
});

export const favorites = sqliteTable('favorites', {
  itemId: text('item_id').primaryKey(),
  itemType: text('item_type').notNull(),
  title: text('title').notNull(),
  summary: text('summary').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const answers = sqliteTable('answers', {
  questionId: text('question_id').primaryKey(),
  answer: text('answer').notNull(),
  score: integer('score').notNull(),
  feedback: text('feedback').notNull(),
  createdAt: text('created_at').notNull(),
});

export const qaConversations = sqliteTable('qa_conversations', {
  id: text('id').primaryKey(),
  question: text('question').notNull(),
  answer: text('answer').notNull(),
  createdAt: text('created_at').notNull(),
}, (table) => [index('idx_qa_created_at').on(table.createdAt)]);
