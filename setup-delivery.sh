#!/bin/bash

echo "=================================="
echo "Delivery Management Setup"
echo "=================================="
echo ""

# Check if PostgreSQL is running
echo "1. Checking PostgreSQL..."
if command -v psql &> /dev/null; then
    echo "✓ PostgreSQL found"
else
    echo "✗ PostgreSQL not found. Please install PostgreSQL first."
    exit 1
fi

echo ""
echo "2. Setting up database..."
echo "Please enter your PostgreSQL password when prompted."
echo ""

# Run the schema
psql -U postgres -d cyclesync -f backend/modules/delivery/postgres_schema.sql

if [ $? -eq 0 ]; then
    echo "✓ Database setup complete"
else
    echo "✗ Database setup failed"
    echo "Make sure:"
    echo "  - PostgreSQL is running"
    echo "  - Database 'cyclesync' exists"
    echo "  - You have the correct credentials"
    exit 1
fi

echo ""
echo "3. Verifying data..."
psql -U postgres -d cyclesync -c "SELECT COUNT(*) as delivery_count FROM delivery_tracking;"
psql -U postgres -d cyclesync -c "SELECT COUNT(*) as updates_count FROM delivery_updates;"

echo ""
echo "=================================="
echo "Setup Complete! ✓"
echo "=================================="
echo ""
echo "Next steps:"
echo "1. Start the backend:"
echo "   cd backend && bal run"
echo ""
echo "2. Start the frontend:"
echo "   cd frontend && npm run dev"
echo ""
echo "3. Test pages:"
echo "   - Buyer: http://localhost:3000/buyer/orders-with-delivery"
echo "   - Supplier: http://localhost:3000/supplier/orders"
echo "   - Test: http://localhost:3000/test-delivery"
echo ""
echo "Sample order IDs:"
echo "  - ord-2024-001 (In Transit)"
echo "  - ord-2024-002 (Delivered)"
echo "  - ord-2024-003 (Delivered)"
echo ""
