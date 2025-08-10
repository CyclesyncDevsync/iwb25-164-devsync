// User Service - Business logic for user operations

public class UserService {
    
    public function init() returns error? {
        // Service initialization
    }

    // Get user profile by ID
    public function getUserProfileById(string userId) returns UserProfile|error {
        // In a real application, this would query a database
        return {
            userId: userId,
            username: "demo_user",
            email: "user@example.com",
            firstName: "Demo",
            lastName: "User",
            roles: ["user"],
            attributes: {
                "theme": "light",
                "language": "en",
                "timezone": "UTC"
            }
        };
    }

    // Update user profile
    public function updateUserProfile(string userId, UserProfileUpdate updateData) returns UserProfile|error {
        // In a real application, this would update the database
        return {
            userId: userId,
            username: updateData.username ?: "demo_user",
            email: updateData.email ?: "user@example.com",
            firstName: updateData.firstName,
            lastName: updateData.lastName,
            roles: ["user"],
            attributes: updateData.attributes
        };
    }

    // Get user preferences
    public function getUserPreferences(string userId) returns UserPreferences|error {
        return {
            userId: userId,
            theme: "light",
            language: "en",
            timezone: "UTC",
            notifications: {
                email: true,
                push: false,
                sms: false
            },
            privacy: {
                profileVisible: true,
                allowContactFromOthers: false
            }
        };
    }

    // Update user preferences
    public function updateUserPreferences(string userId, UserPreferences preferences) returns UserPreferences|error {
        // In a real application, this would update the database
        return preferences;
    }

    // Validate user data
    public function validateUserData(UserProfileUpdate userData) returns boolean|error {
        // Validate email format
        if (userData.email is string) {
            string email = <string>userData.email;
            if (!email.includes("@")) {
                return error("Invalid email format");
            }
        }

        // Validate username
        if (userData.username is string) {
            string username = <string>userData.username;
            if (username.length() < 3) {
                return error("Username must be at least 3 characters");
            }
        }

        return true;
    }
}
