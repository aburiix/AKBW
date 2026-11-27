'use client';

import dynamic from 'next/dynamic';
import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowRight,
  Brain,
  History,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { Link, usePathname } from '@/shared/config/i18n/navigation';
import { useUserStore } from '@/shared/store/user.store';
import { cn } from '@/shared/lib/utils';
import {
  AssistantError,
  deleteAssistantMemoryRequest,
  deleteAssistantThreadRequest,
  getAssistantMeRequest,
  getAssistantThreadRequest,
  streamAssistantChat,
  type IAssistantProduct,
  type IAssistantSize,
} from '@/shared/config/api/assistant/assistant.request';

const Login = dynamic(() => import('@/widgets/login'), { ssr: false });
const Register = dynamic(() => import('@/widgets/register'), { ssr: false });

type Msg = {
  key: string;
  role: 'user' | 'assistant';
  text: string;
  cards?: IAssistantProduct[];
  size?: IAssistantSize | null;
  pending?: boolean;
  error?: boolean;
};
type View = 'chat' | 'history' | 'memory';

/** **qalin** matnni xavfsiz ko'rsatish (HTML ishlatilmaydi) */
function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
        part.startsWith('**') && part.endsWith('**') ? (
          <b key={i} className="font-semibold">
            {part.slice(2, -2)}
          </b>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}

const orb =
  'grid place-items-center rounded-full text-white bg-[radial-gradient(circle_at_35%_30%,#f6e2c8,#8a6243_60%,#3a2414)] shadow-[inset_0_0_12px_rgba(255,255,255,.25)]';

export default function Assistant() {
  const t = useTranslations('Assistant');
  const token = useUserStore((s) => s.token);
  const pathname = usePathname();
  const qc = useQueryClient();

  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>('chat');
  const [threadId, setThreadId] = useState<string | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [tool, setTool] = useState<string | null>(null);
  const feedRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const pendingPrompt = useRef<string | null>(null);

  useEffect(() => setMounted(true), []);
  const authed = mounted && !!token;
  const productId = Number(pathname.match(/\/product\/(\d+)/)?.[1]) || null;

  const { data: me } = useQuery({
    queryKey: ['assistant-me'],
    queryFn: getAssistantMeRequest,
    enabled: authed && open,
  });

  const scroll = useCallback(() => {
    requestAnimationFrame(() =>
      feedRef.current?.scrollTo({ top: feedRef.current.scrollHeight }),
    );
  }, []);
  useEffect(scroll, [msgs, tool, scroll]);

  const send = useCallback(
    async (text: string) => {
      const q = text.trim();
      if (!q || busy) return;
      setInput('');
      setView('chat');
      setBusy(true);
      const aKey = `a${Date.now()}`;
      setMsgs((m) => [
        ...m,
        { key: `u${Date.now()}`, role: 'user', text: q },
        { key: aKey, role: 'assistant', text: '', pending: true },
      ]);
      const patch = (fn: (m: Msg) => Msg) =>
        setMsgs((list) => list.map((m) => (m.key === aKey ? fn(m) : m)));
      const ac = new AbortController();
      abortRef.current = ac;
      try {
        await streamAssistantChat(
          { message: q, threadId, productId },
          (ev, data) => {
            if (ev === 'meta') setThreadId(data.threadId);
            else if (ev === 'text') {
              setTool(null);
              patch((m) => ({ ...m, text: m.text + data.delta }));
            } else if (ev === 'tool') setTool(data.name);
            else if (ev === 'cards')
              patch((m) => ({
                ...m,
                cards: [
                  ...(m.cards ?? []),
                  ...data.products.filter(
                    (p: IAssistantProduct) =>
                      !m.cards?.some((c) => c.id === p.id),
                  ),
                ],
              }));
            else if (ev === 'size') patch((m) => ({ ...m, size: data }));
            else if (ev === 'error')
              patch((m) => ({
                ...m,
                error: true,
                text: m.text || t(`err_${data.code}` as never),
              }));
            else if (ev === 'notice')
              patch((m) => ({ ...m, text: m.text || t('err_REFUSAL') }));
          },
          ac.signal,
        );
      } catch (e) {
        if (!ac.signal.aborted) {
          const code = e instanceof AssistantError ? e.code : 'AI_ERROR';
          patch((m) => ({
            ...m,
            error: true,
            text: t(`err_${code}` as never),
          }));
        }
      } finally {
        patch((m) => ({ ...m, pending: false }));
        setTool(null);
        setBusy(false);
        abortRef.current = null;
        qc.invalidateQueries({ queryKey: ['assistant-me'] });
      }
    },
    [busy, threadId, productId, qc, t],
  );

  // Boshqa joylardan ochish: window.dispatchEvent(new CustomEvent('akbw:assistant', { detail: { prompt } }))
  useEffect(() => {
    const onOpen = (e: Event) => {
      setOpen(true);
      const p = (e as CustomEvent).detail?.prompt;
      if (p) pendingPrompt.current = p;
    };
    window.addEventListener('akbw:assistant', onOpen);
    return () => window.removeEventListener('akbw:assistant', onOpen);
  }, []);
  useEffect(() => {
    if (open && authed && me?.enabled && pendingPrompt.current && !busy) {
      const p = pendingPrompt.current;
      pendingPrompt.current = null;
      send(p);
    }
  }, [open, authed, me?.enabled, busy, send]);

  const newChat = () => {
    abortRef.current?.abort();
    setThreadId(null);
    setMsgs([]);
    setView('chat');
  };
  const openThread = async (id: string) => {
    abortRef.current?.abort();
    const r = await getAssistantThreadRequest(id).catch(() => null);
    if (!r) return;
    setThreadId(id);
    setMsgs(
      r.messages.map((m) => ({
        key: `h${m.id}`,
        role: m.role,
        text: m.ui?.text ?? '',
        cards: m.ui?.cards,
        size: m.ui?.size,
      })),
    );
    setView('chat');
  };

  const chips = productId
    ? [t('chip_size'), t('chip_match'), t('chip_delivery'), t('chip_order')]
    : [
        t('chip_recommend'),
        t('chip_size_general'),
        t('chip_order'),
        t('chip_delivery'),
        t('chip_payment'),
      ];
  if (!mounted) return null;

  return (
    <>
      {open && (
        <section
          aria-label={t('title')}
          className="fixed z-[70] inset-0 md:inset-auto md:right-6 md:bottom-6 md:w-[410px] md:h-[min(700px,calc(100dvh-48px))] flex flex-col bg-[#141210] md:bg-[rgba(20,18,16,.97)] md:rounded-[26px] md:border md:border-line-2 overflow-hidden shadow-[0_30px_80px_-20px_rgba(0,0,0,.85)] pt-[env(safe-area-inset-top)]"
        >
          {/* Sarlavha */}
          <header className="flex items-center gap-3 px-4 py-3.5 border-b border-line bg-gradient-to-b from-[#8a6243]/20 to-transparent">
            <span className={cn(orb, 'size-10 shrink-0')}>
              <Sparkles size={17} />
            </span>
            <div className="min-w-0">
              <b className="block serif text-[20px] leading-none text-ivory">
                {t('title')}
              </b>
              <small className="flex items-center gap-1.5 mt-1 text-[12px] text-[#a9c49a]">
                <i className="size-1.5 rounded-full bg-[#a9c49a]" />
                {authed && me ? t('left', { n: me.left }) : t('subtitle')}
              </small>
            </div>
            <div className="ml-auto flex gap-0.5">
              {authed && (
                <>
                  <button
                    title={t('new_chat')}
                    onClick={newChat}
                    className="grid place-items-center size-9 rounded-full text-ivory/60 hover:text-ivory hover:bg-white/[0.07] cursor-pointer"
                  >
                    <Plus size={18} />
                  </button>
                  <button
                    title={t('history')}
                    onClick={() =>
                      setView(view === 'history' ? 'chat' : 'history')
                    }
                    className={cn(
                      'grid place-items-center size-9 rounded-full hover:bg-white/[0.07] cursor-pointer',
                      view === 'history' ? 'text-ivory' : 'text-ivory/60',
                    )}
                  >
                    <History size={18} />
                  </button>
                  <button
                    title={t('memory')}
                    onClick={() =>
                      setView(view === 'memory' ? 'chat' : 'memory')
                    }
                    className={cn(
                      'grid place-items-center size-9 rounded-full hover:bg-white/[0.07] cursor-pointer',
                      view === 'memory' ? 'text-ivory' : 'text-ivory/60',
                    )}
                  >
                    <Brain size={18} />
                  </button>
                </>
              )}
              <button
                title={t('close')}
                onClick={() => setOpen(false)}
                className="grid place-items-center size-9 rounded-full text-ivory/60 hover:text-ivory hover:bg-white/[0.07] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
          </header>

          {!authed ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center p-8">
              <span className={cn(orb, 'size-20')}>
                <Sparkles size={30} />
              </span>
              <h3 className="serif text-[24px] text-ivory">
                {t('login_title')}
              </h3>
              <p className="text-ivory/60 text-[14px] max-w-[300px]">
                {t('login_text')}
              </p>
              <div className="flex flex-wrap justify-center gap-2.5">
                <Login
                  trigger={
                    <button className="pill pill-ivory">{t('login')}</button>
                  }
                />
                <Register
                  trigger={
                    <button className="pill pill-ghost">{t('register')}</button>
                  }
                />
              </div>
            </div>
          ) : view === 'history' ? (
            <div className="flex-1 overflow-y-auto p-3.5">
              <h4 className="lbl text-ivory/50 px-1 mb-3">{t('history')}</h4>
              {!me?.threads.length && (
                <p className="text-ivory/45 text-[14px] px-1">
                  {t('history_empty')}
                </p>
              )}
              {me?.threads.map((th) => (
                <div
                  key={th.id}
                  className={cn(
                    'group flex items-center gap-2 rounded-xl px-3 py-2.5 hover:bg-white/[0.05]',
                    th.id === threadId && 'bg-white/[0.06]',
                  )}
                >
                  <button
                    onClick={() => openThread(th.id)}
                    className="flex-1 min-w-0 text-left cursor-pointer"
                  >
                    <span className="block truncate text-[14px] text-ivory">
                      {th.title || '…'}
                    </span>
                    <span className="text-[11.5px] text-ivory/40">
                      {new Date(th.updatedAt).toLocaleDateString()}
                    </span>
                  </button>
                  <button
                    aria-label={t('delete')}
                    onClick={async () => {
                      await deleteAssistantThreadRequest(th.id).catch(() => {});
                      if (th.id === threadId) newChat();
                      qc.invalidateQueries({ queryKey: ['assistant-me'] });
                    }}
                    className="grid place-items-center size-8 rounded-full text-ivory/40 hover:text-[#e0896f] opacity-100 md:opacity-0 group-hover:opacity-100 cursor-pointer"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          ) : view === 'memory' ? (
            <div className="flex-1 overflow-y-auto p-4">
              <h4 className="lbl text-ivory/50 mb-2">{t('memory')}</h4>
              <p className="text-ivory/50 text-[13px] mb-4">
                {t('memory_text')}
              </p>
              {!me?.memories.length && (
                <p className="text-ivory/45 text-[14px]">{t('memory_empty')}</p>
              )}
              <ul className="grid gap-2">
                {me?.memories.map((m) => (
                  <li
                    key={m.id}
                    className="flex items-start gap-2 rounded-xl border border-line bg-surface-2 px-3 py-2.5 text-[13.5px] text-ivory/85"
                  >
                    <span className="flex-1">{m.fact}</span>
                    <button
                      aria-label={t('delete')}
                      onClick={async () => {
                        await deleteAssistantMemoryRequest(m.id).catch(
                          () => {},
                        );
                        qc.invalidateQueries({ queryKey: ['assistant-me'] });
                      }}
                      className="text-ivory/40 hover:text-[#e0896f] cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </li>
                ))}
              </ul>
              {!!me?.memories.length && (
                <button
                  onClick={async () => {
                    await deleteAssistantMemoryRequest().catch(() => {});
                    qc.invalidateQueries({ queryKey: ['assistant-me'] });
                  }}
                  className="mt-4 text-[13px] text-[#e0896f] cursor-pointer"
                >
                  {t('memory_clear')}
                </button>
              )}
            </div>
          ) : (
            <>
              <div
                ref={feedRef}
                className="flex-1 overflow-y-auto px-3.5 pt-4 pb-2 flex flex-col gap-2.5"
              >
                {msgs.length === 0 && (
                  <div className="rounded-[18px] rounded-bl-md border border-line bg-surface-2 px-3.5 py-3 text-[14.5px] leading-relaxed text-ivory max-w-[88%] whitespace-pre-line">
                    {t('hello')}
                    {me && !me.enabled && (
                      <span className="block mt-2 text-[#e0896f] text-[13px]">
                        {t('err_DISABLED')}
                      </span>
                    )}
                  </div>
                )}
                {msgs.map((m) => (
                  <Fragment key={m.key}>
                    {(m.text || m.pending || m.error) && (
                      <div
                        className={cn(
                          'max-w-[86%] px-3.5 py-2.5 rounded-[18px] text-[14.5px] leading-relaxed whitespace-pre-line shrink-0',
                          m.role === 'user'
                            ? 'self-end bg-ivory text-night rounded-br-md'
                            : cn(
                                'self-start border border-line bg-surface-2 text-ivory rounded-bl-md',
                                m.error && 'text-[#e0896f]',
                              ),
                        )}
                      >
                        {m.text ? (
                          <Rich text={m.text} />
                        ) : (
                          <span className="inline-flex gap-1 py-1.5">
                            {[0, 1, 2].map((i) => (
                              <i
                                key={i}
                                className="size-1.5 rounded-full bg-ivory/60 animate-bounce"
                                style={{ animationDelay: `${i * 0.15}s` }}
                              />
                            ))}
                          </span>
                        )}
                      </div>
                    )}
                    {!!m.cards?.length && (
                      <div className="flex gap-2 overflow-x-auto shrink-0 pb-1 -mx-1 px-1">
                        {m.cards.map((p) => (
                          <div
                            key={p.id}
                            className="shrink-0 w-[148px] rounded-[14px] overflow-hidden border border-line bg-surface-2"
                          >
                            <Link
                              href={`/product/${p.id}`}
                              onClick={() => setOpen(false)}
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={p.image}
                                alt={p.name}
                                className="w-full aspect-[4/5] object-cover"
                              />
                              <div className="px-2.5 pt-2 text-[12.5px] leading-tight">
                                <b className="block truncate font-medium text-ivory">
                                  {p.name}
                                </b>
                                <span className="text-ivory/40">
                                  {p.price.toLocaleString()} söm
                                </span>
                              </div>
                            </Link>
                            <div className="flex gap-1.5 p-2.5">
                              <Link
                                href={`/product/${p.id}`}
                                onClick={() => setOpen(false)}
                                className="flex-1 grid place-items-center h-[30px] rounded-[9px] bg-ivory text-night text-[11.5px]"
                              >
                                {t('view')}
                              </Link>
                              <Link
                                href={`/try-on?product=${p.id}`}
                                onClick={() => setOpen(false)}
                                className="flex-1 grid place-items-center h-[30px] rounded-[9px] bg-ivory/10 text-ivory text-[11.5px]"
                              >
                                ✦ {t('try')}
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {m.size && (
                      <div className="shrink-0 rounded-[18px] border border-line-2 bg-[linear-gradient(140deg,rgba(138,98,67,.22),rgba(255,255,255,.02))] p-4">
                        <div className="flex items-center gap-3.5">
                          <div className="grid place-items-center size-16 shrink-0 rounded-[18px] bg-ivory text-night serif text-[30px]">
                            {m.size.size}
                          </div>
                          <div>
                            <b className="block serif text-[19px] leading-tight text-ivory">
                              {t('size_title', { size: m.size.size })}
                            </b>
                            <span className="text-ivory/60 text-[12.5px]">
                              {t(`fit_${m.size.fit}`)} ·{' '}
                              {t(
                                m.size.confidence === 'high'
                                  ? 'conf_high'
                                  : 'conf_medium',
                              )}
                              {m.size.between_sizes ? ` · ${t('between')}` : ''}
                            </span>
                          </div>
                        </div>
                        {productId && (
                          <button
                            onClick={() =>
                              window.dispatchEvent(
                                new CustomEvent('akbw:select-size', {
                                  detail: { size: m.size?.size },
                                }),
                              )
                            }
                            className="pill pill-ivory w-full !h-10 mt-3.5 cursor-pointer"
                          >
                            {t('pick_size', { size: m.size.size })}
                          </button>
                        )}
                      </div>
                    )}
                  </Fragment>
                ))}
                {tool && (
                  <div className="self-start text-[12.5px] text-ivory/50 inline-flex items-center gap-2 shrink-0">
                    <RotateCcw
                      size={13}
                      className="animate-spin [animation-direction:reverse]"
                    />
                    {t(`tool_${tool}` as never)}
                  </div>
                )}
              </div>

              {!busy &&
                (msgs.length === 0 || !msgs[msgs.length - 1]?.pending) && (
                  <div className="flex gap-1.5 overflow-x-auto px-3.5 pb-2.5 pt-1 [scrollbar-width:none]">
                    {chips.map((c) => (
                      <button
                        key={c}
                        onClick={() => send(c)}
                        className="shrink-0 h-[34px] px-3.5 rounded-full border border-line-2 text-[13px] text-ivory/65 hover:text-ivory hover:bg-white/[0.05] cursor-pointer"
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                )}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  send(input);
                }}
                className="flex items-center gap-2 mx-3 mb-2 pl-4 pr-1.5 py-1.5 rounded-full bg-surface-2 border border-line-2"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={t('placeholder')}
                  maxLength={2000}
                  className="flex-1 min-w-0 bg-transparent outline-none text-[15px] text-ivory placeholder:text-ivory/35"
                />
                <button
                  type="submit"
                  disabled={busy || !input.trim()}
                  aria-label={t('send')}
                  className="grid place-items-center size-10 rounded-full bg-ivory text-night disabled:opacity-40 cursor-pointer"
                >
                  <ArrowRight size={18} />
                </button>
              </form>
              <p className="text-center text-[10.5px] text-ivory/35 pb-[calc(10px+env(safe-area-inset-bottom))]">
                {t('footer')}
              </p>
            </>
          )}
        </section>
      )}
    </>
  );
}
