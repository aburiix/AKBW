'use client';

import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

const Profile = dynamic(() => import('./index'), { ssr: false });

type Tab = 'menu' | 'favorites' | 'notifications' | 'reviews';
type Sub = 'editProfile' | 'supportChat' | 'productInquiry';

function ChatScreen() {
  // /chat?kind=help — Yordam chati, /chat?kind=ask — Mahsulot so'rash (ilovadagidek)
  const kind = useSearchParams().get('kind');
  return (
    <Profile
      page={{
        tab: 'menu',
        sub: kind === 'ask' ? 'productInquiry' : 'supportChat',
      }}
    />
  );
}

/** Profil bo'limlari alohida sahifa sifatida (ilovadagi ekranlar bilan bir xil yo'llar) */
export default function ProfileScreen({
  tab = 'menu',
  sub,
  chat,
}: {
  tab?: Tab;
  sub?: Sub;
  chat?: boolean;
}) {
  if (chat)
    return (
      <Suspense fallback={null}>
        <ChatScreen />
      </Suspense>
    );
  return <Profile page={{ tab, sub }} />;
}
