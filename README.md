# AddOn - AI-powered Social Collaboration Platform (Scaffold)

This repository contains a starter scaffold for the AddOn platform: a monorepo with minimal interactive frontend, Node.js microservices (auth, gateway, chat), and a lightweight FastAPI AI embeddings service. Use this as a starting point and expand features iteratively.

Quick start (dev):

1. Copy .env.example to .env and adjust variables.
2. docker-compose -f docker-compose.dev.yml up --build
3. Open http://localhost:3000 for the frontend.

What's included:
- web/client: Vite + React + TypeScript + Material UI starter with Login and Chat pages.
- services/auth-service: Express auth stub (Google OAuth and OTP endpoints are placeholders).
- services/gateway: Simple API gateway that proxies to auth-service and exposes Socket.IO client connectivity.
- services/chat-service: Socket.IO-based chat server (basic rooms and message broadcasting).
- ai/embeddings-service: FastAPI skeleton for embeddings and RAG endpoints.
- docker-compose.dev.yml: Local dev stack (mongo, redis, qdrant, minio placeholders) and services.

Next steps:
- Replace stub endpoints with full implementations.
- Add DB integrations, JWT signing, and RBAC.
- Harden security, add tests, CI workflows, and Kubernetes manifests.

