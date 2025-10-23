from fastapi import FastAPI, APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
import jwt
from enum import Enum
import stripe
import base64
from io import BytesIO
from PIL import Image

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Stripe configuration
stripe.api_key = os.environ.get('STRIPE_SECRET_KEY', '')

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# Security
security = HTTPBearer()

# Create the main app
app = FastAPI(title="E-Commerce API", version="1.0.0")
api_router = APIRouter(prefix="/api")

# ============= ENUMS =============
class UserRole(str, Enum):
    CUSTOMER = "customer"
    ADMIN = "admin"
    SUPER_ADMIN = "super_admin"

class OrderStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"

class ProductStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    DRAFT = "draft"

class CouponType(str, Enum):
    PERCENTAGE = "percentage"
    FLAT = "flat"

# ============= MODELS =============
class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    phone: Optional[str] = None
    full_name: str
    role: UserRole = UserRole.CUSTOMER
    hashed_password: str
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    last_login: Optional[datetime] = None

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    phone: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    phone: Optional[str]
    role: UserRole
    is_active: bool
    created_at: datetime

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    sku: str
    title: str
    description: str
    category: str
    tags: List[str] = []
    status: ProductStatus = ProductStatus.ACTIVE
    images: List[str] = []
    created_by: str
    updated_by: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProductVariant(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    product_id: str
    sku: str
    attributes: Dict[str, Any] = {}  # e.g., {"size": "M", "color": "blue"}
    price: float
    compare_at_price: Optional[float] = None
    cost_price: Optional[float] = None
    inventory_quantity: int = 0
    weight: Optional[float] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProductCreate(BaseModel):
    sku: str
    title: str
    description: str
    category: str
    tags: List[str] = []
    status: ProductStatus = ProductStatus.ACTIVE

class ProductVariantCreate(BaseModel):
    sku: str
    attributes: Dict[str, Any] = {}
    price: float
    compare_at_price: Optional[float] = None
    cost_price: Optional[float] = None
    inventory_quantity: int = 0
    weight: Optional[float] = None

class Cart(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    items: List[Dict[str, Any]] = []  # [{"variant_id": str, "quantity": int, "price": float}]
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CartItemAdd(BaseModel):
    variant_id: str
    quantity: int = 1

class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    order_number: str
    user_id: str
    items: List[Dict[str, Any]] = []
    subtotal: float
    discount: float = 0
    tax: float = 0
    shipping: float = 0
    total: float
    status: OrderStatus = OrderStatus.PENDING
    payment_intent_id: Optional[str] = None
    payment_status: str = "pending"
    shipping_address: Dict[str, Any] = {}
    billing_address: Dict[str, Any] = {}
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CheckoutRequest(BaseModel):
    shipping_address: Dict[str, str]
    billing_address: Optional[Dict[str, str]] = None
    coupon_code: Optional[str] = None

class Coupon(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    code: str
    type: CouponType
    value: float  # percentage or flat amount
    min_order_value: float = 0
    max_discount: Optional[float] = None
    usage_limit: Optional[int] = None
    usage_count: int = 0
    valid_from: datetime
    valid_to: datetime
    is_active: bool = True
    created_by: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CouponCreate(BaseModel):
    code: str
    type: CouponType
    value: float
    min_order_value: float = 0
    max_discount: Optional[float] = None
    usage_limit: Optional[int] = None
    valid_from: datetime
    valid_to: datetime

class ActivityLog(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    action_type: str
    resource_type: str
    resource_id: str
    metadata: Dict[str, Any] = {}
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# ============= AUTH UTILITIES =============
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(user_id: str, email: str, role: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict[str, Any]:
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")
    except jwt.JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

async def require_admin(current_user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
    if current_user["role"] not in [UserRole.ADMIN, UserRole.SUPER_ADMIN]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return current_user

async def log_activity(user_id: str, action_type: str, resource_type: str, resource_id: str, metadata: Dict = {}):
    log = ActivityLog(
        user_id=user_id,
        action_type=action_type,
        resource_type=resource_type,
        resource_id=resource_id,
        metadata=metadata
    )
    doc = log.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    await db.activity_logs.insert_one(doc)

# ============= AUTH ROUTES =============
@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserCreate):
    # Check if user exists
    existing = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    
    user = User(
        email=user_data.email,
        full_name=user_data.full_name,
        phone=user_data.phone,
        hashed_password=hash_password(user_data.password)
    )
    
    doc = user.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    if doc.get('last_login'):
        doc['last_login'] = doc['last_login'].isoformat()
    
    await db.users.insert_one(doc)
    
    token = create_access_token(user.id, user.email, user.role)
    user_response = UserResponse(**{k: v for k, v in user.model_dump().items() if k != 'hashed_password'})
    
    return TokenResponse(access_token=token, user=user_response)

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user or not verify_password(credentials.password, user["hashed_password"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    
    if not user["is_active"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is inactive")
    
    # Update last login
    await db.users.update_one(
        {"id": user["id"]},
        {"$set": {"last_login": datetime.now(timezone.utc).isoformat()}}
    )
    
    token = create_access_token(user["id"], user["email"], user["role"])
    user_response = UserResponse(**{k: v for k, v in user.items() if k != 'hashed_password'})
    
    return TokenResponse(access_token=token, user=user_response)

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: Dict = Depends(get_current_user)):
    return UserResponse(**{k: v for k, v in current_user.items() if k != 'hashed_password'})

# ============= PRODUCT ROUTES =============
@api_router.post("/products", dependencies=[Depends(require_admin)])
async def create_product(product: ProductCreate, current_user: Dict = Depends(require_admin)):
    # Check if SKU exists
    existing = await db.products.find_one({"sku": product.sku}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="SKU already exists")
    
    prod = Product(
        **product.model_dump(),
        created_by=current_user["id"],
        updated_by=current_user["id"]
    )
    
    doc = prod.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    
    await db.products.insert_one(doc)
    await log_activity(current_user["id"], "create", "product", prod.id, {"sku": prod.sku})
    
    return {"id": prod.id, "message": "Product created successfully"}

@api_router.get("/products")
async def list_products(
    skip: int = 0,
    limit: int = 50,
    category: Optional[str] = None,
    status: Optional[ProductStatus] = None,
    search: Optional[str] = None
):
    query = {}
    if category:
        query["category"] = category
    if status:
        query["status"] = status
    if search:
        query["$text"] = {"$search": search}
    
    products = await db.products.find(query, {"_id": 0}).skip(skip).limit(limit).to_list(limit)
    total = await db.products.count_documents(query)
    
    return {"products": products, "total": total, "skip": skip, "limit": limit}

@api_router.get("/products/{product_id}")
async def get_product(product_id: str):
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    
    # Get variants
    variants = await db.product_variants.find({"product_id": product_id}, {"_id": 0}).to_list(100)
    product["variants"] = variants
    
    return product

@api_router.put("/products/{product_id}", dependencies=[Depends(require_admin)])
async def update_product(product_id: str, updates: Dict[str, Any], current_user: Dict = Depends(require_admin)):
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    
    updates["updated_by"] = current_user["id"]
    updates["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.products.update_one({"id": product_id}, {"$set": updates})
    await log_activity(current_user["id"], "update", "product", product_id, updates)
    
    return {"message": "Product updated successfully"}

@api_router.delete("/products/{product_id}", dependencies=[Depends(require_admin)])
async def delete_product(product_id: str, current_user: Dict = Depends(require_admin)):
    result = await db.products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    
    # Delete variants
    await db.product_variants.delete_many({"product_id": product_id})
    await log_activity(current_user["id"], "delete", "product", product_id, {})
    
    return {"message": "Product deleted successfully"}

# ============= PRODUCT VARIANT ROUTES =============
@api_router.post("/products/{product_id}/variants", dependencies=[Depends(require_admin)])
async def create_variant(product_id: str, variant: ProductVariantCreate, current_user: Dict = Depends(require_admin)):
    # Check if product exists
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    
    var = ProductVariant(**variant.model_dump(), product_id=product_id)
    doc = var.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.product_variants.insert_one(doc)
    await log_activity(current_user["id"], "create", "variant", var.id, {"product_id": product_id})
    
    return {"id": var.id, "message": "Variant created successfully"}

@api_router.get("/variants/{variant_id}")
async def get_variant(variant_id: str):
    variant = await db.product_variants.find_one({"id": variant_id}, {"_id": 0})
    if not variant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Variant not found")
    return variant

@api_router.put("/variants/{variant_id}", dependencies=[Depends(require_admin)])
async def update_variant(variant_id: str, updates: Dict[str, Any], current_user: Dict = Depends(require_admin)):
    result = await db.product_variants.update_one({"id": variant_id}, {"$set": updates})
    if result.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Variant not found")
    
    await log_activity(current_user["id"], "update", "variant", variant_id, updates)
    return {"message": "Variant updated successfully"}

# ============= CART ROUTES =============
@api_router.get("/cart")
async def get_cart(current_user: Dict = Depends(get_current_user)):
    cart = await db.carts.find_one({"user_id": current_user["id"]}, {"_id": 0})
    if not cart:
        # Create empty cart
        cart = Cart(user_id=current_user["id"])
        doc = cart.model_dump()
        doc['updated_at'] = doc['updated_at'].isoformat()
        await db.carts.insert_one(doc)
        return cart.model_dump()
    
    # Enrich with product details
    for item in cart.get("items", []):
        variant = await db.product_variants.find_one({"id": item["variant_id"]}, {"_id": 0})
        if variant:
            product = await db.products.find_one({"id": variant["product_id"]}, {"_id": 0})
            item["variant"] = variant
            item["product"] = product
    
    return cart

@api_router.post("/cart/items")
async def add_to_cart(item: CartItemAdd, current_user: Dict = Depends(get_current_user)):
    # Check if variant exists
    variant = await db.product_variants.find_one({"id": item.variant_id}, {"_id": 0})
    if not variant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Variant not found")
    
    # Check inventory
    if variant["inventory_quantity"] < item.quantity:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Insufficient inventory")
    
    cart = await db.carts.find_one({"user_id": current_user["id"]}, {"_id": 0})
    
    if not cart:
        cart = Cart(user_id=current_user["id"], items=[])
        cart_items = []
    else:
        cart_items = cart.get("items", [])
    
    # Check if item already in cart
    existing_item = next((i for i in cart_items if i["variant_id"] == item.variant_id), None)
    
    if existing_item:
        existing_item["quantity"] += item.quantity
    else:
        cart_items.append({
            "variant_id": item.variant_id,
            "quantity": item.quantity,
            "price": variant["price"]
        })
    
    await db.carts.update_one(
        {"user_id": current_user["id"]},
        {"$set": {"items": cart_items, "updated_at": datetime.now(timezone.utc).isoformat()}},
        upsert=True
    )
    
    return {"message": "Item added to cart"}

@api_router.put("/cart/items/{variant_id}")
async def update_cart_item(variant_id: str, quantity: int, current_user: Dict = Depends(get_current_user)):
    cart = await db.carts.find_one({"user_id": current_user["id"]}, {"_id": 0})
    if not cart:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cart not found")
    
    cart_items = cart.get("items", [])
    item = next((i for i in cart_items if i["variant_id"] == variant_id), None)
    
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not in cart")
    
    if quantity <= 0:
        cart_items = [i for i in cart_items if i["variant_id"] != variant_id]
    else:
        item["quantity"] = quantity
    
    await db.carts.update_one(
        {"user_id": current_user["id"]},
        {"$set": {"items": cart_items, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return {"message": "Cart updated"}

@api_router.delete("/cart/items/{variant_id}")
async def remove_from_cart(variant_id: str, current_user: Dict = Depends(get_current_user)):
    cart = await db.carts.find_one({"user_id": current_user["id"]}, {"_id": 0})
    if not cart:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cart not found")
    
    cart_items = [i for i in cart.get("items", []) if i["variant_id"] != variant_id]
    
    await db.carts.update_one(
        {"user_id": current_user["id"]},
        {"$set": {"items": cart_items, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return {"message": "Item removed from cart"}

# ============= CHECKOUT & ORDER ROUTES =============
@api_router.post("/checkout")
async def checkout(checkout_data: CheckoutRequest, current_user: Dict = Depends(get_current_user)):
    # Get cart
    cart = await db.carts.find_one({"user_id": current_user["id"]}, {"_id": 0})
    if not cart or not cart.get("items"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cart is empty")
    
    # Calculate totals
    subtotal = 0
    order_items = []
    
    for item in cart["items"]:
        variant = await db.product_variants.find_one({"id": item["variant_id"]}, {"_id": 0})
        if not variant:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Variant {item['variant_id']} not found")
        
        # Check inventory
        if variant["inventory_quantity"] < item["quantity"]:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Insufficient inventory for {variant['sku']}")
        
        item_total = variant["price"] * item["quantity"]
        subtotal += item_total
        
        order_items.append({
            "variant_id": variant["id"],
            "sku": variant["sku"],
            "quantity": item["quantity"],
            "price": variant["price"],
            "total": item_total
        })
    
    # Apply coupon if provided
    discount = 0
    if checkout_data.coupon_code:
        coupon = await db.coupons.find_one({"code": checkout_data.coupon_code}, {"_id": 0})
        if coupon and coupon["is_active"]:
            now = datetime.now(timezone.utc)
            valid_from = datetime.fromisoformat(coupon["valid_from"]) if isinstance(coupon["valid_from"], str) else coupon["valid_from"]
            valid_to = datetime.fromisoformat(coupon["valid_to"]) if isinstance(coupon["valid_to"], str) else coupon["valid_to"]
            
            if valid_from <= now <= valid_to:
                if subtotal >= coupon["min_order_value"]:
                    if coupon["type"] == CouponType.PERCENTAGE:
                        discount = subtotal * (coupon["value"] / 100)
                        if coupon.get("max_discount"):
                            discount = min(discount, coupon["max_discount"])
                    else:
                        discount = coupon["value"]
                    
                    # Update coupon usage
                    await db.coupons.update_one(
                        {"id": coupon["id"]},
                        {"$inc": {"usage_count": 1}}
                    )
    
    # Calculate tax and shipping (simplified for MVP)
    tax = subtotal * 0.1  # 10% tax
    shipping = 10.0 if subtotal < 100 else 0
    total = subtotal - discount + tax + shipping
    
    # Create Stripe payment intent
    try:
        payment_intent = stripe.PaymentIntent.create(
            amount=int(total * 100),  # Convert to paise (smallest unit)
            currency="inr",
            metadata={
                "user_id": current_user["id"],
                "email": current_user["email"]
            }
        )
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Payment setup failed: {str(e)}")
    
    # Create order
    order_number = f"ORD-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}"
    order = Order(
        order_number=order_number,
        user_id=current_user["id"],
        items=order_items,
        subtotal=subtotal,
        discount=discount,
        tax=tax,
        shipping=shipping,
        total=total,
        payment_intent_id=payment_intent.id,
        shipping_address=checkout_data.shipping_address,
        billing_address=checkout_data.billing_address or checkout_data.shipping_address
    )
    
    doc = order.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    
    await db.orders.insert_one(doc)
    
    # Reserve inventory
    for item in order_items:
        await db.product_variants.update_one(
            {"id": item["variant_id"]},
            {"$inc": {"inventory_quantity": -item["quantity"]}}
        )
    
    # Clear cart
    await db.carts.update_one(
        {"user_id": current_user["id"]},
        {"$set": {"items": [], "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    await log_activity(current_user["id"], "checkout", "order", order.id, {"order_number": order_number})
    
    return {
        "order_id": order.id,
        "order_number": order_number,
        "client_secret": payment_intent.client_secret,
        "total": total
    }

@api_router.post("/orders/{order_id}/confirm")
async def confirm_order(order_id: str, current_user: Dict = Depends(get_current_user)):
    order = await db.orders.find_one({"id": order_id, "user_id": current_user["id"]}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    
    # Verify payment with Stripe
    try:
        payment_intent = stripe.PaymentIntent.retrieve(order["payment_intent_id"])
        if payment_intent.status == "succeeded":
            await db.orders.update_one(
                {"id": order_id},
                {"$set": {
                    "status": OrderStatus.CONFIRMED,
                    "payment_status": "paid",
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }}
            )
            await log_activity(current_user["id"], "confirm", "order", order_id, {})
            return {"message": "Order confirmed", "status": "confirmed"}
        else:
            return {"message": "Payment not completed", "status": payment_intent.status}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@api_router.get("/orders")
async def list_orders(current_user: Dict = Depends(get_current_user), skip: int = 0, limit: int = 50):
    query = {"user_id": current_user["id"]}
    orders = await db.orders.find(query, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    total = await db.orders.count_documents(query)
    return {"orders": orders, "total": total}

@api_router.get("/orders/{order_id}")
async def get_order(order_id: str, current_user: Dict = Depends(get_current_user)):
    order = await db.orders.find_one({"id": order_id, "user_id": current_user["id"]}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    return order

# ============= ADMIN ORDER ROUTES =============
@api_router.get("/admin/orders")
async def admin_list_orders(current_user: Dict = Depends(require_admin), skip: int = 0, limit: int = 50, status: Optional[OrderStatus] = None):
    query = {}
    if status:
        query["status"] = status
    
    orders = await db.orders.find(query, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    total = await db.orders.count_documents(query)
    return {"orders": orders, "total": total}

@api_router.put("/admin/orders/{order_id}/status")
async def update_order_status(order_id: str, status: OrderStatus, current_user: Dict = Depends(require_admin)):
    result = await db.orders.update_one(
        {"id": order_id},
        {"$set": {"status": status, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    
    await log_activity(current_user["id"], "update_status", "order", order_id, {"status": status})
    return {"message": "Order status updated"}

# ============= COUPON ROUTES =============
@api_router.post("/admin/coupons", dependencies=[Depends(require_admin)])
async def create_coupon(coupon: CouponCreate, current_user: Dict = Depends(require_admin)):
    # Check if code exists
    existing = await db.coupons.find_one({"code": coupon.code}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Coupon code already exists")
    
    coup = Coupon(**coupon.model_dump(), created_by=current_user["id"])
    doc = coup.model_dump()
    doc['valid_from'] = doc['valid_from'].isoformat()
    doc['valid_to'] = doc['valid_to'].isoformat()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.coupons.insert_one(doc)
    await log_activity(current_user["id"], "create", "coupon", coup.id, {"code": coup.code})
    
    return {"id": coup.id, "message": "Coupon created successfully"}

@api_router.get("/admin/coupons")
async def list_coupons(current_user: Dict = Depends(require_admin), skip: int = 0, limit: int = 50):
    coupons = await db.coupons.find({}, {"_id": 0}).skip(skip).limit(limit).to_list(limit)
    total = await db.coupons.count_documents({})
    return {"coupons": coupons, "total": total}

@api_router.get("/coupons/validate/{code}")
async def validate_coupon(code: str):
    coupon = await db.coupons.find_one({"code": code}, {"_id": 0})
    if not coupon or not coupon["is_active"]:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invalid coupon")
    
    now = datetime.now(timezone.utc)
    valid_from = datetime.fromisoformat(coupon["valid_from"]) if isinstance(coupon["valid_from"], str) else coupon["valid_from"]
    valid_to = datetime.fromisoformat(coupon["valid_to"]) if isinstance(coupon["valid_to"], str) else coupon["valid_to"]
    
    if not (valid_from <= now <= valid_to):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Coupon expired")
    
    if coupon.get("usage_limit") and coupon["usage_count"] >= coupon["usage_limit"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Coupon usage limit reached")
    
    return coupon

# ============= ADMIN USER ROUTES =============
@api_router.get("/admin/users")
async def list_users(current_user: Dict = Depends(require_admin), skip: int = 0, limit: int = 50):
    users = await db.users.find({}, {"_id": 0, "hashed_password": 0}).skip(skip).limit(limit).to_list(limit)
    total = await db.users.count_documents({})
    return {"users": users, "total": total}

@api_router.put("/admin/users/{user_id}/role")
async def update_user_role(user_id: str, role: UserRole, current_user: Dict = Depends(require_admin)):
    if current_user["role"] != UserRole.SUPER_ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Super admin access required")
    
    result = await db.users.update_one({"id": user_id}, {"$set": {"role": role}})
    if result.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    await log_activity(current_user["id"], "update_role", "user", user_id, {"role": role})
    return {"message": "User role updated"}

# ============= ACTIVITY LOGS =============
@api_router.get("/admin/activity-logs")
async def get_activity_logs(
    current_user: Dict = Depends(require_admin),
    skip: int = 0,
    limit: int = 100,
    user_id: Optional[str] = None,
    action_type: Optional[str] = None
):
    query = {}
    if user_id:
        query["user_id"] = user_id
    if action_type:
        query["action_type"] = action_type
    
    logs = await db.activity_logs.find(query, {"_id": 0}).sort("timestamp", -1).skip(skip).limit(limit).to_list(limit)
    total = await db.activity_logs.count_documents(query)
    return {"logs": logs, "total": total}

# ============= ADMIN DASHBOARD STATS =============
@api_router.get("/admin/dashboard/stats")
async def dashboard_stats(current_user: Dict = Depends(require_admin)):
    total_users = await db.users.count_documents({})
    total_products = await db.products.count_documents({})
    total_orders = await db.orders.count_documents({})
    pending_orders = await db.orders.count_documents({"status": OrderStatus.PENDING})
    
    # Calculate revenue (sum of confirmed orders)
    pipeline = [
        {"$match": {"status": {"$in": [OrderStatus.CONFIRMED, OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.DELIVERED]}}},
        {"$group": {"_id": None, "total_revenue": {"$sum": "$total"}}}
    ]
    revenue_result = await db.orders.aggregate(pipeline).to_list(1)
    total_revenue = revenue_result[0]["total_revenue"] if revenue_result else 0
    
    return {
        "total_users": total_users,
        "total_products": total_products,
        "total_orders": total_orders,
        "pending_orders": pending_orders,
        "total_revenue": total_revenue
    }

# ============= IMAGE UPLOAD =============
@api_router.post("/upload/image")
async def upload_image(file: UploadFile = File(...), current_user: Dict = Depends(get_current_user)):
    # Read and validate image
    contents = await file.read()
    try:
        img = Image.open(BytesIO(contents))
        img.verify()
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid image file")
    
    # Convert to base64 for storage (in production, use S3/CDN)
    img_base64 = base64.b64encode(contents).decode('utf-8')
    image_url = f"data:image/{file.filename.split('.')[-1]};base64,{img_base64}"
    
    return {"url": image_url}

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_db():
    # Create indexes
    await db.products.create_index([("sku", 1)], unique=True)
    await db.products.create_index([("category", 1)])
    await db.users.create_index([("email", 1)], unique=True)
    await db.coupons.create_index([("code", 1)], unique=True)
    await db.orders.create_index([("user_id", 1)])
    await db.orders.create_index([("order_number", 1)], unique=True)
    
    # Create text index for search
    try:
        await db.products.create_index([("title", "text"), ("description", "text")])
    except:
        pass  # Index might already exist
    
    logger.info("Database indexes created")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()