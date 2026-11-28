interface IProductTranslation {
  name: string;
  description: string;
  lang: string;
}

export interface ICreateProduct {
  price: number;
  product_images: string[];
  categories: number[];
  sizes: number[];
  colors: number[];
  translations: IProductTranslation[];
  discount?: number;
  type?: 'SELF' | 'FACTORY';
  factory_id?: number | null;
  weight: number;
  volume_x: number;
  volume_y: number;
  volume_z: number;
  /** yaratishda: Telegram kanalga ham yuborilsinmi */
  post_to_channel?: boolean;
}

export interface ICreateCategoryTranslation {
  name: string;
  lang: string;
}

export interface ICreateCategory {
  translations: ICreateCategoryTranslation[];
}

export type IUpdateProduct = { id: number } & Partial<ICreateProduct>;

export interface ICategory {
  id: number;
  name: string;
  parentId?: number | null;
  children?: ICategory[];
  createdAt: string;
  updatedAt: string;
}

export interface IProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  product_images: string[];
  categories: ICategory[];
  sizes: any[];
  colors: any[];
  type: 'SELF' | 'FACTORY';
  factory_id?: number | null;
  weight: number;
  volume_x: number;
  volume_y: number;
  volume_z: number;
  createdAt: string;
  updatedAt: string;
  /** Telegram kanaldagi post (yuborilgan bo'lsa) */
  channel_message_id?: number | null;
  channel_posted_at?: string | null;
}

export interface IProductListResponse {
  data: IProduct[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface IProductFilters {
  page?: number;
  limit?: number;
  q?: string;
  categoryId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
