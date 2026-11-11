import axios from "axios";

const BASE_URL = "https://api.akbw.uz/api/bot";

const start = async (ctx) => {
  const userId = ctx.from.id;
  ctx.reply(`Assalomu alaykum! 👋\n\nSizning Telegram ID: ${userId}\n\nBotdan foydalanish uchun quyidagi buyruqlardan foydalaning:\n\n📦 Bugungi buyurtmalar - Kunlik buyurtmalarni ko'rish\n📊 Hisobotlar - Yuborilgan buyurtmalar tarixi\n❓ Yordam - Yordam olish`);
};

const help = (ctx) => {
  ctx.reply(`🤖 Yordam\n\nQuyidagi buyruqlardan foydalanishingiz mumkin:\n\n/start - Botni boshlash\n/bugungi_buyurtmalar - Bugungi buyurtmalarni ko'rish\n/hisobotlar - Yuborilgan buyurtmalar tarixi\n/help - Yordam olish\n\nYuk holatini yangilash uchun inline tugmalardan foydalaning.`);
};

const info = (ctx) => {
  ctx.reply(`ℹ️ Ma'lumot\n\nBu bot fabrika ishchilari uchun yuklarni boshqarish tizimi.\n\nFunksiyalar:\n- Yangi buyurtmalarni ko'rish\n- Yuk holatini yangilash\n- Buyurtmalar tarixini ko'rish\n\nSizning Telegram ID: ${ctx.from.id}`);
};

const text = (ctx) => {
  ctx.reply("Iltimos, buyruqlardan foydalaning yoki /help yozing.");
};

const orders = async (ctx) => {
  try {
    const response = await axios.get(`${BASE_URL}/orders?tg_id=${ctx.from.id}`);
    console.log("orders response: ", response.data);
    const shipments = response.data || [];

    if (shipments.length > 0) {
      let message = `Bugungi buyurtmalar (${shipments.length} ta):\n\n`;
      shipments.forEach((shipment, index) => {
        const user = shipment.order.user;
        message += `${index + 1}. Buyurtma #${shipment.order.id}\n`;
        message += `   Mijoz: ${user?.name || ""} ${user?.lastName || ""}\n`;
        message += `   Telefon: ${user?.phone || ""}\n`;
        message += `   Umumiy summa: ${shipment.orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0)} so'm\n`;
        message += `   Mahsulotlar:\n`;
        shipment.orderItems.forEach((item) => {
          message += `     - ${item.product?.translations?.[0]?.name || "Mahsulot"} (${item.quantity} ta, ${item.price} so'm)\n`;
        });
        message += `\n`;
      });
      ctx.reply(message);
    } else {
      ctx.reply("Bugun hech qanday buyurtma yo'q.");
    }
  } catch (error) {
    console.error(error);
    ctx.reply("Buyurtmalarni olishda xatolik yuz berdi.");
  }
};

const history = async (ctx) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/history?tg_id=${ctx.from.id}`,
    );

    const shipments = response.data || [];
    if(shipments.length > 0) {
let message = `Hisobotlar (${shipments.length} ta):\n\n`;
        shipments.forEach((shipment, index) => {
          const user = shipment.order.shipment;
          message += `${index + 1}. Buyurtma #${shipment.order.id}\n`;
          message += `   Mijoz: ${user?.name || ""} ${user?.lastName || ""}\n`;
          message += `   Telefon: ${user?.phone || ""}\n`;
          message += `   Umumiy summa: ${shipment.orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0)} so'm\n`;
          message += `   Vaqt: ${new Date(shipment.createdAt).toLocaleDateString("uz-UZ")}\n`;
          message += `   Mahsulotlar:\n`;
          shipment.orderItems.forEach((item) => {
            message += `     - ${item.product?.translations?.[0]?.name || "Mahsulot"} (${item.quantity} ta, ${item.price} so'm)\n`;
          });
          message += `\n`;
        });
        ctx.reply(message);
    }else {
      ctx.reply("Hozircha hisobotlar mavjud emas.");
    }
  } catch (error) {
    console.error(error);
    ctx.reply("Hisobotlarni olishda xatolik yuz berdi.");
  }
};

const checkWorker = async (ctx, next) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/isWorker?tg_id=${ctx.from.id}`,
    );
    console.log("response data: ", response.data);

    if (response.data.status == 200) {
      next();
    } else {
      console.log("Hello world");
      ctx.reply("Siz ishchi emassiz bu botdan foydalana olmaysiz!");
    }
    console.log(response.data);
  } catch (error) {
    console.log(error);
    ctx.reply("Siz bu botdan foydalana olmaysiz!");
  }
};


const handleCallbackQuery = async (ctx) => {
  try {
    const callbackData = ctx.callbackQuery.data;
    console.log("Callback data:", callbackData);

    if (callbackData.startsWith("accept_") || callbackData.startsWith("reject_")) {
      const [action, orderId] = callbackData.split("_");

      if (!orderId || isNaN(orderId)) {
        await ctx.answerCbQuery("Invalid order ID");
        return;
      }

      const response = await axios.post(`${BASE_URL}/order-action`, {
        tg_id: ctx.from.id,
        order_id: parseInt(orderId),
        action: action,
      });

      if (response.data.ok) {
        await ctx.answerCbQuery(
          `Buyurtma ${action === "accept" ? "qabul qilindi" : "rad etildi"}`,
        );

        try {
          await ctx.editMessageText(
            `${ctx.callbackQuery.message.text}\n\n✅ ${action === "accept" ? "Qabul qilindi" : "Rad etildi"} - ${new Date().toLocaleString("uz-UZ")}`,
            { reply_markup: { inline_keyboard: [] } },
          );
        } catch (editError) {
        }
      } else {
        await ctx.answerCbQuery(
          `Xatolik: ${response.data.error || "Noma'lum xatolik"}`,
        );
      }
      return;
    }

    if (callbackData.startsWith("ready_to_bts_")) {
      const shipmentId = callbackData.replace("ready_to_bts_", "");
      await handleShipmentStatusUpdate(ctx, shipmentId, "READY_FOR_BTS");
      return;
    }

    if (callbackData.startsWith("mark_sent_")) {
      const shipmentId = callbackData.replace("mark_sent_", "");
      await handleShipmentStatusUpdate(ctx, shipmentId, "SENT");
      return;
    }

    if (callbackData.startsWith("cancel_")) {
      const shipmentId = callbackData.replace("cancel_", "");
      await handleShipmentStatusUpdate(ctx, shipmentId, "CANCELLED");
      return;
    }

    await ctx.answerCbQuery("Noma'lum amal");
  } catch (error) {
    console.error("Callback query error:", error);
    await ctx.answerCbQuery("Xatolik yuz berdi");
  }
};

const handleShipmentStatusUpdate = async (ctx, shipmentId, newState) => {
  try {
    const response = await axios.post(`${BASE_URL}/shipment-status-update`, {
      tg_id: ctx.from.id,
      shipment_id: parseInt(shipmentId),
      new_state: newState,
    });

    if (response.data.ok) {
      const updatedShipment = response.data.data;
      const statusLabels = {
        "READY_FOR_BTS": "BTSga tayyor",
        "SENT": "Yuborildi",
        "CANCELLED": "Bekor qilindi",
      };

      await ctx.answerCbQuery(`Holat yangilandi: ${statusLabels[newState]}`);

      let message = ctx.callbackQuery.message.text;
      
      message += `\n\n✅ Holat: ${statusLabels[newState]}`;
      
      if (newState === "READY_FOR_BTS" && updatedShipment.tracking_number) {
        message += `\n📦 Trek-raqam: ${updatedShipment.tracking_number}`;
      }

      let keyboard = { inline_keyboard: [] };

      if (newState === "READY_FOR_BTS") {
        keyboard = {
          inline_keyboard: [
            [
              {
                text: "🚚 Yuborildi deb belgilash",
                callback_data: `mark_sent_${shipmentId}`,
              },
            ],
          ],
        };
      } else if (newState === "SENT" || newState === "CANCELLED") {
        keyboard = { inline_keyboard: [] };
      }

      try {
        await ctx.editMessageText(message, { reply_markup: keyboard });
      } catch (editError) {
        console.error("Error editing message:", editError);
      }
    } else {
      await ctx.answerCbQuery(
        `Xatolik: ${response.data.error || "Holatni yangilab bo'lmadi"}`,
      );
    }
  } catch (error) {
    console.error("Shipment status update error:", error);
    await ctx.answerCbQuery("Xatolik yuz berdi");
  }
};

export {
  start,
  help,
  info,
  text,
  orders,
  history,
  checkWorker,
  handleCallbackQuery,
};
