-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "tgUserId" TEXT NOT NULL,
    "name" TEXT,
    "username" TEXT,
    "roles" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_tgUserId_key" ON "public"."User"("tgUserId");
