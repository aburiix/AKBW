import { isAxiosError } from 'axios';
import { toast } from '@/shared/ui/toast';

export const onError = (error: unknown, err_massage?: string) => {
  if (isAxiosError(error)) {
    toast.error(error.response?.data.message);
  } else {
    toast.error(
      err_massage ||
        "Nomalum xatolik yuz berdi! Iltimos keyinroq urunib ko'ring",
    );
  }
};
