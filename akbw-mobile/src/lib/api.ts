import { useAuth } from './auth';
import { toNewLatin, tr, useLang } from './i18n';
import type {
  AssistantMe,
  AssistantUi,
  BtsBranch,
  BtsList,
  BtsPlace,
  Category,
  Order,
  Chat,
  Product,
  ProductList,
  Review,
  StyleItem,
  TryOnMe,
  User,
} from './types';

export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.akbw.uz/api';
export const SITE_URL = 'https://akbw.uz';
/** Server yuklangan fayl uchun http havola qaytarishi mumkin — iOS faqat https rasmni ko'rsatadi. */
export const httpsUrl = (u?: string | null) => (u ? u.replace(/^http:\/\/api\.akbw\.uz/, 'https://api.akbw.uz') : undefined);

export const BRAND = {
  phone: '+998905661107',
  phoneLabel: '+998 90 566 11 07',
  telegram: 'https://t.me/akbwuz',
  instagram: 'https://instagram.com/akbw.uz',
};

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public body?: unknown,
  ) {
    super(message);
  }
}

type Options = { method?: 'GET' | 'POST' | 'PUT' | 'DELETE'; body?: unknown; auth?: boolean; retry?: boolean };

let refreshing: Promise<boolean> | null = null;

async function refreshTokens(): Promise<boolean> {
  const { refreshToken, setTokens, logout } = useAuth.getState();
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    const data = await res.json();
    if (res.ok && data?.token) {
      await setTokens(data.token, data.refreshToken ?? refreshToken);
      return true;
    }
  } catch {
    // tarmoq xatosi — pastda chiqib ketadi
  }
  await logout();
  return false;
}

export async function request<T>(path: string, opts: Options = {}): Promise<T> {
  const { method = 'GET', body, retry = true } = opts;
  const token = useAuth.getState().token;
  const headers: Record<string, string> = { 'Accept-Language': useLang.getState().lang, Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch {
    // 15 s ichida javob kelmadi — server sekin; aks holda internet yo'q
    throw new ApiError(
      0,
      controller.signal.aborted
        ? tr("Server javob bermayapti (vaqt tugadi). Qayta urinib ko'ring.")
        : tr("Internet bilan aloqa yo'q. Qayta urinib ko'ring."),
    );
  } finally {
    clearTimeout(timer);
  }

  if (res.status === 401 && token && retry) {
    refreshing ??= refreshTokens().finally(() => (refreshing = null));
    if (await refreshing) return request<T>(path, { ...opts, retry: false });
  }

  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    const msg =
      (data && (data.message || data.error)) ||
      (res.status === 429 ? tr("Juda ko'p urinish. Birozdan keyin qayta urinib ko'ring.") : tr('Xatolik yuz berdi'));
    // server xabarlari o'zbekcha (eski yozuvda) — o'zbek tilida yangi alifboga o'tkaziladi
    throw new ApiError(res.status, useLang.getState().lang === 'uz' ? toNewLatin(String(msg)) : String(msg), data);
  }
  return data as T;
}

export const api = {
  products: (params: Record<string, string | number | undefined> = {}) => {
    const qs = Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== '')
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
      .join('&');
    return request<ProductList>(`/product${qs ? `?${qs}` : ''}`);
  },
  product: (id: string | number) => request<Product>(`/product/${id}`),
  recommended: () => request<{ newest: Product[]; mostSold: Product[] }>('/product/recommended/all'),
  categories: () => request<Category[]>('/product/categories'),
  sizes: () => request<{ id: number; name: string }[]>('/product/sizes'),
  colors: () => request<{ id: number; name: string }[]>('/product/colors'),
  styles: () => request<{ ok: boolean; data: StyleItem[] }>('/style'),

  sendSms: (phone: string, type?: 'login') => request<{ ok: boolean; isRegistered?: boolean }>('/sms/send', { method: 'POST', body: { phone, type } }),
  verifySms: (phone: string, code: string) =>
    request<{ verifyToken: string }>('/sms/verify', { method: 'POST', body: { phone, code } }),
  login: (phone: string, verifyToken: string) =>
    request<{ token: string; refreshToken: string }>('/auth/login', { method: 'POST', body: { phone, verifyToken } }),
  register: (body: {
    phone: string;
    name: string;
    lastName: string;
    gender: string;
    birthDate: string;
    region: string;
    district: string;
    email?: string;
    verifyToken: string;
    referralCode?: string;
  }) =>
    request<{ token: string; refreshToken?: string }>('/auth/register', { method: 'POST', body }),
  me: () => request<{ data: User; ok: boolean }>('/user/me'),
  updateMe: (body: {
    name?: string;
    lastName?: string;
    gender?: string;
    profile_picture?: string;
    birthDate?: string;
    region?: string;
    district?: string;
    email?: string;
  }) =>
    request<{ data: User; ok: boolean }>('/user/me', { method: 'PUT', body }),
  // sharhlar
  reviews: (productId: number | string, page = 1) =>
    request<{ data: Review[]; meta: { total: number; totalPages: number } }>(`/review/product/${productId}?page=${page}&limit=10`),
  topReviews: () => request<{ data: Review[] }>('/review/top'),
  addReview: (productId: number, rating: number, comment: string) =>
    request<Review>('/review', { method: 'POST', body: { product_id: String(productId), rating, comment } }),
  editReview: (id: number, productId: number, rating: number, comment: string) =>
    request<Review>(`/review/${id}`, { method: 'PUT', body: { product_id: String(productId), rating, comment } }),
  deleteReview: (id: number) => request<unknown>(`/review/${id}`, { method: 'DELETE' }),

  // yordam chati va mahsulot so'rash
  helpChat: () => request<Chat | null>('/chat/help-chat'),
  createHelpChat: () => request<Chat>('/chat', { method: 'POST', body: { receiver_id: 'admin' } }),
  sendHelp: (chat_id: number, message: string) => request<unknown>('/chat/help-chat-message', { method: 'POST', body: { chat_id, message } }),
  askChat: () => request<Chat | null>('/chat/ask-for-product-chat'),
  createAskChat: () => request<Chat>('/chat/ask-for-product-chat', { method: 'POST', body: { receiver_id: 'admin' } }),
  sendAsk: (chat_id: number, message: string, photo?: string) =>
    request<unknown>('/chat/ask-for-product-message', { method: 'POST', body: { chat_id, message, ...(photo ? { photo } : {}) } }),
  uploadImage: async (uri: string) => {
    const form = new FormData();
    form.append('image', { uri, name: 'photo.jpg', type: 'image/jpeg' } as unknown as Blob);
    return upload<{ url: string }>('/upload', form);
  },
  applyCoupon: (code: string) => request<{ success: boolean; coupon: { id: number; discount: number; code: string } }>('/coupon/apply', { method: 'POST', body: { code } }),

  deleteMe: () => request<{ ok: boolean }>('/user/me', { method: 'DELETE' }),
  notifications: () => request<{ data: { id: number; title: string; message: string; createdAt: string }[]; ok: boolean }>('/notification'),
  contact: (body: { name: string; phone: string; about: string }) => request<{ ok: boolean }>('/contact', { method: 'POST', body }),

  // yetkazib berish (BTS)
  regions: () => request<BtsList<BtsPlace>>('/delivery/regions'),
  cities: (regionCode: string) => request<BtsList<BtsPlace>>(`/delivery/cities?regionCode=${encodeURIComponent(regionCode)}`),
  branches: (regionCode: string, cityCode: string) =>
    request<BtsList<BtsBranch>>(
      `/delivery/branches?regionCode=${encodeURIComponent(regionCode)}&cityCode=${encodeURIComponent(cityCode)}`,
    ),
  deliveryPrice: (receiverCityCode: string, products: { productId: string; quantity: string }[]) =>
    request<{ total_price: number }>('/delivery/calculate', { method: 'POST', body: { receiverCityCode, products } }),

  // buyurtmalar
  createOrder: (body: {
    items: { productId: number; sizeId: number | null; colorId: number | null; quantity: number }[];
    total_price: number;
    selectedBranch: BtsBranch;
    coupon_code?: string;
  }) => request<{ order: Order | Order[]; ok?: boolean }>('/order', { method: 'POST', body }),
  orders: () => request<{ data: Order[]; ok: boolean }>('/order'),
  payLink: (method: 'payme' | 'click' | 'paynet', orderId: number, amount: number) => {
    if (method === 'payme') return request<{ link: string }>('/payment/payme/generate-link', { method: 'POST', body: { orderId, amount } });
    if (method === 'click')
      return request<{ link: string }>('/payment/click/checkout', { method: 'POST', body: { order_id: String(orderId), amount } });
    return request<{ link: string }>('/payment/paynet/link', { method: 'POST', body: { orderId: String(orderId), amount } });
  },

  // AKBW AI
  assistantMe: () => request<AssistantMe>('/assistant/me'),
  assistantThread: (id: string) =>
    request<{ messages: { id: number; role: 'user' | 'assistant'; ui: AssistantUi }[] }>(`/assistant/threads/${id}`),
  deleteThread: (id: string) => request<{ ok: boolean }>(`/assistant/threads/${id}`, { method: 'DELETE' }),

  // kiyib ko'rish
  tryOnMe: () => request<TryOnMe>('/tryon/me'),
  deleteTryOn: (id: string) => request<{ ok: boolean }>(`/tryon/${id}`, { method: 'DELETE' }),
  createTryOn: async (photoUri: string, productId: number, imageIndex = 0) => {
    const form = new FormData();
    // React Native FormData fayl ko'rinishi
    form.append('photo', { uri: photoUri, name: 'photo.jpg', type: 'image/jpeg' } as unknown as Blob);
    form.append('productId', String(productId));
    form.append('imageIndex', String(imageIndex));
    return upload<{ ok: boolean; id: string; resultUrl: string; left: number }>('/tryon', form);
  },
};

/** multipart yuborish (AI 5–60 s ishlaydi — uzun kutish). */
async function upload<T>(path: string, form: FormData, retry = true): Promise<T> {
  const token = useAuth.getState().token;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 120000);
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Accept-Language': useLang.getState().lang, ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: form,
      signal: controller.signal,
    });
  } catch {
    throw new ApiError(0, tr("Internet bilan aloqa yo'q yoki javob juda uzoq kutildi."));
  } finally {
    clearTimeout(timer);
  }
  if (res.status === 401 && token && retry) {
    refreshing ??= refreshTokens().finally(() => (refreshing = null));
    if (await refreshing) return upload<T>(path, form, false);
  }
  const data: any = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, data?.message || tr('Xatolik yuz berdi'), data);
  return data as T;
}

/** Tarjimali nom: avval to'g'ridan-to'g'ri name, keyin uz tarjima. */
export function trName(x?: { name?: string; translations?: { lang: string; name: string }[] } | null): string {
  if (!x) return '';
  return x.name || x.translations?.find((t) => t.lang === 'uz')?.name || x.translations?.[0]?.name || '';
}
