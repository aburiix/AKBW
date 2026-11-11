#!/bin/sh

echo "Deploying migrations..."
npx prisma migrate deploy

echo "Pushing migrations..."
npx prisma db push

echo "Generating Prisma client..."
npx prisma generate

echo "Starting app..."
npm run start