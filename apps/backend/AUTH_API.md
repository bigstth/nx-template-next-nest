# Auth API Documentation

## Endpoints

### 1. Register

**POST** `/auth/register`

**Request Body:**

```typescript
{
  email: string;      // Valid email format
  password: string;   // Min 6 characters
  role?: 'USER' | 'VIP' | 'MODERATOR' | 'ADMIN';  // Optional, defaults to USER
}
```

**Response:**

```typescript
{
  id: number;
  email: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}
```

**Validation Rules:**

- Email must be valid format
- Password must be at least 6 characters
- Role must be one of: USER, VIP, MODERATOR, ADMIN

---

### 2. Login

**POST** `/auth/login`

**Request Body:**

```typescript
{
  email: string; // Valid email format
  password: string; // Min 6 characters
}
```

**Response:**

```typescript
{
  access_token: string; // JWT token (expires in 15 minutes)
  user: {
    id: number;
    email: string;
    role: string;
  }
}
```

**Cookies Set:**

- `refresh_token`: HTTP-only, Secure (in production), SameSite=Strict, Max-Age=7 days

---

### 3. Refresh Token

**POST** `/auth/refresh`

**Requirements:**

- Must include `refresh_token` cookie

**Response:**

```typescript
{
  access_token: string; // New JWT token (expires in 15 minutes)
}
```

---

### 4. Logout

**POST** `/auth/logout`

**Requirements:**

- Must include valid `access_token` in Authorization header: `Bearer <token>`

**Response:**

```typescript
{
  message: 'Logged out successfully';
}
```

**Cookies Cleared:**

- `refresh_token`

---

## Error Responses

### Validation Error (400 Bad Request)

```typescript
{
  statusCode: 400,
  message: [
    "Invalid email format",
    "Password must be at least 6 characters long"
  ],
  error: "Bad Request"
}
```

### Unauthorized (401)

```typescript
{
  statusCode: 401,
  message: "Unauthorized"
}
```

---

## Frontend Usage Example

```typescript
import { RegisterRequestInterface, LoginRequestInterface, LoginResponseInterface, RegisterResponseInterface } from '@vcafe/shared-interfaces';

// Register
const registerData: RegisterRequestInterface = {
  email: 'user@example.com',
  password: 'password123',
  role: 'USER',
};

const registerResponse = await fetch('http://localhost:3002/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(registerData),
});

const user: RegisterResponseInterface = await registerResponse.json();

// Login
const loginData: LoginRequestInterface = {
  email: 'user@example.com',
  password: 'password123',
};

const loginResponse = await fetch('http://localhost:3002/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include', // Important for cookies
  body: JSON.stringify(loginData),
});

const loginResult: LoginResponseInterface = await loginResponse.json();
// Save access_token in memory or state management
// refresh_token is automatically stored in HTTP-only cookie

// Refresh Token
const refreshResponse = await fetch('http://localhost:3002/auth/refresh', {
  method: 'POST',
  credentials: 'include', // Important for sending cookies
});

const refreshResult = await refreshResponse.json();
// Update access_token

// Logout
await fetch('http://localhost:3002/auth/logout', {
  method: 'POST',
  headers: { Authorization: `Bearer ${accessToken}` },
  credentials: 'include',
});
```
