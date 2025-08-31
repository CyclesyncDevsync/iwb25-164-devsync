# Multi-stage build for Choreo
FROM ballerina/ballerina:2201.8.5 AS builder

# Set working directory
WORKDIR /app

# Copy project files
COPY . .

# Ensure proper permissions and build the project
RUN chmod -R 755 /app && \
    rm -rf /app/target && \
    bal build

# Runtime stage
FROM ballerina/ballerina:2201.8.5-openjdk17

# Create non-root user with UID in required range (10000-20000)
RUN addgroup -g 10001 choreo && \
    adduser -D -u 10001 -G choreo choreo

# Set working directory
WORKDIR /home/choreo

# Copy built jar from builder stage
COPY --from=builder --chown=choreo:choreo /app/target/bin/*.jar app.jar

# Switch to non-root user (UID must be between 10000-20000 for Choreo)
USER 10001

# Expose ports
EXPOSE 8080 8084 8088 8091 8092 8093 8094 8095 8096 8097 9102

# Run the application
CMD ["java", "-jar", "app.jar"]