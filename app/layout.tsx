import type { Metadata, Viewport } from 'next';
import 'katex/dist/katex.min.css';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#173f35',
  colorScheme: 'light',
};

export const metadata: Metadata = {
  title: '知行工坊 · 具身智能学习工作台',
  description: '面向具身模型与数据算法转型的每日学习、代码实践与求职情报工作台。',
  openGraph: {
    title: '知行工坊 · 具身智能学习工作台',
    description: '每日课程、模型代码洞察、面试与岗位情报，直到完成 SO-101 作品。',
    images: [{ url: '/og.png', width: 1664, height: 943, alt: '知行工坊具身智能学习工作台' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '知行工坊 · 具身智能学习工作台',
    description: '从感知工程师到具身模型 / 数据算法工程师。',
    images: ['/og.png'],
  },
  icons: {
    icon: [{ url: '/app-icon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
