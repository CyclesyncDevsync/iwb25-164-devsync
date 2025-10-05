import ballerina/io;
import ballerinax/postgresql;

public function main() returns error? {
    // Neon database connection details
    string dbHost = "ep-calm-hill-adjqwl68-pooler.c-2.us-east-1.aws.neon.tech";
    int dbPort = 5432;
    string dbUsername = "neondb_owner";
    string dbPassword = "npg_RCFiD1hUXpT5";
    string dbName = "cyclesync";

    // Connect to database
    postgresql:Client dbClient = check new (
        host = dbHost,
        port = dbPort,
        username = dbUsername,
        password = dbPassword,
        database = dbName,
        connectionPool = {maxOpenConnections: 10}
    );

    io:println("✓ Connected to Neon database successfully!");

    // Create tables if not exist
    io:println("\n1. Creating delivery_tracking table...");
    _ = check dbClient->execute(`
        CREATE TABLE IF NOT EXISTS delivery_tracking (
            id VARCHAR(255) PRIMARY KEY,
            order_id VARCHAR(255) NOT NULL UNIQUE,
            status VARCHAR(50) NOT NULL DEFAULT 'pending',
            current_location VARCHAR(500),
            estimated_delivery_date TIMESTAMP,
            actual_delivery_date TIMESTAMP,
            driver_name VARCHAR(255),
            driver_phone VARCHAR(20),
            vehicle_number VARCHAR(50),
            notes TEXT,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
    `);
    io:println("✓ delivery_tracking table ready");

    io:println("\n2. Creating delivery_updates table...");
    _ = check dbClient->execute(`
        CREATE TABLE IF NOT EXISTS delivery_updates (
            id VARCHAR(255) PRIMARY KEY,
            delivery_id VARCHAR(255) NOT NULL,
            status VARCHAR(50) NOT NULL,
            location VARCHAR(500) NOT NULL,
            timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            description TEXT NOT NULL,
            updated_by VARCHAR(255) NOT NULL,
            latitude DECIMAL(10, 8),
            longitude DECIMAL(11, 8),
            FOREIGN KEY (delivery_id) REFERENCES delivery_tracking(id) ON DELETE CASCADE
        )
    `);
    io:println("✓ delivery_updates table ready");

    // Create indexes
    io:println("\n3. Creating indexes...");
    _ = check dbClient->execute(`CREATE INDEX IF NOT EXISTS idx_delivery_order_id ON delivery_tracking(order_id)`);
    _ = check dbClient->execute(`CREATE INDEX IF NOT EXISTS idx_delivery_status ON delivery_tracking(status)`);
    _ = check dbClient->execute(`CREATE INDEX IF NOT EXISTS idx_delivery_updates_delivery_id ON delivery_updates(delivery_id)`);
    io:println("✓ Indexes created");

    // Check existing data
    io:println("\n4. Checking existing data...");
    record {int count;} countResult = check dbClient->queryRow(`SELECT COUNT(*) as count FROM delivery_tracking`);
    io:println(string `Found ${countResult.count} existing delivery records`);

    // Insert delivery data
    io:println("\n5. Inserting delivery data...");

    // Delivery 1: In Transit
    _ = check dbClient->execute(`
        INSERT INTO delivery_tracking (
            id, order_id, status, current_location, estimated_delivery_date,
            driver_name, driver_phone, vehicle_number, notes, created_at, updated_at
        ) VALUES (
            'delivery-001', 'ord-2024-001', 'in_transit', 'Pune Distribution Center',
            CURRENT_TIMESTAMP + INTERVAL '1 day', 'Rajesh Kumar', '+91 98765 00001', 'MH-12-AB-1234',
            'Handle with care - fragile items', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        ) ON CONFLICT (order_id) DO NOTHING
    `);
    io:println("  ✓ Delivery 1 (ord-2024-001) - In Transit");

    // Delivery 2: Delivered
    _ = check dbClient->execute(`
        INSERT INTO delivery_tracking (
            id, order_id, status, current_location, estimated_delivery_date,
            actual_delivery_date, driver_name, driver_phone, vehicle_number, notes, created_at, updated_at
        ) VALUES (
            'delivery-002', 'ord-2024-002', 'delivered', 'Customer Location - Delhi NCR',
            CURRENT_TIMESTAMP - INTERVAL '8 days', CURRENT_TIMESTAMP - INTERVAL '3 days',
            'Amit Sharma', '+91 98765 00002', 'DL-10-CD-5678', 'Delivered successfully',
            CURRENT_TIMESTAMP - INTERVAL '5 days', CURRENT_TIMESTAMP - INTERVAL '3 days'
        ) ON CONFLICT (order_id) DO NOTHING
    `);
    io:println("  ✓ Delivery 2 (ord-2024-002) - Delivered");

    // Delivery 3: Delivered
    _ = check dbClient->execute(`
        INSERT INTO delivery_tracking (
            id, order_id, status, current_location, estimated_delivery_date,
            actual_delivery_date, driver_name, driver_phone, vehicle_number, notes, created_at, updated_at
        ) VALUES (
            'delivery-003', 'ord-2024-003', 'delivered', 'Customer Location - Bangalore',
            CURRENT_TIMESTAMP - INTERVAL '5 days', CURRENT_TIMESTAMP - INTERVAL '1 day',
            'Suresh Patel', '+91 98765 00003', 'KA-01-EF-9012', 'Package delivered successfully',
            CURRENT_TIMESTAMP - INTERVAL '6 days', CURRENT_TIMESTAMP - INTERVAL '1 day'
        ) ON CONFLICT (order_id) DO NOTHING
    `);
    io:println("  ✓ Delivery 3 (ord-2024-003) - Delivered");

    // Insert delivery updates
    io:println("\n6. Inserting delivery updates...");

    // Updates for delivery-001
    _ = check dbClient->execute(`
        INSERT INTO delivery_updates (id, delivery_id, status, location, timestamp, description, updated_by, latitude, longitude)
        VALUES
            ('update-001-1', 'delivery-001', 'in_transit', 'Pune Distribution Center',
             CURRENT_TIMESTAMP, 'Package is on the way to your location', 'system', 18.5204, 73.8567),
            ('update-001-2', 'delivery-001', 'picked_up', 'Mumbai Warehouse',
             CURRENT_TIMESTAMP - INTERVAL '1 day', 'Package picked up from supplier', 'driver', 19.0760, 72.8777),
            ('update-001-3', 'delivery-001', 'pickup_scheduled', 'Supplier Location',
             CURRENT_TIMESTAMP - INTERVAL '2 days', 'Pickup scheduled with driver', 'system', 19.0760, 72.8777)
        ON CONFLICT (id) DO NOTHING
    `);

    // Updates for delivery-002
    _ = check dbClient->execute(`
        INSERT INTO delivery_updates (id, delivery_id, status, location, timestamp, description, updated_by, latitude, longitude)
        VALUES
            ('update-002-1', 'delivery-002', 'delivered', 'Customer Location - Delhi NCR',
             CURRENT_TIMESTAMP - INTERVAL '3 days', 'Successfully delivered to customer', 'driver', 28.7041, 77.1025),
            ('update-002-2', 'delivery-002', 'out_for_delivery', 'Delhi Distribution Hub',
             CURRENT_TIMESTAMP - INTERVAL '3 days' - INTERVAL '2 hours', 'Out for delivery - estimated arrival in 2 hours', 'system', 28.6139, 77.2090),
            ('update-002-3', 'delivery-002', 'in_transit', 'Gurgaon Transit Point',
             CURRENT_TIMESTAMP - INTERVAL '4 days', 'Package in transit to delivery location', 'system', 28.4595, 77.0266),
            ('update-002-4', 'delivery-002', 'picked_up', 'Supplier Warehouse',
             CURRENT_TIMESTAMP - INTERVAL '5 days', 'Package picked up from supplier', 'driver', 28.7041, 77.1025)
        ON CONFLICT (id) DO NOTHING
    `);

    // Updates for delivery-003
    _ = check dbClient->execute(`
        INSERT INTO delivery_updates (id, delivery_id, status, location, timestamp, description, updated_by, latitude, longitude)
        VALUES
            ('update-003-1', 'delivery-003', 'delivered', 'Customer Location - Bangalore',
             CURRENT_TIMESTAMP - INTERVAL '1 day', 'Package delivered successfully', 'driver', 12.9716, 77.5946),
            ('update-003-2', 'delivery-003', 'out_for_delivery', 'Bangalore Distribution Center',
             CURRENT_TIMESTAMP - INTERVAL '1 day' - INTERVAL '3 hours', 'Out for delivery', 'system', 12.9716, 77.5946),
            ('update-003-3', 'delivery-003', 'in_transit', 'Katunayake to Bangalore',
             CURRENT_TIMESTAMP - INTERVAL '3 days', 'Package in transit', 'system', 7.1907, 79.8838),
            ('update-003-4', 'delivery-003', 'picked_up', 'Export Processing Zone, Katunayake',
             CURRENT_TIMESTAMP - INTERVAL '6 days', 'Package collected from supplier', 'driver', 7.1907, 79.8838)
        ON CONFLICT (id) DO NOTHING
    `);

    io:println("  ✓ All delivery updates inserted (11 records)");

    // Verify data
    io:println("\n7. Verifying data...");
    record {int count;} finalCountResult = check dbClient->queryRow(`SELECT COUNT(*) as count FROM delivery_tracking`);
    record {int count;} updatesCountResult = check dbClient->queryRow(`SELECT COUNT(*) as count FROM delivery_updates`);

    io:println(string `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    io:println(string `✅ SUCCESS! Data added to Neon database`);
    io:println(string `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    io:println(string `   Delivery records: ${finalCountResult.count}`);
    io:println(string `   Delivery updates: ${updatesCountResult.count}`);
    io:println("\nTest the API:");
    io:println("  curl http://localhost:9091/delivery/ord-2024-001");
    io:println("\nTest the frontend:");
    io:println("  http://localhost:3000/test-delivery");
    io:println(string `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

    check dbClient.close();
}
