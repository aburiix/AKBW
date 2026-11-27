export interface Named {
  id: number;
  name: string;
}

export interface Category extends Named {
  parentId?: number | null;
  children?: Category[];
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  discount: number;
  product_images: string[];
  categories: Category[];
  sizes: Named[];
  colors: Named[];
  rating: number | null;
}

export interface ProductList {
  data: Product[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export interface User {
  id: string;
  phone: string;
  name: string;
  lastName: string;
  gender: string;
  profile_picture?: string | null;
  referralCode?: string;
  availableBonus?: number;
  reviews?: { id: number; rating: number; comment: string; product_id: number; createdAt: string }[];
}

export interface BtsPlace {
  code: string;
  name: string;
}

export interface BtsBranch extends BtsPlace {
  regionCode: string;
  cityCode: string;
  address: string;
  lat_long: string;
  phone: string;
  video_link: string;
  working_hours: Record<number, string | null>;
}

export interface BtsList<T> {
  status: boolean;
  message: string;
  data: { items: T[] };
}

export type OrderState = 'REVIEW' | 'PENDING' | 'PAID' | 'SENT' | 'CANCELLED';

export interface Translation {
  lang: string;
  name: string;
}

export interface OrderItem {
  id: number;
  productId: number;
  quantity: number;
  price: number;
  product?: { id: number; name?: string; product_images?: string[]; translations?: Translation[] };
  size?: { name?: string; translations?: Translation[] } | null;
  color?: { name?: string; translations?: Translation[] } | null;
}

export interface Order {
  id: number;
  state: OrderState;
  total_price: number;
  createdAt: string;
  orderItems: OrderItem[];
}

export interface AssistantProduct {
  id: number;
  name: string;
  price: number;
  image: string;
  sizes: string[];
  colors: string[];
}

export interface AssistantSize {
  size: string;
  confidence: 'high' | 'medium';
  between_sizes: boolean;
  fit: 'tight' | 'regular' | 'loose';
  product_id: number | null;
  product_name?: string;
}

export interface AssistantUi {
  text: string;
  cards?: AssistantProduct[];
  size?: AssistantSize | null;
}

export interface AssistantMe {
  ok: boolean;
  enabled: boolean;
  limit: number;
  left: number;
  memories: { id: number; fact: string }[];
  threads: { id: string; title: string; updatedAt: string }[];
}

export interface TryOnItem {
  id: string;
  productId: number;
  resultUrl: string;
  createdAt: string;
}

export interface TryOnMe {
  ok: boolean;
  enabled: boolean;
  limit: number;
  left: number;
  items: TryOnItem[];
}

export interface StyleItem {
  id: number;
  image: string;
  categoryId: number;
  category?: { id: number; name: string } | null;
}

export interface Review {
  id: number;
  rating: number;
  comment: string;
  product_id: number;
  user?: { id: string; name: string; lastName: string; profile_picture?: string } | null;
  createdAt: string;
}

export interface ChatMessage {
  id: number;
  chat_id: number;
  sender_id: string | null;
  message: string;
  photo?: string;
  createdAt: string;
}

export interface Chat {
  id: number;
  user_id: string;
  messages: ChatMessage[];
}
