import httpClient from '../httpClient';

export interface IAiThreadRow {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  user: { id: string; name: string; lastName: string; phone: string };
  messageCount: number;
  last: { role: 'user' | 'assistant'; text: string; createdAt: string } | null;
}

export interface IAiMessage {
  id: number;
  role: 'user' | 'assistant';
  createdAt: string;
  ui: {
    text: string;
    cards?: { id: number; name: string; price: number; image: string }[];
    size?: { size: string; fit: string; confidence: string; product_name?: string } | null;
  };
}

export const getAiThreads = async (params: { q?: string; page?: number }) =>
  (await httpClient.get('/assistant/admin/threads', { params })).data as {
    data: IAiThreadRow[];
    meta: { total: number; page: number; totalPages: number };
  };

export const getAiThread = async (id: string) =>
  (await httpClient.get(`/assistant/admin/threads/${id}`)).data as {
    thread: { id: string; title: string; createdAt: string; user: IAiThreadRow['user'] & { gender: string; createdAt: string } };
    messages: IAiMessage[];
    memories: { id: number; fact: string; createdAt: string }[];
  };
