import { fetch as expoFetch } from 'expo/fetch';
import { api, API_URL } from './api';
import { useAuth } from './auth';
import { useLang } from './i18n';

export const AI_ERRORS: Record<string, string> = {
  DISABLED: 'AKBW AI hali ishga tushirilmagan. Tez orada!',
  LIMIT: 'Bugungi savollar limiti tugadi. Ertaga yana yozing.',
  THREAD_FULL: 'Suhbat juda uzun bo‘ldi — yangi suhbat oching.',
  AUTH: 'Iltimos, profilingizga qayta kiring.',
  EMPTY: 'Xabar bo‘sh.',
  REFUSAL: 'Bu savolga javob bera olmayman. Boshqacha so‘rab ko‘ring.',
  AI_ERROR: 'Javob olishda xatolik bo‘ldi. Qayta urinib ko‘ring.',
};

export class AssistantError extends Error {
  constructor(public code: string) {
    super(code);
  }
}

/** AKBW AI javobini oqim (SSE) ko'rinishida o'qiydi: har hodisa onEvent(nomi, ma'lumot). */
export async function streamChat(
  body: { message: string; threadId?: string | null; productId?: number | null },
  onEvent: (event: string, data: any) => void,
  signal?: AbortSignal,
) {
  const send = () =>
    expoFetch(`${API_URL}/assistant/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
        'Accept-Language': useLang.getState().lang,
        Authorization: `Bearer ${useAuth.getState().token ?? ''}`,
      },
      body: JSON.stringify(body),
      signal,
    });

  let res = await send();
  if (res.status === 401) {
    // oddiy so'rov token muddati tugagan bo'lsa uni yangilaydi
    await api.assistantMe().catch(() => {});
    res = await send();
  }
  if (!res.ok || !res.body) {
    const j: any = await res.json().catch(() => ({}));
    throw new AssistantError(j?.code || (res.status === 401 ? 'AUTH' : 'AI_ERROR'));
  }

  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = '';
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    let i: number;
    while ((i = buf.indexOf('\n\n')) >= 0) {
      const chunk = buf.slice(0, i);
      buf = buf.slice(i + 2);
      let ev = 'message';
      let data = '';
      for (const line of chunk.split('\n')) {
        if (line.startsWith('event: ')) ev = line.slice(7).trim();
        else if (line.startsWith('data: ')) data += line.slice(6);
      }
      try {
        onEvent(ev, data ? JSON.parse(data) : null);
      } catch {
        // buzilgan bo'lak — o'tkazib yuboramiz
      }
    }
  }
}
