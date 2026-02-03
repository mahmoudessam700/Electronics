-- CreateEnum
CREATE TYPE "ShopStatus" AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "ShopMemberRole" AS ENUM ('OWNER', 'MANAGER', 'STAFF', 'FINANCE');

-- CreateEnum
CREATE TYPE "ShopMemberStatus" AS ENUM ('ACTIVE', 'INVITED', 'SUSPENDED', 'REVOKED');

-- CreateEnum
CREATE TYPE "ShopInvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED');

-- CreateEnum
CREATE TYPE "ShopKycStatus" AS ENUM ('UNVERIFIED', 'SUBMITTED', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ShopPayoutSchedule" AS ENUM ('MANUAL', 'WEEKLY', 'BIWEEKLY', 'MONTHLY');

-- CreateEnum
CREATE TYPE "ShopCommissionLedgerType" AS ENUM ('ORDER_EARNING', 'ADJUSTMENT', 'PAYOUT', 'REVERSAL', 'FEE');

-- CreateEnum
CREATE TYPE "ShopPayoutStatus" AS ENUM ('PENDING', 'SCHEDULED', 'PROCESSING', 'PAID', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ShopPayoutMethod" AS ENUM ('BANK_TRANSFER', 'MOBILE_WALLET', 'PAYPAL', 'CASH_COLLECTION');

-- CreateEnum
CREATE TYPE "ShopAutomationEvent" AS ENUM ('ORDER_CREATED', 'ORDER_UPDATED', 'ORDER_FULFILLED', 'COMMISSION_EARNED', 'PAYOUT_QUEUED', 'PAYOUT_COMPLETED');

-- CreateEnum
CREATE TYPE "ShopOrderPayoutStatus" AS ENUM ('NOT_REQUESTED', 'QUEUED', 'PAID_OUT', 'WITHHELD');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Role" ADD VALUE 'SHOP_OWNER';
ALTER TYPE "Role" ADD VALUE 'SHOP_STAFF';

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "commissionTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "shopId" TEXT,
ADD COLUMN     "shopPayoutId" TEXT,
ADD COLUMN     "shopPayoutStatus" "ShopOrderPayoutStatus" NOT NULL DEFAULT 'NOT_REQUESTED';

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "commissionAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "commissionRateApplied" DOUBLE PRECISION,
ADD COLUMN     "netRevenue" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "commissionLocked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "commissionRate" DOUBLE PRECISION,
ADD COLUMN     "inventoryQuantity" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "shopId" TEXT,
ADD COLUMN     "tracksInventory" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Shop" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "logo" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "status" "ShopStatus" NOT NULL DEFAULT 'PENDING',
    "kycStatus" "ShopKycStatus" NOT NULL DEFAULT 'UNVERIFIED',
    "defaultCommissionRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "payoutSchedule" "ShopPayoutSchedule" NOT NULL DEFAULT 'MANUAL',
    "lastPayoutDate" TIMESTAMP(3),
    "nextPayoutDate" TIMESTAMP(3),
    "ownerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Shop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShopMember" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "role" "ShopMemberRole" NOT NULL DEFAULT 'STAFF',
    "status" "ShopMemberStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShopMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShopFeatureToggle" (
    "id" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShopFeatureToggle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShopSetting" (
    "id" TEXT NOT NULL,
    "shopId" TEXT,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShopSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShopInvitation" (
    "id" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "ShopMemberRole" NOT NULL DEFAULT 'STAFF',
    "status" "ShopInvitationStatus" NOT NULL DEFAULT 'PENDING',
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "invitedById" TEXT,
    "acceptedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShopInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShopPayoutPreference" (
    "id" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "method" "ShopPayoutMethod" NOT NULL DEFAULT 'BANK_TRANSFER',
    "accountName" TEXT,
    "accountNumber" TEXT,
    "bankName" TEXT,
    "bankSwift" TEXT,
    "walletProvider" TEXT,
    "walletNumber" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShopPayoutPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShopCommissionLedger" (
    "id" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "orderId" TEXT,
    "orderItemId" TEXT,
    "productId" TEXT,
    "payoutId" TEXT,
    "type" "ShopCommissionLedgerType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EGP',
    "balanceAfter" DOUBLE PRECISION,
    "description" TEXT,
    "reference" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShopCommissionLedger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShopPayout" (
    "id" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EGP',
    "status" "ShopPayoutStatus" NOT NULL DEFAULT 'PENDING',
    "scheduledFor" TIMESTAMP(3),
    "processedAt" TIMESTAMP(3),
    "reference" TEXT,
    "notes" TEXT,
    "preferenceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShopPayout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShopAutomationHook" (
    "id" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "event" "ShopAutomationEvent" NOT NULL,
    "url" TEXT NOT NULL,
    "secret" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "lastTriggeredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShopAutomationHook_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Shop_slug_key" ON "Shop"("slug");

-- CreateIndex
CREATE INDEX "Shop_status_idx" ON "Shop"("status");

-- CreateIndex
CREATE INDEX "ShopMember_shopId_idx" ON "ShopMember"("shopId");

-- CreateIndex
CREATE UNIQUE INDEX "ShopMember_userId_shopId_key" ON "ShopMember"("userId", "shopId");

-- CreateIndex
CREATE INDEX "ShopFeatureToggle_shopId_idx" ON "ShopFeatureToggle"("shopId");

-- CreateIndex
CREATE UNIQUE INDEX "ShopFeatureToggle_shopId_key_key" ON "ShopFeatureToggle"("shopId", "key");

-- CreateIndex
CREATE INDEX "ShopSetting_shopId_idx" ON "ShopSetting"("shopId");

-- CreateIndex
CREATE UNIQUE INDEX "ShopSetting_shopId_key_key" ON "ShopSetting"("shopId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "ShopInvitation_token_key" ON "ShopInvitation"("token");

-- CreateIndex
CREATE INDEX "ShopInvitation_shopId_idx" ON "ShopInvitation"("shopId");

-- CreateIndex
CREATE INDEX "ShopInvitation_email_idx" ON "ShopInvitation"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ShopPayoutPreference_shopId_key" ON "ShopPayoutPreference"("shopId");

-- CreateIndex
CREATE INDEX "ShopCommissionLedger_shopId_idx" ON "ShopCommissionLedger"("shopId");

-- CreateIndex
CREATE INDEX "ShopCommissionLedger_orderId_idx" ON "ShopCommissionLedger"("orderId");

-- CreateIndex
CREATE INDEX "ShopCommissionLedger_orderItemId_idx" ON "ShopCommissionLedger"("orderItemId");

-- CreateIndex
CREATE INDEX "ShopCommissionLedger_payoutId_idx" ON "ShopCommissionLedger"("payoutId");

-- CreateIndex
CREATE INDEX "ShopCommissionLedger_productId_idx" ON "ShopCommissionLedger"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "ShopPayout_reference_key" ON "ShopPayout"("reference");

-- CreateIndex
CREATE INDEX "ShopPayout_shopId_idx" ON "ShopPayout"("shopId");

-- CreateIndex
CREATE INDEX "ShopPayout_status_idx" ON "ShopPayout"("status");

-- CreateIndex
CREATE INDEX "ShopAutomationHook_shopId_idx" ON "ShopAutomationHook"("shopId");

-- CreateIndex
CREATE UNIQUE INDEX "ShopAutomationHook_shopId_event_key" ON "ShopAutomationHook"("shopId", "event");

-- CreateIndex
CREATE INDEX "Order_shopId_idx" ON "Order"("shopId");

-- CreateIndex
CREATE INDEX "Order_shopPayoutId_idx" ON "Order"("shopPayoutId");

-- CreateIndex
CREATE INDEX "Product_shopId_idx" ON "Product"("shopId");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_shopPayoutId_fkey" FOREIGN KEY ("shopPayoutId") REFERENCES "ShopPayout"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shop" ADD CONSTRAINT "Shop_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShopMember" ADD CONSTRAINT "ShopMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShopMember" ADD CONSTRAINT "ShopMember_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShopFeatureToggle" ADD CONSTRAINT "ShopFeatureToggle_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShopSetting" ADD CONSTRAINT "ShopSetting_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShopInvitation" ADD CONSTRAINT "ShopInvitation_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShopInvitation" ADD CONSTRAINT "ShopInvitation_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShopPayoutPreference" ADD CONSTRAINT "ShopPayoutPreference_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShopCommissionLedger" ADD CONSTRAINT "ShopCommissionLedger_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShopCommissionLedger" ADD CONSTRAINT "ShopCommissionLedger_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShopCommissionLedger" ADD CONSTRAINT "ShopCommissionLedger_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShopCommissionLedger" ADD CONSTRAINT "ShopCommissionLedger_payoutId_fkey" FOREIGN KEY ("payoutId") REFERENCES "ShopPayout"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShopCommissionLedger" ADD CONSTRAINT "ShopCommissionLedger_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShopPayout" ADD CONSTRAINT "ShopPayout_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShopPayout" ADD CONSTRAINT "ShopPayout_preferenceId_fkey" FOREIGN KEY ("preferenceId") REFERENCES "ShopPayoutPreference"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShopAutomationHook" ADD CONSTRAINT "ShopAutomationHook_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;
