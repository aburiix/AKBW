import { FulfillmentType, OrderState, ShipmentState } from "../generated/prisma/client/index.js";
import { type Request, type Response, type NextFunction } from "express";
import type { GroupedItems, IOrderItem } from "../types/order.types.js";
import axios, { isAxiosError } from "axios";
import { prisma } from "../db/client.js";

async function notifyFactoryWorkers(shipmentId: number, factoryId: number | null) {
  if (!factoryId) return;

  try {
    const workers = await prisma.workers.findMany({
      where: { factory_id: factoryId },
      select: { tg_id: true },
    });

    if (workers.length === 0) return;

    console.log(`Found ${workers.length} workers to notify for shipment ${shipmentId}`);

    const shipment = await prisma.shipment.findUnique({
      where: {
        id: Number(shipmentId),
      },
      include: {
        order: {
          include: {
            user: true,
          }
        },
        orderItems: {
          include: {
            product: {
              include: {
                translations: true,
              }
            },
          }
        },
      }
    })

    console.log("shipment: ", shipment);

    if (!shipment) return;

    const user = shipment.order.user;
    let message = `🆕 Yangi buyurtma!\n\n`;
    message += `Buyurtma raqami: #${shipment.order.id}\n`;
    message += `Mijoz: ${user.name} ${user.lastName}\n`;
    message += `Telefon: ${user.phone}\n`;
    message += `Umumiy summa: ${shipment.orderItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0)} so'm\n\n`;
    message += `Mahsulotlar:\n`;

    shipment.orderItems.forEach((item, idx) => {
      console.log("item: ", item);
      const productName =
        item?.product?.translations?.[0]?.name || `Mahsulot ${item.productId}`;
      message += `${idx + 1}. ${productName} - ${item.quantity} ta\n`;
    });

    const keyboard = {
      inline_keyboard: [
        [
          {
            text: "Yuborishga tayyor",
            callback_data: `ready_to_bts_${shipment.id}`,
          },
          { text: "❌ Rad etildi", callback_data: `cancel_${shipment.id}` },
        ],
      ],
    };

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      console.error("TELEGRAM_BOT_TOKEN is not set");
      return;
    }

    for (const worker of workers) {
      if (!worker.tg_id) continue;

      try {
        const response = await axios.post(
          `https://api.telegram.org/bot${botToken}/sendMessage`,
          {
            chat_id: worker.tg_id,
            text: message,
            reply_markup: keyboard,
            parse_mode: "HTML",
          },
        );

        if (response.data.ok) {
          console.log(
            `Notification sent to worker ${worker.tg_id} for shipment ${shipment.id}`,
          );
        } else {
          console.error(
            `Failed to send Telegram notification to worker ${worker.tg_id}:`,
            response.data.description,
          );
        }
      } catch (error: any) {
        console.error(
          `Failed to send Telegram notification to worker ${worker.tg_id}:`,
          error?.response?.data?.description || error.message,
        );
      }
    }
  } catch (error) {
    console.error("Error notifying factory workers:", error);
  }
}

async function notifyAdminSelf(shipmentId: number) {
  try {
    const shipment = await prisma.shipment.findUnique({
      where: {
        id: Number(shipmentId),
      },
      include: {
        order: {
          include: {
            user: true,
          }
        },
        orderItems: {
          include: {
            product: {
              include: {
                translations: true,
              }
            },
          }
        },
      }
    })

    console.log("Self shipment created:", shipment);

    if (!shipment) return;

    // Log self shipment for admin visibility
    console.log(`🆕 Self shipment created for order #${shipment.order.id}`);
    console.log(`Shipment ID: ${shipment.id}`);
    console.log(`Items: ${shipment.orderItems.length}`);
    console.log(`Total: ${shipment.orderItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0)} so'm`);

    // TODO: Implement admin notification system when User model has tg_id or separate admin notification table
  } catch (error) {
    console.error("Error logging self shipment:", error);
  }
}

async function createShipmentsAfterPayment(orderId: number) {
  try {
    const order = await prisma.orders.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
        address: true,
      },
    });

    if (!order) {
      console.error("Order not found for shipment creation");
      return;
    }

    // Check if shipments already exist for this order
    const existingShipments = await prisma.shipment.findMany({
      where: { orderId },
    });

    if (existingShipments.length > 0) {
      console.log(`Shipments already exist for order ${orderId}, skipping creation`);
      return;
    }

    // Group order items by factory/self
    const grouped = new Map<string, any>();

    for (const orderItem of order.orderItems) {
      const product = orderItem.product;
      let shipmentKey: string = '';

      if (product.type === FulfillmentType.FACTORY && product.factory_id) {
        shipmentKey = product.factory_id.toString();
      } else {
        shipmentKey = FulfillmentType.SELF;
      }

      if (!grouped.has(shipmentKey)) {
        const groupedItem: any = {
          shipmentKey,
          type: product.type,
          items: [],
        };
        if (product.factory_id) {
          groupedItem.factoryId = product.factory_id;
        }
        grouped.set(shipmentKey, groupedItem);
      }

      grouped.get(shipmentKey)!.items.push(orderItem);
    }

    const factoryShipmentsToNotify: { shipmentId: number; factoryId: number }[] = [];

    // Create shipments
    for (const [, group] of grouped) {
      let shipment;

      if (group.type === FulfillmentType.FACTORY) {
        const factory = await prisma.factories.findUnique({
          where: { id: group.factoryId! },
        });

        if (!factory) {
          console.error(`Factory not found for factoryId ${group.factoryId}`);
          continue;
        }

        shipment = await prisma.shipment.create({
          data: {
            orderId: order.id,
            factoryId: factory.id,
            type: FulfillmentType.FACTORY,
            state: ShipmentState.PENDING,
            sender_city_code: factory.bts_city_code,
            sender_region_code: factory.bts_region_code,
            sender_branch_code: factory.bts_branch_code,
            receiver_city_code: order.address.city_code,
            receiver_region_code: "01",
            receiver_branch_code: order.address.branch_code,
            receiver_address: order.address.address,
          },
        });

        factoryShipmentsToNotify.push({ shipmentId: shipment.id, factoryId: factory.id });
      } else {
        shipment = await prisma.shipment.create({
          data: {
            orderId: order.id,
            type: FulfillmentType.SELF,
            state: ShipmentState.PENDING,
            sender_city_code: "0102",
            sender_branch_code: "0136",
            sender_region_code: "01",
            receiver_city_code: order.address.city_code,
            receiver_region_code: "01",
            receiver_branch_code: order.address.branch_code,
            receiver_address: order.address.address,
          },
        });

        // Notify admin for self shipments
        await notifyAdminSelf(shipment.id);
      }

      // Link order items to shipment
      for (const orderItem of group.items) {
        await prisma.orderItem.update({
          where: { id: orderItem.id },
          data: { shipmentId: shipment.id },
        });
      }
    }

    // Notify factory workers
    for (const { shipmentId, factoryId } of factoryShipmentsToNotify) {
      await notifyFactoryWorkers(shipmentId, factoryId);
    }

    console.log(`Shipments created and notifications sent for order ${orderId}`);
  } catch (error) {
    console.error("Error creating shipments after payment:", error);
  }
}

export { createShipmentsAfterPayment };

export const reviewOrder = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user_id = req.user;

    const {
      items,
      coupon_id,
      coupon_code,
      selectedBranch
    } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: user_id },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        ok: false,
      });
    }

    const couponId = coupon_id || null;
    let finalCouponId = couponId;
    if (!finalCouponId && coupon_code) {
      const coupon = await prisma.coupons.findUnique({
        where: { code: coupon_code },
      });
      if (coupon) finalCouponId = coupon.id;
    };

    const productIds = items.map((i: IOrderItem) => i.productId);
    const products = await prisma.products.findMany({
      where: { id: { in: productIds } },
    });

    let grouped = new Map<string, GroupedItems>();

    for (const item of items) {
      const product = products.find(p => p.id === item.productId);

      if (!product) return;

      let shipmentKey: string = '';

      if (product.type === FulfillmentType.FACTORY && product.factory_id) {
        shipmentKey = product.factory_id.toString();
      } else {
        shipmentKey = FulfillmentType.SELF;
      }

      if (!grouped.has(shipmentKey)) {
        const groupedItem: GroupedItems = {
          shipmentKey,
          type: product.type,
          items: [],
        };
        if (product.factory_id) {
          groupedItem.factoryId = product.factory_id;
        }
        grouped.set(shipmentKey, groupedItem);
      };

      grouped.get(shipmentKey)!.items.push({
        item,
        product,
      });
    };

    const total_price = items.reduce((acc: number, item: IOrderItem) => {
      const product = products.find(p => p.id === item.productId);

      if (!product) return acc;

      return acc + product.price * item.quantity;
    }, 0);

    const address = await prisma.adresses.create({
      data: {
        user_id: user_id,
        address: selectedBranch.address,
        city_code: selectedBranch.cityCode,
        branch_code: selectedBranch.code,
      },
    });

    const order = await prisma.orders.create({
      data: {
        user_id: user_id,
        total_price: total_price,
        addressId: address.id,
      },
    });

    // Create order items without shipments (shipments will be created after payment)
    for (const [, group] of grouped) {
      for (const entry of group.items) {
        await prisma.orderItem.create({
          data: {
            orderId: order.id,
            productId: entry.product.id!,
            quantity: entry.item.quantity,
            colorId: entry.item.colorId,
            sizeId: entry.item.sizeId,
            price: entry.product.price,
            actual_product_link: entry.product.actual_product_link ?? "",
          },
        });
      }
    }

    return res.status(200).json({
      message: "Order created successfully",
      order,
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
    const user_id = req.user;
    const orders = await prisma.orders.findMany({
      where: { user_id },
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            name: true,
            lastName: true,
            phone: true,
          },
        },
        coupon: {
          select: {
            id: true,
            code: true,
            discount: true,
          },
        },
        shipments: {
          include: {
            factory: {
              select: {
                name: true,
              },
            },
          },
        },
        orderItems: {
          include: {
            product: {
              include: {
                translations: true,
              },
            },
            size: {
              include: {
                translations: true,
              },
            },
            color: {
              include: {
                translations: true,
              },
            },
            shipment: true,
          },
        },
      },
    });

    for (const order of orders) {
      if (order.state === OrderState.PAID && (!order.shipments || order.shipments.length === 0)) {
        await createShipmentsAfterPayment(order.id);
      }
    }

    const updatedOrders = await prisma.orders.findMany({
      where: { user_id },
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            name: true,
            lastName: true,
            phone: true,
          },
        },
        coupon: {
          select: {
            id: true,
            code: true,
            discount: true,
          },
        },
        shipments: {
          include: {
            factory: {
              select: {
                name: true,
              },
            },
          },
        },
        orderItems: {
          include: {
            product: {
              include: {
                translations: true,
              },
            },
            size: {
              include: {
                translations: true,
              },
            },
            color: {
              include: {
                translations: true,
              },
            },
            shipment: true,
          },
        },
      },
    });

    res.status(200).json({
      data: updatedOrders,
      ok: true,
    });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const { state } = req.body;

    const order = await prisma.orders.update({
      where: { id: Number(id) },
      data: { state },
    });

    if (state === OrderState.PAID) {
      await createShipmentsAfterPayment(order.id);
    }

    res.status(200).json({
      message: "Order status updated successfully",
      data: order,
      ok: true,
    });
  } catch (error) {
    console.log("updating order status error: ", error);
    if (isAxiosError(error)) {
      console.log("Axios update order status error response data: ", error.response?.data);
      console.log("Axios update order status error request data: ", error.request?.data);
    }
    next(error);
  }
};

export const getAllOrders = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const user_id = req.user;
  
  try {
    const orders = await prisma.orders.findMany({
      where: {
        user_id: user_id,
      },
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            name: true,
            lastName: true,
            phone: true,
          },
        },
        coupon: {
          select: {
            id: true,
            code: true,
            discount: true,
          },
        },
        orderItems: {
          include: {
            product: {
              include: {
                translations: true,
              },
            },
            size: {
              include: {
                translations: true,
              },
            },
            color: {
              include: {
                translations: true,
              },
            },
          },
        },
      },
    });

    res.status(200).json({
      data: orders,
      ok: true,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllOrderAdmins = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const orders = await prisma.orders.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            name: true,
            lastName: true,
            phone: true,
          },
        },
        coupon: {
          select: {
            id: true,
            code: true,
            discount: true,
          },
        },
        orderItems: {
          include: {
            product: {
              include: {
                translations: true,
              },
            },
            size: {
              include: {
                translations: true,
              },
            },
            color: {
              include: {
                translations: true,
              },
            },
          },
        },
      },
    });

    res.status(200).json({
      data: orders,
      ok: true,
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orderStatuses = Object.values(OrderState);
    res.status(200).json({
      data: orderStatuses,
      ok: true,
    });
  } catch (error) {
    next(error);
  }
}