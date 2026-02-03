import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import {
    PrismaClient,
    Role,
    ShopAutomationEvent,
    ShopCommissionLedgerType,
    ShopInvitationStatus,
    ShopKycStatus,
    ShopMemberRole,
    ShopPayoutMethod,
    ShopPayoutSchedule,
    ShopPayoutStatus,
    ShopStatus,
} from '@prisma/client';
import bcrypt from 'bcryptjs';

const connectionString = process.env.DATABASE_URL!;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const demoShops = [
    {
        id: 'shop_demo_cairo',
        name: 'Cairo Electronics Collective',
        slug: 'cairo-electronics',
        description: 'Flagship hub for high-volume Cairo-based merchants.',
        email: 'cairo@demo-shops.test',
        phone: '+20 100 111 2222',
        address: 'Downtown Cairo, Egypt',
        status: ShopStatus.ACTIVE,
        kycStatus: ShopKycStatus.VERIFIED,
        payoutSchedule: ShopPayoutSchedule.WEEKLY,
        defaultCommissionRate: 12.5,
    },
    {
        id: 'shop_demo_nile',
        name: 'Nile Gadget Partners',
        slug: 'nile-gadgets',
        description: 'Consortium of Delta region accessory vendors.',
        email: 'nile@demo-shops.test',
        phone: '+20 100 333 4444',
        address: 'Alexandria, Egypt',
        status: ShopStatus.ACTIVE,
        kycStatus: ShopKycStatus.SUBMITTED,
        payoutSchedule: ShopPayoutSchedule.BIWEEKLY,
        defaultCommissionRate: 15,
    },
];

const demoUsers = [
    {
        id: 'user_demo_owner',
        email: 'owner@demo-shops.test',
        name: 'Omar Nasser',
        phone: '+20 100 555 0000',
        role: Role.SHOP_OWNER,
    },
    {
        id: 'user_demo_manager',
        email: 'manager@demo-shops.test',
        name: 'Layla Mansour',
        phone: '+20 100 666 0000',
        role: Role.SHOP_STAFF,
    },
    {
        id: 'user_demo_finance',
        email: 'finance@nile-gadgets.test',
        name: 'Karim Fahmy',
        phone: '+20 100 777 0000',
        role: Role.SHOP_STAFF,
    },
];

const demoMemberships = [
    {
        id: 'shop_member_cairo_owner',
        shopSlug: 'cairo-electronics',
        userEmail: 'owner@demo-shops.test',
        role: ShopMemberRole.OWNER,
    },
    {
        id: 'shop_member_cairo_manager',
        shopSlug: 'cairo-electronics',
        userEmail: 'manager@demo-shops.test',
        role: ShopMemberRole.MANAGER,
    },
    {
        id: 'shop_member_nile_finance',
        shopSlug: 'nile-gadgets',
        userEmail: 'finance@nile-gadgets.test',
        role: ShopMemberRole.FINANCE,
    },
];

const demoPayoutPreferences = [
    {
        id: 'shop_pref_cairo',
        shopSlug: 'cairo-electronics',
        method: ShopPayoutMethod.BANK_TRANSFER,
        accountName: 'Cairo Electronics LLC',
        accountNumber: 'EG123456789',
        bankName: 'National Bank of Egypt',
        bankSwift: 'NBEGEGCX',
    },
    {
        id: 'shop_pref_nile',
        shopSlug: 'nile-gadgets',
        method: ShopPayoutMethod.MOBILE_WALLET,
        walletProvider: 'Vodafone Cash',
        walletNumber: '+20 100 333 4444',
    },
];

const demoAutomationHooks = [
    {
        id: 'hook_cairo_orders',
        shopSlug: 'cairo-electronics',
        event: ShopAutomationEvent.ORDER_CREATED,
        url: 'https://webhook.site/cairo-orders',
        secret: 'whsec-cairo-demo',
    },
    {
        id: 'hook_nile_payouts',
        shopSlug: 'nile-gadgets',
        event: ShopAutomationEvent.PAYOUT_QUEUED,
        url: 'https://webhook.site/nile-payouts',
        secret: 'whsec-nile-demo',
    },
];

const demoInvitations = [
    {
        id: 'invite_cairo_buyer',
        shopSlug: 'cairo-electronics',
        invitedByEmail: 'owner@demo-shops.test',
        email: 'ops@cairo-vendors.test',
        role: ShopMemberRole.STAFF,
        token: 'invite-token-cairo-ops',
    },
];

const demoPayouts = [
    {
        id: 'payout_cairo_jan',
        shopSlug: 'cairo-electronics',
        reference: 'PO-CAIRO-2026-01',
        amount: 4200,
        status: ShopPayoutStatus.SCHEDULED,
        scheduledFor: new Date(new Date().setDate(new Date().getDate() + 7)),
        notes: 'Weekly automated payout',
    },
    {
        id: 'payout_nile_jan',
        shopSlug: 'nile-gadgets',
        reference: 'PO-NILE-2026-01',
        amount: 2100,
        status: ShopPayoutStatus.PENDING,
        scheduledFor: new Date(new Date().setDate(new Date().getDate() + 10)),
        notes: 'Bi-weekly disbursement',
    },
];

const demoLedgerEntries = [
    {
        id: 'ledger_cairo_order_1',
        shopSlug: 'cairo-electronics',
        type: ShopCommissionLedgerType.ORDER_EARNING,
        amount: 1800,
        balanceAfter: 1800,
        description: 'Commission from January launch sale',
    },
    {
        id: 'ledger_cairo_payout_hold',
        shopSlug: 'cairo-electronics',
        type: ShopCommissionLedgerType.PAYOUT,
        amount: -4200,
        balanceAfter: -2400,
        payoutReference: 'PO-CAIRO-2026-01',
        description: 'Reserved for upcoming payout',
    },
    {
        id: 'ledger_nile_adjustment',
        shopSlug: 'nile-gadgets',
        type: ShopCommissionLedgerType.ADJUSTMENT,
        amount: 350,
        balanceAfter: 350,
        description: 'Manual credit for launch promotion',
    },
];

const baseProducts = [
    { id: 'hd-1', name: '9.5mm HD Caddy Hard Drive Enclosure Box', price: 45.0, originalPrice: 65.0, rating: 4.5, reviewCount: 234, image: 'https://images.unsplash.com/photo-1724349008551-46ea25dadd5b?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Storage' },
    { id: 'hd-2', name: '12.7mm HD Caddy Hard Drive Enclosure Box', price: 50.0, originalPrice: 70.0, rating: 4.6, reviewCount: 189, image: 'https://images.unsplash.com/photo-1724349008551-46ea25dadd5d?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Storage' },
    { id: 'hd-3', name: '819-C HD Storage Box Enclosure', price: 55.0, originalPrice: null, rating: 4.4, reviewCount: 145, image: 'https://images.unsplash.com/photo-1724349008551-46ea25dadd5b?w=400', isPrime: true, deliveryDate: 'Jan 28', category: 'Storage' },
    { id: 'hd-4', name: '819-USB HD Storage Box with USB Interface', price: 60.0, originalPrice: null, rating: 4.7, reviewCount: 278, image: 'https://images.unsplash.com/photo-1724349008551-46ea25dadd5b?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Storage' },
    { id: 'hd-5', name: '2520U3 USB 3.0 HD Enclosure Box', price: 75.0, originalPrice: 95.0, rating: 4.8, reviewCount: 412, image: 'https://images.unsplash.com/photo-1724349008551-46ea25dadd5b?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Storage' },
    { id: 'hd-6', name: '2520T HD Enclosure Box', price: 70.0, originalPrice: null, rating: 4.5, reviewCount: 198, image: 'https://images.unsplash.com/photo-1724349008551-46ea25dadd5b?w=400', isPrime: true, deliveryDate: 'Jan 29', category: 'Storage' },
    { id: 'hd-7', name: 'US03A HD Storage Box', price: 65.0, originalPrice: null, rating: 4.6, reviewCount: 167, image: 'https://images.unsplash.com/photo-1724349008551-46ea25dadd5b?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Storage' },
    { id: 'cable-1', name: 'USB 2.0 AM to Printer Cable 1.5M Black', price: 25.0, originalPrice: null, rating: 4.3, reviewCount: 567, image: 'https://images.unsplash.com/photo-1760708825913-65a50b3dc39b?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Cables' },
    { id: 'cable-2', name: 'USB 2.0 AM to Printer Cable 3M Black', price: 35.0, originalPrice: null, rating: 4.4, reviewCount: 423, image: 'https://images.unsplash.com/photo-1760708825913-65a50b3dc39b?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Cables' },
    { id: 'cable-3', name: 'USB 2.0 AM to Printer Cable 5M Black', price: 45.0, originalPrice: null, rating: 4.5, reviewCount: 334, image: 'https://images.unsplash.com/photo-1760708825913-65a50b3dc39b?w=400', isPrime: true, deliveryDate: 'Jan 28', category: 'Cables' },
    { id: 'cable-4', name: 'USB 2.0 AM to Printer Cable 10M Black', price: 65.0, originalPrice: 85.0, rating: 4.6, reviewCount: 289, image: 'https://images.unsplash.com/photo-1760708825913-65a50b3dc39b?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Cables' },
    { id: 'cable-5', name: 'USB 2.0 AM to AF Extension Cable 1.5M', price: 20.0, originalPrice: null, rating: 4.4, reviewCount: 678, image: 'https://images.unsplash.com/photo-1760708825913-65a50b3dc39b?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Cables' },
    { id: 'cable-6', name: 'USB 2.0 AM to AF Extension Cable 3M', price: 30.0, originalPrice: null, rating: 4.5, reviewCount: 534, image: 'https://images.unsplash.com/photo-1760708825913-65a50b3dc39b?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Cables' },
    { id: 'cable-7', name: 'USB 2.0 AM to AF Extension Cable 5M', price: 40.0, originalPrice: null, rating: 4.5, reviewCount: 412, image: 'https://images.unsplash.com/photo-1760708825913-65a50b3dc39b?w=400', isPrime: true, deliveryDate: 'Jan 28', category: 'Cables' },
    { id: 'cable-8', name: 'USB 2.0 AM to AF Extension Cable 10M', price: 60.0, originalPrice: 80.0, rating: 4.6, reviewCount: 345, image: 'https://images.unsplash.com/photo-1760708825913-65a50b3dc39b?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Cables' },
    { id: 'cable-9', name: 'HDMI Flat Cable 1.5M Black 1080P', price: 35.0, originalPrice: null, rating: 4.7, reviewCount: 892, image: 'https://images.unsplash.com/photo-1583259034006-5ea8361109e7?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Cables' },
    { id: 'cable-10', name: 'HDMI Flat Cable 3M Black 1080P', price: 50.0, originalPrice: null, rating: 4.7, reviewCount: 756, image: 'https://images.unsplash.com/photo-1583259034006-5ea8361109e7?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Cables' },
    { id: 'cable-11', name: 'HDMI Flat Cable 5M Black 1080P', price: 70.0, originalPrice: 90.0, rating: 4.8, reviewCount: 634, image: 'https://images.unsplash.com/photo-1583259034006-5ea8361109e7?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Cables' },
    { id: 'cable-12', name: 'HDMI Flat Cable 10M Black 1080P', price: 120.0, originalPrice: 150.0, rating: 4.8, reviewCount: 523, image: 'https://images.unsplash.com/photo-1583259034006-5ea8361109e7?w=400', isPrime: true, deliveryDate: 'Jan 28', category: 'Cables' },
    { id: 'cable-13', name: 'HDMI 4K Cable 1.5M Blue Box', price: 55.0, originalPrice: null, rating: 4.9, reviewCount: 1234, image: 'https://images.unsplash.com/photo-1583259034006-5ea8361109e7?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Cables' },
    { id: 'cable-14', name: 'HDMI 4K Cable 3M Blue Box', price: 70.0, originalPrice: null, rating: 4.9, reviewCount: 1087, image: 'https://images.unsplash.com/photo-1583259034006-5ea8361109e7?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Cables' },
    { id: 'cable-15', name: 'HDMI 4K Cable 5M Blue Box', price: 90.0, originalPrice: 120.0, rating: 4.9, reviewCount: 945, image: 'https://images.unsplash.com/photo-1583259034006-5ea8361109e7?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Cables' },
    { id: 'cable-16', name: 'HDMI 4K Cable 10M Blue Box', price: 140.0, originalPrice: 180.0, rating: 4.9, reviewCount: 823, image: 'https://images.unsplash.com/photo-1583259034006-5ea8361109e7?w=400', isPrime: true, deliveryDate: 'Jan 28', category: 'Cables' },
    { id: 'cable-20', name: 'CAT.6 Ethernet Cable 1M Gray', price: 15.0, originalPrice: null, rating: 4.5, reviewCount: 789, image: 'https://images.unsplash.com/photo-1768981342927-5a1c0d998a37?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Cables' },
    { id: 'cable-21', name: 'CAT.6 Ethernet Cable 3M Gray', price: 25.0, originalPrice: null, rating: 4.5, reviewCount: 634, image: 'https://images.unsplash.com/photo-1768981342927-5a1c0d998a37?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Cables' },
    { id: 'cable-22', name: 'CAT.6 Ethernet Cable 5M Gray', price: 35.0, originalPrice: null, rating: 4.6, reviewCount: 523, image: 'https://images.unsplash.com/photo-1768981342927-5a1c0d998a37?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Cables' },
    { id: 'cable-23', name: 'CAT.6 Ethernet Cable 10M Gray', price: 55.0, originalPrice: 75.0, rating: 4.6, reviewCount: 467, image: 'https://images.unsplash.com/photo-1768981342927-5a1c0d998a37?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Cables' },
    { id: 'cable-24', name: 'CAT.6 Ethernet Cable 20M Gray', price: 105.0, originalPrice: 140.0, rating: 4.7, reviewCount: 312, image: 'https://images.unsplash.com/photo-1768981342927-5a1c0d998a37?w=400', isPrime: true, deliveryDate: 'Jan 28', category: 'Cables' },
    { id: 'cable-29', name: 'VGA 3+4 Cable 1.5M', price: 30.0, originalPrice: null, rating: 4.3, reviewCount: 445, image: 'https://images.unsplash.com/photo-1696150874769-ea4f30453c2c?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Cables' },
    { id: 'cable-30', name: 'VGA 3+4 Cable 3M', price: 40.0, originalPrice: null, rating: 4.4, reviewCount: 378, image: 'https://images.unsplash.com/photo-1696150874769-ea4f30453c2c?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Cables' },
    { id: 'cable-33', name: 'DisplayPort to DisplayPort Cable 1.8M', price: 55.0, originalPrice: null, rating: 4.7, reviewCount: 456, image: 'https://images.unsplash.com/photo-1696150874769-ea4f30453c2c?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Cables' },
    { id: 'cable-35', name: 'DisplayPort to HDMI Cable 1.8M', price: 60.0, originalPrice: null, rating: 4.8, reviewCount: 623, image: 'https://images.unsplash.com/photo-1696150874769-ea4f30453c2c?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Cables' },
    { id: 'cable-37', name: 'HDMI to DVI Cable 1.5M', price: 45.0, originalPrice: null, rating: 4.5, reviewCount: 378, image: 'https://images.unsplash.com/photo-1583259034006-5ea8361109e7?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Cables' },
    { id: 'cable-42', name: 'Type-C to HDMI Cable 1.8M 4K', price: 85.0, originalPrice: 115.0, rating: 4.8, reviewCount: 678, image: 'https://images.unsplash.com/photo-1583259034006-5ea8361109e7?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Cables' },
    { id: 'cable-43', name: 'Lightning to HDMI Cable for iPhone', price: 95.0, originalPrice: 125.0, rating: 4.7, reviewCount: 892, image: 'https://images.unsplash.com/photo-1583259034006-5ea8361109e7?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Cables' },
    { id: 'cable-39', name: '3.5mm Audio Cable 1.5M', price: 20.0, originalPrice: null, rating: 4.4, reviewCount: 567, image: 'https://images.unsplash.com/photo-1531492643958-bf0c4c4c441a?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Audio' },
    { id: 'cable-40', name: '3.5mm Audio Cable 3M', price: 30.0, originalPrice: null, rating: 4.5, reviewCount: 445, image: 'https://images.unsplash.com/photo-1531492643958-bf0c4c4c441a?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Audio' },
    { id: 'splitter-1', name: 'HDMI Splitter 1x2 4K', price: 120.0, originalPrice: 160.0, rating: 4.7, reviewCount: 567, image: 'https://images.unsplash.com/photo-1764712749001-3a5694e6db40?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Adapters' },
    { id: 'splitter-2', name: 'HDMI Splitter 1x4 4K', price: 180.0, originalPrice: 240.0, rating: 4.8, reviewCount: 489, image: 'https://images.unsplash.com/photo-1764712749001-3a5694e6db40?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Adapters' },
    { id: 'converter-1', name: 'HDMI to VGA Converter Adapter', price: 65.0, originalPrice: null, rating: 4.5, reviewCount: 678, image: 'https://images.unsplash.com/photo-1696150874769-ea4f30453c2c?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Adapters' },
    { id: 'converter-2', name: 'VGA to HDMI Converter Adapter', price: 75.0, originalPrice: 95.0, rating: 4.6, reviewCount: 534, image: 'https://images.unsplash.com/photo-1696150874769-ea4f30453c2c?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Adapters' },
    { id: 'adapter-1', name: 'USB 2.0 to RJ45 Ethernet Adapter', price: 45.0, originalPrice: null, rating: 4.4, reviewCount: 789, image: 'https://images.unsplash.com/photo-1603899122911-27c0cb85824a?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Adapters' },
    { id: 'adapter-2', name: 'USB 3.0 to RJ45 Gigabit Adapter', price: 65.0, originalPrice: 85.0, rating: 4.7, reviewCount: 923, image: 'https://images.unsplash.com/photo-1603899122911-27c0cb85824a?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Adapters' },
    { id: 'adapter-3', name: 'Type-C to RJ45 Gigabit Adapter', price: 75.0, originalPrice: 95.0, rating: 4.8, reviewCount: 1123, image: 'https://images.unsplash.com/photo-1603899122911-27c0cb85824a?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Adapters' },
    { id: 'mouse-1', name: 'M260 Wired Optical Mouse', price: 35.0, originalPrice: null, rating: 4.5, reviewCount: 1234, image: 'https://images.unsplash.com/photo-1760376789492-de70fab19d94?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Peripherals' },
    { id: 'mouse-2', name: 'R520 Wireless Mouse 2.4GHz', price: 55.0, originalPrice: 75.0, rating: 4.6, reviewCount: 1567, image: 'https://images.unsplash.com/photo-1660491083562-d91a64d6ea9c?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Peripherals' },
    { id: 'mouse-3', name: 'W10 Wireless Gaming Mouse', price: 65.0, originalPrice: 90.0, rating: 4.7, reviewCount: 2123, image: 'https://images.unsplash.com/photo-1660491083562-d91a64d6ea9c?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Peripherals' },
    { id: 'mouse-4', name: 'M185 Portable Wireless Mouse', price: 48.0, originalPrice: null, rating: 4.5, reviewCount: 1876, image: 'https://images.unsplash.com/photo-1660491083562-d91a64d6ea9c?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Peripherals' },
    { id: 'keyboard-1', name: 'CS700 Wired Membrane Keyboard', price: 85.0, originalPrice: 110.0, rating: 4.5, reviewCount: 934, image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Peripherals' },
    { id: 'film-1', name: 'Keyboard Protection Film Transparent', price: 15.0, originalPrice: null, rating: 4.3, reviewCount: 456, image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Peripherals' },
    { id: 'pad-1', name: 'L-16 Stitched Gaming Mouse Pad', price: 45.0, originalPrice: null, rating: 4.6, reviewCount: 1234, image: 'https://images.unsplash.com/photo-1629429408708-3a59f51979c5?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Peripherals' },
    { id: 'pad-2', name: 'X3 Stitched Gaming Mouse Pad', price: 40.0, originalPrice: null, rating: 4.5, reviewCount: 1089, image: 'https://images.unsplash.com/photo-1629429408708-3a59f51979c5?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Peripherals' },
    { id: 'pad-5', name: 'H-8 Stitched Wolf Design Mouse Pad', price: 55.0, originalPrice: null, rating: 4.8, reviewCount: 823, image: 'https://images.unsplash.com/photo-1629429408708-3a59f51979c5?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Peripherals' },
    { id: 'webcam-1', name: 'HD 720P USB Webcam', price: 120.0, originalPrice: 160.0, rating: 4.5, reviewCount: 567, image: 'https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Peripherals' },
    { id: 'webcam-2', name: 'Full HD 1080P USB Webcam', price: 180.0, originalPrice: 240.0, rating: 4.7, reviewCount: 823, image: 'https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Peripherals' },
    { id: 'hub-1', name: 'USB 2.0 4-Port Hub', price: 35.0, originalPrice: null, rating: 4.4, reviewCount: 789, image: 'https://images.unsplash.com/photo-1603899122911-27c0cb85824a?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Hubs' },
    { id: 'hub-2', name: 'USB 3.0 4-Port Hub', price: 55.0, originalPrice: 75.0, rating: 4.6, reviewCount: 934, image: 'https://images.unsplash.com/photo-1603899122911-27c0cb85824a?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Hubs' },
    { id: 'hub-3', name: 'USB 3.0 7-Port Hub with Power', price: 95.0, originalPrice: 125.0, rating: 4.7, reviewCount: 678, image: 'https://images.unsplash.com/photo-1603899122911-27c0cb85824a?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Hubs' },
    { id: 'hub-4', name: 'Type-C to USB 3.0 4-Port Hub', price: 65.0, originalPrice: 85.0, rating: 4.8, reviewCount: 1123, image: 'https://images.unsplash.com/photo-1603899122911-27c0cb85824a?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Hubs' },
    { id: 'reader-1', name: 'USB 2.0 SD/TF Card Reader', price: 25.0, originalPrice: null, rating: 4.4, reviewCount: 567, image: 'https://images.unsplash.com/photo-1603899122911-27c0cb85824a?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Storage' },
    { id: 'reader-2', name: 'USB 3.0 Multi Card Reader', price: 45.0, originalPrice: 60.0, rating: 4.6, reviewCount: 789, image: 'https://images.unsplash.com/photo-1603899122911-27c0cb85824a?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Storage' },
    { id: 'reader-3', name: 'Type-C USB 3.0 SD Card Reader', price: 55.0, originalPrice: 75.0, rating: 4.7, reviewCount: 645, image: 'https://images.unsplash.com/photo-1603899122911-27c0cb85824a?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Storage' },
];

async function seedShops() {
    const map: Record<string, { id: string }> = {};
    for (const shop of demoShops) {
        const record = await prisma.shop.upsert({
            where: { slug: shop.slug },
            update: {
                name: shop.name,
                description: shop.description,
                email: shop.email,
                phone: shop.phone,
                address: shop.address,
                status: shop.status,
                kycStatus: shop.kycStatus,
                payoutSchedule: shop.payoutSchedule,
                defaultCommissionRate: shop.defaultCommissionRate,
            },
            create: {
                id: shop.id,
                name: shop.name,
                slug: shop.slug,
                description: shop.description,
                email: shop.email,
                phone: shop.phone,
                address: shop.address,
                status: shop.status,
                kycStatus: shop.kycStatus,
                payoutSchedule: shop.payoutSchedule,
                defaultCommissionRate: shop.defaultCommissionRate,
                nextPayoutDate: new Date(),
            },
        });
        map[shop.slug] = { id: record.id };
    }
    return map;
}

async function seedUsers() {
    const password = await bcrypt.hash('Password123!', 10);
    const map: Record<string, { id: string }> = {};
    for (const user of demoUsers) {
        const record = await prisma.user.upsert({
            where: { email: user.email },
            update: {
                name: user.name,
                phone: user.phone,
                role: user.role,
            },
            create: {
                id: user.id,
                email: user.email,
                password,
                name: user.name,
                phone: user.phone,
                role: user.role,
                emailVerified: true,
            },
        });
        map[user.email] = { id: record.id };
    }
    return map;
}

async function seedShopMembers(shopMap: Record<string, { id: string }>, userMap: Record<string, { id: string }>) {
    for (const membership of demoMemberships) {
        const shopId = shopMap[membership.shopSlug]?.id;
        const userId = userMap[membership.userEmail]?.id;
        if (!shopId || !userId) continue;

        await prisma.shopMember.upsert({
            where: { userId_shopId: { userId, shopId } },
            update: { role: membership.role },
            create: {
                id: membership.id,
                userId,
                shopId,
                role: membership.role,
            },
        });

        if (membership.role === ShopMemberRole.OWNER) {
            await prisma.shop.update({ where: { id: shopId }, data: { ownerId: userId } });
        }
    }
}

async function seedPayoutPreferences(shopMap: Record<string, { id: string }>) {
    const map: Record<string, { id: string }> = {};
    for (const pref of demoPayoutPreferences) {
        const shopId = shopMap[pref.shopSlug]?.id;
        if (!shopId) continue;

        const record = await prisma.shopPayoutPreference.upsert({
            where: { shopId },
            update: {
                method: pref.method,
                accountName: pref.accountName,
                accountNumber: pref.accountNumber,
                bankName: pref.bankName,
                bankSwift: pref.bankSwift,
                walletProvider: pref.walletProvider,
                walletNumber: pref.walletNumber,
            },
            create: {
                id: pref.id,
                shopId,
                method: pref.method,
                accountName: pref.accountName,
                accountNumber: pref.accountNumber,
                bankName: pref.bankName,
                bankSwift: pref.bankSwift,
                walletProvider: pref.walletProvider,
                walletNumber: pref.walletNumber,
            },
        });
        map[pref.shopSlug] = { id: record.id };
    }
    return map;
}

async function seedAutomationHooks(shopMap: Record<string, { id: string }>) {
    for (const hook of demoAutomationHooks) {
        const shopId = shopMap[hook.shopSlug]?.id;
        if (!shopId) continue;

        await prisma.shopAutomationHook.upsert({
            where: { shopId_event: { shopId, event: hook.event } },
            update: {
                url: hook.url,
                secret: hook.secret,
                enabled: true,
            },
            create: {
                id: hook.id,
                shopId,
                event: hook.event,
                url: hook.url,
                secret: hook.secret,
                enabled: true,
                metadata: { source: 'seed' },
            },
        });
    }
}

async function seedInvitations(shopMap: Record<string, { id: string }>, userMap: Record<string, { id: string }>) {
    for (const invite of demoInvitations) {
        const shopId = shopMap[invite.shopSlug]?.id;
        const invitedById = userMap[invite.invitedByEmail]?.id;
        if (!shopId || !invitedById) continue;

        await prisma.shopInvitation.upsert({
            where: { token: invite.token },
            update: {
                email: invite.email,
                role: invite.role,
                status: ShopInvitationStatus.PENDING,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                invitedById,
            },
            create: {
                id: invite.id,
                shopId,
                email: invite.email,
                role: invite.role,
                status: ShopInvitationStatus.PENDING,
                token: invite.token,
                invitedById,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });
    }
}

async function seedPayouts(
    shopMap: Record<string, { id: string }>,
    preferenceMap: Record<string, { id: string }>,
) {
    const map: Record<string, { id: string }> = {};
    for (const payout of demoPayouts) {
        const shopId = shopMap[payout.shopSlug]?.id;
        if (!shopId) continue;
        const preferenceId = preferenceMap[payout.shopSlug]?.id || null;

        const record = await prisma.shopPayout.upsert({
            where: { reference: payout.reference },
            update: {
                amount: payout.amount,
                status: payout.status,
                scheduledFor: payout.scheduledFor,
                notes: payout.notes,
                preferenceId,
            },
            create: {
                id: payout.id,
                shopId,
                amount: payout.amount,
                status: payout.status,
                scheduledFor: payout.scheduledFor,
                reference: payout.reference,
                notes: payout.notes,
                preferenceId,
            },
        });
        map[payout.reference] = { id: record.id };
    }
    return map;
}

async function seedLedgerEntries(
    shopMap: Record<string, { id: string }>,
    payoutMap: Record<string, { id: string }>,
) {
    for (const entry of demoLedgerEntries) {
        const shopId = shopMap[entry.shopSlug]?.id;
        if (!shopId) continue;
        const payoutId = entry.payoutReference ? payoutMap[entry.payoutReference]?.id || null : null;

        await prisma.shopCommissionLedger.upsert({
            where: { id: entry.id },
            update: {
                amount: entry.amount,
                type: entry.type,
                balanceAfter: entry.balanceAfter,
                description: entry.description,
                payoutId,
            },
            create: {
                id: entry.id,
                shopId,
                amount: entry.amount,
                type: entry.type,
                balanceAfter: entry.balanceAfter,
                description: entry.description,
                payoutId,
            },
        });
    }
}

async function seedProducts(shopMap: Record<string, { id: string }>) {
    console.log('Deleting existing products...');
    await prisma.product.deleteMany();

    const shopIds = Object.values(shopMap);
    const enrichedProducts = baseProducts.map((product, index) => {
        const assignedShop = shopIds.length ? shopIds[index % shopIds.length] : null;
        return {
            ...product,
            shopId: assignedShop?.id,
            commissionRate: assignedShop ? 10 + (index % 5) : null,
            inventoryQuantity: 40 + (index % 6) * 5,
            tracksInventory: true,
        };
    });

    await prisma.product.createMany({ data: enrichedProducts, skipDuplicates: true });
    console.log(`Seeded ${enrichedProducts.length} products`);
}

async function main() {
    console.log('Start seeding multi-tenant demo data...');
    const shopMap = await seedShops();
    const userMap = await seedUsers();
    await seedShopMembers(shopMap, userMap);
    const preferenceMap = await seedPayoutPreferences(shopMap);
    await seedAutomationHooks(shopMap);
    await seedInvitations(shopMap, userMap);
    const payoutMap = await seedPayouts(shopMap, preferenceMap);
    await seedLedgerEntries(shopMap, payoutMap);
    await seedProducts(shopMap);
    console.log('Seeding complete.');
}

main()
    .catch((error) => {
        console.error('Seeding failed:', error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
