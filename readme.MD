# 🚀 Adey – AI-Powered Chatbot for Customer Support and Sales

Adey is an AI-powered chatbot designed to enhance customer support and sales for businesses. It leverages Retrieval-Augmented Generation (RAG) to fetch answers from company documents, improving response accuracy and user experience.

## 🌟 Key Features

- 🔐 Authentication & Authorization – Secure user access.
- 💳 Payment Processing – Integrated with PayPal for seamless transactions.
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

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.
