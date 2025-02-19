# gh-portfolio-pages
A static website hosted on a NodeJS Docker image that displays my personal portfolio.

# Overview
This repository contains the code and configuration for my personal portfolio website. It's a static site served using Caddy within a Docker container, making deployment straightforward and efficient.

# Features
Static Website: Fast loading times and simple maintenance.
Caddy Server: Automatic HTTPS, reverse proxy capabilities, and easy configuration.
Dockerized Deployment: Consistent environment setup and easy scalability.
# Getting Started
## Prerequisites
Docker installed on your machine. Get Docker
## Installation
1. Clone the repository

`git clone https://github.com/bquoctruong/gh-portfolio-pages.git`

2. Navigate to the project directory

`cd gh-portfolio-pages`

3. Build and run the Docker container

`docker-compose up -d`

This command uses Docker Compose to build and run the services defined in docker-compose.yml.

## Access the Website
Open your web browser and navigate to http://localhost (or the domain you've configured) to view the portfolio website.
# Configuration
- Caddy Configuration: Modify the Caddyfile to change server settings, add domains, or configure SSL.
- Website Content: Update the files in the site directory to customize the portfolio content.

# Project Structure
- Caddyfile: Configuration file for the Caddy server.
- docker-compose.yml: Defines the Docker services for easy orchestration.
- site/: Contains all the static files for the website (HTML, CSS, JS, images).

# Deployment
To deploy the website on a production server:

- Ensure Docker is installed on the server.
- Follow the installation steps mentioned above.
- Configure DNS settings to point your domain to the server's IP.
- Update the Caddyfile with your domain name for automatic HTTPS.

# Contributing
Contributions are welcome! Feel free to submit issues or pull requests to improve the project.

# License
This project is licensed under the MIT License.
