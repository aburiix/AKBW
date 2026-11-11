'use client';

import React, { useState } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import {
  Modal,
  ModalContent,
  ModalTitle,
  ModalDescription,
} from '@/shared/ui/modal';
import {
  IFactory,
  ICreateFactory,
  PaymentDateForFactories,
} from '@/shared/config/api/factory/factory.model';
import { Select } from '@/shared/ui/select';
import {
  useCreateFactory,
  useUpdateFactory,
  useBtsRegions,
  useBtsCities,
  useGetBranches
} from '../lib/hooks';

interface AddFactoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  factory?: IFactory | null;
}

export default function AddFactoryModal({
  isOpen,
  onClose,
  factory,
}: AddFactoryModalProps) {
  const [formData, setFormData] = useState<ICreateFactory>({
    name: '',
    phone: '',
    address: '',
    bts_region_code: '',
    bts_city_code: '',
    bts_branch_code: '',
    login: '',
    password: '',
    payment_type: PaymentDateForFactories.MONTH,
  });

  const [region, setRegion] = useState('');
  const [district, setDistrict] = useState('');

  const createMutation = useCreateFactory();
  const updateMutation = useUpdateFactory();
  const { data: regionsData, isLoading: isRegionsLoading, error: btsGettingError } = useBtsRegions();
  const { data: citiesData, isLoading: isCitiesLoading, error: btsCitiesGettingError } = useBtsCities(region);
  const { data: branchesData, isLoading: isBranchesLoading, error: btsBranchesGettingError } = useGetBranches({ regionCode: region, cityCode: district });

  React.useEffect(() => {
    if (factory && isOpen) {
      setFormData({
        name: factory.name,
        phone: factory.phone,
        address: factory.address,
        bts_region_code: factory.bts_region_code,
        bts_city_code: factory.bts_city_code,
        bts_branch_code: factory.bts_branch_code,
        login: factory.login,
        payment_type: factory.payment_type,
        password: '',
      });
      setRegion(factory.bts_region_code);
      setDistrict(factory.bts_city_code);
    } else if (!factory && isOpen) {
      setFormData({
        name: '',
        phone: '',
        address: '',
        bts_region_code: '',
        bts_city_code: '',
        bts_branch_code: '',
        login: '',
        password: '',
        payment_type: PaymentDateForFactories.MONTH,
      });
      setRegion('');
      setDistrict('');
    }
  }, [factory, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      if (factory) {
        // Only send password if it's not empty (to avoid empty password error)
        console.log("factory Formdata Update: ", formData);
        await updateMutation.mutateAsync({ id: factory.id, factory: formData });
      } else {
        await createMutation.mutateAsync(formData);
      }
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <ModalContent className="max-w-xl bg-white p-0 overflow-hidden border-none rounded-[32px] shadow-2xl">
      <div>
        <p className='text-red-500'>{btsGettingError?.message || btsCitiesGettingError?.message || btsBranchesGettingError?.message ? 'Xatolik yuz berdi' : ''}</p>
      </div>
        <div className="flex flex-col">
          {/* Header */}
          <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
            <div>
              <ModalTitle className="text-xl font-black uppercase tracking-tight">
                {factory ? 'Zavodni tahrirlash' : 'Zavod qo‘shish'}
              </ModalTitle>
              <ModalDescription className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                Zavod haqidagi barcha ma’lumotlarni kiriting
              </ModalDescription>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white rounded-full transition-all cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Form Content */}
          <div className="p-8 pb-12 space-y-10 overflow-y-auto max-h-[70vh]">
            {/* Main info & Credentials */}
            <div className="space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-black/20 pb-2 border-b border-gray-50 flex items-center justify-between">
                Asosiy ma'lumotlar & Kirish ma'lumotlari
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-black text-gray-400 ml-1">
                    Login
                  </label>
                  <Input
                    name="login"
                    placeholder="Loginingiz"
                    className="h-12 border-gray-100 rounded-2xl focus-visible:ring-black/10 font-bold"
                    value={formData.login}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-black text-gray-400 ml-1">
                    Parol
                  </label>
                  <Input
                    name="password"
                    type="text"
                    placeholder="••••••••"
                    className="h-12 border-gray-100 rounded-2xl focus-visible:ring-black/10 font-bold"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-black text-gray-400 ml-1">
                  Kompaniya nomi (Zavod)
                </label>
                <Input
                  name="name"
                  placeholder="Masalan: AKBW Factory"
                  className="h-12 border-gray-100 rounded-2xl focus-visible:ring-black/10 font-bold"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-black/20 pb-2 border-b border-gray-50 flex items-center justify-between">
                Bog'lanish
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-black text-gray-400 ml-1">
                    Telefon raqami
                  </label>
                  <Input
                    name="phone"
                    placeholder="+998..."
                    className="h-12 border-gray-100 rounded-2xl focus-visible:ring-black/10 font-bold"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-black text-gray-400 ml-1">
                    BTS Viloyat
                  </label>
                  <div className="relative">
                    <select
                      value={region}
                      onChange={(e) => {
                        setRegion(e.target.value);
                        setDistrict('');
                        setFormData((prev) => ({
                          ...prev,
                          bts_region_code: e.target.value,
                          bts_city_code: '',
                          bts_branch_code: '',
                        }));
                      }}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl h-12 px-4 text-sm font-bold appearance-none cursor-pointer focus:ring-2 focus:ring-black/10"
                      disabled={isRegionsLoading}
                    >
                      <option value="">
                        {isRegionsLoading ? 'Yuklanmoqda...' : 'Viloyatni tanlang'}
                      </option>
                      {regionsData?.data?.items?.map((r: any) => (
                        <option key={r.code} value={r.code}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={18}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-black/50 pointer-events-none"
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-black text-gray-400 ml-1">
                    BTS Shahar
                  </label>
                  <div className="relative">
                    <select
                      value={district}
                      disabled={!region || isCitiesLoading}
                      onChange={(e) => {
                        setDistrict(e.target.value);
                        setFormData((prev) => ({
                          ...prev,
                          bts_city_code: e.target.value,
                          bts_branch_code: '',
                        }));
                      }}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl h-12 px-4 text-sm font-bold appearance-none cursor-pointer focus:ring-2 focus:ring-black/10 disabled:opacity-50"
                    >
                      <option value="">
                        {isCitiesLoading ? 'Yuklanmoqda...' : 'Shaharni tanlang'}
                      </option>
                      {citiesData?.data?.items?.map((d: any) => (
                        <option key={d.code} value={d.code}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={18}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-black/50 pointer-events-none"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-black text-gray-400 ml-1">
                    BTS Filial
                  </label>
                  <div className="relative">
                    <select
                      value={formData.bts_branch_code}
                      onChange={(e) => {
                        setFormData((prev) => ({
                          ...prev,
                          bts_branch_code: e.target.value,
                        }));
                      }}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl h-12 px-4 text-sm font-bold appearance-none cursor-pointer focus:ring-2 focus:ring-black/10 disabled:opacity-50"
                      disabled={!region || !district || isBranchesLoading || !branchesData?.data?.items?.length}
                    >
                      <option value="">
                        {isBranchesLoading ? 'Yuklanmoqda...' : 'Filialni tanlang'}
                      </option>
                      {branchesData?.data?.items?.map((branch: any) => (
                        <option key={branch.code} value={branch.code}>
                          {branch.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={18}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-black/50 pointer-events-none"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-black text-gray-400 ml-1">
                  Manzil
                </label>
                <Input
                  name="address"
                  placeholder="To'liq manzilni kiriting..."
                  className="h-12 border-gray-100 rounded-2xl focus-visible:ring-black/10 font-bold"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Management Info */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-black text-gray-400 ml-1">
                  To‘lov turi
                </label>
                <Select
                  name="payment_type"
                  value={formData.payment_type}
                  onChange={handleChange}
                  className="h-12 border-gray-100 rounded-2xl font-bold"
                >
                  <option value="MONTH">Har oy</option>
                  <option value="THREEMONTH">
                    3 oyda bir
                  </option>
                  <option value="SIXMONTH">
                    6 oyda bir
                  </option>
                  <option value="YEAR">
                    Yiliga bir
                  </option>
                </Select>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-8 border-t border-gray-50 flex justify-end bg-gray-50/30">
            <div className="flex gap-4">
              <Button
                variant="ghost"
                onClick={onClose}
                className="rounded-2xl h-14 px-8 font-black uppercase tracking-widest text-[10px] cursor-pointer"
              >
                Bekor qilish
              </Button>
              <Button
                onClick={handleSave}
                disabled={
                  createMutation.isPending || updateMutation.isPending
                }
                className="rounded-[20px] h-14 px-12 bg-black text-white font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-black/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                {createMutation.isPending || updateMutation.isPending
                  ? 'Saqlanmoqda...'
                  : 'Saqlash'}
              </Button>
            </div>
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
}
