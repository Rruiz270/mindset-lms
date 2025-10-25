-- Create ContentProgress table to track individual content completion
CREATE TABLE IF NOT EXISTS "ContentProgress" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "timeSpent" INTEGER NOT NULL DEFAULT 0, -- in seconds
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentProgress_pkey" PRIMARY KEY ("id")
);

-- Create unique constraint on userId and contentId
ALTER TABLE "ContentProgress" ADD CONSTRAINT "ContentProgress_userId_contentId_key" UNIQUE ("userId", "contentId");

-- Add foreign key constraints
ALTER TABLE "ContentProgress" ADD CONSTRAINT "ContentProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ContentProgress" ADD CONSTRAINT "ContentProgress_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create indexes for better query performance
CREATE INDEX "ContentProgress_userId_idx" ON "ContentProgress"("userId");
CREATE INDEX "ContentProgress_contentId_idx" ON "ContentProgress"("contentId");
CREATE INDEX "ContentProgress_userId_completed_idx" ON "ContentProgress"("userId", "completed");