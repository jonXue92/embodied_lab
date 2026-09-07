'use client';

import { useEffect, useState } from 'react';

type InstallChoice = { outcome: 'accepted' | 'dismissed'; platform: string };
type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<InstallChoice>;
};

type NavigatorWithStandalone = Navigator & { standalone?: boolean };

export default function InstallPrompt() {
  const [visible, setVisible] = useState(false);
  const [isIos] = useState(() => (
    typeof window !== 'undefined' && /iphone|ipad|ipod/i.test(window.navigator.userAgent)
  ));
  const [installEvent, setInstallEvent] = useState<InstallPromptEvent | null>(null);

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches
      || Boolean((window.navigator as NavigatorWithStandalone).standalone);
    if (standalone || window.localStorage.getItem('install-prompt-dismissed') === '1') return;

    const timer = window.setTimeout(() => setVisible(true), 1200);
    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as InstallPromptEvent);
      setVisible(true);
    };
    const onInstalled = () => setVisible(false);

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  function dismiss() {
    window.localStorage.setItem('install-prompt-dismissed', '1');
    setVisible(false);
  }

  async function install() {
    if (!installEvent) return;
    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    if (choice.outcome === 'accepted') setVisible(false);
    setInstallEvent(null);
  }

  if (!visible) return null;

  return <aside className="install-prompt" aria-label="安装知行工坊">
    <span className="install-prompt-icon" aria-hidden="true">知</span>
    <div>
      <b>添加到手机主屏幕</b>
      <span>{installEvent
        ? '像 App 一样直接打开，每天少一步。'
        : isIos
          ? 'Safari 点“分享”，再选“添加到主屏幕”。'
          : '在浏览器菜单中选择“添加到主屏幕”。'}</span>
    </div>
    {installEvent ? <button className="install-prompt-action" onClick={install}>安装</button> : null}
    <button className="install-prompt-close" onClick={dismiss} aria-label="暂不安装">×</button>
  </aside>;
}
