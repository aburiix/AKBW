import httpClient, { getLocaleFromPathname } from '../httpClient';
import { BASE_URL } from '../URLs';
import { useUserStore } from '@/shared/store/user.store';

export interface IAssistantProduct {
  id: number;
  name: string;
  price: number;
  image: string;
  sizes: string[];
  colors: string[];
}
export interface IAssistantSize {
  size: string;
  confidence: 'high' | 'medium';
  between_sizes: boolean;
  fit: 'tight' | 'regular' | 'loose';
  product_id: number | null;
  product_name?: string;
}
export interface IAssistantUi {
  text: string;
  cards?: IAssistantProduct[];
  size?: IAssistantSize | null;
}
export interface IAssistantMe {
  ok: boolean;
  enabled: boolean;
  limit: number;
  left: number;
  memories: { id: number; fact: string }[];
  threads: { id: string; title: string; updatedAt: string }[];
}

export const getAssistantMeRequest = async (): Promise<IAssistantMe> =>
  (await httpClient.get('/assistant/me')).data;

export const getAssistantThreadRequest = async (
  id: string,
): Promise<{
  messages: { id: number; role: 'user' | 'assistant'; ui: IAssistantUi }[];
}> => (await httpClient.get(`/assistant/threads/${id}`)).data;

export const deleteAssistantThreadRequest = async (id: string) =>
  (await httpClient.delete(`/assistant/threads/${id}`)).data;

export const deleteAssistantMemoryRequest = async (id?: number) =>
  (
    await httpClient.delete(
      id ? `/assistant/memory/${id}` : '/assistant/memory',
    )
  ).data;

export class AssistantError extends Error {
  constructor(public code: string) {
    super(code);
  }
}

/** Javobni oqim (SSE) ko'rinishida o'qiydi. Har bir hodisa onEvent(nomi, ma'lumot) ga beriladi. */
export async function streamAssistantChat(
  body: {
    message: string;
    threadId?: string | null;
    productId?: number | null;
  },
  onEvent: (event: string, data: any) => void,
  signal?: AbortSignal,
) {
  const send = () =>
    fetch(`${BASE_URL}/assistant/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept-Language': getLocaleFromPathname(),
        Authorization: `Bearer ${useUserStore.getState().token ?? ''}`,
      },
      body: JSON.stringify(body),
      signal,
    });

  let res = await send();
  if (res.status === 401) {
    // httpClient token muddati tugagan bo'lsa yangilaydi, keyin qayta urinamiz
    await getAssistantMeRequest().catch(() => {});
    res = await send();
  }
  if (!res.ok || !res.body) {
    const j = await res.json().catch(() => ({}));
    throw new AssistantError(
      j?.code || (res.status === 401 ? 'AUTH' : 'AI_ERROR'),
    );
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
        /* buzilgan bo'lak — o'tkazib yuboramiz */
      }
    }
  }
}
