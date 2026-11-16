import type {
  NextFunction,
  Request,
  Response
} from "express";
import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";


// import routers
import { langaugeMiddleware } from "./middleware/language.middleware.js";
import factoryDashboardRoutes from "./routers/factoryDashboard.routes.js";
import notificationRoutes from "./routers/notification.routes.js";
import factoryOrderRoutes from "./routers/factoryOrder.routes.js";
import transactionsRoutes from "./routers/transactions.routes.js";
import factoryAuthRoutes from "./routers/factoryAuth.routes.js";
import dashboardRoutes from "./routers/dashboard.routes.js";
import shipmentRoutes from "./routers/shipment.routes.js";
import deliveryRoutes from "./routers/delivery.routes.js";
import paymentRoutes from "./routers/payment.routes.js";
import factoryRoutes from "./routers/factory.routes.js";
import productRoutes from "./routers/product.routes.js";
import workerRoutes from "./routers/worker.routes.js";
import uploadRoutes from "./routers/upload.routes.js";
import couponRoutes from "./routers/coupon.router.js";
import reviewRoutes from "./routers/review.routes.js";
import contactRoutes from "./routers/contact.routes.js"
import bootstrap from "./scripts/bootstrap-admin.js";
import styleRoutes from "./routers/style.routes.js";
import adminRoutes from "./routers/admin.routes.js";
import orderRoutes from "./routers/order.routes.js";
import userRoutes from "./routers/user.routes.js";
import authRoutes from "./routers/auth.routes.js";
import chatRoutes from "./routers/chat.routes.js";
import smsRoutes from "./routers/sms.routes.js";
import BaseError from "./errors/base.errors.js";
import botRoutes from "./routers/bot.routes.js";
import tryonRoutes from "./routers/tryon.routes.js";
import assistantRoutes from "./routers/assistant.routes.js";
import path from "path";

// configure dotenv
dotenv.config();

// initialize express
const app = express();

app.set("trust proxy", true);

// environment variables
const PORT = process.env.PORT || 3000;

// middlewares
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

app.use(morgan("combined"));
app.use(
  cors({
    origin: (origin, callback) => {
      const allowed = [
        "https://akbw.uz",
        "https://www.akbw.uz",
        "https://factory.akbw.uz",
        "https://admin.akbw.uz",
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        // Qo'shimcha domenlar (masalan, sinov manzili): CORS_EXTRA_ORIGINS=https://a.com,https://b.com
        ...(process.env.CORS_EXTRA_ORIGINS || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      ];
      // The browser extension sends requests from a per-install
      // chrome-extension://<id> origin, so allow any extension origin.
      const isExtension = typeof origin === "string" && origin.startsWith("chrome-extension://");
      if (!origin || isExtension || allowed.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(langaugeMiddleware);
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// routes
app.get("/", (req: Request, res: Response) => {
  res.send("Working !");
});

app.get("/favicon.ico", (req: Request, res: Response) => {
  res.status(204).end();
});

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/sms", smsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/product", productRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/review", reviewRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/style", styleRoutes);
app.use("/api/factory/dashboard", factoryDashboardRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/notification", notificationRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/delivery", deliveryRoutes);
app.use("/api/factory", factoryRoutes);
app.use("/api/factory/auth", factoryAuthRoutes);
app.use("/api/factory/orders", factoryOrderRoutes);
app.use("/api/transactions", transactionsRoutes);
app.use("/api/factory/workers", workerRoutes);
app.use("/api/shipment", shipmentRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/coupon", couponRoutes);
app.use("/api/bot", botRoutes);
app.use("/api/tryon", tryonRoutes);
app.use("/api/assistant", assistantRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    message: `Route ${req.originalUrl} not found`,
    ok: false,
  });
});

// error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Global Error Handler:", err);

  if (err.isTransactionError) {
    console.log("error this is transaction error: ", err.isTransactionError);
    return res.status(200).json({
      error: {
        code: err.transactionErrorCode,
        message: err.transactionErrorMessage,
        data: err.transactionData,
      },
      id: err.transactionId,
    });
  }

  if (err instanceof BaseError) {
    console.log("we are at base ERROR: ", err);
    return res
      .status(err.statusCode)
      .json({ message: err.message, errors: err.errors });
  }

  res.status(err.status || 500).json({
    message: err.message || "Noma'lum xatolik yuz berdi",
    ok: false,
  });
});

// start server
app.listen(PORT, async () => {
  // PM2 bir nechta nusxa ishga tushiradi — birinchi adminni faqat 0-nusxa yaratadi
  if (!process.env.NODE_APP_INSTANCE || process.env.NODE_APP_INSTANCE === "0") await bootstrap();
  console.log(`Server is running on port ${PORT}`);
});
