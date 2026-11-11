import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { extractError } from "@/shared/lib/extractError";
import {
  getAdminShipments,
  getShipmentStates,
  updateShipmentStatus
} from "@/shared/config/api/shipment/shipment.requests";
import { getDeliveryFromToLinks, getSenderConfigRequest, saveSenderConfigRequest, getDistanceRequest } from "@/shared/config/api/delivery/delivery.requests";
import {
  getRegionsRequest,
  getCitiesRequest,
  getBranchesRequest,
} from "@/shared/config/api/bts/bts.requests";
import { IGetBranchesRequest } from "@/shared/config/api/bts/bts.model";
import { ISenderConfig } from "@/shared/config/api/delivery/delivery.model";

export const useGetAdminShipments = (state?: string) => {
  return useQuery({
    queryKey: ['adminShipments', state],
    queryFn: () => getAdminShipments(state),
  })
}

export const useGetShipmentStates = () => {
  return useQuery({
    queryKey: ['shipmentStates'],
    queryFn: () => getShipmentStates(),
  })
}

export const useGetDeliveryFromToLinks = () => {
  return useMutation({
    mutationKey: ['delivery-from-to-links'],
    mutationFn: getDeliveryFromToLinks,
  });
};

export const useUpdateShipmentStatus = () => {
  return useMutation({
    mutationKey: ['update-shipment-status'],
    mutationFn: updateShipmentStatus,
    onSuccess: () => {
      window.location.reload();
    },
    onError: (error) => {
      toast.error(extractError(error) || 'Yetkazib berish holatini yangilashda xatolik yuz berdi');
    },
  });
};

export const useBtsRegions = () => {
  return useQuery({
    queryKey: ['bts-regions'],
    queryFn: getRegionsRequest,
  });
};

export const useBtsCities = (regionCode: string) => {
  return useQuery({
    queryKey: ['bts-cities', regionCode],
    queryFn: () => getCitiesRequest(regionCode),
    enabled: !!regionCode,
  });
};

export const useGetBranches = (body: IGetBranchesRequest) => {
  return useQuery({
    queryKey: ['bts-branches', body],
    queryFn: () => getBranchesRequest(body),
    enabled: !!body.regionCode && !!body.cityCode,
  })
}

export const useGetSenderConfig = () => {
  return useQuery({
    queryKey: ['sender-config'],
    queryFn: getSenderConfigRequest,
  });
};

export const useSaveSenderConfig = () => {
  return useMutation({
    mutationKey: ['save-sender-config'],
    mutationFn: (config: ISenderConfig) => saveSenderConfigRequest(config),
    onError: (error) => {
      toast.error(extractError(error) || 'Yuborish manzilini saqlashda xatolik yuz berdi');
    },
  });
};

export const useGetDistance = () => {
  return useMutation({
    mutationKey: ['delivery-distance'],
    mutationFn: getDistanceRequest,
  });
};
