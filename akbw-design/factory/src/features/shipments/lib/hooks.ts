import { useMutation, useQuery } from "@tanstack/react-query";
import {
  getFactoryShipments,
  getShipmentStates,
  updateShipmentStatus
} from "@/shared/config/api/shipment/shipment.requests";
import { getDeliveryFromToLinks } from "@/shared/config/api/delivery/delivery.requests";
import {
  getRegionsRequest,
  getCitiesRequest,
  getBranchesRequest,
} from "@/shared/config/api/bts/bts.requests";
import { IGetBranchesRequest } from "@/shared/config/api/bts/bts.model";

export const useGetFactoryShipments = (state?: string) => {
  return useQuery({
    queryKey: ['factoryShipments', state],
    queryFn: () => getFactoryShipments(state),
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
    }
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
