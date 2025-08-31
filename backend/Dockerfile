# Use official Ballerina runtime
FROM ballerina/ballerina:2201.8.5

# Create a non-root user and group
RUN groupadd -g 10014 cyclesync && \
    useradd -u 10014 -g cyclesync -m -s /bin/bash cyclesync

# Set working directory
WORKDIR /home/cyclesync

# Copy project files with correct ownership
COPY --chown=cyclesync:cyclesync . .

# Switch to non-root user for building
USER cyclesync

# Remove cloud.toml if exists to avoid cloud extension issues
RUN rm -f Cloud.toml || true

# Build the Ballerina project without cloud extension
RUN bal build --skip-tests --offline || bal build --skip-tests

# Expose all service ports
EXPOSE 9090 8084 8085 8086 8087 8088 8091 8097 9095

# Run the application as non-root user
CMD ["java", "-jar", "target/bin/Cyclesync.jar"]