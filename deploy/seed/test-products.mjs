// 25 ta bir xil TEST mahsulot qo'shadi (yoki --clean bilan hammasini o'chiradi).
// Server konteyneri ichida ishlaydi:
//   docker compose cp ../deploy/seed/test-products.mjs server:/app/test-products.mjs   (rasm: test-cardigan.png ham)
//   docker compose exec -T server node /app/test-products.mjs [--clean]
// Belgi: actual_product_link = "TEST_SEED", kategoriya nomi "TEST".
import fs from "fs";
import path from "path";
import { prisma } from "/app/dist/db/client.js";

const MARK = "TEST_SEED";
const N = 25;
const BASE = (process.env.PUBLIC_URL || "https://api.akbw.uz").replace(/\/$/, "");
const IMG_SRC = "/app/test-cardigan.png";
const IMG_DIR = "/app/uploads/test-seed";
const IMG_URL = `${BASE}/uploads/test-seed/cardigan.png`;

async function clean() {
  const products = await prisma.products.findMany({ where: { actual_product_link: MARK }, select: { id: true } });
  const ids = products.map((p) => p.id);
  if (ids.length) {
    await prisma.productTranslations.deleteMany({ where: { productId: { in: ids } } });
    await prisma.products.deleteMany({ where: { id: { in: ids } } });
  }
  const cats = await prisma.categoryTranslations.findMany({ where: { name: "TEST" }, select: { categoryId: true } });
  for (const { categoryId } of cats) {
    const used = await prisma.products.count({ where: { categories: { some: { id: categoryId } } } });
    if (!used) {
      await prisma.categoryTranslations.deleteMany({ where: { categoryId } });
      await prisma.categories.delete({ where: { id: categoryId } }).catch(() => {});
    }
  }
  fs.rmSync(IMG_DIR, { recursive: true, force: true });
  console.log(`o'chirildi: ${ids.length} ta TEST mahsulot`);
}

const tr = (uz, ru, en) => [
  { lang: "uz", name: uz },
  { lang: "ru", name: ru },
  { lang: "en", name: en },
];

async function findOrCreate(model, trModel, fk, uzName, names) {
  const hit = await prisma[trModel].findFirst({ where: { name: uzName, lang: "uz" } });
  if (hit) return hit[fk];
  const row = await prisma[model].create({ data: { translations: { create: names } } });
  return row.id;
}

async function seed() {
  const already = await prisma.products.count({ where: { actual_product_link: MARK } });
  if (already) {
    console.log(`allaqachon bor: ${already} ta TEST mahsulot (avval --clean)`);
    return;
  }
  fs.mkdirSync(IMG_DIR, { recursive: true });
  fs.copyFileSync(IMG_SRC, path.join(IMG_DIR, "cardigan.png"));

  const categoryId = await findOrCreate("categories", "categoryTranslations", "categoryId", "TEST", tr("TEST", "TEST", "TEST"));
  const sizeIds = [];
  for (const s of ["S", "M", "L"]) sizeIds.push(await findOrCreate("sizes", "sizeTranslations", "sizeId", s, tr(s, s, s)));
  const colorIds = [
    await findOrCreate("colors", "colorTranslations", "colorId", "Kulrang", tr("Kulrang", "Серый", "Grey")),
    await findOrCreate("colors", "colorTranslations", "colorId", "Qora", tr("Qora", "Чёрный", "Black")),
  ];

  for (let i = 1; i <= N; i++) {
    await prisma.products.create({
      data: {
        price: 249000,
        product_images: [IMG_URL],
        type: "SELF",
        actual_product_link: MARK,
        weight: 0.5,
        volume_x: 30,
        volume_y: 25,
        volume_z: 5,
        categories: { connect: [{ id: categoryId }] },
        sizes: { connect: sizeIds.map((id) => ({ id })) },
        colors: { connect: colorIds.map((id) => ({ id })) },
        translations: {
          create: [
            { lang: "uz", name: `TEST · Oversize kardigan #${i}`, description: "Sinov uchun mahsulot. Yumshoq to'qilgan oversize kardigan." },
            { lang: "ru", name: `TEST · Оверсайз кардиган #${i}`, description: "Тестовый товар. Мягкий вязаный кардиган оверсайз." },
            { lang: "en", name: `TEST · Oversize cardigan #${i}`, description: "Test product. Soft knitted oversize cardigan." },
          ],
        },
      },
    });
  }
  console.log(`qo'shildi: ${N} ta TEST mahsulot, rasm ${IMG_URL}`);
}

try {
  if (process.argv.includes("--clean")) await clean();
  else await seed();
} finally {
  await prisma.$disconnect();
  process.exit(0);
}
