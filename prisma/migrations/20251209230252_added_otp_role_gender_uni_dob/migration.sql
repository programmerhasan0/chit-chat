-- CreateEnum
CREATE TYPE "Role" AS ENUM ('student', 'faculty', 'recruiter', 'pro partner');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('male', 'female', 'other');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "dateOfBirth" TIMESTAMP(3),
ADD COLUMN     "gender" "Gender",
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "otp" TEXT,
ADD COLUMN     "otpExpire" TEXT,
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'student',
ADD COLUMN     "university" TEXT,
ALTER COLUMN "password" DROP NOT NULL;
