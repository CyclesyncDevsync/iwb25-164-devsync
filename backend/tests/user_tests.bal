import ballerina/test;
import hp/Cyclesync.user;

// Test User Service
@test:Config {}
function testUserServiceInit() {
    user:UserService|error userService = new();
    test:assertTrue(userService is user:UserService, "User service should be initialized");
}

@test:Config {}
function testGetUserProfileById() returns error? {
    user:UserService userService = new();
    string testUserId = "test-user-123";
    
    user:UserProfile|error result = userService.getUserProfileById(testUserId);
    test:assertTrue(result is user:UserProfile, "Should return user profile");
    
    if (result is user:UserProfile) {
        test:assertEquals(result.userId, testUserId, "User ID should match");
        test:assertTrue(result.username.length() > 0, "Username should not be empty");
        test:assertTrue(result.email.includes("@"), "Email should be valid format");
    }
}

@test:Config {}
function testUpdateUserProfile() returns error? {
    user:UserService userService = new();
    string testUserId = "test-user-123";
    
    user:UserProfileUpdate updateData = {
        username: "updated_user",
        email: "updated@example.com",
        firstName: "Updated",
        lastName: "User",
        attributes: {
            "theme": "dark",
            "language": "en"
        }
    };
    
    user:UserProfile|error result = userService.updateUserProfile(testUserId, updateData);
    test:assertTrue(result is user:UserProfile, "Should return updated user profile");
    
    if (result is user:UserProfile) {
        test:assertEquals(result.userId, testUserId, "User ID should match");
        test:assertEquals(result.username, "updated_user", "Username should be updated");
        test:assertEquals(result.email, "updated@example.com", "Email should be updated");
    }
}

@test:Config {}
function testGetUserPreferences() returns error? {
    user:UserService userService = new();
    string testUserId = "test-user-123";
    
    user:UserPreferences|error result = userService.getUserPreferences(testUserId);
    test:assertTrue(result is user:UserPreferences, "Should return user preferences");
    
    if (result is user:UserPreferences) {
        test:assertEquals(result.userId, testUserId, "User ID should match");
        test:assertTrue(result.theme.length() > 0, "Theme should not be empty");
        test:assertTrue(result.language.length() > 0, "Language should not be empty");
    }
}

@test:Config {}
function testValidateUserDataValid() returns error? {
    user:UserService userService = new();
    
    user:UserProfileUpdate validData = {
        username: "validuser",
        email: "valid@example.com",
        firstName: "Valid",
        lastName: "User",
        attributes: {}
    };
    
    boolean|error result = userService.validateUserData(validData);
    test:assertTrue(result is boolean, "Should return boolean for valid data");
    
    if (result is boolean) {
        test:assertTrue(result, "Valid data should pass validation");
    }
}

@test:Config {}
function testValidateUserDataInvalidEmail() returns error? {
    user:UserService userService = new();
    
    user:UserProfileUpdate invalidData = {
        username: "testuser",
        email: "invalid-email",
        firstName: "Test",
        lastName: "User",
        attributes: {}
    };
    
    boolean|error result = userService.validateUserData(invalidData);
    test:assertTrue(result is error, "Should return error for invalid email");
}

@test:Config {}
function testValidateUserDataShortUsername() returns error? {
    user:UserService userService = new();
    
    user:UserProfileUpdate invalidData = {
        username: "ab", // Too short
        email: "test@example.com",
        firstName: "Test",
        lastName: "User",
        attributes: {}
    };
    
    boolean|error result = userService.validateUserData(invalidData);
    test:assertTrue(result is error, "Should return error for short username");
}

// Test User Controller
@test:Config {}
function testUserControllerInit() returns error? {
    user:UserController userController = new();
    test:assertTrue(userController is user:UserController, "User controller should be initialized");
}
