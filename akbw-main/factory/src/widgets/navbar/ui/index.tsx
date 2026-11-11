"use client";

import { useFactoryAuthStore } from '@/features/auth/model/auth.store';
import { Accordion } from '@/shared/ui/accordion';
import { Button } from '@/shared/ui/button';
import {
  NavigationMenu,
  NavigationMenuList,
} from '@/shared/ui/navigation-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/shared/ui/sheet';
import { Menu, LogOut } from 'lucide-react';
import { menu } from '../lib/data';
import { PRODUCT_INFO } from '@/shared/constants/data';
import RenderMenuItem from './RenderItem';
import RenderMobileMenuItem from './RenderMobileMenuItem';
import { ChangeLang } from './ChangeLang';
import Link from 'next/link';

const Navbar = () => {
  const { token, factory, logout } = useFactoryAuthStore();

  return null;

  return (
    <section className="py-4 sticky top-0 bg-white/80 backdrop-blur-md z-50 border-b border-gray-50">
      <div className="custom-container">
        {/* Desktop Menu */}
        <nav className="hidden justify-between lg:flex">
          <div className="flex items-center gap-10">
            {/* Logo */}
            <Link href={'/'} className="flex items-center gap-2">
              <img
                src={PRODUCT_INFO.logo}
                className="max-h-8"
                alt={PRODUCT_INFO.name}
              />
              <span className="text-lg font-black uppercase tracking-tighter">
                {PRODUCT_INFO.name}
              </span>
            </Link>
            <div className="flex items-center">
              <NavigationMenu>
                <NavigationMenuList className="gap-2">
                  {menu.map((item) => RenderMenuItem(item))}
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </div>
          <div className="flex gap-4 items-center">
            <ChangeLang />
            {token ? (
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Hamkor</p>
                  <p className="text-sm font-black uppercase tracking-tight">{factory?.name}</p>
                </div>
                <Button variant="outline" size="icon" onClick={logout} className="rounded-xl border-gray-100 hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-colors">
                  <LogOut size={16} />
                </Button>
              </div>
            ) : (
              <>
                <Button asChild variant="ghost" className="font-bold uppercase tracking-widest text-[10px]">
                  <Link href="/login">Kirish</Link>
                </Button>
                <Button asChild className="rounded-xl bg-black px-6 font-bold uppercase tracking-widest text-[10px]">
                  <Link href="/register">Ro‘yxatdan o‘tish</Link>
                </Button>
              </>
            )}
          </div>
        </nav>

        {/* Mobile Menu */}
        <div className="block lg:hidden">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href={'/'} className="flex items-center gap-2">
              <img
                src={PRODUCT_INFO.logo}
                className="max-h-8"
                alt={PRODUCT_INFO.name}
              />
            </Link>
            <Sheet>
              <div className="flex items-center gap-3">
                <ChangeLang />
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="rounded-xl border-gray-100 shadow-sm">
                    <Menu className="size-4" />
                  </Button>
                </SheetTrigger>
              </div>
              <SheetContent className="overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>
                    <Link href={'/'} className="flex items-center gap-2">
                      <img
                        src={PRODUCT_INFO.logo}
                        className="max-h-8"
                        alt={PRODUCT_INFO.name}
                      />
                    </Link>
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-8 p-6">
                  <Accordion
                    type="single"
                    collapsible
                    className="flex w-full flex-col gap-4"
                  >
                    {menu.map((item) => RenderMobileMenuItem(item))}
                  </Accordion>

                  <div className="flex flex-col gap-3 pt-6 border-t border-gray-50">
                    {token ? (
                      <>
                        <div className="mb-4">
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Hamkor</p>
                          <p className="text-xl font-black uppercase tracking-tight">{factory?.name}</p>
                        </div>
                        <Button variant="outline" className="rounded-xl border-gray-100 text-red-500 font-bold uppercase tracking-widest text-[10px]" onClick={logout}>
                          <LogOut size={16} className="mr-2" /> Chiqish
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button asChild variant="outline" className="rounded-xl font-bold uppercase tracking-widest text-[10px]">
                          <Link href="/login">Kirish</Link>
                        </Button>
                        <Button asChild className="rounded-xl bg-black font-bold uppercase tracking-widest text-[10px]">
                          <Link href="/register">Ro‘yxatdan o‘tish</Link>
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Navbar;
