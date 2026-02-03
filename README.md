# CoffeeDoor API Gateway

Central entry point for the CoffeeDoor microservices ecosystem. This service handles authentication, authorization, request routing, and provides observability features for all downstream microservices.

## Technology Stack

- **Framework**: NestJS v11
- **Language**: TypeScript 5.7
- **Runtime**: Node.js 24
- **RPC Protocol**: gRPC (for microservice communication)
- **Message Queue**: RabbitMQ (for async notifications)
- **Authentication**: JWT with Passport.js
- **Observability**: Prometheus metrics + OpenTelemetry/Jaeger tracing
- **API Documentation**: Swagger/OpenAPI

## Project Structure

```
api-gateway/
├── src/
│   ├── auth/                    # Authentication module (signup, signin, tokens)
│   ├── user/                    # User profile & admin management
│   ├── menu-category/           # Menu category CRUD operations
│   ├── menu-item/               # Menu item management
│   ├── media/                   # File upload (avatars)
│   ├── health-check/            # Microservices health monitoring
│   ├── supervision/
│   │   ├── metrics/             # Prometheus metrics collection
│   │   └── tracing/             # OpenTelemetry/Jaeger tracing
│   ├── transport/
│   │   └── message-broker/      # RabbitMQ integration
│   ├── common/                  # Shared DTOs and enums
│   ├── configs/                 # gRPC client configuration
│   ├── utils/                   # Interceptors, filters, helpers
│   └── generated-types/         # Auto-generated protobuf types
├── proto/                       # Protocol buffer definitions
├── test/                        # E2E tests
├── Dockerfile
└── docker-compose.yml
```

## Connected Microservices

| Service | Protocol | Purpose |
|---------|----------|---------|
| User Microservice | gRPC | Authentication, user management |
| Menu Microservice | gRPC | Menu categories and items |
| Media Microservice | gRPC | File storage operations |
| Notification Microservice | RabbitMQ | Email notifications |

## Environment Variables

Create a `.env` file based on `.env.example`:

```env
# Server
NODE_ENV=development
HTTP_PORT=

# gRPC Microservices
MENU_MICROSERVICE_GRPC_URL=0.0.0.0:5001
USER_MICROSERVICE_GRPC_URL=0.0.0.0:5002
MEDIA_MICROSERVICE_GRPC_URL=0.0.0.0:5003

# Cookie Configuration
COOKIE_SECRET=your_cookie_secret_key_here
COOKIE_DOMAIN=your_domain

# JWT
JWT_ACCESS_SECRET=your_jwt_access_secret_key

# RabbitMQ
RABBITMQ_URL=
RABBITMQ_QUEUE=
```

## Installation

```bash
npm install
```

## Running the Service

```bash
# Development (watch mode)
npm run start:dev

# Production build
npm run build
npm run start:prod

# Debug mode
npm run start:debug
```

## Docker

```bash
# Build image
docker build -t api-gateway .

# Run with docker-compose
docker-compose up
```

## API Endpoints

### Authentication (`/auth`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/signup` | No | Register new user |
| POST | `/auth/signin` | No | Login user |
| POST | `/auth/verify-email?token=` | No | Verify email address |
| POST | `/auth/resend-confirmation-email` | No | Resend verification email |
| POST | `/auth/refresh-tokens` | Cookie | Refresh JWT tokens |
| POST | `/auth/logout` | JWT | Clear refresh token |
| POST | `/auth/init-reset-password` | No | Initiate password reset |
| POST | `/auth/resend-reset-password-email` | No | Resend password reset email |
| POST | `/auth/set-new-password?token=` | No | Set new password |

### User (`/user`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/user/me` | JWT | Get own profile |
| GET | `/user/:id` | JWT | Get user by ID |
| POST | `/user/update` | JWT | Update profile |
| DELETE | `/user/delete` | JWT | Delete account |
| POST | `/user/confirm-password` | JWT | Verify password |
| POST | `/user/change-password` | JWT | Change password |

### Admin (`/admin`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/admin/users` | ADMIN | List all users (paginated) |
| GET | `/admin/user/:id` | ADMIN | Get user details |
| POST | `/admin/ban` | ADMIN | Ban user |
| POST | `/admin/unban` | ADMIN | Unban user |
| POST | `/admin/change-role/:id` | ADMIN | Change user role |
| GET | `/admin/banned-users` | ADMIN | List banned users |
| GET | `/admin/ban-details/:id` | ADMIN | Get ban info |

### Menu Category (`/menu-category`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/menu-category?language=` | ADMIN/MOD | Get categories by language (EN, UA, RU) |
| GET | `/menu-category/:id` | ADMIN/MOD | Get category details |
| POST | `/menu-category/create` | ADMIN/MOD | Create category |
| PATCH | `/menu-category/update/:id` | ADMIN/MOD | Update category |
| PATCH | `/menu-category/change-position/:id` | ADMIN/MOD | Reorder category |
| DELETE | `/menu-category/:id` | ADMIN/MOD | Delete category |

### Menu Item (`/menu-item`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/menu-item?categoryId=` | ADMIN/MOD | Get items by category |
| GET | `/menu-item/:id` | ADMIN/MOD | Get item details |

### Media (`/media`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/media/upload-avatar` | JWT | Upload avatar (max 1MB, JPEG/PNG/GIF/WebP) |
| DELETE | `/media/remove-avatar` | JWT | Remove avatar |

### Health & Monitoring

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health-check` | No | Check all microservices status |
| GET | `/metrics` | No | Prometheus metrics |
| GET | `/docs` | No | Swagger API documentation |

## Authentication & Authorization

### JWT Strategy
- Access tokens via `Authorization: Bearer <token>` header
- Refresh tokens via HTTP-only cookies

### Custom Decorators

```typescript
// Require JWT authentication
@Protected()

// Require specific roles
@Protected(UserRole.ADMIN)
@Protected(UserRole.ADMIN, UserRole.MODERATOR)

// Extract user ID from token
@UserId() userId: string
```

### Guards

- **JwtAuthGuard**: Validates JWT tokens
- **RolesGuard**: Enforces role-based access control

## Observability

### Prometheus Metrics

Available at `GET /metrics`:

- `http_request_duration_seconds` - Request latency histogram
- `http_active_requests` - Current active requests gauge
- `http_requests_total` - Total request counter

Labels: `service`, `method`, `route`, `status_code`

### Distributed Tracing

OpenTelemetry integration with Jaeger exporter for request tracing across microservices.

## Error Handling

gRPC errors are automatically mapped to HTTP status codes:

| gRPC Code | HTTP Status |
|-----------|-------------|
| CANCELLED (1) | 422 Unprocessable Entity |
| INVALID_ARGUMENT (3) | 400 Bad Request |
| DEADLINE_EXCEEDED (4) | 504 Gateway Timeout |
| NOT_FOUND (5) | 404 Not Found |
| ALREADY_EXISTS (6) | 409 Conflict |
| PERMISSION_DENIED (7) | 403 Forbidden |
| RESOURCE_EXHAUSTED (8) | 429 Too Many Requests |
| UNAUTHENTICATED (16) | 401 Unauthorized |

## Testing

```bash
# Unit tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:cov

# E2E tests
npm run test:e2e
```

## Code Quality

```bash
# Lint
npm run lint

# Format
npm run format
```

## Protocol Buffers

Proto definitions are located in `/proto/`:

- `auth.proto` - Authentication service
- `user.proto` - User service
- `menu-category.proto` - Menu category service
- `menu-item.proto` - Menu item service
- `health-check.proto` - Health check service

Generated TypeScript types are in `src/generated-types/`.

## Architecture Diagram

```
┌─────────────┐     HTTP/REST      ┌─────────────────┐
│   Client    │ ─────────────────► │   API Gateway   │
└─────────────┘                    │   (Port 4004)   │
                                   └────────┬────────┘
                                            │
                    ┌───────────────────────┼───────────────────────┐
                    │                       │                       │
                    ▼ gRPC                  ▼ gRPC                  ▼ RabbitMQ
           ┌───────────────┐       ┌───────────────┐       ┌───────────────┐
           │     User      │       │     Menu      │       │ Notification  │
           │ Microservice  │       │ Microservice  │       │ Microservice  │
           │  (Port 5002)  │       │  (Port 5001)  │       │   (Queue)     │
           └───────────────┘       └───────────────┘       └───────────────┘
                    │                       │
                    ▼                       ▼
           ┌───────────────┐       ┌───────────────┐
           │   Postgresql  │       │   Postgresql  │
           └───────────────┘       └───────────────┘
```

## License

This project is proprietary software for CoffeeDoor.
