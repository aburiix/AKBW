import { HelpCircle, Image as ImageIcon, X } from 'lucide-react';

import React from 'react';
import { ChatComposer, ChatHeader, ChatMessages } from './ChatParts';
import { useTranslations } from 'next-intl';

interface Props {
  handleBackToMenu: () => void;
  chatMessage: string;
  setChatMessage: (chatMessage: string) => void;
  handleSendMessage: () => void;
  selectedImage: File | null;
  handleImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setSelectedImage: (selectedImage: File | null) => void;
  messages: any[];
  currentUserId: string;
}

export default function ProductInquiry({
  handleBackToMenu,
  chatMessage,
  setChatMessage,
  handleSendMessage,
  selectedImage,
  handleImageSelect,
  setSelectedImage,
  messages,
  currentUserId,
}: Props) {
  const t = useTranslations('Profile');
  return (
    <div className="flex flex-col h-full">
      <ChatHeader
        onBack={handleBackToMenu}
        backLabel={t('back_to_menu')}
        title={t('menu_items.inquiry.title')}
        subtitle={t('menu_items.inquiry.desc')}
      />
      <ChatMessages
        messages={messages}
        currentUserId={currentUserId}
        empty={
          <div className="flex flex-col items-center gap-3">
            <span className="grid place-items-center size-14 rounded-full glass">
              <HelpCircle size={22} className="text-ivory/70" />
            </span>
            <p className="serif text-[22px] text-ivory">
              {t('inquiry_empty_title')}
            </p>
            <p className="text-[13px] text-ivory/45">
              {t('inquiry_empty_desc')}
            </p>
          </div>
        }
      />

      {selectedImage && (
        <div className="mb-2 flex items-center gap-3 p-2 pr-3 rounded-2xl border border-line-2 bg-ivory/[0.04]">
          <span className="grid place-items-center size-9 rounded-xl bg-surface-3 text-ivory/60">
            <ImageIcon size={16} />
          </span>
          <span className="text-[13px] text-ivory/75 flex-1 truncate">
            {selectedImage.name}
          </span>
          <button
            type="button"
            aria-label="remove"
            onClick={() => setSelectedImage(null)}
            className="grid place-items-center size-8 rounded-full text-ivory/50 hover:text-sale hover:bg-sale/10 cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>
      )}

      <ChatComposer
        value={chatMessage}
        onChange={setChatMessage}
        onSend={handleSendMessage}
        placeholder={t('inquiry_placeholder')}
        leading={
          <label
            title="Rasm"
            className="grid place-items-center size-10 shrink-0 rounded-full text-ivory/60 hover:text-ivory hover:bg-ivory/[0.06] cursor-pointer transition-colors"
          >
            <ImageIcon size={17} />
            <input
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
          </label>
        }
      />
    </div>
  );
}
