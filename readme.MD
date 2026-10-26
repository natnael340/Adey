# 🚀 Adey – AI-Powered Chatbot for Customer Support and Sales

Adey is an AI-powered chatbot designed to enhance customer support and sales for businesses. It leverages Retrieval-Augmented Generation (RAG) to fetch answers from company documents, improving response accuracy and user experience.

## 🌟 Key Features

- 🔐 Authentication & Authorization – Secure user access.
- 📊 Rate Limiting – Controls incoming traffic to ensure service stability.
- 📦 Containerization – Utilized for scalable deployment.
- 📜 Logging – Implements logging mechanisms for monitoring and analysis.
- ⚡ Caching – Enhances performance through efficient caching strategies.

## ⚙️ Getting Started

### 🛠️ Prerequisites

Ensure you have the following installed:

- 🐳 Docker
- 🏗️ Docker Compose

### 🚀 Installation & Setup

1️⃣ **Clone the repository**:

```
git clone https://github.com/natnael340/Adey.git
cd Adey
```

2️⃣ **Build the Docker containers**:

```
docker compose -f docker-compose.dev.yml build
```

3️⃣ **Start the application**:

```
docker compose -f docker-compose.dev.yml up
```

For production, use `docker-compose.prod.yml` instead.

## 🚢 Deployment

Every push to `main` runs the CI tests, builds an image (`ghcr.io/natnael340/adey:<commit-sha>`) and deploys it to EC2 with a blue/green switch (`devops/scripts/deploy.sh`):

1. run migrations once
2. start the idle backend color (`backend_blue` / `backend_green`) with the new image
3. wait for `/health` to pass. If it doesn't, the deploy stops and the live color keeps serving
4. point nginx at the new color (`devops/nginx/upstream/active.conf`) and reload it gracefully
5. after a short drain, stop the old color and restart the celery worker

PRs and pushes to `develop` only run checks: missing migrations, `migrate`, and `pytest`.

**Rollback:** re-run the `deploy` job of an older successful run in GitHub Actions, or run `./devops/scripts/deploy.sh <old-sha>` on the server.

The production compose file no longer includes an in-compose `db` service. Configure an external database before deploying, with `DATABASE_URL` and `PG_VECTOR_DB_URL` set in `.production.env`.


## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.
