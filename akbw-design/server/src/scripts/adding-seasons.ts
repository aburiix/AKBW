import { copyFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { prisma } from "../db/client.js";
import { fileURLToPath } from "url";
import path from "path";

const BASE_URL = process.env.PUBLIC_URL || "https://api.akbw.uz";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.resolve(__dirname, "../..");
const UPLOADS_DIR = path.join(PROJECT_ROOT, "uploads");

const resolveMediaDir = (): string => {
    const candidates = [
        process.env["MEDIA_DIR"],
        path.join(PROJECT_ROOT, "media"),
        path.join(PROJECT_ROOT, "src", "media"),
        path.join(PROJECT_ROOT, "dist", "media")
    ].filter(Boolean) as string[];

    const found = candidates.find((dir) => existsSync(dir));
    if (!found) {
        throw new Error(`Media papka topilmadi. Qidirildi: ${candidates.join(", ")}`);
    }
    return found;
};

const MEDIA_DIR = resolveMediaDir();

const IMAGES = [
    {
        name: "Yoz",
        file: "summer-akbw.webp"
    },
    {
        name: "Qish",
        file: "winter-akbw.webp"
    },
    {
        name: "Bahor",
        file: "bahor-akbw.webp"
    },
    {
        name: "Kuz",
        file: "autumn-akbw.webp"
    }
];

const addSeasons = async () => {
    try {
        await mkdir(UPLOADS_DIR, { recursive: true });

        for (const image of IMAGES) {
            const category = await prisma.categories.findFirst({
                where: {
                    translations: {
                        some: {
                            name: image.name
                        }
                    }
                }
            });

            if (!category) {
                console.log(`Category not found for "${image.name}", skipping`);
                continue;
            }

            const source = path.join(MEDIA_DIR, image.file);
            const destination = path.join(UPLOADS_DIR, image.file);
            await copyFile(source, destination);

            const url = `${BASE_URL}/uploads/${image.file}`;

            const existing = await prisma.styles.findFirst({
                where: {
                    categoryId: category.id
                }
            });

            if (existing) {
                await prisma.styles.update({
                    where: { id: existing.id },
                    data: { image: url }
                });
                console.log(`Style updated for "${image.name}": ${existing.id}`);
            } else {
                const style = await prisma.styles.create({
                    data: {
                        image: url,
                        categoryId: category.id
                    }
                });
                console.log(`Style created for "${image.name}": ${style.id}`);
            }
        }
    } catch (error) {
        console.error("Adding seasons failed: ", error);
    } finally {
        await prisma.$disconnect();
    }
};

addSeasons();
