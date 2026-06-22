from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from typing import List
from datetime import timedelta
import models
import schemas
import auth
from database import engine, get_db

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Inventory & Order Management API", version="1.0.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== AUTHENTICATION ENDPOINTS ====================

@app.post("/auth/register", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    # Check if username exists
    existing_user = db.query(models.User).filter(models.User.username == user.username).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )

    # Check if email exists
    existing_email = db.query(models.User).filter(models.User.email == user.email).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Create new user
    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/auth/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Login and get access token"""
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")

    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/auth/me", response_model=schemas.UserResponse)
def get_me(current_user: models.User = Depends(auth.get_current_active_user)):
    """Get current user info"""
    return current_user

# ==================== PRODUCT ENDPOINTS ====================

@app.post("/products", response_model=schemas.ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    product: schemas.ProductCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Create a new product"""
    # Check if SKU already exists
    existing_product = db.query(models.Product).filter(models.Product.sku == product.sku).first()
    if existing_product:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Product with this SKU already exists"
        )

    db_product = models.Product(**product.model_dump())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

@app.get("/products", response_model=List[schemas.ProductResponse])
def get_products(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    """Retrieve all products"""
    products = db.query(models.Product).offset(skip).limit(limit).all()
    return products

@app.get("/products/{product_id}", response_model=schemas.ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    """Retrieve a specific product by ID"""
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    return product

@app.put("/products/{product_id}", response_model=schemas.ProductResponse)
def update_product(product_id: int, product_update: schemas.ProductUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    """Update product details"""
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    # Check SKU uniqueness if it's being updated
    if product_update.sku and product_update.sku != product.sku:
        existing = db.query(models.Product).filter(
            models.Product.sku == product_update.sku,
            models.Product.id != product_id
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Product with this SKU already exists"
            )

    update_data = product_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(product, field, value)

    db.commit()
    db.refresh(product)
    return product

@app.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    """Delete a product"""
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    db.delete(product)
    db.commit()
    return None

# ==================== CUSTOMER ENDPOINTS ====================

@app.post("/customers", response_model=schemas.CustomerResponse, status_code=status.HTTP_201_CREATED)
def create_customer(customer: schemas.CustomerCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    """Create a new customer"""
    # Check if email already exists
    existing_customer = db.query(models.Customer).filter(models.Customer.email == customer.email).first()
    if existing_customer:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Customer with this email already exists"
        )

    db_customer = models.Customer(**customer.model_dump())
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    return db_customer

@app.get("/customers", response_model=List[schemas.CustomerResponse])
def get_customers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    """Retrieve all customers"""
    customers = db.query(models.Customer).offset(skip).limit(limit).all()
    return customers

@app.get("/customers/{customer_id}", response_model=schemas.CustomerResponse)
def get_customer(customer_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    """Retrieve customer details by ID"""
    customer = db.query(models.Customer).filter(models.Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found"
        )
    return customer

@app.delete("/customers/{customer_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_customer(customer_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    """Delete a customer"""
    customer = db.query(models.Customer).filter(models.Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found"
        )

    db.delete(customer)
    db.commit()
    return None

# ==================== ORDER ENDPOINTS ====================

@app.post("/orders", response_model=schemas.OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(order: schemas.OrderCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    """Create a new order"""
    # Verify customer exists
    customer = db.query(models.Customer).filter(models.Customer.id == order.customer_id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found"
        )

    # Verify products exist and have sufficient stock
    total_amount = 0
    order_items_data = []

    for item in order.items:
        product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with ID {item.product_id} not found"
            )

        # Check sufficient stock
        if product.quantity < item.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for product '{product.name}'. Available: {product.quantity}, Requested: {item.quantity}"
            )

        item_total = product.price * item.quantity
        total_amount += item_total

        order_items_data.append({
            'product': product,
            'quantity': item.quantity,
            'price_at_order': product.price
        })

    # Create order
    db_order = models.Order(
        customer_id=order.customer_id,
        total_amount=total_amount
    )
    db.add(db_order)
    db.flush()  # Get order ID

    # Add order items and reduce stock
    for item_data in order_items_data:
        # Insert order item
        db.execute(
            models.order_items.insert().values(
                order_id=db_order.id,
                product_id=item_data['product'].id,
                quantity=item_data['quantity'],
                price_at_order=item_data['price_at_order']
            )
        )

        # Reduce stock
        item_data['product'].quantity -= item_data['quantity']

    db.commit()
    db.refresh(db_order)

    # Fetch order items for response
    order_items_result = db.execute(
        select(models.order_items).where(models.order_items.c.order_id == db_order.id)
    ).fetchall()

    items_response = [
        schemas.OrderItemResponse(
            product_id=item.product_id,
            quantity=item.quantity,
            price_at_order=item.price_at_order
        )
        for item in order_items_result
    ]

    response = schemas.OrderResponse(
        id=db_order.id,
        customer_id=db_order.customer_id,
        total_amount=db_order.total_amount,
        created_at=db_order.created_at,
        items=items_response
    )

    return response

@app.get("/orders", response_model=List[schemas.OrderResponse])
def get_orders(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    """Retrieve all orders"""
    orders = db.query(models.Order).offset(skip).limit(limit).all()

    result = []
    for order in orders:
        order_items_result = db.execute(
            select(models.order_items).where(models.order_items.c.order_id == order.id)
        ).fetchall()

        items_response = [
            schemas.OrderItemResponse(
                product_id=item.product_id,
                quantity=item.quantity,
                price_at_order=item.price_at_order
            )
            for item in order_items_result
        ]

        result.append(schemas.OrderResponse(
            id=order.id,
            customer_id=order.customer_id,
            total_amount=order.total_amount,
            created_at=order.created_at,
            items=items_response
        ))

    return result

@app.get("/orders/{order_id}", response_model=schemas.OrderResponse)
def get_order(order_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    """Retrieve order details by ID"""
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )

    order_items_result = db.execute(
        select(models.order_items).where(models.order_items.c.order_id == order.id)
    ).fetchall()

    items_response = [
        schemas.OrderItemResponse(
            product_id=item.product_id,
            quantity=item.quantity,
            price_at_order=item.price_at_order
        )
        for item in order_items_result
    ]

    return schemas.OrderResponse(
        id=order.id,
        customer_id=order.customer_id,
        total_amount=order.total_amount,
        created_at=order.created_at,
        items=items_response
    )

@app.delete("/orders/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_order(order_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    """Cancel/Delete an order"""
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )

    db.delete(order)
    db.commit()
    return None

# ==================== DASHBOARD ENDPOINT ====================

@app.get("/dashboard", response_model=schemas.DashboardSummary)
def get_dashboard(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    """Get dashboard summary statistics"""
    total_products = db.query(func.count(models.Product.id)).scalar()
    total_customers = db.query(func.count(models.Customer.id)).scalar()
    total_orders = db.query(func.count(models.Order.id)).scalar()

    # Low stock products (quantity < 10)
    low_stock = db.query(models.Product).filter(models.Product.quantity < 10).all()

    return schemas.DashboardSummary(
        total_products=total_products,
        total_customers=total_customers,
        total_orders=total_orders,
        low_stock_products=low_stock
    )

@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
