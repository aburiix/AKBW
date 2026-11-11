import httpClient from '../httpClient';
import type { CategoryItem } from './categories.model';
import { ENDP_CATEGORIES } from '../URLs';

export const getCategories = async (): Promise<CategoryItem[]> => {
  return (await httpClient.get(ENDP_CATEGORIES)).data;
};
