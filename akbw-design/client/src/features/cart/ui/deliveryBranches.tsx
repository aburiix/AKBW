'use client';

import React from 'react';
import { IBtsBranch } from '@/shared/config/api/bts/bts.model';
import { Phone, Clock, MapPin, Play, ExternalLink } from 'lucide-react';
import { getTelegram } from '@/shared/lib/telegram';
import { cn } from '@/shared/lib/utils';
import { useTranslations } from 'next-intl';

interface DeliveryBranchesProps {
  branches: IBtsBranch[];
  selectedBranch: IBtsBranch | null;
  onSelectBranch: (branch: IBtsBranch) => void;
  isLoading?: boolean;
  error?: string;
}

const getTodayHours = (workingHours: Record<number, string | null>) => {
  const today = new Date().getDay();
  const dayIndex = today === 0 ? 6 : today - 1;
  return workingHours[dayIndex] || 'Closed';
};

export default function DeliveryBranches({
  branches,
  selectedBranch,
  onSelectBranch,
  isLoading = false,
  error,
}: DeliveryBranchesProps) {
  const t = useTranslations('Cart');

  if (error) {
    return (
      <div className="w-full rounded-2xl border border-sale/30 bg-sale/10 p-3 text-sale text-xs">
        {error}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full rounded-2xl border border-line bg-ivory/[0.03] p-4 flex items-center justify-center min-h-20">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-ivory"></div>
          <span className="text-xs text-ivory/50">Loading branches...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 w-full mt-3">
      <div className="grid grid-cols-1 gap-2.5 max-h-80 overflow-y-auto pr-1">
        {branches.length === 0 ? (
          <div className="col-span-full text-center py-8 text-ivory/40 text-sm">
            No branches available
          </div>
        ) : (
          branches.map((branch) => (
            <button
              key={branch.code}
              onClick={() => onSelectBranch(branch)}
              className={cn(
                'text-left p-3.5 rounded-2xl border transition-all cursor-pointer group',
                selectedBranch?.code === branch.code
                  ? 'border-ivory bg-ivory/[0.08]'
                  : 'border-line-2 hover:border-ivory/40',
              )}
            >
              {/* Branch Name */}
              <h4 className="text-[14px] text-ivory truncate">{branch.name}</h4>

              {/* Address */}
              <div className="flex gap-1.5 mt-1.5 text-xs text-ivory/55 line-clamp-1">
                <MapPin size={12} className="shrink-0 mt-0.5 text-ivory/35" />
                <span className="truncate">{branch.address}</span>
              </div>

              {/* Open in Map Button */}
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  const url = `https://www.google.com/maps/dir/?api=1&destination=${branch.lat_long}`;
                  const tg = getTelegram();
                  if (tg) tg.openLink(url);
                  else window.open(url, '_blank');
                }}
                className="flex items-center gap-1 mt-2 text-xs text-star hover:underline cursor-pointer"
              >
                <ExternalLink size={10} />
                {t('open_in_map')}
              </span>

              {/* Phone & Hours */}
              <div className="flex gap-2 mt-2.5 text-xs flex-wrap">
                <a
                  href={`tel:${branch.phone}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-0.5 text-star hover:underline"
                >
                  <Phone size={11} />
                  {branch.phone}
                </a>
                <div className="flex items-center gap-0.5 text-ivory/45 ml-auto">
                  <Clock size={11} />
                  <span className="font-medium">
                    {getTodayHours(branch.working_hours)}
                  </span>
                </div>
              </div>

              {/* Video Link */}
              {branch.video_link && (
                <a
                  href={branch.video_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1 text-xs text-star hover:underline mt-2"
                >
                  <Play size={10} fill="currentColor" />
                  Video
                </a>
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
