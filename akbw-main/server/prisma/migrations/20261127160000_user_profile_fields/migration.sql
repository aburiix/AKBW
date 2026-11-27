-- Ro'yxatdan o'tishda so'raladigan qo'shimcha ma'lumotlar (eski foydalanuvchilar uchun bo'sh)
ALTER TABLE "User" ADD COLUMN "birthDate" TIMESTAMP(3),
ADD COLUMN "region" TEXT,
ADD COLUMN "district" TEXT,
ADD COLUMN "email" TEXT;
