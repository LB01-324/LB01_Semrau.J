# A simple chat app with websocket

## Prerequisites

- Docker
- Node >= 20.x

## Get Started

```bash
npm install
docker compose up -d # For starting the app as Docker containers
npm run dev # For development
npm run prod # For production or Docker init command
npm run lint # Check code style
```

Then access the frontend at http://localhost:3000

## GitHub Workflow

This repository includes a GitHub Actions workflow that automatically builds and pushes the Docker image to Docker Hub
when changes are pushed to the main or dev branch. The workflow is configured to run on a self-hosted runner on windows.

### Required GitHub Secrets

To enable the Docker Hub integration, you need to add the following secrets to your GitHub repository:

1. `DOCKERHUB_USERNAME`: Your Docker Hub username
2. `DOCKERHUB_TOKEN`: Your Docker Hub access token (not your password)
