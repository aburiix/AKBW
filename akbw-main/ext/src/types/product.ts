export interface TextCandidate {
  value: string;
  source: string;
}

export interface PageCandidates {
  title: TextCandidate[];
  price: TextCandidate[];
  description: TextCandidate[];
  images: string[];
}

export interface CatalogItem {
  id: number;
  name: string;
}

export interface CategoryNode extends CatalogItem {
  parentId: number | null;
  children?: CategoryNode[];
}

export interface Catalog {
  categories: CategoryNode[];
  sizes: CatalogItem[];
  colors: CatalogItem[];
}

export interface ProductData {
  title: string;
  price: string;
  description: string;
  images: string[];
  categoryIds: number[];
  sizeIds: number[];
  colorIds: number[];
  discount: string;
  url: string;
  hostname: string;
  importedAt: string;
  language: string;
}

export type ProductField = keyof Omit<
  ProductData,
  "url" | "hostname" | "importedAt" | "language"
>;

export type CatalogKind = "categories" | "sizes" | "colors";
export type CatalogIdField = "categoryIds" | "sizeIds" | "colorIds";

export interface ImportPayload {
  price: number;
  product_images: string[];
  actual_product_link: string;
  categories: number[];
  sizes: number[];
  colors: number[];
  translations: { name: string; description: string; lang: string }[];
  weight: number;
  volume_x: number;
  volume_y: number;
  volume_z: number;
  type: "SELF" | "FACTORY";
  discount?: number;
}

export interface ImportHistoryEntry {
  id: string;
  title: string;
  price: string;
  url: string;
  hostname: string;
  image: string;
  importedAt: string;
}
