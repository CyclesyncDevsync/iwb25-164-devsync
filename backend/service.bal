
// Simple wrapper service for Choreo deployment
public function main() returns error? {
    // This will trigger the module imports and start all services
    check startServices();
}

function startServices() returns error? {
    // Services are auto-started through module imports in main.bal
    // This function is just to ensure proper initialization
    return;
}