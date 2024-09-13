# Use the official Caddy image from Docker Hub
FROM caddy:alpine

# Copy the Caddyfile to the Caddy configuration directory
COPY Caddyfile /etc/caddy/Caddyfile

# Copy the HTML files and directories containing assets, CSS, images, and JS into the container
COPY . /srv

# Set the working directory for Caddy
WORKDIR /srv

RUN chown -R caddy:caddy /srv

# Expose port 80 and 443 for HTTP and HTTPS
EXPOSE 80 443

# Use the default Caddyfile (automatically handles static files)
CMD ["caddy", "file-server", "--browse"]
