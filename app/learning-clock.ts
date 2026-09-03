import { addDays, shanghaiDateKey } from './curriculum';

// Reschedule at midnight, and catch up immediately after a suspended tab resumes.
export function observeShanghaiDate(onDate: (date: string) => void) {
  let timer: ReturnType<typeof setTimeout>;
  function refresh() {
    clearTimeout(timer);
    const now = new Date();
    const today = shanghaiDateKey(now);
    onDate(today);
    const midnight = new Date(`${addDays(today, 1)}T00:00:00+08:00`);
    timer = setTimeout(refresh, Math.max(1, midnight.getTime() - now.getTime()));
  }
  refresh();
  document.addEventListener('visibilitychange', refresh);
  window.addEventListener('focus', refresh);
  return () => {
    clearTimeout(timer);
    document.removeEventListener('visibilitychange', refresh);
    window.removeEventListener('focus', refresh);
  };
}
