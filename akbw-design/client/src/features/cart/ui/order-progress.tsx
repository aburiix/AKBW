'use client';

import { motion } from 'framer-motion';
import { cn } from '@/shared/lib/utils';
import {
  Truck,
  Package,
  Plane,
  Clock,
  CheckCircle2,
  MapPin,
} from 'lucide-react';

interface Shipment {
  id: number;
  state:
    | 'PENDING'
    | 'READY_FOR_BTS'
    | 'SENT'
    | 'DELIVERED'
    | 'PREPARING'
    | 'IN_TRANSIT'
    | 'ARRIVED_UZBEKISTAN'
    | string;
  type: 'FACTORY' | 'SELF';
  factory?: {
    name: string;
  };
}

interface OrderProgressProps {
  shipments: Shipment[];
}

const getSelfShipmentStatuses = () => {
  return ['PREPARING', 'IN_TRANSIT', 'ARRIVED_UZBEKISTAN', 'SENT', 'DELIVERED'];
};

const getFactoryShipmentStatuses = () => {
  return ['PREPARING', 'SENT', 'DELIVERED'];
};

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'PREPARING':
      return {
        label: 'Tayyorlanmoqda',
        icon: Package,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
      };
    case 'IN_TRANSIT':
      return {
        label: "Yo'lda",
        icon: Plane,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
      };
    case 'ARRIVED_UZBEKISTAN':
      return {
        label: "O'zbekistonga yetib keldi",
        icon: MapPin,
        color: 'text-orange-600',
        bgColor: 'bg-orange-100',
      };
    case 'SENT':
      return {
        label: 'Yuborildi',
        icon: Truck,
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-100',
      };
    case 'DELIVERED':
      return {
        label: 'Yetkazib berildi',
        icon: CheckCircle2,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
      };
    default:
      return {
        label: status,
        icon: Clock,
        color: 'text-gray-600',
        bgColor: 'bg-gray-100',
      };
  }
};

const getCurrentStepIndex = (currentState: string, statuses: string[]) => {
  return statuses.indexOf(currentState);
};

export const OrderProgress = ({ shipments }: OrderProgressProps) => {
  if (!shipments || shipments.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h3 className="lbl text-ivory/45">Yuklar holati</h3>
      {shipments.map((shipment) => {
        const statuses =
          shipment.type === 'FACTORY'
            ? getFactoryShipmentStatuses()
            : getSelfShipmentStatuses();
        const currentStepIndex = getCurrentStepIndex(shipment.state, statuses);
        const statusConfig = getStatusConfig(shipment.state);
        const StatusIcon = statusConfig.icon;

        return (
          <div
            key={shipment.id}
            className="rounded-2xl p-4 border border-line bg-ivory/[0.03]"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    'p-2 rounded-full',
                    statusConfig.bgColor,
                    statusConfig.color,
                  )}
                >
                  <StatusIcon size={14} />
                </div>
                <div>
                  <p className="text-[13px] text-ivory">
                    {shipment.type === 'FACTORY'
                      ? shipment.factory?.name || 'Zavod'
                      : 'AKBW'}
                  </p>
                  <p className="lbl !text-[10px] text-ivory/40">
                    Yuk #{shipment.id}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p
                  className={cn(
                    'text-xs font-bold uppercase tracking-wider',
                    statusConfig.color,
                  )}
                >
                  {statusConfig.label}
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="flex items-center justify-between">
                {statuses.map((status, index) => {
                  const stepConfig = getStatusConfig(status);
                  const StepIcon = stepConfig.icon;
                  const isCompleted = index <= currentStepIndex;
                  const isCurrent = index === currentStepIndex;

                  return (
                    <div
                      key={status}
                      className="flex flex-col items-center flex-1"
                    >
                      <div className="relative w-full">
                        {/* Line before this step */}
                        {index > 0 && (
                          <motion.div
                            className={cn(
                              'absolute top-1/2 left-0 h-0.5 -translate-y-1/2',
                              isCompleted ? 'bg-ok' : 'bg-ivory/15',
                            )}
                            initial={{ width: 0 }}
                            animate={{ width: '100%' }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            style={{ left: '-50%', right: '50%' }}
                          />
                        )}

                        {/* Step icon/dot */}
                        <motion.div
                          className={cn(
                            'relative z-10 mx-auto w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300',
                            isCompleted
                              ? 'bg-ok border-ok text-night'
                              : isCurrent
                                ? `${stepConfig.bgColor} ${stepConfig.color} border-current`
                                : 'bg-surface-2 border-line-2 text-ivory/35',
                          )}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          {isCompleted ? (
                            <CheckCircle2 size={16} />
                          ) : (
                            <StepIcon size={14} />
                          )}
                        </motion.div>
                      </div>

                      {/* Step label */}
                      <motion.div
                        className={cn(
                          'mt-2 text-[10px] font-medium text-center',
                          isCompleted
                            ? 'text-ok'
                            : isCurrent
                              ? stepConfig.color
                              : 'text-ivory/35',
                        )}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 + 0.2 }}
                      >
                        {stepConfig.label}
                      </motion.div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
