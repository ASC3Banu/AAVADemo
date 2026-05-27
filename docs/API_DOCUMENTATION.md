# API Documentation

## Authentication API

### POST /v1/auth/login

Authenticate user and obtain access token.

**Rate Limit**: 5 requests/minute per IP

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "mfa_code": "123456" // Optional
}
```

**Success Response (200)**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "Bearer",
  "expires_in": 900
}
```

**Error Responses**:
- 400: Invalid input
- 401: Invalid credentials
- 403: Account locked
- 429: Rate limit exceeded
- 500: Server error

---

### POST /v1/auth/refresh

Refresh access token using refresh token.

**Rate Limit**: 10 requests/minute

**Request Body**:
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Success Response (200)**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "Bearer",
  "expires_in": 900
}
```

---

## Shipment API

### GET /v1/shipments/:shipment_id

Get shipment details by ID.

**Authentication**: Required
**Rate Limit**: 1000 requests/minute

**Success Response (200)**:
```json
{
  "shipment_id": "SHP123456",
  "tracking_number": "TRK1234567890",
  "status": "in_transit",
  "origin": {
    "address": "123 Main St",
    "city": "New York",
    "country": "USA"
  },
  "destination": {
    "address": "456 Oak Ave",
    "city": "Los Angeles",
    "country": "USA"
  },
  "estimated_delivery": "2024-12-25T10:00:00Z"
}
```

---

### POST /v1/shipments

Create new shipment.

**Authentication**: Required
**Authorization**: admin, manager, operator
**Rate Limit**: 100 requests/minute

**Request Body**:
```json
{
  "origin": {
    "address": "123 Main St",
    "city": "New York",
    "country": "USA",
    "postalCode": "10001"
  },
  "destination": {
    "address": "456 Oak Ave",
    "city": "Los Angeles",
    "country": "USA",
    "postalCode": "90001"
  },
  "carrier": {
    "id": "CARRIER001",
    "name": "Express Logistics",
    "serviceType": "express"
  }
}
```

**Success Response (201)**:
```json
{
  "shipment_id": "SHP123456",
  "tracking_number": "TRK1234567890",
  "status": "pending",
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

## Error Handling

All error responses follow this format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": "Additional error details",
    "timestamp": "2024-01-01T00:00:00Z",
    "request_id": "uuid-v4"
  }
}
```

### Common Error Codes

- `VALIDATION_ERROR` (400): Invalid input data
- `UNAUTHORIZED` (401): Authentication required or failed
- `FORBIDDEN` (403): Insufficient permissions
- `NOT_FOUND` (404): Resource not found
- `RATE_LIMIT_EXCEEDED` (429): Too many requests
- `INTERNAL_ERROR` (500): Server error