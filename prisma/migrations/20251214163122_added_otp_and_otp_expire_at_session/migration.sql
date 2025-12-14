-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "otp" TEXT,
ADD COLUMN     "otpExpire" TIMESTAMP(3);
