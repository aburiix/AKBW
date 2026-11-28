-- Telegram kanalga yuborilgan mahsulot posti
ALTER TABLE "Products" ADD COLUMN "channel_message_id" INTEGER;
ALTER TABLE "Products" ADD COLUMN "channel_posted_at" TIMESTAMP(3);
