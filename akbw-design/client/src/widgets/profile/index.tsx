'use client';

import { Button } from '@/shared/ui/button';
import {
  Modal,
  ModalClose,
  ModalContent,
  ModalDescription,
  ModalTitle,
  ModalTrigger,
} from '@/shared/ui/modal';
import { cn } from '@/shared/lib/utils';
import {
  X,
  User,
  Heart,
  Bell,
  MessageSquare,
  Menu as MenuIcon,
  Settings,
  HelpCircle,
  LogOut,
  Info,
  Phone,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import React from 'react';
import * as z from 'zod';
import { useUIStore } from '@/shared/model/use-ui-store';
import ProfileHeader from './ProfileHeader';
import MenuItems from './MenuItems';
import EditProfile from './EditProfile';
import SupportChat from './SupportChat';
import ProductInquiry from './ProductInquiry';
import FavoriteTab from './FavoriteTab';
import Notifications from './Notifications';
import ReviewTab from './ReviewTab';
import { useUserStore } from '@/shared/store/user.store';
import { useUser, useUpdateUser } from '@/features/user/lib/hooks';
import { useSupportChat, useProductInquiry } from './lib/hooks';
import { toast } from '@/shared/ui/toast';
import { uploadRequest } from '@/shared/config/api/upload/upload.request';
import Login from '../login';
import { AuthHeader } from '@/shared/ui/auth';
import Register from '../register';
import { useRouter, usePathname, Link } from '@/shared/config/i18n/navigation';
import { useTranslations, useLocale } from 'next-intl';

// Zod schema will be created inside the component to use translations

type TabType = 'menu' | 'favorites' | 'notifications' | 'reviews';
type SubSectionType = 'editProfile' | 'supportChat' | 'productInquiry' | null;

interface ProfileProps {
  children?: React.ReactNode;
}

function Profile({ children }: ProfileProps) {
  const { data: userData } = useUser();
  const updateUserMutation = useUpdateUser();

  const [name, setName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [gender, setGender] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [profileImage, setProfileImage] = React.useState<string>('');
  const [chatMessage, setChatMessage] = React.useState('');
  const [selectedImage, setSelectedImage] = React.useState<File | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);

  const router = useRouter();
  const pathname = usePathname();

  const t = useTranslations('Profile');
  const locale = useLocale();

  React.useEffect(() => {
    if (userData?.data) {
      const user = userData.data;
      setName(user.name || '');
      setLastName(user.lastName || '');
      setGender(user.gender || 'male');
      setPhone(user.phone || '');
      setProfileImage(user.profile_picture || '');
    }
  }, [userData]);

  const isProfileOpen = useUIStore((s) => s.isProfileOpen);
  const onOpenChange = useUIStore((s) => s.onOpenChange);
  const activeProfileTab = useUIStore((s) => s.activeProfileTab);
  const activeProfileSubSection = useUIStore((s) => s.activeProfileSubSection);
  const setProfileSubSection = useUIStore((s) => s.setProfileSubSection);
  const setProfileTab = useUIStore((s) => s.setProfileTab);

  const activeTab = activeProfileTab as TabType;
  const activeSubSection = activeProfileSubSection as SubSectionType;

  const token = useUserStore((s) => s.token);
  const setToken = useUserStore((s) => s.setToken);

  const formatPhone = (value: string) => {
    let cleaned = value.replace(/[^\d+]/g, '');
    if (!cleaned.startsWith('+998')) {
      cleaned = '+998' + cleaned.replace('+', '').replace('998', '');
    }

    let formatted = '+998';
    const digits = cleaned.slice(4).replace(/\D/g, '');

    if (digits.length > 0) formatted += ' ' + digits.slice(0, 2);
    if (digits.length > 2) formatted += ' ' + digits.slice(2, 5);
    if (digits.length > 5) formatted += ' ' + digits.slice(5, 7);
    if (digits.length > 7) formatted += ' ' + digits.slice(7, 9);

    return formatted;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    if (formatted.length <= 19) {
      setPhone(formatted);
    }
  };

  const profileSchema = React.useMemo(
    () =>
      z.object({
        name: z.string().min(2, t('validation.name_min')),
        lastName: z.string().min(2, t('validation.lastname_min')),
        gender: z.string().min(2, t('validation.gender_min')),
      }),
    [t],
  );

  const handleSaveProfile = async () => {
    const result = profileSchema.safeParse({ name, lastName, gender });

    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.issues.forEach((issue: z.ZodIssue) => {
        newErrors[issue.path[0] as string] = issue.message;
      });
      setErrors(newErrors);
      return;
    }

    setErrors({});

    try {
      await updateUserMutation.mutateAsync({
        name,
        lastName,
        gender,
        profile_picture: profileImage,
      });
      toast.success(t('messages.save_success'));
      setProfileSubSection(null);
    } catch {
      toast.error(t('messages.save_error'));
    }
  };

  const {
    data: supportChat,
    sendMessage: sendSupportMessage,
    createChat: createSupportChat,
  } = useSupportChat();
  const {
    data: productInquiryChat,
    sendMessage: sendProductInquiryMessage,
    createChat: createProductInquiryChat,
  } = useProductInquiry();

  const handleSendMessage = async () => {
    if (!chatMessage.trim()) return;

    try {
      if (activeSubSection === 'supportChat') {
        let chatId = supportChat?.id;
        if (!chatId) {
          const newChat = await createSupportChat({ receiver_id: 'admin' }); // Assuming admin ID is known or handle by backend
          chatId = newChat.id;
        }
        await sendSupportMessage({ chat_id: chatId, message: chatMessage });
      } else if (activeSubSection === 'productInquiry') {
        let chatId = productInquiryChat?.id;
        let photoUrl = '';
        if (selectedImage) {
          const response = await uploadRequest.uploadImage(selectedImage);
          photoUrl = response.url;
        }

        if (!chatId) {
          const newChat = await createProductInquiryChat({
            receiver_id: 'admin',
          });
          chatId = newChat.id;
        }

        if (photoUrl.length > 0) {
          await sendProductInquiryMessage({
            chat_id: chatId,
            message: chatMessage,
            photo: photoUrl,
          });
        } else {
          await sendProductInquiryMessage({
            chat_id: chatId,
            message: chatMessage,
          });
        }

        setSelectedImage(null);
      }
      setChatMessage('');
    } catch {
      toast.error(t('messages.send_error'));
    }
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsUploading(true);
      try {
        const { uploadRequest } =
          await import('@/shared/config/api/upload/upload.request');
        const response = await uploadRequest.uploadImage(file);
        setProfileImage(response.url);
        toast.success(t('messages.image_upload_success'));
      } catch {
        toast.error(t('messages.image_upload_error'));
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleBackToMenu = () => {
    setProfileSubSection(null);
  };

  const handleChangeLanguage = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLocale = e.target.value;
    router.replace(pathname, { locale: newLocale });
  };

  const tabs = React.useMemo(
    () => [
      { id: 'menu' as TabType, label: t('tabs.menu'), icon: MenuIcon },
      { id: 'favorites' as TabType, label: t('tabs.favorites'), icon: Heart },
      {
        id: 'notifications' as TabType,
        label: t('tabs.notifications'),
        icon: Bell,
      },
      {
        id: 'reviews' as TabType,
        label: t('tabs.reviews'),
        icon: MessageSquare,
      },
    ],
    [t],
  );

  const menuItems = React.useMemo(
    () => [
      {
        id: 'editProfile' as SubSectionType,
        title: t('menu_items.edit_profile.title'),
        description: t('menu_items.edit_profile.desc'),
        icon: Settings,
        color: 'from-slate-600 to-slate-700',
      },
      {
        id: 'supportChat' as SubSectionType,
        title: t('menu_items.support.title'),
        description: t('menu_items.support.desc'),
        icon: Sparkles,
        // "Yordam" — AKBW AI chatini ochadi (profil oynasi yopiladi)
        action: () => {
          onOpenChange(false);
          window.dispatchEvent(new CustomEvent('akbw:assistant'));
        },
        color: 'from-teal-600 to-teal-700',
      },
      {
        id: 'productInquiry' as SubSectionType,
        title: t('menu_items.inquiry.title'),
        description: t('menu_items.inquiry.desc'),
        icon: HelpCircle,
        color: 'from-indigo-600 to-indigo-700',
      },
      {
        id: 'about',
        title: t('menu_items.about.title'),
        description: t('menu_items.about.desc'),
        icon: Info,
        color: 'from-blue-600 to-blue-700',
        href: '/about',
      },
      {
        id: 'contact',
        title: t('menu_items.contact_item.title'),
        description: t('menu_items.contact_item.desc'),
        icon: Phone,
        color: 'from-green-600 to-green-700',
        href: '/contact',
      },
    ],
    [t],
  );

  const renderProfileHeader = () => (
    <ProfileHeader
      name={name}
      lastName={lastName}
      gender={gender}
      profileImage={profileImage}
      activeTab={activeTab}
      activeSubSection={activeSubSection}
      onImageSelect={handleImageSelect}
      isUploading={isUploading}
    />
  );

  const renderMenuItems = () => (
    <MenuItems
      menuItems={menuItems}
      setProfileSubSection={setProfileSubSection}
      onClose={() => onOpenChange(false)}
    />
  );

  const renderEditProfile = () => (
    <EditProfile
      handleBackMenu={handleBackToMenu}
      handleSaveProfile={handleSaveProfile}
      handlePhoneChange={handlePhoneChange}
      name={name}
      lastName={lastName}
      gender={gender}
      phone={phone}
      errors={errors}
      setName={setName}
      setLastName={setLastName}
      setGender={setGender}
    />
  );

  const renderSupportChat = () => (
    <SupportChat
      handleBackToMenu={handleBackToMenu}
      chatMessage={chatMessage}
      setChatMessage={setChatMessage}
      handleSendMessage={handleSendMessage}
      messages={supportChat?.messages || []}
      currentUserId={userData?.data?.id || ''}
    />
  );

  const renderProductInquiry = () => (
    <ProductInquiry
      handleBackToMenu={handleBackToMenu}
      chatMessage={chatMessage}
      setChatMessage={setChatMessage}
      handleSendMessage={handleSendMessage}
      selectedImage={selectedImage}
      handleImageSelect={(e) => {
        if (e.target.files && e.target.files[0]) {
          setSelectedImage(e.target.files[0]);
        }
      }}
      setSelectedImage={setSelectedImage}
      messages={productInquiryChat?.messages || []}
      currentUserId={userData?.data?.id || ''}
    />
  );

  const renderMenuContent = () => {
    if (activeSubSection === 'editProfile') return renderEditProfile();
    if (activeSubSection === 'supportChat') return renderSupportChat();
    if (activeSubSection === 'productInquiry') return renderProductInquiry();
    return renderMenuItems();
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'menu':
        return renderMenuContent();

      case 'favorites':
        return <FavoriteTab />;

      case 'notifications':
        return <Notifications />;

      case 'reviews':
        return <ReviewTab reviews={userData?.data?.reviews || []} />;
    }
  };

  const handleLogOut = () => {
    setToken(null);
    onOpenChange(false);
  };

  if (!token) {
    return (
      <Modal open={isProfileOpen} onOpenChange={onOpenChange}>
        <ModalTrigger asChild>
          {children || <User size={24} className="cursor-pointer" />}
        </ModalTrigger>
        <ModalContent className="max-w-[440px] flex flex-col">
          <ModalClose>
            <X />
          </ModalClose>
          <ModalTitle className="sr-only">{t('guest_mode')}</ModalTitle>

          <AuthHeader
            title={t('guest_mode')}
            subtitle={t('guest_description')}
          />

          <div className="mt-7 flex flex-col gap-3">
            <Login trigger={<Button className="w-full">{t('login')}</Button>} />
            <Register
              trigger={
                <Button variant="outline" className="w-full">
                  {t('register')}
                </Button>
              }
            />
          </div>

          <div className="mt-7 pt-6 border-t border-line">
            <h3 className="lbl text-ivory/45 mb-3">{t('useful_links')}</h3>
            <div className="flex flex-col gap-1">
              {[
                {
                  href: '/about',
                  icon: <Info size={17} />,
                  label: t('about_us'),
                },
                {
                  href: '/contact',
                  icon: <Phone size={17} />,
                  label: t('contact'),
                },
              ].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => onOpenChange(false)}
                  className="flex items-center gap-3 h-12 px-2 rounded-2xl text-ivory/80 hover:text-ivory hover:bg-ivory/[0.05] transition-colors"
                >
                  <span className="grid place-items-center size-9 rounded-xl border border-line-2 text-ivory/70">
                    {l.icon}
                  </span>
                  <span className="text-[14px]">{l.label}</span>
                </Link>
              ))}
              <div className="relative mt-2">
                <select
                  value={locale}
                  className="w-full h-12 appearance-none rounded-2xl border border-line-2 bg-ivory/[0.04] px-4 text-[14px] text-ivory outline-none cursor-pointer"
                  onChange={handleChangeLanguage}
                >
                  <option value="uz">O&apos;zbek 🇺🇿</option>
                  <option value="ru">Русский 🇷🇺</option>
                  <option value="en">English 🇺🇸</option>
                </select>
                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ivory/50"
                />
              </div>
            </div>
          </div>
        </ModalContent>
      </Modal>
    );
  }

  return (
    <Modal open={isProfileOpen} onOpenChange={onOpenChange}>
      <ModalTrigger asChild>
        {children || <User size={24} className="cursor-pointer" />}
      </ModalTrigger>
      <ModalContent className="max-w-[560px] max-h-[calc(100dvh-24px)] overflow-hidden flex flex-col p-5 md:p-7">
        <ModalTitle className="sr-only">{t('user_profile_aria')}</ModalTitle>
        <ModalClose>
          <X />
        </ModalClose>

        {((activeTab === 'menu' &&
          (activeSubSection === null || activeSubSection === 'editProfile')) ||
          activeTab === 'reviews' ||
          activeTab === 'notifications' ||
          activeTab === 'favorites') &&
          renderProfileHeader()}

        {!(activeTab === 'menu' && activeSubSection) && (
          <div className="mt-3">
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar p-1 rounded-full border border-line-2 bg-ivory/[0.03]">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    type="button"
                    key={tab.id}
                    onClick={() => {
                      setProfileTab(tab.id);
                      setProfileSubSection(null);
                    }}
                    className={cn(
                      'flex-1 flex items-center justify-center h-10 px-3.5 gap-2 cursor-pointer rounded-full transition-all whitespace-nowrap',
                      activeTab === tab.id
                        ? 'bg-ivory text-night'
                        : 'text-ivory/55 hover:text-ivory',
                    )}
                  >
                    <Icon size={15} className="shrink-0" />
                    <span className="lbl !tracking-[0.12em]">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div
          className={cn(
            'flex-1 overflow-y-auto no-scrollbar -mx-1 px-1',
            activeTab === 'menu' && activeSubSection ? 'mt-2' : 'mt-4',
          )}
        >
          {renderTabContent()}

          {!(activeTab === 'menu' && activeSubSection) && (
            <>
              <select
                value={locale}
                onChange={handleChangeLanguage}
                className="md:hidden w-full mt-4 h-12 appearance-none rounded-2xl border border-line-2 bg-ivory/[0.04] px-4 text-[14px] text-ivory outline-none cursor-pointer"
              >
                <option value="uz">O&apos;zbek 🇺🇿</option>
                <option value="ru">Русский 🇷🇺</option>
                <option value="en">English 🇺🇸</option>
              </select>
              <Button
                onClick={handleLogOut}
                variant="outline"
                className="w-full mt-4 !border-sale/40 !text-sale hover:!bg-sale/10"
              >
                <LogOut size={16} />
                {t('logout')}
              </Button>
            </>
          )}
        </div>

        {!(activeTab === 'menu' && activeSubSection) && (
          <ModalDescription className="mt-5 text-[10.5px] text-center leading-relaxed text-ivory/35">
            {t('security_note')}
          </ModalDescription>
        )}
      </ModalContent>
    </Modal>
  );
}

export default Profile;
