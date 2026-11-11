'use client';

import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { ShipmentCard } from './ShipmentCard';
import React, { useEffect, useState } from 'react';
import { IBtsBranch } from '@/shared/config/api/bts/bts.model';
import { PackageSearch, MapPin, ChevronDown, ChevronRight, Check, Route, Phone, Loader2 } from 'lucide-react';
import { IDeliveryFromToLinkResponse } from '@/shared/config/api/delivery/delivery.model';
import { useGetDeliveryFromToLinks, useGetAdminShipments, useGetShipmentStates, useBtsRegions, useBtsCities, useGetBranches, useGetSenderConfig, useSaveSenderConfig, useGetDistance } from '../lib/hooks';
import { toast } from 'sonner';

const normalizePhone = (phone: string) => {
  const digits = phone.replace(/[^\d+]/g, '');
  if (digits.startsWith('+998')) return digits.slice(0, 13);
  return phone;
};

const isValidPhone = (phone: string) => /^\+998\d{9}$/.test(phone);

interface SenderAddress {
  address: string;
  city_code: string;
  branch_code: string;
  region_code: string;
  region_name: string;
  city_name: string;
  branch_name: string;
  lat_long: string;
  name: string;
  phone: string;
}

const renderStatuses = ({ statuses, setActiveTab, activeTab }: { statuses: string[], setActiveTab: (tab: string) => void, activeTab: string }) => {
  const getLocalStatus = (status: string) => {
    switch (status) {
      case "PENDING":
        return "JARAYONDA";
      case "READY_FOR_BTS":
        return "JO'NATISHGA TAYYOR";
      case "SENT":
        return "YUBORILDI";
      default:
        return status;
    };
  };

  const canbeRenderedStatuses = statuses.filter((status) => {
    return status === "PENDING" || status === "READY_FOR_BTS" || status === "SENT";
  });

  return (
    <div className="flex gap-2 flex-wrap">
      {["HAMMASI", ...canbeRenderedStatuses].map((tab: string, _: number) => (
        <Button
          key={_}
          onClick={() => setActiveTab(tab)}
          className={cn(
            "rounded-xl px-4 text-[10px] uppercase font-black tracking-widest transition-all",
            activeTab === tab 
              ? "bg-black text-white" 
              : "bg-gray-50 text-gray-600 hover:bg-gray-100"
          )}
        >
          {getLocalStatus(tab)}
        </Button>
      ))}
    </div>
  )
}

type PickerStep = 'region' | 'district' | 'branch';

export function ShipmentView() {
  const [activeTab, setActiveTab] = useState('HAMMASI');
  const [links, setLinks] = useState<IDeliveryFromToLinkResponse[]>([]);
  const [showAddressConfig, setShowAddressConfig] = useState(false);
  const [senderAddress, setSenderAddress] = useState<SenderAddress | null>(null);
  const [senderName, setSenderName] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [pickerStep, setPickerStep] = useState<PickerStep>('region');
  const [region, setRegion] = useState<string>('');
  const [district, setDistrict] = useState<string>('');
  const [selectedBranch, setSelectedBranch] = useState<IBtsBranch | null>(null);
  const [adminLocation, setAdminLocation] = useState<{ lat: number; lng: number } | null>(null);

  const { data: shipmentStates } = useGetShipmentStates();
  const { data: adminShipments, isLoading } = useGetAdminShipments();
  const getDeliveryFromToLinks = useGetDeliveryFromToLinks();
  const { data: regionsData, isLoading: isRegionsLoading } = useBtsRegions();
  const { data: citiesData, isLoading: isCitiesLoading } = useBtsCities(region);
  const { data: branchesData, isLoading: isBranchesLoading } = useGetBranches({ regionCode: region, cityCode: district });
  const { data: senderConfigData } = useGetSenderConfig();
  const saveSenderConfig = useSaveSenderConfig();
  const getDistance = useGetDistance();
  const distance = getDistance.data?.data as { distanceKm: number; durationMin: number } | undefined;
  const isDistanceLoading = getDistance.isPending;

  useEffect(() => {
    if (senderConfigData?.data) {
      const config = senderConfigData.data;
      setSenderAddress({
        address: config.address,
        city_code: config.city_code,
        branch_code: config.branch_code,
        region_code: config.region_code,
        region_name: '',
        city_name: '',
        branch_name: '',
        lat_long: config.lat_long || '',
        name: config.name,
        phone: config.phone,
      });
    }
  }, [senderConfigData]);

  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setAdminLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
      },
      (error) => {
        console.log('Geolocation error:', error.message);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 },
    );
  }, []);

  useEffect(() => {
    if (adminLocation && senderAddress?.lat_long) {
      const [lat, lng] = senderAddress.lat_long.split(',');
      if (lat && lng) {
        getDistance.mutate({
          origin: adminLocation,
          destination: { lat: parseFloat(lat), lng: parseFloat(lng) },
        });
      }
    }
  }, [adminLocation, senderAddress?.lat_long]);

  useEffect(() => {
    if (adminShipments?.length > 0) {
      getDeliveryFromToLinks.mutate({
        shipmentIds: adminShipments.map((shipment: { id: number }) => String(shipment.id)),
      }, {
        onSuccess: (data: IDeliveryFromToLinkResponse[]) => {
          setLinks(data);
        },
        onError: (error) => {
          console.error('Failed to fetch delivery links:', error);
          setLinks([]);
        }
      });
    }
  }, [adminShipments]);

  const handleOpenConfig = () => {
    setPickerStep('region');
    setRegion('');
    setDistrict('');
    setSelectedBranch(null);
    setSenderName(senderAddress?.name || '');
    setSenderPhone(senderAddress?.phone || '');
    setShowAddressConfig(true);
  };

  const handleSelectRegion = (code: string, name: string) => {
    setRegion(code);
    setDistrict('');
    setSelectedBranch(null);
    setPickerStep('district');
  };

  const handleSelectDistrict = (code: string, name: string) => {
    setDistrict(code);
    setSelectedBranch(null);
    setPickerStep('branch');
  };

  const handleSelectBranch = (branch: IBtsBranch) => {
    setSelectedBranch(branch);
  };

  const handleSaveAddress = () => {
    if (!selectedBranch) return;
    if (!senderName.trim()) {
      toast.error('Yuboruvchi nomini kiriting');
      return;
    }
    const phone = normalizePhone(senderPhone);
    if (!isValidPhone(phone)) {
      toast.error('Telefon raqam formati noto\'g\'ri. Talab qilinadigan format: +998901234567');
      return;
    }
    setSenderPhone(phone);
    const regionName = regionsData?.data?.items?.find((r) => r.code === region)?.name || '';
    const cityName = citiesData?.data?.items?.find((c) => c.code === district)?.name || '';
    const address = {
      address: selectedBranch.address,
      city_code: selectedBranch.cityCode,
      branch_code: selectedBranch.code,
      region_code: region,
      region_name: regionName,
      city_name: cityName,
      branch_name: selectedBranch.name,
      lat_long: selectedBranch.lat_long,
      name: senderName.trim(),
      phone,
    };
    saveSenderConfig.mutate(
      {
        name: address.name,
        phone: address.phone,
        address: address.address,
        region_code: address.region_code,
        city_code: address.city_code,
        branch_code: address.branch_code,
        lat_long: address.lat_long,
      },
      {
        onSuccess: (data) => {
          setSenderAddress(address);
          setShowAddressConfig(false);
          toast.success('Yuborish manzili saqlandi');
        },
      },
    );
  };

  const handleBack = () => {
    if (pickerStep === 'branch') {
      setDistrict('');
      setSelectedBranch(null);
      setPickerStep('district');
    } else if (pickerStep === 'district') {
      setRegion('');
      setDistrict('');
      setPickerStep('region');
    }
  };

  if (!shipmentStates || !adminShipments) {
    return null;
  };

  const isLinksLoading = getDeliveryFromToLinks.isPending;
  const hasShipments = adminShipments.length > 0;
  const showLoading = isLoading || isLinksLoading;

  return (
    <div className="space-y-10 py-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter">Yuklar</h1>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-[0.2em] mt-2">
            Statuslar bo'yicha filtrlash va boshqarish
          </p>
        </div>

        <div className="flex gap-3 items-center flex-wrap">
          {senderAddress && (
            <div className="bg-gray-50 rounded-xl border border-gray-100 px-4 py-2 flex items-center gap-3">
              <MapPin size={12} className="text-gray-400" />
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Manzil:</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-black">{senderAddress.branch_name || 'AKB Ombori'}</span>
                </div>
                <span className="text-[9px] text-gray-400 font-medium">{senderAddress.address}</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[9px] font-bold text-gray-500">{senderAddress.name}</span>
                  <span className="text-[9px] text-gray-400">•</span>
                  <span className="text-[9px] text-gray-500">{senderAddress.phone}</span>
                </div>
                {distance && (
                  <div className="flex items-center gap-1 mt-1">
                    <Route size={10} className="text-gray-400" />
                    <span className="text-[9px] font-bold text-gray-500">
                      {isDistanceLoading ? 'Hisoblanmoqda...' : `~${distance.distanceKm} km · ${distance.durationMin} daqiqa`}
                    </span>
                  </div>
                )}
              </div>
              {senderAddress.lat_long && (
                <button
                  onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&origin=${adminLocation?.lat ?? ''},${adminLocation?.lng ?? ''}&destination=${senderAddress.lat_long}`, '_blank')}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-black text-white text-[9px] font-black uppercase tracking-widest hover:bg-black/90 transition-all cursor-pointer"
                  title="Yo'nalish (Directions)"
                >
                  <Route size={11} />
                  Yo'nalish
                </button>
              )}
              <button
                onClick={handleOpenConfig}
                className="text-[10px] font-bold text-gray-400 underline hover:text-black transition-colors cursor-pointer"
              >
                O'zgartirish
              </button>
            </div>
          )}
          <Button
            onClick={handleOpenConfig}
            className={cn(
              "rounded-xl px-4 text-[10px] uppercase font-black tracking-widest transition-all",
              showAddressConfig 
                ? "bg-black text-white" 
                : senderAddress
                  ? "bg-gray-50 text-gray-600 hover:bg-gray-100"
                  : "bg-black text-white"
            )}
          >
            <MapPin size={12} className="mr-2" />
            {senderAddress ? 'Yuborish manzilini o\'zgartirish' : 'Yuborish manzilini tanlang'}
          </Button>
          {renderStatuses({ statuses: shipmentStates, setActiveTab, activeTab })}
        </div>
      </div>

      {!senderAddress && !showAddressConfig && (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-[32px] border border-gray-200 p-10 flex flex-col items-center justify-center space-y-4">
          <div className="p-5 bg-white rounded-full shadow-sm">
            <MapPin size={36} className="text-gray-300" />
          </div>
          <p className="text-xs font-black uppercase tracking-widest text-gray-400">
            Yuborish manzili tanlanmagan
          </p>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest text-center max-w-md">
            Yuklarni yuborish uchun BTS filialini tanlang. Manzilni tanlash uchun quyidagi tugmani bosing.
          </p>
          <Button
            onClick={handleOpenConfig}
            className="rounded-xl px-6 text-[10px] uppercase font-black tracking-widest bg-black text-white hover:bg-black/90"
          >
            <MapPin size={12} className="mr-2" />
            Manzilni tanlash
          </Button>
        </div>
      )}

      {showAddressConfig && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
          {pickerStep !== 'region' && (
            <button
              onClick={handleBack}
              className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors cursor-pointer"
            >
              <ChevronRight size={12} className="rotate-180" />
              Orqaga
            </button>
          )}

          <div className="flex items-center gap-2 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
            <MapPin size={12} />
            <span>
              {pickerStep === 'region' && 'Viloyatni tanlang'}
              {pickerStep === 'district' && 'Tumanni tanlang'}
              {pickerStep === 'branch' && 'BTS filialini tanlang'}
            </span>
          </div>

          {/* Steps indicator */}
          <div className="flex items-center gap-2">
            {(['region', 'district', 'branch'] as PickerStep[]).map((step, idx) => (
              <React.Fragment key={step}>
                <div className={cn(
                  "flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest",
                  pickerStep === step ? "text-black" : idx < (['region', 'district', 'branch'] as PickerStep[]).indexOf(pickerStep) ? "text-green-600" : "text-gray-300"
                )}>
                  <div className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black",
                    pickerStep === step ? "bg-black text-white" : idx < (['region', 'district', 'branch'] as PickerStep[]).indexOf(pickerStep) ? "bg-green-600 text-white" : "bg-gray-100 text-gray-400"
                  )}>
                    {idx < (['region', 'district', 'branch'] as PickerStep[]).indexOf(pickerStep) ? (
                      <Check size={10} />
                    ) : (
                      idx + 1
                    )}
                  </div>
                  <span className="hidden md:inline">
                    {step === 'region' && 'Viloyat'}
                    {step === 'district' && 'Tuman'}
                    {step === 'branch' && 'Filial'}
                  </span>
                </div>
                {idx < 2 && <ChevronRight size={10} className="text-gray-300" />}
              </React.Fragment>
            ))}
          </div>

          {/* Region selector */}
          {pickerStep === 'region' && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-80 overflow-y-auto">
              {isRegionsLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-12 rounded-xl bg-gray-100 animate-pulse" />
                ))
              ) : (
                regionsData?.data?.items?.map((r) => (
                  <button
                    key={r.code}
                    onClick={() => handleSelectRegion(r.code, r.name)}
                    className={cn(
                      "text-left px-4 py-3 rounded-xl border-2 transition-all text-xs font-bold uppercase tracking-wide cursor-pointer",
                      region === r.code
                        ? "border-black bg-black text-white"
                        : "border-gray-200 bg-white hover:border-gray-300 text-black"
                    )}
                  >
                    {r.name}
                  </button>
                ))
              )}
            </div>
          )}

          {/* District (city) selector */}
          {pickerStep === 'district' && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-80 overflow-y-auto">
              {isCitiesLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-12 rounded-xl bg-gray-100 animate-pulse" />
                ))
              ) : (
                citiesData?.data?.items?.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => handleSelectDistrict(c.code, c.name)}
                    className={cn(
                      "text-left px-4 py-3 rounded-xl border-2 transition-all text-xs font-bold uppercase tracking-wide cursor-pointer",
                      district === c.code
                        ? "border-black bg-black text-white"
                        : "border-gray-200 bg-white hover:border-gray-300 text-black"
                    )}
                  >
                    {c.name}
                  </button>
                ))
              )}
            </div>
          )}

          {/* Branch selector */}
          {pickerStep === 'branch' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-80 overflow-y-auto">
              {isBranchesLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-16 rounded-xl bg-gray-100 animate-pulse" />
                ))
              ) : branchesData?.data?.items && branchesData.data.items.length > 0 ? (
                branchesData.data.items.map((branch) => (
                  <button
                    key={branch.code}
                    onClick={() => handleSelectBranch(branch)}
                    className={cn(
                      "text-left p-4 rounded-xl border-2 transition-all cursor-pointer",
                      selectedBranch?.code === branch.code
                        ? "border-black bg-black/5"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-black truncate">{branch.name}</p>
                        <p className="text-[10px] text-gray-500 truncate mt-1">{branch.address}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        {branch.lat_long && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(`https://www.google.com/maps/dir/?api=1&destination=${branch.lat_long}`, '_blank');
                            }}
                            className="p-1.5 rounded-lg hover:bg-black/10 transition-colors"
                            title="Xaritada ko'rish"
                          >
                            <MapPin size={14} className="text-gray-400" />
                          </button>
                        )}
                        {selectedBranch?.code === branch.code && (
                          <Check size={14} className="text-black" />
                        )}
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest col-span-2 text-center py-8">
                  Filiallar topilmadi
                </p>
              )}
            </div>
          )}

          {pickerStep === 'branch' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Yuboruvchi nomi
                </label>
                <Input
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="Masalan: Sifat"
                  className="rounded-xl border-gray-200 bg-white text-xs font-medium h-11"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Telefon raqami
                </label>
                <Input
                  value={senderPhone}
                  onChange={(e) => setSenderPhone(normalizePhone(e.target.value))}
                  placeholder="+998901234567"
                  inputMode="tel"
                  className="rounded-xl border-gray-200 bg-white text-xs font-medium h-11"
                />
              </div>
            </div>
          )}

          {pickerStep === 'branch' && selectedBranch && (
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Tanlangan filial</p>
                  <p className="text-xs font-bold text-black mt-0.5">{selectedBranch.name}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">{selectedBranch.address}</p>
                </div>
                {selectedBranch.lat_long && (
                  <button
                    onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${selectedBranch.lat_long}`, '_blank')}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-gray-200 text-[10px] font-bold uppercase tracking-widest text-gray-600 hover:text-black hover:border-black transition-all cursor-pointer"
                  >
                    <MapPin size={12} />
                    Xaritada ko'rish
                  </button>
                )}
              </div>
            </div>
          )}

          {pickerStep === 'branch' && (
            <div className="flex justify-end">
              <Button
                onClick={handleSaveAddress}
                disabled={!selectedBranch}
                className="rounded-xl px-6 py-2 text-[10px] uppercase font-black tracking-widest bg-black text-white hover:bg-black/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Saqlash
              </Button>
            </div>
          )}
        </div>
      )}

      {showLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-[300px] rounded-[32px] bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : hasShipments ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {adminShipments.map((item: any) => (
            activeTab == "HAMMASI" ? (
              <ShipmentCard key={item.id} item={item} shipmentLinks={links.find((l) => l.shipmentId == item.id)} senderAddress={senderAddress || undefined} />
            ) : activeTab == item.state && (
              <ShipmentCard key={item.id} item={item} shipmentLinks={links.find((l) => l.shipmentId == item.id)} senderAddress={senderAddress || undefined} />
            )
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-gray-50/50 border border-dashed border-gray-200 rounded-[40px] space-y-4">
          <div className="p-6 bg-white rounded-full shadow-sm">
            <PackageSearch size={48} className="text-gray-200" />
          </div>
          <p className="text-xs font-black uppercase tracking-widest text-gray-400">
            Hozircha buyurtmalar mavjud emas
          </p>
        </div>
      )}
    </div>
  );
}
