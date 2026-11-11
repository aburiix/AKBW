import { prisma } from '../src/db/client.js';

async function main() {
    // Create categories
    const categories = await prisma.categories.createMany({
        data: [
            {},
            {},
            {},
            {},
        ],
    });

    // Create category translations
    await prisma.categoryTranslations.createMany({
        data: [
            { categoryId: 1, name: 'T-Shirts', lang: 'en' },
            { categoryId: 1, name: 'Футболки', lang: 'ru' },
            { categoryId: 1, name: 'T-Shirts', lang: 'uz' },
            { categoryId: 2, name: 'Outerwear', lang: 'en' },
            { categoryId: 2, name: 'Верхняя одежда', lang: 'ru' },
            { categoryId: 2, name: 'Outerwear', lang: 'uz' },
            { categoryId: 3, name: 'Shoes', lang: 'en' },
            { categoryId: 3, name: 'Обувь', lang: 'ru' },
            { categoryId: 3, name: 'Shoes', lang: 'uz' },
            { categoryId: 4, name: 'Pants', lang: 'en' },
            { categoryId: 4, name: 'Брюки', lang: 'ru' }, 
            { categoryId: 4, name: 'Pants', lang: 'uz' },
        ],
    });

    // Create sizes
    const sizes = await prisma.sizes.createMany({
        data: [
            {},
            {},
            {},
            {},
            {},
        ],
    });

    // Create size translations
    await prisma.sizeTranslations.createMany({
        data: [
            { sizeId: 1, name: 'XS', lang: 'en' },
            { sizeId: 1, name: 'XS', lang: 'ru' },
            { sizeId: 1, name: 'XS', lang: 'uz' },
            { sizeId: 2, name: 'S', lang: 'en' },
            { sizeId: 2, name: 'S', lang: 'ru' },
            { sizeId: 2, name: 'S', lang: 'uz' },
            { sizeId: 3, name: 'M', lang: 'en' },
            { sizeId: 3, name: 'M', lang: 'ru' },
            { sizeId: 3, name: 'M', lang: 'uz' },
            { sizeId: 4, name: 'L', lang: 'en' },
            { sizeId: 4, name: 'L', lang: 'ru' },
            { sizeId: 4, name: 'L', lang: 'uz' },
            { sizeId: 5, name: 'XL', lang: 'en' },
            { sizeId: 5, name: 'XL', lang: 'ru' },
            { sizeId: 5, name: 'XL', lang: 'uz' },
        ],
    });

    // Create colors
    const colors = await prisma.colors.createMany({
        data: [
            {},
            {},
            {},
            {},
        ],
    });

    // Create color translations
    await prisma.colorTranslations.createMany({
        data: [
            { colorId: 1, name: 'Black', lang: 'en' },
            { colorId: 1, name: 'Черный', lang: 'ru' },
            { colorId: 1, name: 'Qora', lang: 'uz' },
            { colorId: 2, name: 'White', lang: 'en' },
            { colorId: 2, name: 'Белый', lang: 'ru' },
            { colorId: 2, name: 'Oq', lang: 'uz' },
            { colorId: 3, name: 'Red', lang: 'en' },
            { colorId: 3, name: 'Красный', lang: 'ru' },
            { colorId: 3, name: 'Qizil', lang: 'uz' },
            { colorId: 4, name: 'Blue', lang: 'en' },
            { colorId: 4, name: 'Синий', lang: 'ru' },
            { colorId: 4, name: 'Ko\'k', lang: 'uz' },
        ],
    });

    // Create default access types
    await prisma.access.createMany({
        data: [
            { name: 'ko\'rish' },
            { name: 'yaratish' },
            { name: 'o\'zgartirish' },
            { name: 'o\'chirish' },
        ]
    });

    // Create default admin address for sending shipments
    await prisma.adresses.upsert({
        where: { id: 1000 },
        update: {},
        create: {
            id: 1000,
            user_id: '1',
            address: 'Toshkent shahar, Yunusobod tumani, AKB Ombori',
            city_code: '0102',
            branch_code: '0136',
        },
    });

    console.log('Seed data created successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
