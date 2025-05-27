# Inventory Management System

An inventory management application with real-time tracking, reporting, and user authentication.

## Project Structure

The project consists of two main parts:

- **Backend (inv-bk)**: An Elysia.js API server with MongoDB database and Redis caching
- **Frontend (inv-fr)**: A Vue.js application with responsive UI and reporting features

## Features

- **User Authentication**: Secure login/registration with JWT token-based authentication
- **Product Management**: Add, update, delete, and track inventory items
- **Inventory Tracking**: Monitor product entry, exit, and stock levels
- **Reporting**: Visualize inventory trends with charts and detailed reports
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Technology Stack

### Backend
- [Elysia.js](https://elysiajs.com/) - Fast Node.js web framework
- [MongoDB](https://www.mongodb.com/) - NoSQL database
- [Redis](https://redis.io/) - In-memory data store for caching
- [JWT](https://jwt.io/) - JSON Web Tokens for authentication
- [Bun](https://bun.sh/) - JavaScript runtime

### Frontend
- [Vue.js 3](https://vuejs.org/) - Progressive JavaScript framework
- [Vite](https://vitejs.dev/) - Frontend build tool
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Chart.js](https://www.chartjs.org/) - JavaScript charting library
- [Axios](https://axios-http.com/) - HTTP client

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
```bash
cd inv-bk
```

2. Install dependencies:
```bash
bun install
```
3. Configure environment variables in .env:
```bash
DB_CONNECT = your_mongodb_connection
JWT_ACCESS_TOKEN = your_jwt_secret
JWT_REFRESH_TOKEN = your_jwt_secret
REDIS_PORT =  your_redis_connection
DOMAIN_ORIGIN = your_domain_origin (http://localhost:5173 or https://frontend.yourdomain.com)
```
4. Run the development server:
```bash
bun run dev
```
5. Build the project:
```bash
bun run build

bun run start
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd inv-fr
```

2. Install dependencies:
```bash
bun install
```

3. Configure environment variables in .env:
```bash
VITE_BACKEND_PORT=your_backend_url (http://localhost:3000 or https://api.yourdomain.com)
```
4. Run the development server:
```bash
bun dev
```
5. Build the project:
```bash
bun run build
```
