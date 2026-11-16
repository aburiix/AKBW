import { prisma } from "../db/client.js";
import bcrypt from "bcryptjs";

export default async function bootstrap() {
    try {
        // Birinchi admin ma'lumotlari faqat server/.env faylidan olinadi (kodda saqlanmaydi)
        const name = process.env.ADMIN_NAME || "Admin";
        const lastName = process.env.ADMIN_LASTNAME || "";
        const phone = process.env.ADMIN_PHONE;
        const password = process.env.ADMIN_PASSWORD;

        if (!phone || !password) {
            console.warn("Bootstrap: ADMIN_PHONE / ADMIN_PASSWORD .env da yo'q — admin yaratish o'tkazib yuborildi.");
            return;
        }

        console.log("Checking for existing admins...");
        const existingAdmin = await prisma.admins.findFirst({
            where: { phone }
        });

        if (existingAdmin?.phone) {
            await prisma.admins.update({
                where: { id: existingAdmin.id },
                data: { password: await bcrypt.hash(password, 10) }
            });

            console.log(`Admin password synced from .env for ${phone}.`);
            return;
        }

        console.log("Creating default access roles...");
        const accessRoles = ["ko'rish", "yaratish", "o'zgartirish", "o'chirish"];
        await prisma.access.createMany({
            data: accessRoles.map(name => ({ name })),
            skipDuplicates: true
        });

        console.log(`Creating first admin: ${name} ${lastName} (${phone})...`);
        await prisma.admins.create({
            data: {
                name,
                lastName,
                phone,
                password: await bcrypt.hash(password, 10),
                role: "SuperAdmin",
                access: {
                    connect: accessRoles.map(name => ({ name }))
                }
            }
        });

        console.log("First admin created successfully!");
        console.log(`Login with phone ${phone} and the ADMIN_PASSWORD from .env.`);
    } catch (error) {
        console.error("Bootstrap failed:", error);
    }
}
