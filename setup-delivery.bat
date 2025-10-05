@echo off
echo ==================================
echo Delivery Management Setup
echo ==================================
echo.

echo 1. Setting up PostgreSQL database...
echo Please enter your PostgreSQL password when prompted.
echo.

REM Run the schema
psql -U postgres -d cyclesync -f backend\modules\delivery\postgres_schema.sql

if %ERRORLEVEL% EQU 0 (
    echo [32mDatabase setup complete![0m
) else (
    echo [31mDatabase setup failed![0m
    echo Make sure:
    echo   - PostgreSQL is running
    echo   - Database 'cyclesync' exists
    echo   - You have the correct credentials
    pause
    exit /b 1
)

echo.
echo 2. Verifying data...
psql -U postgres -d cyclesync -c "SELECT COUNT(*) as delivery_count FROM delivery_tracking;"
psql -U postgres -d cyclesync -c "SELECT COUNT(*) as updates_count FROM delivery_updates;"

echo.
echo ==================================
echo Setup Complete!
echo ==================================
echo.
echo Next steps:
echo 1. Start the backend:
echo    cd backend ^&^& bal run
echo.
echo 2. Start the frontend:
echo    cd frontend ^&^& npm run dev
echo.
echo 3. Test pages:
echo    - Buyer: http://localhost:3000/buyer/orders-with-delivery
echo    - Supplier: http://localhost:3000/supplier/orders
echo    - Test: http://localhost:3000/test-delivery
echo.
echo Sample order IDs:
echo   - ord-2024-001 (In Transit)
echo   - ord-2024-002 (Delivered)
echo   - ord-2024-003 (Delivered)
echo.
pause
