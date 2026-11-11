import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getAllAskForChats,
  getAllHelpChats,
  sendAdminHelpMessage,
  sendAdminAskMessage,
  deleteAdminAskChat,
} from '@/shared/config/api/chat/chat.request';
import { toast } from 'sonner';
import { extractError } from '@/shared/lib/extractError';

export const useAdminHelpChats = () => {
  return useQuery({
    queryKey: ['admin-help-chats'],
    queryFn: getAllHelpChats,
  });
};

export const useAdminSendMessage = (type: 'help' | 'ask') => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: type === 'help' ? sendAdminHelpMessage : sendAdminAskMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [type === 'help' ? 'admin-help-chats' : 'admin-ask-chats'],
      });
    },
    onError: (error) => {
      toast.error(extractError(error) || 'Xabar yuborishda xatolik yuz berdi');
    },
  });
};

export const useAdminAskChats = () => {
  return useQuery({
    queryKey: ['admin-ask-chats'],
    queryFn: getAllAskForChats,
  });
};

export const useDeleteAdminAskChat = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteAdminAskChat(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-ask-chats'] });
    },
    onError: (error) => {
      toast.error(extractError(error) || "O'chirishda xatolik yuz berdi");
    },
  });
};
