# Cyclesync Backend - Module-Based Architecture

This backend has been restructured using a module-based architecture to improve code organization, maintainability, and reusability.

## Module Structure

```
backend/
├── main_modular.bal          # Main application file using modules
├── Ballerina.toml            # Package configuration
├── modules/                  # Module-based components
│   ├── auth/                # Authentication module
│   │   ├── Module.md
│   │   ├── auth_middleware.bal
│   │   ├── auth_service.bal
│   │   ├── auth_types.bal
│   │   └── asgardeo_config.bal
│   ├── user/                # User management module
│   │   ├── Module.md
│   │   ├── user_controller.bal
│   │   ├── user_service.bal
│   │   └── user_types.bal
│   ├── admin/               # Admin functionality module
│   │   ├── Module.md
│   │   ├── admin_controller.bal
│   │   ├── admin_service.bal
│   │   └── admin_types.bal
│   ├── sms/                 # SMS functionality module
│   │   ├── Module.md
│   │   ├── SMSController.bal
│   │   ├── sms_service.bal
│   │   └── sms_types.bal
│   └── common/              # Shared utilities module
│       ├── Module.md
│       ├── common_types.bal
│       ├── utils.bal
│       └── constants.bal
└── tests/                   # Test modules
    ├── Module.md
    ├── auth_tests.bal
    ├── user_tests.bal
    ├── admin_tests.bal
    ├── sms_tests.bal
    └── common_tests.bal
```

## Modules Overview

### 🔐 Auth Module (`hp/Cyclesync.auth`)
- **Purpose**: Handles all authentication and authorization
- **Components**: 
  - `AuthService`: Token validation, user authentication
  - `AuthMiddleware`: HTTP request authentication
  - `AsgardeoConfig`: Identity provider configuration
- **Usage**: `import hp/Cyclesync.auth;`

### 👤 User Module (`hp/Cyclesync.user`)
- **Purpose**: User profile and preferences management
- **Components**:
  - `UserController`: User-related HTTP endpoints
  - `UserService`: User business logic
  - `UserTypes`: User data structures
- **Usage**: `import hp/Cyclesync.user;`

### ⚙️ Admin Module (`hp/Cyclesync.admin`)
- **Purpose**: Administrative functionality
- **Components**:
  - `AdminController`: Admin HTTP endpoints
  - `AdminService`: Admin business logic
  - `AdminTypes`: Admin data structures
- **Usage**: `import hp/Cyclesync.admin;`

### 📱 SMS Module (`hp/Cyclesync.sms`)
- **Purpose**: SMS messaging functionality
- **Components**:
  - `SMSController`: SMS HTTP endpoints
  - `SMSService`: SMS business logic
  - `SMSTypes`: SMS data structures
- **Usage**: `import hp/Cyclesync.sms;`

### 🔧 Common Module (`hp/Cyclesync.common`)
- **Purpose**: Shared utilities and types
- **Components**:
  - `CommonTypes`: Shared data structures
  - `Utils`: Utility functions
  - `Constants`: Application constants
- **Usage**: `import hp/Cyclesync.common;`

## Benefits of Module-Based Architecture

1. **Separation of Concerns**: Each module handles a specific domain
2. **Reusability**: Modules can be imported and used independently
3. **Maintainability**: Easier to maintain and update specific functionality
4. **Testing**: Each module can be tested independently
5. **Scalability**: Easy to add new modules or extend existing ones
6. **Code Organization**: Clear structure and logical grouping

## Running the Application

### Using the Original Structure
```bash
cd backend
bal run main.bal
```

### Using the New Module Structure
```bash
cd backend
bal run main_modular.bal
```

## Running Tests
```bash
cd backend
bal test
```

## Module Import Examples

```ballerina
// Import specific modules
import hp/Cyclesync.auth;
import hp/Cyclesync.user;
import hp/Cyclesync.common;

// Use module functions
auth:AuthResult result = auth:validateAuth(request);
common:ApiResponse response = common:createSuccessResponse("Success", data);
user:UserProfile profile = userService.getUserProfile(userId);
```

## API Endpoints

The API endpoints remain the same as the original structure:

- **Health**: `GET /health`
- **User**: `/api/user/*`
- **Admin**: `/api/admin/*`
- **SMS**: `/api/sms/*`

## Configuration

The application can be configured using the same `Config.toml` file. The module structure does not change the configuration approach.

## Migration from Original Structure

The original files have been reorganized into modules while maintaining the same functionality:

- `auth_middleware.bal` → `modules/auth/auth_middleware.bal`
- `auth_service.bal` → `modules/auth/auth_service.bal`
- `controllers/user_controller.bal` → `modules/user/user_controller.bal`
- `controllers/admin_controller.bal` → `modules/admin/admin_controller.bal`
- `types/auth_types.bal` → `modules/auth/auth_types.bal`
- `common_types.bal` → `modules/common/common_types.bal`

## Next Steps

1. Update any deployment scripts to use `main_modular.bal`
2. Update import statements in existing code
3. Add additional modules as needed
4. Enhance testing coverage for each module
5. Consider adding module-specific documentation
