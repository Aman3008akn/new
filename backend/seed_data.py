import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def seed_database():
    # Connect to MongoDB
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    db_name = os.environ.get('DB_NAME', 'ecommerce_db')
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    print("Starting database seeding...")
    
    # Create Super Admin User
    admin_email = "admin@swiftcommerce.com"
    existing_admin = await db.users.find_one({"email": admin_email})
    
    if not existing_admin:
        admin_user = {
            "id": "admin-001",
            "email": admin_email,
            "full_name": "Super Admin",
            "phone": "+1234567890",
            "role": "super_admin",
            "hashed_password": pwd_context.hash("admin123"),
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "last_login": None
        }
        await db.users.insert_one(admin_user)
        print(f"✓ Created super admin user: {admin_email} (password: admin123)")
    else:
        print(f"✓ Super admin already exists: {admin_email}")
    
    # Create Regular Customer
    customer_email = "customer@example.com"
    existing_customer = await db.users.find_one({"email": customer_email})
    
    if not existing_customer:
        customer_user = {
            "id": "customer-001",
            "email": customer_email,
            "full_name": "John Doe",
            "phone": "+1234567891",
            "role": "customer",
            "hashed_password": pwd_context.hash("customer123"),
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "last_login": None
        }
        await db.users.insert_one(customer_user)
        print(f"✓ Created customer user: {customer_email} (password: customer123)")
    else:
        print(f"✓ Customer already exists: {customer_email}")
    
    # Create Sample Products
    products = [
        {
            "id": "prod-001",
            "sku": "LAPTOP-001",
            "title": "Premium Laptop Pro 15\"",
            "description": "High-performance laptop with 16GB RAM, 512GB SSD, and dedicated graphics card. Perfect for professionals and gamers.",
            "category": "Electronics",
            "tags": ["laptop", "computer", "electronics"],
            "status": "active",
            "images": ["https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=600&fit=crop"],
            "created_by": "admin-001",
            "updated_by": "admin-001",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "prod-002",
            "sku": "PHONE-001",
            "title": "Smartphone X Pro",
            "description": "Latest flagship smartphone with 6.7\" OLED display, 5G connectivity, and professional camera system.",
            "category": "Electronics",
            "tags": ["smartphone", "mobile", "electronics"],
            "status": "active",
            "images": ["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&h=600&fit=crop"],
            "created_by": "admin-001",
            "updated_by": "admin-001",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "prod-003",
            "sku": "WATCH-001",
            "title": "Luxury Smart Watch",
            "description": "Premium smartwatch with health tracking, GPS, and customizable faces. Water-resistant up to 50m.",
            "category": "Accessories",
            "tags": ["watch", "smartwatch", "accessories"],
            "status": "active",
            "images": ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop"],
            "created_by": "admin-001",
            "updated_by": "admin-001",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "prod-004",
            "sku": "HEADPHONE-001",
            "title": "Wireless Noise-Cancelling Headphones",
            "description": "Premium over-ear headphones with active noise cancellation, 30-hour battery life, and superior sound quality.",
            "category": "Audio",
            "tags": ["headphones", "audio", "wireless"],
            "status": "active",
            "images": ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop"],
            "created_by": "admin-001",
            "updated_by": "admin-001",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "prod-005",
            "sku": "CAMERA-001",
            "title": "Professional DSLR Camera",
            "description": "24MP full-frame sensor with 4K video recording, weather-sealed body, and dual card slots.",
            "category": "Photography",
            "tags": ["camera", "photography", "electronics"],
            "status": "active",
            "images": ["https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&h=600&fit=crop"],
            "created_by": "admin-001",
            "updated_by": "admin-001",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "prod-006",
            "sku": "SHOES-001",
            "title": "Running Shoes Pro",
            "description": "Professional running shoes with advanced cushioning, breathable mesh, and durable outsole.",
            "category": "Fashion",
            "tags": ["shoes", "running", "sports"],
            "status": "active",
            "images": ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop"],
            "created_by": "admin-001",
            "updated_by": "admin-001",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    for product in products:
        existing = await db.products.find_one({"sku": product["sku"]})
        if not existing:
            await db.products.insert_one(product)
            print(f"✓ Created product: {product['title']}")
        else:
            print(f"✓ Product already exists: {product['title']}")
    
    # Create Variants for each product
    variants = [
        # Laptop variants
        {"product_id": "prod-001", "sku": "LAPTOP-001-16GB", "attributes": {"RAM": "16GB", "Storage": "512GB"}, "price": 1299.99, "compare_at_price": 1499.99, "inventory_quantity": 25},
        {"product_id": "prod-001", "sku": "LAPTOP-001-32GB", "attributes": {"RAM": "32GB", "Storage": "1TB"}, "price": 1799.99, "compare_at_price": 1999.99, "inventory_quantity": 15},
        
        # Smartphone variants
        {"product_id": "prod-002", "sku": "PHONE-001-128GB", "attributes": {"Storage": "128GB", "Color": "Black"}, "price": 899.99, "compare_at_price": 999.99, "inventory_quantity": 50},
        {"product_id": "prod-002", "sku": "PHONE-001-256GB", "attributes": {"Storage": "256GB", "Color": "Silver"}, "price": 999.99, "compare_at_price": 1099.99, "inventory_quantity": 30},
        
        # Watch variants
        {"product_id": "prod-003", "sku": "WATCH-001-BLK", "attributes": {"Color": "Black", "Band": "Sport"}, "price": 349.99, "compare_at_price": 399.99, "inventory_quantity": 40},
        {"product_id": "prod-003", "sku": "WATCH-001-SLV", "attributes": {"Color": "Silver", "Band": "Metal"}, "price": 449.99, "compare_at_price": 499.99, "inventory_quantity": 20},
        
        # Headphone variants
        {"product_id": "prod-004", "sku": "HEADPHONE-001-BLK", "attributes": {"Color": "Black"}, "price": 299.99, "compare_at_price": 349.99, "inventory_quantity": 60},
        {"product_id": "prod-004", "sku": "HEADPHONE-001-WHT", "attributes": {"Color": "White"}, "price": 299.99, "compare_at_price": 349.99, "inventory_quantity": 45},
        
        # Camera variants
        {"product_id": "prod-005", "sku": "CAMERA-001-BODY", "attributes": {"Type": "Body Only"}, "price": 1999.99, "compare_at_price": 2199.99, "inventory_quantity": 12},
        {"product_id": "prod-005", "sku": "CAMERA-001-KIT", "attributes": {"Type": "With Lens Kit"}, "price": 2499.99, "compare_at_price": 2799.99, "inventory_quantity": 8},
        
        # Shoes variants
        {"product_id": "prod-006", "sku": "SHOES-001-9", "attributes": {"Size": "9", "Color": "Black"}, "price": 129.99, "compare_at_price": 159.99, "inventory_quantity": 35},
        {"product_id": "prod-006", "sku": "SHOES-001-10", "attributes": {"Size": "10", "Color": "Blue"}, "price": 129.99, "compare_at_price": 159.99, "inventory_quantity": 40},
    ]
    
    for variant in variants:
        existing = await db.product_variants.find_one({"sku": variant["sku"]})
        if not existing:
            variant_doc = {
                "id": f"var-{variant['sku']}",
                **variant,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await db.product_variants.insert_one(variant_doc)
            print(f"✓ Created variant: {variant['sku']}")
        else:
            print(f"✓ Variant already exists: {variant['sku']}")
    
    # Create Sample Coupons
    coupons = [
        {
            "id": "coupon-001",
            "code": "WELCOME10",
            "type": "percentage",
            "value": 10,
            "min_order_value": 50,
            "max_discount": 100,
            "usage_limit": 1000,
            "usage_count": 0,
            "valid_from": datetime.now(timezone.utc).isoformat(),
            "valid_to": (datetime.now(timezone.utc) + timedelta(days=30)).isoformat(),
            "is_active": True,
            "created_by": "admin-001",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "coupon-002",
            "code": "SAVE50",
            "type": "flat",
            "value": 50,
            "min_order_value": 200,
            "max_discount": None,
            "usage_limit": 500,
            "usage_count": 0,
            "valid_from": datetime.now(timezone.utc).isoformat(),
            "valid_to": (datetime.now(timezone.utc) + timedelta(days=60)).isoformat(),
            "is_active": True,
            "created_by": "admin-001",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    for coupon in coupons:
        existing = await db.coupons.find_one({"code": coupon["code"]})
        if not existing:
            await db.coupons.insert_one(coupon)
            print(f"✓ Created coupon: {coupon['code']}")
        else:
            print(f"✓ Coupon already exists: {coupon['code']}")
    
    print("\n✅ Database seeding completed successfully!")
    print("\nLogin Credentials:")
    print("  Admin: admin@swiftcommerce.com / admin123")
    print("  Customer: customer@example.com / customer123")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_database())
