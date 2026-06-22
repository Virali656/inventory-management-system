#!/bin/bash
# Test script for authentication endpoints

BASE_URL="http://localhost:8000"

echo "================================"
echo "Testing Authentication System"
echo "================================"
echo ""

# Test 1: Register a new user
echo "1. Registering new user..."
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "email": "test@example.com", "password": "password123"}')

echo "Response: $REGISTER_RESPONSE"
echo ""

# Test 2: Login with the user
echo "2. Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=testuser&password=password123")

echo "Response: $LOGIN_RESPONSE"

# Extract token
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
echo "Token: $TOKEN"
echo ""

# Test 3: Get current user info
echo "3. Getting current user info..."
ME_RESPONSE=$(curl -s -X GET "$BASE_URL/auth/me" \
  -H "Authorization: Bearer $TOKEN")

echo "Response: $ME_RESPONSE"
echo ""

# Test 4: Try to access protected endpoint (products)
echo "4. Testing protected endpoint (GET /products)..."
PRODUCTS_RESPONSE=$(curl -s -X GET "$BASE_URL/products" \
  -H "Authorization: Bearer $TOKEN")

echo "Response: $PRODUCTS_RESPONSE"
echo ""

# Test 5: Try without token (should fail)
echo "5. Testing without token (should fail)..."
NO_AUTH_RESPONSE=$(curl -s -X GET "$BASE_URL/products")

echo "Response: $NO_AUTH_RESPONSE"
echo ""

# Test 6: Check API docs
echo "6. API Documentation available at: $BASE_URL/docs"
echo ""

echo "================================"
echo "Tests Complete!"
echo "================================"
