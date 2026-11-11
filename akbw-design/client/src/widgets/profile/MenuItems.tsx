import { Link } from '@/shared/config/i18n/navigation';
import React from 'react';
import { ChevronRight } from 'lucide-react';

interface Props {
  menuItems: any[];
  setProfileSubSection: (id: string) => void;
  onClose?: () => void;
}

export default function MenuItems({
  menuItems,
  setProfileSubSection,
  onClose,
}: Props) {
  return (
    <div className="space-y-2">
      {menuItems.map((item) => {
        const Icon = item.icon;

        const content = (
          <>
            <div className="grid place-items-center size-11 shrink-0 rounded-2xl border border-line-2 bg-ivory/[0.04] text-ivory/80 group-hover:bg-ivory group-hover:text-night transition-colors">
              <Icon size={19} />
            </div>
            <div className="flex-1 text-left">
              <h4 className="text-[15px] text-ivory">{item.title}</h4>
              <p className="text-[12.5px] text-ivory/45 mt-0.5">
                {item.description}
              </p>
            </div>
            <ChevronRight
              size={20}
              className="text-ivory/30 group-hover:text-ivory group-hover:translate-x-0.5 transition-all"
            />
          </>
        );

        if (item.href) {
          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={onClose}
              className="w-full cursor-pointer flex items-center gap-4 p-3 pr-4 rounded-[20px] border border-line hover:border-line-2 hover:bg-ivory/[0.03] transition-all group"
            >
              {content}
            </Link>
          );
        }

        return (
          <button
            key={item.id}
            onClick={() => setProfileSubSection(item.id)}
            className="w-full cursor-pointer flex items-center gap-4 p-3 pr-4 rounded-[20px] border border-line hover:border-line-2 hover:bg-ivory/[0.03] transition-all group"
          >
            {content}
          </button>
        );
      })}
    </div>
  );
}
