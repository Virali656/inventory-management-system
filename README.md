# 📦 Inventory & Order Management System

A full-stack, production-ready, containerized inventory and order management system built with FastAPI, React, and PostgreSQL.

## 🚀 Features

### Backend (FastAPI)
- **Product Management**: CRUD operations for products with SKU validation
- **Customer Management**: Customer registration and management with unique email constraint
- **Order Management**: Create orders with automatic stock reduction and total calculation
- **Dashboard**: Real-time statistics and low stock alerts
- **Data Validation**: Pydantic schemas for request/response validation
- **Error Handling**: Comprehensive error handling with proper HTTP status codes

### Frontend (React + TypeScript)
- **Modern UI**: Clean, responsive design with professional styling
- **Product Management**: Add, view, update, and delete products
- **Customer Management**: Add, view, and delete customers
- **Order Management**: Create orders with product selection and view order history
- **Dashboard**: Overview with statistics and low stock alerts
- **Authentication**: Login system with protected routes

### Database (PostgreSQL)
- **Relational Data**: Properly structured tables with foreign key relationships
- **Data Integrity**: Constraints for unique SKUs, emails, and non-negative quantities
- **Order Items**: Many-to-many relationship between orders and products

## 🛠️ Technology Stack

| Component | Technology |
|-----------|-----------|
| **Backend** | Python 3.11, FastAPI, SQLAlchemy, Pydantic |
| **Frontend** | React 18, TypeScript, React Router, Axios |
| **Database** | PostgreSQL 15 |
| **Containerization** | Docker, Docker Compose |
| **Version Control** | Git |

## 📋 Prerequisites

- Docker Desktop (or Docker Engine + Docker Compose)
- Git

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd inventory-management-system
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` if needed (default values work for local development):

```env
POSTGRES_USER=inventory_user
POSTGRES_PASSWORD=inventory_pass
POSTGRES_DB=inventory_db
DATABASE_URL=postgresql://inventory_user:inventory_pass@db:5432/inventory_db
BACKEND_PORT=8000
FRONTEND_PORT=3000
```

### 3. Build and Run with Docker Compose

```bash
# Build and start all services
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

### 5. Login Credentials

Use these demo credentials to login:

- **Admin**: 
  - Username: `admin`
  - Password: `admin123`

- **Demo User**:
  - Username: `demo`
  - Password: `demo123`

## 📁 Project Structure

```
inventory-management-system/
├── backend/                    # FastAPI backend
│   ├── main.py                # Main application and API endpoints
│   ├── models.py              # SQLAlchemy database models
│   ├── schemas.py             # Pydantic schemas for validation
│   ├── database.py            # Database configuration
│   ├── requirements.txt       # Python dependencies
│   ├── Dockerfile            # Backend container definition
│   └── .dockerignore         # Docker ignore patterns
│
├── frontend/                  # React frontend
│   ├── public/               # Static assets
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   ├── context/          # React context (AuthContext)
│   │   ├── pages/            # Page components
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Products.tsx
│   │   │   ├── Customers.tsx
│   │   │   ├── Orders.tsx
│   │   │   ├── Login.tsx
│   │   │   └── CustomerSignup.tsx
│   │   ├── services/         # API service layer
│   │   ├── types/            # TypeScript type definitions
│   │   ├── App.tsx           # Main app component
│   │   └── index.tsx         # Entry point
│   ├── package.json          # NPM dependencies
│   ├── tsconfig.json         # TypeScript configuration
│   ├── Dockerfile           # Frontend container definition
│   └── .dockerignore        # Docker ignore patterns
│
├── docker-compose.yml        # Multi-container orchestration
├── .env.example             # Environment variables template
└── README.md                # This file
```

## 🔌 API Endpoints

### Products
- `POST /products` - Create a new product
- `GET /products` - Get all products
- `GET /products/{id}` - Get product by ID
- `PUT /products/{id}` - Update product
- `DELETE /products/{id}` - Delete product

### Customers
- `POST /customers` - Create a new customer
- `GET /customers` - Get all customers
- `GET /customers/{id}` - Get customer by ID
- `DELETE /customers/{id}` - Delete customer

### Orders
- `POST /orders` - Create a new order
- `GET /orders` - Get all orders
- `GET /orders/{id}` - Get order by ID
- `DELETE /orders/{id}` - Cancel/delete order

### Dashboard
- `GET /dashboard` - Get dashboard statistics

### Health
- `GET /health` - Health check endpoint

## 📊 API Documentation

Once the backend is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🔐 Business Logic

### Product Management
- ✅ SKU must be unique
- ✅ Quantity cannot be negative
- ✅ Price must be positive

### Customer Management
- ✅ Email must be unique
- ✅ Phone number validation

### Order Management
- ✅ Verifies customer exists
- ✅ Verifies products exist
- ✅ Checks sufficient stock before order creation
- ✅ Automatically calculates total amount
- ✅ Automatically reduces product stock
- ✅ Prevents orders with insufficient inventory

## 🛠️ Development

### Running Backend Locally (without Docker)

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn main:app --reload
```

### Running Frontend Locally (without Docker)

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

### Database Setup

The PostgreSQL database is automatically initialized when you run `docker-compose up`. Tables are created automatically by SQLAlchemy on first run.

## 🐳 Docker Commands

### Build Services
```bash
docker-compose build
```

### Start Services
```bash
docker-compose up
```

### Stop Services
```bash
docker-compose down
```

### View Logs
```bash
docker-compose logs -f
```

### Remove Volumes (Reset Database)
```bash
docker-compose down -v
```

## 🧪 Testing the API

### Using cURL

```bash
# Health check
curl http://localhost:8000/health

# Create a product
curl -X POST http://localhost:8000/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Laptop",
    "sku": "LAP-001",
    "price": 999.99,
    "quantity": 50
  }'

# Get all products
curl http://localhost:8000/products
```

### Using the Interactive API Docs

Visit http://localhost:8000/docs to use the interactive Swagger UI for testing all endpoints.

## 📦 Docker Hub

The backend image is available on Docker Hub:

```bash
# Pull the image
docker pull <your-dockerhub-username>/inventory-backend:latest

# Run the container
docker run -p 8000:8000 <your-dockerhub-username>/inventory-backend:latest
```

## 🌐 Deployment

### Backend Deployment (Render/Railway/Fly.io)

1. Create a new web service
2. Connect your GitHub repository
3. Set environment variables:
   - `DATABASE_URL` - PostgreSQL connection string
4. Deploy from main branch

### Frontend Deployment (Vercel/Netlify)

1. Import project from GitHub
2. Set build command: `npm run build`
3. Set publish directory: `build`
4. Set environment variable:
   - `REACT_APP_API_URL` - Backend API URL
5. Deploy

### Database (Production)

Use a managed PostgreSQL service:
- **Render PostgreSQL**
- **Railway PostgreSQL**
- **Supabase**
- **ElephantSQL**

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Change ports in docker-compose.yml or .env file
```

### Database Connection Error
```bash
# Ensure PostgreSQL container is running
docker-compose ps

# Check logs
docker-compose logs db
```

### Frontend Cannot Connect to Backend
```bash
# Verify CORS settings in backend/main.py
# Check REACT_APP_API_URL in frontend
```

## 📝 License

This project is licensed under the [MIT License](LICENSE).

---
