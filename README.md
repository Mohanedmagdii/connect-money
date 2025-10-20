# Connect Money API

A simple NestJS application for user management and money deposits.

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Docker and Docker Compose
- MongoDB

### Running the Application

#### Option 1: Using Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd connect-money
   ```

2. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env file with your preferred settings
   ```

3. **Run with Docker Compose**
   ```bash
   docker-compose up --build -d
   ```

4. **Check if services are running**
   ```bash
   docker-compose ps
   ```

The application will be available at `http://localhost:3000`

#### Option 2: Local Development

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp env.example .env
   # Update .env with your MongoDB connection string
   ```

3. **Run the application**
   ```bash
   # Development mode
   npm run start:dev
   
   # Production mode
   npm run build
   npm run start:prod
   ```

## API Endpoints

Base URL: `http://localhost:3000`

### 1. Register User

**POST** `/users`

Creates a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "username": "johndoe",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "username": "johndoe",
    "balance": 0
  },
  "accessToken": "jwt_token_here",
  "refreshToken": "refresh_token_here"
}
```

### 2. Login User

**POST** `/users/login`

Authenticates a user and returns access tokens.

**Request Body:**
```json
{
  "username": "johndoe",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "username": "johndoe",
    "balance": 0
  },
  "accessToken": "jwt_token_here",
  "refreshToken": "refresh_token_here"
}
```

### 3. Deposit Money

**POST** `/users/deposit`

Deposits money to user's account. Requires authentication.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "amount": 100,
  "description": "deposit",
  "transaction": "idempotent key"
}
```

**Response:**
```json
{
  "transaction": {
    "_id": "transaction_id",
    "amount": 100,
    "description": "deposit",
    "transaction": "idempotent key",
    "type": "deposit",
    "user": "user_id"
  },
  "balance": 100
}
```
## Environment Variables

Copy `env.example` to `.env` and configure: