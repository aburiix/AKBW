import { type NextFunction, type Response, type Request } from "express";
import { randomNumbers } from "../utils/random.utils.js";
import { prisma } from "../db/client.js";
import smsService from "../services/sms.service.js";
import { signPhoneProof } from "../utils/phoneProof.util.js";

// Sinov raqamlari (SMS yuborilmaydi, doimiy kod bilan kiriladi):
//   TEST_LOGIN_PHONES=+998000000001,+998000000002   TEST_LOGIN_CODE=12345 (5 xonali)
// Ikkalasi ham bo'sh bo'lsa — o'chiq.
const digits = (v: unknown) => String(v ?? "").replace(/\D/g, "");
const testCode = (phone: unknown): string | null => {
  const code = process.env.TEST_LOGIN_CODE || "";
  if (!/^\d{5}$/.test(code)) return null;
  const list = (process.env.TEST_LOGIN_PHONES || "").split(",").map(digits).filter(Boolean);
  return list.includes(digits(phone)) ? code : null;
};

export const send = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const fixed = testCode(req.body.phone);
    const randomDigitCode = fixed ?? randomNumbers();

    const existingVerify = await prisma.verify.findUnique({
      where: {
        phone: req.body.phone,
      },
    });

    if (existingVerify) {
      const currentTime = Date.now();
      const expiresDate = existingVerify.createdAt.getTime() + 60 * 1000;
      if (currentTime < expiresDate) {
        return res.status(400).json({
          message: "Iltimos yangi kod yuborishdan oldin 1minut kuting!",
        });
      } else {
        await prisma.verify.delete({
          where: {
            phone: req.body.phone,
          },
        });
      }
    }

    const user = await prisma.user.findUnique({
      where: {
        phone: req.body.phone,
      },
    });

    if (!user?.id && req.body.type == "login") {
      return res.status(404).json({
        message: "User not found",
        ok: false,
        isRegistered: false,
      });
    }

    const verifyCode = await prisma.verify.upsert({
      where: {
        phone: req.body.phone,
      },
      update: {
        code: String(randomDigitCode),
        createdAt: new Date(), // Reset createdAt to extend validity
      },
      create: {
        code: String(randomDigitCode),
        phone: req.body.phone,
      },
    });

    const text: string = `AKBW platformasi uchun tasdiqlash kodingiz: ${randomDigitCode}`;

    if (fixed) {
      console.log(`[sms] sinov raqami, SMS yuborilmadi: ${digits(req.body.phone).slice(-4)}`);
      return res.status(201).json({
        message: "Code created and sent successfully",
        ok: true,
        code: verifyCode.id,
        isRegistered: !!user,
      });
    }

    try {
      await smsService.sendSms({
        phone_number: String(req.body.phone),
        message: text,
      });

      return res.status(201).json({
        message: "Code created and sent successfully",
        ok: true,
        code: verifyCode.id,
        isRegistered: !!user,
      });
    } catch (error: any) {
      console.error("SMS sending failed:", error.message);
      return res.status(500).json({
        message: "Failed to send SMS. Please try again later.",
        ok: false,
      });
    }
  } catch (error) {
    next(error);
  }
};

export const verify = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const verifyCode = await prisma.verify.findUnique({
      where: {
        phone: req.body.phone,
      },
    });

    if (!verifyCode?.id) {
      return res.status(404).json({
        message: "Code not found",
        ok: false,
      });
    }

    const currentTime = Date.now();
    const expiresDate = verifyCode.createdAt.getTime() + 60 * 1000;

    if (currentTime > expiresDate) {
      return res.status(400).json({
        message: "Code expired",
        ok: false,
      });
    }

    if (verifyCode.code !== req.body.code) {
      return res.status(400).json({
        message: "Invalid code",
        ok: false,
      });
    }

    await prisma.verify.delete({
      where: {
        id: verifyCode.id,
      },
    });

    return res.status(200).json({
      message: "Code verified successfully",
      ok: true,
      verifyToken: signPhoneProof(req.body.phone),
    });
  } catch (error) {
    next(error);
  }
};
