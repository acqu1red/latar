# Latar - AI Floor Plan Generator

This repository contains the full source code for Latar, an application that generates 2D floor plans from room photos using AI.

## Project Structure

This is a monorepo containing two main projects:

-   `./frontend/`: A Vite + React + TypeScript application that serves as the user interface.
-   `./backend/`: A Node.js + Express server that handles image analysis with the OpenAI Vision API and generates the floor plans.

## Getting Started

1.  **Explore the projects**: Each sub-directory (`frontend` and `backend`) contains its own detailed `README.md` file with specific instructions for setup, local development, and deployment.
2.  **Deploy the Backend**: Start by following the instructions in `backend/README.md` to deploy the server to Railway.
3.  **Deploy the Frontend**: Once the backend is live, follow the instructions in `frontend/README.md` to configure and deploy the frontend to GitHub Pages.

The projects are designed to work together but are deployed separately to their respective hosting platforms (Railway for the backend, GitHub Pages for the frontend).
