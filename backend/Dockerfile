# Use official Ballerina runtime
FROM ballerina/ballerina:2201.8.0

# Set working directory
WORKDIR /home/ballerina

# Copy project files
COPY . .

# Remove cloud.toml if exists to avoid cloud extension issues
RUN rm -f Cloud.toml

# Build the Ballerina project without cloud extension
RUN bal build --skip-tests --offline || bal build --skip-tests

# Expose all service ports
EXPOSE 9090 8084 8085 8086 8087 8088 8091 8097 9095

# Run the application
CMD ["java", "-jar", "target/bin/Cyclesync.jar"]