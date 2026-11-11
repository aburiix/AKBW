import { OrderState, ShipmentState } from "../generated/prisma/client/index.js";
import type { Request, Response, NextFunction } from "express";
import { prisma } from "../db/client.js";
import deliveryService from "../services/delivery.service.js";
import axios from "axios";
import type { ICreateOrderRequest } from "../types/delivery.types.js";

export const isWorker = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { tg_id } = req.query;
    console.log(tg_id, "tg_id");

    const worker = await prisma.workers.findUnique({
      where: {
        tg_id: String(tg_id),
      },
    });

    console.log("worker: ", worker);

    if (!worker) {
      return res.status(404).json({
        message: "You are not a worker",
        status: 404,
        error_note: "Wrong tg_id, you cannot use HTS-akbw bot",
      });
    }

    return res.status(200).json({
      status: 200,
      message: "You are a worker",
      worker,
    });
  } catch (error) {
    next(error);
  }
};

export const getOrders = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { tg_id } = req.query;

    const worker = await prisma.workers.findUnique({
      where: {
        tg_id: String(tg_id),
      },
      include: {
        factory: true,
      },
    });

    if (!worker) {
      return res.status(404).json({
        ok: false,
        error: "You are not a worker",
        error_status: 404,
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const shipments = await prisma.shipment.findMany({
      where: {
        factoryId: worker.factory_id,
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
        order: {
          state: OrderState.PENDING,
        }
      },
      include: {
        orderItems: {
          include: {
            product: {
              include: {
                translations: true,
              }
            },
          },
        },
        order: {
          include: {
            user: true,
          }
        }
      },
    })

    console.log("shipments: ", shipments);

    if (!shipments) {
      return res.status(404).json({
        ok: false,
        error: "Factory not found",
        error_status: 404,
      });
    }

    return res.status(200).json(shipments);
  } catch (error) {
    next(error);
  }
};

export const getHistory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { tg_id } = req.query;

    const worker = await prisma.workers.findUnique({
      where: {
        tg_id: String(tg_id),
      },
      include: {
        factory: true,
      },
    });

    if (!worker) {
      return res.status(404).json({
        ok: false,
        error: "You are not a worker",
        error_status: 404,
      });
    };

    const shipments = await prisma.shipment.findMany({
      where: {
        factoryId: worker.factory_id,
        state: ShipmentState.SENT,
      },
      include: {
        orderItems: {
          include: {
            product: {
              include: {
                translations: true,
              }
            },
          },
        },
        order: {
          include: {
            user: true,
          }
        }
      },
    });

    console.log("history shipments: ", shipments);


    if (!shipments) {
      return res.status(404).json({
        ok: false,
        error: "Factory not found",
        error_status: 404,
      });
    }

    return res.status(200).json(shipments);
  } catch (error) {
    next(error);
  }
};

export const handleOrderAction = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { tg_id, order_id, action } = req.body;

    if (!tg_id || !order_id || !action) {
      return res.status(400).json({
        ok: false,
        error: "Missing required fields: tg_id, order_id, action",
      });
    }

    // Verify worker
    const worker = await prisma.workers.findUnique({
      where: { tg_id: String(tg_id) },
    });

    if (!worker) {
      return res.status(404).json({
        ok: false,
        error: "You are not a worker",
        error_status: 404,
      });
    }

    const order = await prisma.orders.findUnique({
      where: { id: Number(order_id) },
      include: {
        shipments: {
          include: {
            factory: true,
          }
        }
      },
    });

    if (!order) {
      return res.status(404).json({
        ok: false,
        error: "Order not found",
        error_status: 404,
      });
    }

    if (order.shipments.every((shipment) => shipment.factoryId !== worker.factory_id)) {
      return res.status(403).json({
        ok: false,
        error: "You cannot modify this order",
        error_status: 403,
      });
    }

    let newState: ShipmentState;
    let message: string;

    switch (action) {
      case "accept":
        newState = ShipmentState.SENT;
        message = "Buyurtma qabul qilindi va mijozga yetkazildi";
        break;
      case "reject":
        newState = ShipmentState.CANCELLED;
        message = "Buyurtma rad etildi";
        break;
      default:
        return res.status(400).json({
          ok: false,
          error: "Invalid action. Use 'accept' or 'reject'",
        });
    }

    const updatedOrder = await prisma.shipment.update({
      where: { id: Number(order_id) },
      data: { state: newState },
    });

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (botToken && worker.tg_id) {
      try {
        await axios.post(
          `https://api.telegram.org/bot${botToken}/sendMessage`,
          {
            chat_id: worker.tg_id,
            text: `${message}\nBuyurtma raqami: #${order.id}\nHolat: ${newState}`,
            parse_mode: "HTML",
          },
        );
      } catch (telegramError) {
        console.error("Failed to send confirmation to worker:", telegramError);
      }
    }

    return res.status(200).json({
      ok: true,
      message: "Order action processed successfully",
      order: updatedOrder,
    });
  } catch (error) {
    next(error);
  }
};

const VALID_TRANSITIONS: Record<ShipmentState, ShipmentState[]> = {
  [ShipmentState.PENDING]: [ShipmentState.READY_FOR_BTS],
  [ShipmentState.READY_FOR_BTS]: [ShipmentState.SENT],
  [ShipmentState.SENT]: [ShipmentState.DELIVERED],
  [ShipmentState.DELIVERED]: [],
  [ShipmentState.CANCELLED]: [],
  [ShipmentState.ORDERED_FROM_SUPPLIER]: [ShipmentState.SUPPLIER_CONFIRMED],
  [ShipmentState.SUPPLIER_CONFIRMED]: [ShipmentState.IN_TRANSIT],
  [ShipmentState.IN_TRANSIT]: [ShipmentState.ARRIVED_UZBEKISTAN],
  [ShipmentState.ARRIVED_UZBEKISTAN]: [ShipmentState.IN_CUSTOMS],
  [ShipmentState.IN_CUSTOMS]: [ShipmentState.READY_FOR_BTS],
};

export const handleShipmentStatusUpdate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { tg_id, shipment_id, new_state } = req.body;

    if (!tg_id || !shipment_id || !new_state) {
      return res.status(400).json({
        ok: false,
        error: "Missing required fields: tg_id, shipment_id, new_state",
      });
    }

    // Verify worker
    const worker = await prisma.workers.findUnique({
      where: { tg_id: String(tg_id) },
    });

    if (!worker) {
      return res.status(404).json({
        ok: false,
        error: "You are not a worker",
        error_status: 404,
      });
    }

    const shipment = await prisma.shipment.findUnique({
      where: { id: Number(shipment_id) },
      include: {
        orderItems: {
          include: {
            product: {
              include: {
                translations: true,
              },
            },
          },
        },
        order: {
          include: {
            user: true,
            address: true,
          },
        },
        factory: true,
      },
    });

    if (!shipment) {
      return res.status(404).json({
        ok: false,
        error: "Shipment not found",
        error_status: 404,
      });
    }

    if (shipment.factoryId !== worker.factory_id) {
      return res.status(403).json({
        ok: false,
        error: "You cannot modify this shipment",
        error_status: 403,
      });
    }

    if (!Object.values(ShipmentState).includes(new_state)) {
      return res.status(400).json({
        ok: false,
        error: "Invalid shipment state",
      });
    }

    const validNextStates = VALID_TRANSITIONS[shipment.state as ShipmentState] || [];
    if (!validNextStates.includes(new_state as ShipmentState)) {
      return res.status(400).json({
        ok: false,
        error: `Invalid status transition from ${shipment.state} to ${new_state}. Valid transitions: ${validNextStates.join(', ')}`,
      });
    }

    console.log(`[Shipment Status Change via Bot] ID: ${shipment.id}, Previous: ${shipment.state}, New: ${new_state}, UpdatedBy: tg_id:${tg_id}, Timestamp: ${new Date().toISOString()}`);

    let trackingNumber = shipment.tracking_number;
    if (new_state === ShipmentState.READY_FOR_BTS && !shipment.tracking_number) {
      try {
        if (shipment.factory) {
          const calculateDeliveryPrice = await deliveryService.calculateDeliveryCost({
            pickup_type: "self",
            dropoff_type: "branch",
            senderCityCode: shipment.factory.bts_city_code,
            receiverCityCode: shipment.order.address.city_code,
            is_multiple_cost: 1,
            weight: shipment.orderItems.reduce((acc, item) => acc + item.quantity, 0),
            volume: {
              x: shipment.orderItems.reduce((acc, item) => acc + item.product.volume_x, 0),
              y: shipment.orderItems.reduce((acc, item) => acc + item.product.volume_y, 0),
              z: shipment.orderItems.reduce((acc, item) => acc + item.product.volume_z, 0),
            }
          });

          const payload: ICreateOrderRequest = {
            clientId: shipment.id.toString(),
            pickup_type: "self",
            dropoff_type: "branch",
            is_sender_location: false,
            is_receiver_location: false,
            sender: {
              name: shipment.factory.name,
              phone: shipment.factory.phone,
              address: shipment.factory.address,
              city_code: shipment.factory.bts_city_code,
            },
            receiver: {
              name: shipment.order.user.name,
              phone: shipment.order.user.phone,
              address: shipment.order.address.address,
              city_code: shipment.order.address.city_code,
              branch_code: shipment.order.address.branch_code,
            },
            takePhoto: 1,
            back_money: calculateDeliveryPrice,
            cargo: {
              weight: shipment.orderItems.reduce((acc, item) => acc + item.quantity, 0),
              volume: shipment.orderItems.reduce(
                (acc, item) =>
                  acc +
                  ((item.product?.volume_x || 0) *
                    (item.product?.volume_y || 0) *
                    (item.product?.volume_z || 0)) *
                  item.quantity,
                0
              ),
              piece: shipment.orderItems.length,
              packageId: 4,
              postTypeId: 1,
              postTypes: shipment.orderItems.map((item) => ({
                code: item.product.id.toString(),
                name: item.product.translations[0]?.name || "",
                count: item.quantity,
                cost: item.product.price,
              })),
              options: [{
                optionId: 2,
                goods: shipment.orderItems.map((item) => ({
                  mxikGoodsId: item.product.id,
                  amount: item.quantity,
                  goodPrice: item.product.price,
                }))
              }],
            },
            ready_to_take: false,
          }
          console.log("the paylaod from shipment-controller=: ", payload);

          const response = await deliveryService.createOrder(payload)

          console.log("the response from shipment-controller=: ", response);
          if (response?.data?.orderId) {
            trackingNumber = response.data.orderId;
            console.log(`[Postal Provider] Order created for shipment ${shipment.id}, tracking number: ${trackingNumber}`);
          }
        }
      } catch (postalError) {
        console.error("Failed to create postal provider order:", postalError);
      }
    }

    const updatedShipment = await prisma.shipment.update({
      where: { id: Number(shipment_id) },
      data: {
        state: new_state as ShipmentState,
        ...(trackingNumber && { tracking_number: trackingNumber }),
      },
    });

    return res.status(200).json({
      ok: true,
      message: "Shipment status updated successfully",
      data: updatedShipment,
    });
  } catch (error) {
    next(error);
  }
};
