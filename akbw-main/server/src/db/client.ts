import "dotenv/config";
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/client/index.js';
import pg from 'pg'

const connectionString = `${process.env.DATABASE_URL}`

const pool = new pg.Pool({
  connectionString,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
})

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err)
  process.exit(-1)
})

const adapter = new PrismaPg(pool)
// Maxfiy maydonlar hech qachon API javobiga tushmasin (masalan, sharhlarda `user: true`
// mijozning refreshToken'ini hammaga ochib qo'ygan edi). Kerak bo'lgan joyda `omit: { password: false }`.
const prisma = new PrismaClient({
  adapter,
  omit: {
    user: { refreshToken: true },
    admins: { password: true, refreshToken: true },
    factories: { password: true },
  },
})

export { prisma }
