# Multi-stage build for Choreo
FROM ballerina/ballerina:2201.8.5 AS builder

# Set working directory
WORKDIR /app

# Copy project files
COPY . .

# Build the project
RUN bal build

# Runtime stage
FROM ballerina/ballerina:2201.8.5-openjdk17

# Create non-root user
RUN addgroup -g 10014 choreo && \
    adduser -D -u 10014 -G choreo choreo

# Set working directory
WORKDIR /home/choreo

# Copy built jar from builder stage
COPY --from=builder --chown=choreo:choreo /app/target/bin/*.jar app.jar

# Switch to non-root user
USER 10014

# Expose ports
EXPOSE 8080 8084 8088 8091 8092 8093 8094 8095 8096 8097 9102

# Run the application
CMD ["java", "-jar", "app.jar"]