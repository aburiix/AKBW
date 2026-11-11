import { MessageCircle } from 'lucide-react';
import { ChatComposer, ChatHeader, ChatMessages } from './ChatParts';
import React from 'react';
import { useTranslations } from 'next-intl';

interface Props {
  handleBackToMenu: () => void;
  chatMessage: string;
  setChatMessage: (chatMessage: string) => void;
  handleSendMessage: () => void;
  messages: any[];
  currentUserId: string;
}

export default function SupportChat({
  handleBackToMenu,
  chatMessage,
  setChatMessage,
  handleSendMessage,
  messages,
  currentUserId,
}: Props) {
  const t = useTranslations('Profile');
  return (
    <div className="flex flex-col h-full">
      <ChatHeader
        onBack={handleBackToMenu}
        backLabel={t('back_to_menu')}
        title={t('menu_items.support.title')}
        subtitle={t('menu_items.support.desc')}
      />
      <ChatMessages
        messages={messages}
        currentUserId={currentUserId}
        empty={
          <div className="flex flex-col items-center gap-3">
            <span className="grid place-items-center size-14 rounded-full glass">
              <MessageCircle size={22} className="text-ivory/70" />
            </span>
            <p className="serif text-[22px] text-ivory">
              {t('menu_items.support.title')}
            </p>
            <p className="text-[13px] text-ivory/45">
              {t('menu_items.support.desc')}
            </p>
          </div>
        }
      />
      <ChatComposer
        value={chatMessage}
        onChange={setChatMessage}
        onSend={handleSendMessage}
        placeholder={t('chat_placeholder')}
      />
    </div>
  );
}
