'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { ShipmentCard } from './ShipmentCard';
import { PackageSearch, MapPin, ChevronRight, Check } from 'lucide-react';
import { Skeleton } from '@/shared/ui/skeleton';
import { useGetDeliveryFromToLinks, useGetFactoryShipments, useGetShipmentStates, useBtsRegions, useBtsCities, useGetBranches } from '../lib/hooks';
import { IDeliveryFromToLinkResponse } from '@/shared/config/api/delivery/delivery.model';
import { IBtsBranch } from '@/shared/config/api/bts/bts.model';

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
    <Tabs defaultValue="HAMMASI" className="w-full md:w-auto cursor-pointer" onValueChange={setActiveTab}>
      <TabsList className="h-12 bg-gray-50 border border-gray-100 rounded-2xl p-1 gap-1">
        {["HAMMASI", ...canbeRenderedStatuses].map((tab: string, _: number) => (
          <TabsTrigger
            key={_}
            value={tab}
            className="rounded-xl px-4 text-[10px] uppercase font-black tracking-widest data-[state=active]:bg-black data-[state=active]:text-white transition-all transition-duration-300"
          >
            {getLocalStatus(tab)}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}

type PickerStep = 'region' | 'district' | 'branch';

export function OrdersView() {
  const [activeTab, setActiveTab] = useState('HAMMASI');
  const [links, setLinks] = useState<IDeliveryFromToLinkResponse[]>([]);
  const [showAddressConfig, setShowAddressConfig] = useState(false);
  const [senderAddress, setSenderAddress] = useState<{
    address: string;
    city_code: string;
    branch_code: string;
    region_code: string;
    region_name: string;
    city_name: string;
    branch_name: string;
    lat_long: string;
  } | null>(null);
  const [pickerStep, setPickerStep] = useState<PickerStep>('region');
  const [region, setRegion] = useState<string>('');
  const [district, setDistrict] = useState<string>('');
  const [selectedBranch, setSelectedBranch] = useState<IBtsBranch | null>(null);

  const { data: shipmentStates } = useGetShipmentStates();
  const { data: factoryShipments, isLoading } = useGetFactoryShipments();
  const getDeliveryFromToLinks = useGetDeliveryFromToLinks();
  const { data: regionsData, isLoading: isRegionsLoading } = useBtsRegions();
  const { data: citiesData, isLoading: isCitiesLoading } = useBtsCities(region);
  const { data: branchesData, isLoading: isBranchesLoading } = useGetBranches({ regionCode: region, cityCode: district });

  useEffect(() => {
    if (factoryShipments?.length > 0) {
      getDeliveryFromToLinks.mutate({
        shipmentIds: factoryShipments.map((shipment: { id: number }) => String(shipment.id)),
      }, {
        onSuccess: (data: IDeliveryFromToLinkResponse[]) => {
          setLinks(data);
        }
      });
    }
  }, [factoryShipments]);

  const handleOpenConfig = () => {
    setPickerStep('region');
    setRegion('');
    setDistrict('');
    setSelectedBranch(null);
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
    const regionName = regionsData?.data?.items?.find((r) => r.code === region)?.name || '';
    const cityName = citiesData?.data?.items?.find((c) => c.code === district)?.name || '';
    setSenderAddress({
      address: selectedBranch.address,
      city_code: selectedBranch.cityCode,
      branch_code: selectedBranch.code,
      region_code: region,
      region_name: regionName,
      city_name: cityName,
      branch_name: selectedBranch.name,
      lat_long: selectedBranch.lat_long,
    });
    setShowAddressConfig(false);
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

  if (!shipmentStates || !factoryShipments) {
    return null;
  };

  const isLinksLoading = getDeliveryFromToLinks.isPending;
  const hasShipments = factoryShipments.length > 0;
  const hasLinks = links.length > 0 && links.find((l) => l.shipmentId);
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

        <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
          {senderAddress && (
            <div className="bg-gray-50 rounded-xl border border-gray-100 px-4 py-2 flex items-center gap-3">
              <MapPin size={12} className="text-gray-400" />
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Manzil:</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-black">{senderAddress.branch_name}</span>
                </div>
                <span className="text-[9px] text-gray-400 font-medium">{senderAddress.address}</span>
              </div>
              {senderAddress.lat_long && (
                <button
                  onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${senderAddress.lat_long}`, '_blank')}
                  className="p-1.5 rounded-lg hover:bg-black/10 transition-colors"
                  title="Xaritada ko'rish"
                >
                  <MapPin size={14} className="text-gray-500" />
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
            {senderAddress ? "Yuborish manzilini o'zgartirish" : 'Yuborish manzilini tanlang'}
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
            <Skeleton key={i} className="h-[300px] rounded-[32px]" />
          ))}
        </div>
      ) : hasShipments && hasLinks ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {factoryShipments.map((item: any) => (
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
