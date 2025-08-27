-- CreateEnum
CREATE TYPE "public"."IterStatus" AS ENUM ('PLANNED', 'OPEN', 'CLOSED');

-- CreateTable
CREATE TABLE "public"."Book" (
    "id" TEXT NOT NULL,
    "titleNorm" TEXT NOT NULL,
    "authorsNorm" TEXT[],
    "year" INTEGER,
    "isbn10" TEXT,
    "isbn13" TEXT,
    "coverUrl" TEXT,
    "source" TEXT,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Book_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Iteration" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "public"."IterStatus" NOT NULL DEFAULT 'PLANNED',
    "isPublicVotes" BOOLEAN NOT NULL DEFAULT false,
    "openedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "meetingDate" TIMESTAMP(3),

    CONSTRAINT "Iteration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Candidate" (
    "id" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "addedByUserId" TEXT NOT NULL,
    "iterationId" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Candidate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Vote" (
    "id" TEXT NOT NULL,
    "iterationId" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Vote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Book_isbn13_key" ON "public"."Book"("isbn13");

-- CreateIndex
CREATE INDEX "Candidate_iterationId_idx" ON "public"."Candidate"("iterationId");

-- CreateIndex
CREATE UNIQUE INDEX "Candidate_bookId_iterationId_key" ON "public"."Candidate"("bookId", "iterationId");

-- CreateIndex
CREATE INDEX "Vote_candidateId_idx" ON "public"."Vote"("candidateId");

-- CreateIndex
CREATE UNIQUE INDEX "Vote_userId_iterationId_key" ON "public"."Vote"("userId", "iterationId");

-- AddForeignKey
ALTER TABLE "public"."Candidate" ADD CONSTRAINT "Candidate_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "public"."Book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Candidate" ADD CONSTRAINT "Candidate_addedByUserId_fkey" FOREIGN KEY ("addedByUserId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Candidate" ADD CONSTRAINT "Candidate_iterationId_fkey" FOREIGN KEY ("iterationId") REFERENCES "public"."Iteration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Vote" ADD CONSTRAINT "Vote_iterationId_fkey" FOREIGN KEY ("iterationId") REFERENCES "public"."Iteration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Vote" ADD CONSTRAINT "Vote_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "public"."Candidate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Vote" ADD CONSTRAINT "Vote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
