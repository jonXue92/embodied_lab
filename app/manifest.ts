import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: '知行工坊 · 具身智能学习工作台',
    short_name: '知行工坊',
    description: '每日课程、代码实践、学习打卡与具身智能求职情报。',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#f5f4ee',
    theme_color: '#173f35',
    lang: 'zh-CN',
    categories: ['education', 'productivity'],
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
    ],
  };
}
