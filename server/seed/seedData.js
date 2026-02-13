// server/seed/seedData.js
// Run: cd server && node seed/seedData.js
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Settings = require('../models/Settings');
const Coupon = require('../models/Coupon');

// Original product data from productsData.js
const allProductsData = [
    // --- Women's Products (Brand: Goli) ---
    { Brand: "Goli", id: 1, title: "Stylecast Floral Print Fit & Flare Dress", price: 2309, category: "Women", image_front: "/images/goli/front_1.jpeg", image_back: "/images/goli/back_1.jpeg", Size: ["S", "M", "L", "XL", "XXL"], bodyType: ["Pear", "Rectangle"], occasion: ["Party", "Casual"] },
    { Brand: "Goli", id: 2, title: "Westside Wardrobe Solid Bodycon Dress", price: 1899, category: "Women", image_front: "/images/goli/front_2.jpeg", image_back: "/images/goli/back_2.jpeg", Size: ["S", "M", "L"], bodyType: ["Pear", "Rectangle", "Hourglass"], occasion: ["Party", "Date Night", "Dinner date"] },
    { Brand: "Goli", id: 3, title: "Olive Green Tiered Maxi Dress with Puff Sleeves", price: 999, category: "Women", image_front: "/images/goli/front_3.jpeg", image_back: "/images/goli/back_3.jpeg", Size: ["S", "M", "L", "XL", "XXL", "+Size"], bodyType: ["Pear", "Rectangle", "Apple"], occasion: ["Travel", "Day Outs", "Vacation"] },
    { Brand: "Goli", id: 4, title: "Globus Women Blue Floral V-Neck Waist Tie-Up Belted Tiered Fit & Flare Midi Dress", price: 814, category: "Women", image_front: "/images/goli/front_4.jpeg", image_back: "/images/goli/back_4.jpeg", Size: ["S", "M", "L", "XL"], bodyType: ["Rectangle", "Hourglass"], occasion: ["Casual", "College/School"] },
    { Brand: "Goli", id: 5, title: "DressBerry Top, Blazer & Trousers Co-Ord set", price: 2564, category: "Women", image_front: "/images/goli/front_5.jpeg", image_back: "/images/goli/back_5.jpeg", Size: ["M", "L", "XL"], bodyType: ["Apple", "Inverted Triangle"], occasion: ["Professional", "Formal"] },
    { Brand: "Goli", id: 6, title: "Zipper Sports Dress", price: 1181, category: "Women", image_front: "/images/goli/front_6.jpeg", image_back: "/images/goli/back_6.jpeg", Size: ["M", "L", "XL"], bodyType: ["Apple", "Hourglass", "Pear"], occasion: ["Fitness", "Gym", "Sports"] },
    { Brand: "Goli", id: 7, title: "Snug-Fit High Rise Active Skirt with Attached Tights in Black", price: 1181, category: "Women", image_front: "/images/goli/front_7.jpeg", image_back: "/images/goli/back_7.jpeg", Size: ["M", "L", "XL", "XXL"], bodyType: ["Rectangle", "Hourglass"], occasion: ["Fitness", "Gym", "Sports"] },
    { Brand: "Goli", id: 8, title: "Burgundy Maroon Foil Print Rayon Long Anarkali Dress", price: 567, category: "Women", image_front: "/images/goli/front_8.jpeg", image_back: "/images/goli/back_8.jpeg", Size: ["S", "M", "L", "XL"], bodyType: ["Apple", "Rectangle", "Pear"], occasion: ["Casual", "Day Outs", "Party"] },
    { Brand: "Goli", id: 9, title: "Anarkali Gown-Digital Printed Pure Jimmy Organza Gown", price: 1999, category: "Women", image_front: "/images/goli/front_9.jpeg", image_back: "/images/goli/back_9.jpeg", Size: ["S", "M", "L", "XL", "XXL"], bodyType: ["Rectangle", "Hourglass", "Pear", "Apple"], occasion: ["Traditional", "Party"] },
    { Brand: "Goli", id: 10, title: "Classic Contrast Forest Green Blouse & Wine Red Maxi Skirt", price: 3509, category: "Women", image_front: "/images/goli/front_10.jpeg", image_back: "/images/goli/back_10.jpeg", Size: ["S", "M", "L", "XL", "XXL"], bodyType: ["Rectangle", "Pear", "Apple", "Inverted Triangle", "Hourglass"], occasion: ["Traditional", "Party"] },
    { Brand: "Goli", id: 11, title: "Boho Chic Embroidered Crop & Skirt Co-ord Set", price: 2159, category: "Women", image_front: "/images/goli/front_11.jpeg", image_back: "/images/goli/back_11.jpeg", Size: ["S", "M", "L", "XL"], bodyType: ["Rectangle", "Pear", "Apple", "Inverted Triangle", "Hourglass"], occasion: ["Travel", "Getaways", "Fusion Events"] },
    { Brand: "Goli", id: 12, title: "Boho Babe: Smocked Tube Top with High-Waisted Trousers", price: 3509, category: "Women", image_front: "/images/goli/front_12.jpeg", image_back: "/images/goli/back_12.jpeg", Size: ["S", "M", "L", "XL", "XXL"], bodyType: ["Inverted Triangle", "Pear", "Apple", "Hourglass", "Rectangle"], occasion: ["Travel", "Getaways"] },
    { Brand: "Goli", id: 13, title: "Tropical Block-Print Maxi Dress", price: 1952, category: "Women", image_front: "/images/goli/front_13.jpeg", image_back: "/images/goli/back_13.jpeg", Size: ["S", "M", "L", "XL", "XXL"], bodyType: ["Rectangle", "Pear", "Apple", "Hourglass"], occasion: ["Travel", "Getaways", "Casual Outings"] },
    { Brand: "Goli", id: 14, title: "Maroon Black Tie-Up Square Neck Mini Skater Dress", price: 4826, category: "Women", image_front: "/images/goli/front_14.jpeg", image_back: "/images/goli/back_14.jpeg", Size: ["S", "M", "L"], bodyType: ["Rectangle", "Pear", "Hourglass"], occasion: ["Night Parties/Clubbing", "Date Night"] },
    { Brand: "Goli", id: 15, title: "Steel Blue Strapless Ruched Bodycon Midi Dress with Front Slit", price: 4129, category: "Women", image_front: "/images/goli/front_15.jpeg", image_back: "/images/goli/back_15.jpeg", Size: ["S", "M", "L"], bodyType: ["Hourglass", "Rectangle", "Inverted Triangle", "Pear"], occasion: ["Clubbing", "Romantic Dinners"] },
    { Brand: "Goli", id: 16, title: "Chic Chocolate Brown Power Suit with Beige Inner Top", price: 3899, category: "Women", image_front: "/images/goli/front_16.jpeg", image_back: "/images/goli/back_16.jpeg", Size: ["S", "M", "L", "XL", "XXL"], bodyType: ["Rectangle", "Pear", "Inverted Triangle", "Hourglass"], occasion: ["Professional", "Formal Meetups", "Office wear"] },
    { Brand: "Goli", id: 17, title: "Vibrant Floral Lehenga with Elegant Crop Blouse and Dupatta", price: 4999, category: "Women", image_front: "/images/goli/front_17.jpeg", image_back: "/images/goli/back_17.jpeg", Size: ["S", "M", "L", "XL", "XXL"], bodyType: ["Rectangle", "Pear", "Apple", "Hourglass"], occasion: ["Traditional", "Festivals", "Family Celebrations", "Weddings"] },
    { Brand: "Goli", id: 18, title: "Wide-Leg Denim Jeans", price: 1999, category: "Women", image_front: "/images/goli/front_18.jpeg", image_back: "/images/goli/back_18.jpeg", Size: ["S", "M", "L", "XL", "XXL"], bodyType: ["Rectangle", "Pear", "Apple", "Hourglass"], occasion: ["Casual", "Weekend Outings", "Brunch"] },
    { Brand: "Goli", id: 19, title: "Regal Yellow and Blue Half Saree with Embellished Blouse and Dupatta", price: 6591, category: "Women", image_front: "/images/goli/front_19.jpeg", image_back: "/images/goli/back_19.jpeg", Size: ["S", "M", "L", "XL", "XXL"], bodyType: ["Pear", "Apple", "Hourglass"], occasion: ["Traditional", "Weddings", "Festivals"] },
    { Brand: "Goli", id: 20, title: "Blush Elegance: Soft Pink Crop Top with Layered Net Lehenga", price: 3198, category: "Women", image_front: "/images/goli/front_20.jpeg", image_back: "/images/goli/back_20.jpeg", Size: ["S", "M", "L", "XL", "XXL"], bodyType: ["Rectangle", "Pear", "Hourglass"], occasion: ["Festivals", "Engagements", "Photoshoots"] },
    // --- Men's Products (Brand: Tan) ---
    { Brand: "Tan", id: 21, title: "Textured Knit Polo Shirt for Men", price: 499, category: "Men", image_front: "/images/tan/front_1.jpeg", image_back: "/images/tan/back_1.jpeg", Size: ["S", "M", "L", "XL", "XXL"], bodyType: ["Slim Build", "Muscular Build", "Broader Build"], occasion: ["Traditional", "Festivals", "Family Celebrations"] },
    { Brand: "Tan", id: 22, title: "Beige Corduroy Co-Ord Set With White Tee", price: 999, category: "Men", image_front: "/images/tan/front_2.jpeg", image_back: "/images/tan/back_2.jpeg", Size: ["S", "M", "L", "XL", "XXL"], bodyType: ["Slim Build", "Muscular Build", "Broader Build"], occasion: ["Casual", "Meetups", "Travel"] },
    { Brand: "Tan", id: 23, title: "Relaxed Sky Blue Open Collar Shirt with Dark Cargo Jeans", price: 6453, category: "Men", image_front: "/images/tan/front_3.jpeg", image_back: "/images/tan/back_3.jpeg", Size: ["M", "L", "XL", "XXL"], bodyType: ["Slim Build", "Muscular Build", "Broader Build"], occasion: ["Casual", "Weekend Outings", "Vacation"] },
    { Brand: "Tan", id: 24, title: "Sleek Black Embroidered Shirt with Geometric Deer Design", price: 499, category: "Men", image_front: "/images/tan/front_4.jpeg", image_back: "/images/tan/back_4.jpeg", Size: ["S", "M", "L", "XL", "XXL"], bodyType: ["Slim Build", "Muscular Build", "Broader Build"], occasion: ["Date Night", "Festivals", "Evening Parties"] },
    { Brand: "Tan", id: 25, title: "Black Party Shirt with Metallic Geometric Detailing", price: 3874, category: "Men", image_front: "/images/tan/front_5.jpeg", image_back: "/images/tan/back_5.jpeg", Size: ["S", "M", "L", "XL"], bodyType: ["Slim Build", "Muscular Build", "Broader Build"], occasion: ["Date Night", "Festivals", "Evening Parties"] },
    { Brand: "Tan", id: 26, title: "Traditional Cream and Gold-Bordered Dhoti Ensemble", price: 879, category: "Men", image_front: "/images/tan/front_6.jpeg", image_back: "/images/tan/back_6.jpeg", Size: ["S", "M", "L", "XL", "XXL"], bodyType: ["Slim Build", "Muscular Build", "Broader Build"], occasion: ["Traditional", "Festivals"] },
    { Brand: "Tan", id: 27, title: "Textured White Shirt", price: 2992, category: "Men", image_front: "/images/tan/front_7.jpeg", image_back: "/images/tan/back_7.jpeg", Size: ["S", "M", "L", "XL"], bodyType: ["Slim Build", "Muscular Build", "Broader Build"], occasion: ["Date Night", "Beach or Resort", "Evening Parties"] },
    { Brand: "Tan", id: 28, title: "Elegant White Traditional set with Gold Zari Detailing", price: 1987, category: "Men", image_front: "/images/tan/front_8.jpeg", image_back: "/images/tan/back_8.jpeg", Size: ["S", "M", "L", "XL", "XXL"], bodyType: ["Slim Build", "Muscular Build", "Broader Build"], occasion: ["Weddings", "Festivals", "Temple wear"] },
    { Brand: "Tan", id: 29, title: "Casual Brown Textured Shirt", price: 1874, category: "Men", image_front: "/images/tan/front_9.jpeg", image_back: "/images/tan/back_9.jpeg", Size: ["S", "M", "L", "XL"], bodyType: ["Slim Build", "Muscular Build", "Broader Build"], occasion: ["Date Night", "Casual", "Evening Parties", "Travel"] },
    { Brand: "Tan", id: 30, title: "Soft Blue Textured Casual Shirt", price: 2974, category: "Men", image_front: "/images/tan/front_10.jpeg", image_back: "/images/tan/back_10.jpeg", Size: ["S", "M", "L", "XL"], bodyType: ["Slim Build", "Muscular Build", "Broader Build"], occasion: ["Casual", "Vacation", "Evening Parties", "Meetups"] }
];

const seedDatabase = async () => {
    try {
        await connectDB();

        console.log('🗑️  Clearing existing data...');
        await Promise.all([
            User.deleteMany({}),
            Category.deleteMany({}),
            Product.deleteMany({}),
            Settings.deleteMany({}),
            Coupon.deleteMany({})
        ]);

        // Create admin user
        console.log('👤 Creating admin user...');
        const admin = await User.create({
            name: 'Admin',
            email: 'admin@vibepick.com',
            password: 'admin123',
            role: 'admin'
        });
        console.log(`   ✅ Admin: admin@vibepick.com / admin123`);

        // Create test customer
        const customer = await User.create({
            name: 'Test User',
            email: 'user@vibepick.com',
            password: 'user123',
            role: 'customer',
            addresses: [{
                fullName: 'Test User',
                phone: '9876543210',
                addressLine1: '123 Test Street',
                city: 'Mumbai',
                state: 'Maharashtra',
                pincode: '400001',
                isDefault: true
            }]
        });
        console.log(`   ✅ Customer: user@vibepick.com / user123`);

        // Create categories
        console.log('📂 Creating categories...');
        const womenCat = await Category.create({
            name: 'Women',
            description: 'Women\'s fashion and clothing',
            subcategories: [
                { name: 'Dresses' },
                { name: 'Co-Ord Sets' },
                { name: 'Traditional' },
                { name: 'Active Wear' },
                { name: 'Jeans' }
            ]
        });

        const menCat = await Category.create({
            name: 'Men',
            description: 'Men\'s fashion and clothing',
            subcategories: [
                { name: 'Shirts' },
                { name: 'Co-Ord Sets' },
                { name: 'Traditional' }
            ]
        });
        console.log('   ✅ Categories: Women, Men');

        // Create products
        console.log('📦 Seeding products...');
        const categoryMap = { Women: womenCat._id, Men: menCat._id };

        const products = [];
        for (const p of allProductsData) {
            const product = await Product.create({
                title: p.title,
                description: `${p.title} by ${p.Brand}. Perfect for ${p.occasion.join(', ')}.`,
                price: p.price,
                category: categoryMap[p.category],
                brand: p.Brand,
                images: [
                    { url: p.image_front, alt: `${p.title} - Front` },
                    { url: p.image_back, alt: `${p.title} - Back` }
                ],
                sizes: p.Size,
                stock: Math.floor(Math.random() * 50) + 10, // 10-60 random stock
                bodyType: p.bodyType,
                occasion: p.occasion,
                sku: `VP-${p.Brand.toUpperCase().slice(0, 3)}-${String(p.id).padStart(4, '0')}`,
                isFeatured: p.id <= 4 || p.id === 21 || p.id === 22, // First few as featured
                isTrending: p.id >= 14 && p.id <= 17 || p.id >= 25  // Some as trending
            });
            products.push(product);
        }
        console.log(`   ✅ ${products.length} products seeded`);

        // Create sample coupons
        console.log('🎟️  Creating sample coupons...');
        await Coupon.create([
            {
                code: 'WELCOME10',
                discountType: 'percent',
                discountValue: 10,
                minPurchase: 500,
                maxDiscount: 200,
                validUntil: new Date('2027-12-31'),
                usageLimit: 1000
            },
            {
                code: 'FLAT500',
                discountType: 'fixed',
                discountValue: 500,
                minPurchase: 2000,
                validUntil: new Date('2027-12-31'),
                usageLimit: 500
            }
        ]);
        console.log('   ✅ Coupons: WELCOME10 (10% off), FLAT500 (₹500 off)');

        // Create default settings
        console.log('⚙️  Creating default settings...');
        await Settings.create({
            siteName: 'AURA Maniac',
            tagline: 'Unleash Your Style.',
            logo: '/images/logo.svg',
            contactEmail: 'contact@auramaniac.com',
            contactPhone: '+91 95427 84604',
            companyName: 'AURA Maniac Fashions Pvt. Ltd.',
            companyAddress: 'Hyderabad, Telangana — 500081',
            gstNumber: '36AAECV0000A1Z0',
            homepageSections: {
                heroTitle: 'Fresh Fashion Finds',
                heroSubtitle: 'New Collection',
                heroCta: 'Unleash Your Style.',
                showFeatured: true,
                showTrending: true,
                showCategories: true,
                showTestimonials: true,
                showNewsletter: true
            },
            freeShippingAbove: 999,
            shippingCharge: 99
        });
        console.log('   ✅ Default settings created');

        console.log('\n🎉 Database seeded successfully!');
        console.log('\n📋 Quick reference:');
        console.log('   Admin login: admin@vibepick.com / admin123');
        console.log('   Customer login: user@vibepick.com / user123');
        console.log('   Coupon codes: WELCOME10, FLAT500');

        process.exit(0);
    } catch (error) {
        console.error('❌ Seed error:', error);
        process.exit(1);
    }
};

seedDatabase();
