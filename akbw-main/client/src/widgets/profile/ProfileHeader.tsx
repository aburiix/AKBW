import React, { useRef } from 'react';
import { Camera, User, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface Props {
  name: string;
  lastName: string;
  gender: string;
  profileImage: string;
  activeTab: string;
  activeSubSection: 'editProfile' | 'supportChat' | 'productInquiry' | null;
  onImageSelect?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isUploading?: boolean;
}

export default function ProfileHeader({
  name,
  lastName,
  gender,
  profileImage,
  activeTab,
  activeSubSection,
  onImageSelect,
  isUploading,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = useTranslations('Register');

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-row items-center gap-4 pb-5 pr-12 md:pr-0 md:flex-col md:text-center md:gap-3 md:pb-6 border-b border-line transition-all">
      <div className="relative">
        <div className="w-[72px] h-[72px] md:w-24 md:h-24 rounded-full p-[2px] bg-[conic-gradient(from_200deg,#c8986a,#efe8db,#6b6e5f,#c8986a)] shadow-[0_18px_40px_-16px_rgba(200,152,106,0.6)] shrink-0">
          <div className="w-full h-full rounded-full bg-surface border-2 border-surface flex items-center justify-center overflow-hidden relative">
            {profileImage ? (
              <img
                src={profileImage}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-[radial-gradient(circle_at_30%_25%,#6e4a2e,#24180f_70%)] flex items-center justify-center">
                <User className="w-10 h-10 md:w-12 md:h-12 text-ivory/80" />
              </div>
            )}
            {isUploading && (
              <div className="absolute inset-0 bg-night/50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
            )}
          </div>
        </div>
        {activeTab === 'menu' && activeSubSection === 'editProfile' && (
          <>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={onImageSelect}
            />
            <button
              onClick={handleCameraClick}
              disabled={isUploading}
              className="absolute bottom-0 right-0 bg-ivory text-night p-2 rounded-full hover:bg-[#fff] transition-all border-2 border-surface disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Camera size={12} />
            </button>
          </>
        )}
      </div>
      <div className="flex-1 text-left md:text-center min-w-0">
        <h3 className="serif text-[26px] md:text-[30px] leading-tight text-ivory truncate">
          {name} {lastName}
        </h3>
        <p className="lbl text-ivory/45 mt-1.5">
          {gender === 'male' ? t('gender_male') : t('gender_female')}
        </p>
      </div>
    </div>
  );
}
