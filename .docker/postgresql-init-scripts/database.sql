CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename = 'user'
    ) THEN
        CREATE TABLE "user" (
            "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            "email" TEXT UNIQUE NOT NULL,
            "password" TEXT NOT NULL,
            "name" TEXT NOT NULL,
            "isActive" BOOLEAN DEFAULT TRUE NOT NULL,
            "roles" TEXT[] DEFAULT ARRAY['user'] NOT NULL
        );
    END IF;
END $$;

