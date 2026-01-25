import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const connectionString = process.env.DATABASE_URL!;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const products = [
    // HD BOX Products - Caddies
    { id: 'hd-1', name: '9.5mm HD Caddy Hard Drive Enclosure Box', price: 45.00, originalPrice: 65.00, rating: 4.5, reviewCount: 234, image: 'https://images.unsplash.com/photo-1724349008551-46ea25dadd5b?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Storage' },
    { id: 'hd-2', name: '12.7mm HD Caddy Hard Drive Enclosure Box', price: 50.00, originalPrice: 70.00, rating: 4.6, reviewCount: 189, image: 'https://images.unsplash.com/photo-1724349008551-46ea25dadd5b?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Storage' },
    { id: 'hd-3', name: '819-C HD Storage Box Enclosure', price: 55.00, originalPrice: null, rating: 4.4, reviewCount: 145, image: 'https://images.unsplash.com/photo-1724349008551-46ea25dadd5b?w=400', isPrime: true, deliveryDate: 'Jan 28', category: 'Storage' },
    { id: 'hd-4', name: '819-USB HD Storage Box with USB Interface', price: 60.00, originalPrice: null, rating: 4.7, reviewCount: 278, image: 'https://images.unsplash.com/photo-1724349008551-46ea25dadd5b?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Storage' },
    { id: 'hd-5', name: '2520U3 USB 3.0 HD Enclosure Box', price: 75.00, originalPrice: 95.00, rating: 4.8, reviewCount: 412, image: 'https://images.unsplash.com/photo-1724349008551-46ea25dadd5b?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Storage' },
    { id: 'hd-6', name: '2520T HD Enclosure Box', price: 70.00, originalPrice: null, rating: 4.5, reviewCount: 198, image: 'https://images.unsplash.com/photo-1724349008551-46ea25dadd5b?w=400', isPrime: true, deliveryDate: 'Jan 29', category: 'Storage' },
    { id: 'hd-7', name: 'US03A HD Storage Box', price: 65.00, originalPrice: null, rating: 4.6, reviewCount: 167, image: 'https://images.unsplash.com/photo-1724349008551-46ea25dadd5b?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Storage' },

    // USB CABLES
    { id: 'cable-1', name: 'USB 2.0 AM to Printer Cable 1.5M Black', price: 25.00, originalPrice: null, rating: 4.3, reviewCount: 567, image: 'https://images.unsplash.com/photo-1760708825913-65a50b3dc39b?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Cables' },
    { id: 'cable-2', name: 'USB 2.0 AM to Printer Cable 3M Black', price: 35.00, originalPrice: null, rating: 4.4, reviewCount: 423, image: 'https://images.unsplash.com/photo-1760708825913-65a50b3dc39b?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Cables' },
    { id: 'cable-3', name: 'USB 2.0 AM to Printer Cable 5M Black', price: 45.00, originalPrice: null, rating: 4.5, reviewCount: 334, image: 'https://images.unsplash.com/photo-1760708825913-65a50b3dc39b?w=400', isPrime: true, deliveryDate: 'Jan 28', category: 'Cables' },
    { id: 'cable-4', name: 'USB 2.0 AM to Printer Cable 10M Black', price: 65.00, originalPrice: 85.00, rating: 4.6, reviewCount: 289, image: 'https://images.unsplash.com/photo-1760708825913-65a50b3dc39b?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Cables' },
    { id: 'cable-5', name: 'USB 2.0 AM to AF Extension Cable 1.5M', price: 20.00, originalPrice: null, rating: 4.4, reviewCount: 678, image: 'https://images.unsplash.com/photo-1760708825913-65a50b3dc39b?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Cables' },
    { id: 'cable-6', name: 'USB 2.0 AM to AF Extension Cable 3M', price: 30.00, originalPrice: null, rating: 4.5, reviewCount: 534, image: 'https://images.unsplash.com/photo-1760708825913-65a50b3dc39b?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Cables' },
    { id: 'cable-7', name: 'USB 2.0 AM to AF Extension Cable 5M', price: 40.00, originalPrice: null, rating: 4.5, reviewCount: 412, image: 'https://images.unsplash.com/photo-1760708825913-65a50b3dc39b?w=400', isPrime: true, deliveryDate: 'Jan 28', category: 'Cables' },
    { id: 'cable-8', name: 'USB 2.0 AM to AF Extension Cable 10M', price: 60.00, originalPrice: 80.00, rating: 4.6, reviewCount: 345, image: 'https://images.unsplash.com/photo-1760708825913-65a50b3dc39b?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Cables' },

    // HDMI Cables
    { id: 'cable-9', name: 'HDMI Flat Cable 1.5M Black 1080P', price: 35.00, originalPrice: null, rating: 4.7, reviewCount: 892, image: 'https://images.unsplash.com/photo-1583259034006-5ea8361109e7?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Cables' },
    { id: 'cable-10', name: 'HDMI Flat Cable 3M Black 1080P', price: 50.00, originalPrice: null, rating: 4.7, reviewCount: 756, image: 'https://images.unsplash.com/photo-1583259034006-5ea8361109e7?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Cables' },
    { id: 'cable-11', name: 'HDMI Flat Cable 5M Black 1080P', price: 70.00, originalPrice: 90.00, rating: 4.8, reviewCount: 634, image: 'https://images.unsplash.com/photo-1583259034006-5ea8361109e7?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Cables' },
    { id: 'cable-12', name: 'HDMI Flat Cable 10M Black 1080P', price: 120.00, originalPrice: 150.00, rating: 4.8, reviewCount: 523, image: 'https://images.unsplash.com/photo-1583259034006-5ea8361109e7?w=400', isPrime: true, deliveryDate: 'Jan 28', category: 'Cables' },
    { id: 'cable-13', name: 'HDMI 4K Cable 1.5M Blue Box', price: 55.00, originalPrice: null, rating: 4.9, reviewCount: 1234, image: 'https://images.unsplash.com/photo-1583259034006-5ea8361109e7?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Cables' },
    { id: 'cable-14', name: 'HDMI 4K Cable 3M Blue Box', price: 70.00, originalPrice: null, rating: 4.9, reviewCount: 1087, image: 'https://images.unsplash.com/photo-1583259034006-5ea8361109e7?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Cables' },
    { id: 'cable-15', name: 'HDMI 4K Cable 5M Blue Box', price: 90.00, originalPrice: 120.00, rating: 4.9, reviewCount: 945, image: 'https://images.unsplash.com/photo-1583259034006-5ea8361109e7?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Cables' },
    { id: 'cable-16', name: 'HDMI 4K Cable 10M Blue Box', price: 140.00, originalPrice: 180.00, rating: 4.9, reviewCount: 823, image: 'https://images.unsplash.com/photo-1583259034006-5ea8361109e7?w=400', isPrime: true, deliveryDate: 'Jan 28', category: 'Cables' },

    // Ethernet Cables
    { id: 'cable-20', name: 'CAT.6 Ethernet Cable 1M Gray', price: 15.00, originalPrice: null, rating: 4.5, reviewCount: 789, image: 'https://images.unsplash.com/photo-1768981342927-5a1c0d998a37?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Cables' },
    { id: 'cable-21', name: 'CAT.6 Ethernet Cable 3M Gray', price: 25.00, originalPrice: null, rating: 4.5, reviewCount: 634, image: 'https://images.unsplash.com/photo-1768981342927-5a1c0d998a37?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Cables' },
    { id: 'cable-22', name: 'CAT.6 Ethernet Cable 5M Gray', price: 35.00, originalPrice: null, rating: 4.6, reviewCount: 523, image: 'https://images.unsplash.com/photo-1768981342927-5a1c0d998a37?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Cables' },
    { id: 'cable-23', name: 'CAT.6 Ethernet Cable 10M Gray', price: 55.00, originalPrice: 75.00, rating: 4.6, reviewCount: 467, image: 'https://images.unsplash.com/photo-1768981342927-5a1c0d998a37?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Cables' },
    { id: 'cable-24', name: 'CAT.6 Ethernet Cable 20M Gray', price: 105.00, originalPrice: 140.00, rating: 4.7, reviewCount: 312, image: 'https://images.unsplash.com/photo-1768981342927-5a1c0d998a37?w=400', isPrime: true, deliveryDate: 'Jan 28', category: 'Cables' },

    // VGA Cables
    { id: 'cable-29', name: 'VGA 3+4 Cable 1.5M', price: 30.00, originalPrice: null, rating: 4.3, reviewCount: 445, image: 'https://images.unsplash.com/photo-1696150874769-ea4f30453c2c?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Cables' },
    { id: 'cable-30', name: 'VGA 3+4 Cable 3M', price: 40.00, originalPrice: null, rating: 4.4, reviewCount: 378, image: 'https://images.unsplash.com/photo-1696150874769-ea4f30453c2c?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Cables' },
    { id: 'cable-33', name: 'DisplayPort to DisplayPort Cable 1.8M', price: 55.00, originalPrice: null, rating: 4.7, reviewCount: 456, image: 'https://images.unsplash.com/photo-1696150874769-ea4f30453c2c?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Cables' },
    { id: 'cable-35', name: 'DisplayPort to HDMI Cable 1.8M', price: 60.00, originalPrice: null, rating: 4.8, reviewCount: 623, image: 'https://images.unsplash.com/photo-1696150874769-ea4f30453c2c?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Cables' },
    { id: 'cable-37', name: 'HDMI to DVI Cable 1.5M', price: 45.00, originalPrice: null, rating: 4.5, reviewCount: 378, image: 'https://images.unsplash.com/photo-1583259034006-5ea8361109e7?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Cables' },
    { id: 'cable-42', name: 'Type-C to HDMI Cable 1.8M 4K', price: 85.00, originalPrice: 115.00, rating: 4.8, reviewCount: 678, image: 'https://images.unsplash.com/photo-1583259034006-5ea8361109e7?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Cables' },
    { id: 'cable-43', name: 'Lightning to HDMI Cable for iPhone', price: 95.00, originalPrice: 125.00, rating: 4.7, reviewCount: 892, image: 'https://images.unsplash.com/photo-1583259034006-5ea8361109e7?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Cables' },

    // Audio Cables
    { id: 'cable-39', name: '3.5mm Audio Cable 1.5M', price: 20.00, originalPrice: null, rating: 4.4, reviewCount: 567, image: 'https://images.unsplash.com/photo-1531492643958-bf0c4c4c441a?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Audio' },
    { id: 'cable-40', name: '3.5mm Audio Cable 3M', price: 30.00, originalPrice: null, rating: 4.5, reviewCount: 445, image: 'https://images.unsplash.com/photo-1531492643958-bf0c4c4c441a?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Audio' },

    // Splitters & Adapters
    { id: 'splitter-1', name: 'HDMI Splitter 1x2 4K', price: 120.00, originalPrice: 160.00, rating: 4.7, reviewCount: 567, image: 'https://images.unsplash.com/photo-1764712749001-3a5694e6db40?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Adapters' },
    { id: 'splitter-2', name: 'HDMI Splitter 1x4 4K', price: 180.00, originalPrice: 240.00, rating: 4.8, reviewCount: 489, image: 'https://images.unsplash.com/photo-1764712749001-3a5694e6db40?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Adapters' },
    { id: 'converter-1', name: 'HDMI to VGA Converter Adapter', price: 65.00, originalPrice: null, rating: 4.5, reviewCount: 678, image: 'https://images.unsplash.com/photo-1696150874769-ea4f30453c2c?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Adapters' },
    { id: 'converter-2', name: 'VGA to HDMI Converter Adapter', price: 75.00, originalPrice: 95.00, rating: 4.6, reviewCount: 534, image: 'https://images.unsplash.com/photo-1696150874769-ea4f30453c2c?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Adapters' },
    { id: 'adapter-1', name: 'USB 2.0 to RJ45 Ethernet Adapter', price: 45.00, originalPrice: null, rating: 4.4, reviewCount: 789, image: 'https://images.unsplash.com/photo-1603899122911-27c0cb85824a?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Adapters' },
    { id: 'adapter-2', name: 'USB 3.0 to RJ45 Gigabit Adapter', price: 65.00, originalPrice: 85.00, rating: 4.7, reviewCount: 923, image: 'https://images.unsplash.com/photo-1603899122911-27c0cb85824a?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Adapters' },
    { id: 'adapter-3', name: 'Type-C to RJ45 Gigabit Adapter', price: 75.00, originalPrice: 95.00, rating: 4.8, reviewCount: 1123, image: 'https://images.unsplash.com/photo-1603899122911-27c0cb85824a?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Adapters' },

    // Mice
    { id: 'mouse-1', name: 'M260 Wired Optical Mouse', price: 35.00, originalPrice: null, rating: 4.5, reviewCount: 1234, image: 'https://images.unsplash.com/photo-1760376789492-de70fab19d94?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Peripherals' },
    { id: 'mouse-2', name: 'R520 Wireless Mouse 2.4GHz', price: 55.00, originalPrice: 75.00, rating: 4.6, reviewCount: 1567, image: 'https://images.unsplash.com/photo-1660491083562-d91a64d6ea9c?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Peripherals' },
    { id: 'mouse-3', name: 'W10 Wireless Gaming Mouse', price: 65.00, originalPrice: 90.00, rating: 4.7, reviewCount: 2123, image: 'https://images.unsplash.com/photo-1660491083562-d91a64d6ea9c?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Peripherals' },
    { id: 'mouse-4', name: 'M185 Portable Wireless Mouse', price: 48.00, originalPrice: null, rating: 4.5, reviewCount: 1876, image: 'https://images.unsplash.com/photo-1660491083562-d91a64d6ea9c?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Peripherals' },

    // Keyboards
    { id: 'keyboard-1', name: 'CS700 Wired Membrane Keyboard', price: 85.00, originalPrice: 110.00, rating: 4.5, reviewCount: 934, image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Peripherals' },
    { id: 'film-1', name: 'Keyboard Protection Film Transparent', price: 15.00, originalPrice: null, rating: 4.3, reviewCount: 456, image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Peripherals' },

    // Mouse Pads
    { id: 'pad-1', name: 'L-16 Stitched Gaming Mouse Pad', price: 45.00, originalPrice: null, rating: 4.6, reviewCount: 1234, image: 'https://images.unsplash.com/photo-1629429408708-3a59f51979c5?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Peripherals' },
    { id: 'pad-2', name: 'X3 Stitched Gaming Mouse Pad', price: 40.00, originalPrice: null, rating: 4.5, reviewCount: 1089, image: 'https://images.unsplash.com/photo-1629429408708-3a59f51979c5?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Peripherals' },
    { id: 'pad-5', name: 'H-8 Stitched Wolf Design Mouse Pad', price: 55.00, originalPrice: null, rating: 4.8, reviewCount: 823, image: 'https://images.unsplash.com/photo-1629429408708-3a59f51979c5?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Peripherals' },

    // Webcams
    { id: 'webcam-1', name: 'HD 720P USB Webcam', price: 120.00, originalPrice: 160.00, rating: 4.5, reviewCount: 567, image: 'https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Peripherals' },
    { id: 'webcam-2', name: 'Full HD 1080P USB Webcam', price: 180.00, originalPrice: 240.00, rating: 4.7, reviewCount: 823, image: 'https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Peripherals' },

    // Hubs
    { id: 'hub-1', name: 'USB 2.0 4-Port Hub', price: 35.00, originalPrice: null, rating: 4.4, reviewCount: 789, image: 'https://images.unsplash.com/photo-1603899122911-27c0cb85824a?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Hubs' },
    { id: 'hub-2', name: 'USB 3.0 4-Port Hub', price: 55.00, originalPrice: 75.00, rating: 4.6, reviewCount: 934, image: 'https://images.unsplash.com/photo-1603899122911-27c0cb85824a?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Hubs' },
    { id: 'hub-3', name: 'USB 3.0 7-Port Hub with Power', price: 95.00, originalPrice: 125.00, rating: 4.7, reviewCount: 678, image: 'https://images.unsplash.com/photo-1603899122911-27c0cb85824a?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Hubs' },
    { id: 'hub-4', name: 'Type-C to USB 3.0 4-Port Hub', price: 65.00, originalPrice: 85.00, rating: 4.8, reviewCount: 1123, image: 'https://images.unsplash.com/photo-1603899122911-27c0cb85824a?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Hubs' },

    // Card Readers
    { id: 'reader-1', name: 'USB 2.0 SD/TF Card Reader', price: 25.00, originalPrice: null, rating: 4.4, reviewCount: 567, image: 'https://images.unsplash.com/photo-1603899122911-27c0cb85824a?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Storage' },
    { id: 'reader-2', name: 'USB 3.0 Multi Card Reader', price: 45.00, originalPrice: 60.00, rating: 4.6, reviewCount: 789, image: 'https://images.unsplash.com/photo-1603899122911-27c0cb85824a?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Storage' },
    { id: 'reader-3', name: 'Type-C USB 3.0 SD Card Reader', price: 55.00, originalPrice: 75.00, rating: 4.7, reviewCount: 645, image: 'https://images.unsplash.com/photo-1603899122911-27c0cb85824a?w=400', isPrime: true, deliveryDate: 'Tomorrow', category: 'Storage' },
];

async function main() {
    console.log('Start seeding...');

    // Delete existing products
    await prisma.product.deleteMany();
    console.log('Deleted existing products');

    // Create products
    for (const product of products) {
        await prisma.product.create({
            data: product,
        });
    }

    console.log(`Seeded ${products.length} products`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
