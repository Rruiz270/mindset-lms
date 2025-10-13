'use client';

export default function QuickSetupPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Mindset LMS Quick Setup</h1>
        
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <p>Run these commands in your Neon SQL Editor to set up the database:</p>
          
          <div className="bg-gray-900 text-white p-4 rounded overflow-x-auto">
            <pre>{`-- 1. Create User table
CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "email" TEXT UNIQUE NOT NULL,
  "password" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "role" TEXT DEFAULT 'STUDENT',
  "level" TEXT,
  "studentId" TEXT UNIQUE,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- 2. Create admin account (password: admin123)
INSERT INTO "User" ("email", "password", "name", "role") 
VALUES (
  'admin@mindset.com', 
  '$2a$12$7JKJgK.hQx6x0RbQxK9FEOQxHVdT8YpMnH3xL5wY2XvKGxQKkW5oi',
  'Admin User', 
  'ADMIN'
) ON CONFLICT ("email") DO NOTHING;

-- 3. Create other required tables
CREATE TABLE IF NOT EXISTS "Package" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL REFERENCES "User"("id"),
  "totalLessons" INTEGER NOT NULL,
  "usedLessons" INTEGER DEFAULT 0,
  "remainingLessons" INTEGER NOT NULL,
  "validFrom" TIMESTAMP NOT NULL,
  "validUntil" TIMESTAMP NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);`}</pre>
          </div>
          
          <div className="border-t pt-4">
            <h2 className="font-bold mb-2">Steps:</h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>Go to your Neon Dashboard</li>
              <li>Select the "production" branch</li>
              <li>Open SQL Editor</li>
              <li>Copy and paste the SQL above</li>
              <li>Click "Run"</li>
              <li>Login with: admin@mindset.com / admin123</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}