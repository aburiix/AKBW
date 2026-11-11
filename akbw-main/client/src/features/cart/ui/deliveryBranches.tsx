'use client';

import React from 'react';
import { IBtsBranch } from '@/shared/config/api/bts/bts.model';
import { Phone, Clock, MapPin, Play, ExternalLink } from 'lucide-react';
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
      <div className="w-full bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-xs font-medium">
        {error}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full bg-gray-50 rounded-xl p-4 flex items-center justify-center min-h-20">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black"></div>
          <span className="text-xs text-gray-500 font-medium">
            Loading branches...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 w-full mt-3">
      <div className="grid grid-cols-1 gap-2.5 max-h-80 overflow-y-auto pr-1">
        {branches.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-400 text-sm">
            No branches available
          </div>
        ) : (
          branches.map((branch) => (
            <button
              key={branch.code}
              onClick={() => onSelectBranch(branch)}
              className={cn(
                'text-left p-3 rounded-xl border-2 transition-all cursor-pointer group hover:shadow-md',
                selectedBranch?.code === branch.code
                  ? 'border-black bg-black/5 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-gray-300',
              )}
            >
              {/* Branch Name */}
              <h4 className="font-bold text-sm text-black truncate group-hover:text-black transition-colors">
                {branch.name}
              </h4>

              {/* Address */}
              <div className="flex gap-1.5 mt-1.5 text-xs text-gray-600 line-clamp-1">
                <MapPin size={12} className="shrink-0 mt-0.5 text-gray-400" />
                <span className="truncate">{branch.address}</span>
              </div>

              {/* Open in Map Button */}
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(
                    `https://www.google.com/maps/dir/?api=1&destination=${branch.lat_long}`,
                    '_blank',
                  );
                }}
                className="flex items-center gap-1 mt-2 text-xs text-blue-600 hover:text-blue-700 hover:underline font-medium cursor-pointer"
              >
                <ExternalLink size={10} />
                {t('open_in_map')}
              </span>

              {/* Phone & Hours */}
              <div className="flex gap-2 mt-2.5 text-xs flex-wrap">
                <a
                  href={`tel:${branch.phone}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-0.5 text-blue-600 hover:underline font-medium"
                >
                  <Phone size={11} />
                  {branch.phone}
                </a>
                <div className="flex items-center gap-0.5 text-gray-500 ml-auto">
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
                  className="flex items-center gap-1 text-xs text-blue-600 hover:underline font-medium mt-2"
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
