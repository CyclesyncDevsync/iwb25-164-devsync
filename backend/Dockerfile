# Use official Ballerina runtime
FROM ballerina/ballerina:2201.8.0

# Set working directory
WORKDIR /home/ballerina

# Copy project files
COPY . .

# Build the Ballerina project
RUN bal build --skip-tests

# Expose all service ports
EXPOSE 9090 8084 8085 8086 8087 8088 9095

# Run the application
CMD ["bal", "run", "target/bin/Cyclesync.jar"]