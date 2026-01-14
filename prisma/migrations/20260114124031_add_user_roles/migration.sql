-- CreateEnum
CREATE TYPE "Role" AS ENUM ('buyer', 'seller', 'rider', 'admin');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'buyer';
