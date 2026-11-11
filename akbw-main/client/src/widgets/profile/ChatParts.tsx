'use client';

import React from 'react';
import { ArrowLeft, Send } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

/** Chat sarlavhasi: orqaga tugma + nom + "onlayn" belgisi */
export function ChatHeader({
  onBack,
  backLabel,
  title,
  subtitle,
}: {
  onBack: () => void;
  backLabel: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-center gap-3 pb-4 pr-12 border-b border-line">
      <button
        type="button"
        onClick={onBack}
        aria-label={backLabel}
        title={backLabel}
        className="grid place-items-center size-10 shrink-0 rounded-full border border-line-2 text-ivory/70 hover:text-ivory hover:bg-ivory/[0.06] transition-colors cursor-pointer"
      >
        <ArrowLeft size={17} />
      </button>
      <div className="relative grid place-items-center size-10 shrink-0 rounded-full glass">
        <span className="font-display text-[10px] text-ivory">AKBW</span>
        <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-ok border-2 border-surface-2" />
      </div>
      <div className="min-w-0">
        <p className="serif text-[20px] leading-tight text-ivory truncate">
          {title}
        </p>
        <p className="text-[12px] text-ivory/45 truncate">{subtitle}</p>
      </div>
    </div>
  );
}

/** Xabarlar oynasi: yangi xabar kelganda pastga o'zi aylanadi */
export function ChatMessages({
  messages,
  currentUserId,
  empty,
}: {
  messages: any[];
  currentUserId: string;
  empty: React.ReactNode;
}) {
  const endRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [messages?.length]);

  return (
    <div className="flex-1 min-h-[300px] h-[min(52dvh,480px)] overflow-y-auto no-scrollbar py-4">
      {messages && messages.length > 0 ? (
        <div className="flex flex-col gap-2.5">
          {messages.map((msg) => {
            const mine = msg.sender_id === currentUserId;
            return (
              <div
                key={msg.id}
                className={cn(
                  'flex items-end gap-2',
                  mine ? 'justify-end' : 'justify-start',
                )}
              >
                {!mine && (
                  <span className="grid place-items-center size-7 shrink-0 rounded-full border border-line-2 bg-surface-3 font-display text-[7px] text-ivory/80">
                    AKBW
                  </span>
                )}
                <div
                  className={cn(
                    'max-w-[78%] px-4 py-2.5 shadow-[0_10px_24px_-14px_rgba(0,0,0,0.8)]',
                    mine
                      ? 'bg-ivory text-night rounded-[20px] rounded-br-md'
                      : 'bg-surface-3 text-ivory border border-line rounded-[20px] rounded-bl-md',
                  )}
                >
                  {msg.photo && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={msg.photo}
                      alt="Attached"
                      className="w-full h-auto rounded-xl mb-2"
                    />
                  )}
                  {msg.message && (
                    <p className="text-[14px] leading-snug whitespace-pre-wrap break-words">
                      {msg.message}
                    </p>
                  )}
                  <p
                    className={cn(
                      'text-[10.5px] mt-1 text-right tabular-nums',
                      mine ? 'text-night/45' : 'text-ivory/35',
                    )}
                  >
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={endRef} />
        </div>
      ) : (
        <div className="h-full grid place-items-center text-center px-6">
          {empty}
        </div>
      )}
    </div>
  );
}

/** Xabar yozish paneli */
export function ChatComposer({
  value,
  onChange,
  onSend,
  placeholder,
  leading,
}: {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  placeholder: string;
  leading?: React.ReactNode;
}) {
  return (
    <form
      className="flex items-center gap-1.5 p-1.5 rounded-full border border-line-2 bg-ivory/[0.04] focus-within:border-ivory/50 transition-colors"
      onSubmit={(e) => {
        e.preventDefault();
        onSend();
      }}
    >
      {leading}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 min-w-0 h-10 bg-transparent px-3 text-[14.5px] text-ivory placeholder:text-ivory/35 outline-none"
      />
      <button
        type="submit"
        aria-label="Send"
        disabled={!value.trim() && !leading}
        className="grid place-items-center size-10 shrink-0 rounded-full bg-ivory text-night hover:bg-[#fff] active:scale-95 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Send size={16} />
      </button>
    </form>
  );
}
