-- CreateTable
CREATE TABLE "AssistantThread" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssistantThread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssistantMessage" (
    "id" SERIAL NOT NULL,
    "threadId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "api" JSONB NOT NULL,
    "ui" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssistantMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssistantMemory" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "fact" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssistantMemory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AssistantThread_userId_updatedAt_idx" ON "AssistantThread"("userId", "updatedAt");

-- CreateIndex
CREATE INDEX "AssistantMessage_threadId_id_idx" ON "AssistantMessage"("threadId", "id");

-- CreateIndex
CREATE INDEX "AssistantMemory_userId_idx" ON "AssistantMemory"("userId");

-- AddForeignKey
ALTER TABLE "AssistantThread" ADD CONSTRAINT "AssistantThread_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssistantMessage" ADD CONSTRAINT "AssistantMessage_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "AssistantThread"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssistantMemory" ADD CONSTRAINT "AssistantMemory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
