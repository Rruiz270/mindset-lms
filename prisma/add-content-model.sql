-- Create enum for content type
CREATE TYPE "ContentType" AS ENUM ('reading', 'video', 'audio', 'exercise', 'quiz', 'discussion');

-- Create enum for content phase
CREATE TYPE "ContentPhase" AS ENUM ('pre-class', 'live-class', 'post-class');

-- Create Content table
CREATE TABLE "Content" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "ContentType" NOT NULL,
    "phase" "ContentPhase" NOT NULL,
    "duration" INTEGER NOT NULL DEFAULT 15,
    "resourceUrl" TEXT,
    "order" INTEGER NOT NULL DEFAULT 1,
    "level" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Content_pkey" PRIMARY KEY ("id")
);

-- Create index on topicId for better query performance
CREATE INDEX "Content_topicId_idx" ON "Content"("topicId");

-- Create index on level for better query performance  
CREATE INDEX "Content_level_idx" ON "Content"("level");

-- Create composite index for common queries
CREATE INDEX "Content_topicId_phase_idx" ON "Content"("topicId", "phase");

-- Add foreign key constraint
ALTER TABLE "Content" ADD CONSTRAINT "Content_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;