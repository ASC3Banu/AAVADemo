# AI-Powered Logistics Monitoring System - Backend API

## Overview

Enterprise-grade backend API for the AI-Powered Logistics Monitoring System with comprehensive security, compliance, and observability features.

## Features

### Security
- **Authentication**: OAuth 2.0 + JWT with refresh tokens
- **Authorization**: Role-Based Access Control (RBAC)
- **Encryption**: AES-256-GCM for data at rest, TLS 1.3 for data in transit
- **Input Validation**: Zod schema validation on all endpoints
- **Rate Limiting**: Configurable per-endpoint rate limits
- **Account Protection**: Login attempt tracking and account lockout
- **MFA Support**: Multi-factor authentication ready

### Compliance
- **GDPR**: Consent management, right to be forgotten, data portability
- **PCI-DSS**: Secure payment data handling
- **ISO 27001**: Security controls and audit trails
- **SOC 2**: Comprehensive logging and monitoring
- **Data Residency**: Configurable data location compliance

### Observability
- **Structured Logging**: Winston with daily log rotation
- **Audit Trail**: Separate audit log for compliance
- **Data Lineage**: Track data access and modifications
- **PII Filtering**: Automatic redaction of sensitive data in logs
- **Metrics**: Performance and business metrics tracking
- **Health Checks**: Liveness and readiness probes

### Performance
- **Caching**: Redis for session and data caching
- **Connection Pooling**: Optimized database connections
- **Compression**: Response compression enabled
- **Query Optimization**: Indexed database queries

## Architecture

```
src/
├── configs/          # Configuration management
│   ├── app.config.ts
│   ├── database.config.ts
│   ├── redis.config.ts
│   └── logger.config.ts
├── controllers/      # Request handlers
│   ├── auth.controller.ts
│   └── shipment.controller.ts
├── services/         # Business logic
│   ├── auth.service.ts
│   ├── shipment.service.ts
│   └── metrics.service.ts
├── repositories/     # Data access layer
│   └── shipment.repository.ts
├── models/           # Database models
│   ├── user.model.ts
│   ├── shipment.model.ts
│   └── notification.model.ts
├── middlewares/      # Express middlewares
│   ├── auth.middleware.ts
│   ├── validation.middleware.ts
│   ├── error.middleware.ts
│   └── logging.middleware.ts
├── routes/           # API route definitions
│   ├── auth.routes.ts
│   ├── shipment.routes.ts
│   ├── analytics.routes.ts
│   ├── notification.routes.ts
│   ├── user.routes.ts
│   └── prediction.routes.ts
├── resources/        # Utility resources
│   ├── encryption.resource.ts
│   └── consent.resource.ts
├── tests/            # Test suites
│   ├── auth.test.ts
│   ├── shipment.test.ts
│   └── integration/
└── index.ts          # Application entry point
```

## Getting Started

### Prerequisites
- Node.js >= 18.0.0
- MongoDB >= 7.0
- Redis >= 7.0
- npm >= 9.0.0

### Installation

```bash
# Clone repository
git clone https://github.com/ASC3Banu/AAVADemo.git
cd AAVADemo

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Update .env with your configuration
```

### Development

```bash
# Start development server with hot reload
npm run dev

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run integration tests
npm run test:integration

# Lint code
npm run lint

# Format code
npm run format
```

### Production Build

```bash
# Build TypeScript
npm run build

# Start production server
npm start
```

### Docker Deployment

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop services
docker-compose down
```

## API Documentation

### Base URL
- Development: `http://localhost:3000`
- Staging: `https://api-staging.logistics.example.com`
- Production: `https://api.logistics.example.com`

### Authentication

All API requests (except `/auth/login`) require a valid JWT token in the Authorization header:

```
Authorization: Bearer <access_token>
```

### Endpoints

#### Authentication
- `POST /v1/auth/login` - User login
- `POST /v1/auth/refresh` - Refresh access token
- `POST /v1/auth/logout` - User logout

#### Shipments
- `GET /v1/shipments` - List shipments
- `GET /v1/shipments/:id` - Get shipment details
- `POST /v1/shipments` - Create shipment
- `PATCH /v1/shipments/:id/status` - Update shipment status

#### Analytics
- `GET /v1/analytics/shipments` - Shipment analytics
- `GET /v1/analytics/carriers` - Carrier performance

#### Notifications
- `GET /v1/notifications` - List notifications
- `PATCH /v1/notifications/:id/read` - Mark as read

#### Users
- `GET /v1/users/me` - Get user profile
- `PATCH /v1/users/me` - Update user profile

#### Predictions
- `POST /v1/predictions/delivery` - Get delivery prediction

### Rate Limits
- Login: 5 requests/minute
- Read operations: 1000 requests/minute
- Write operations: 100 requests/minute
- Analytics: 100 requests/minute

## Security Best Practices

1. **Environment Variables**: Never commit `.env` files
2. **Secrets Management**: Use AWS Secrets Manager or Azure Key Vault in production
3. **TLS**: Always use TLS 1.3 in production
4. **Password Policy**: Minimum 8 characters, complexity requirements
5. **Session Management**: 15-minute access token expiry
6. **Account Lockout**: 5 failed attempts = 15-minute lockout
7. **Input Validation**: All inputs validated with Zod schemas
8. **SQL Injection**: MongoDB sanitization enabled
9. **XSS Protection**: Helmet security headers
10. **CORS**: Configured allowed origins only

## Compliance

### GDPR
- User consent tracking
- Right to access personal data
- Right to be forgotten
- Data portability
- Breach notification procedures

### PCI-DSS
- Encrypted cardholder data
- Access controls
- Regular security testing
- Audit trails

### Audit Logging
- All authentication events
- All data access events
- All data modification events
- All administrative actions
- Logs retained for 7 years

## Monitoring

### Health Checks
- `/health` - Basic health check
- `/health/ready` - Readiness probe (checks dependencies)

### Logs
- Application logs: `logs/application-YYYY-MM-DD.log`
- Error logs: `logs/error-YYYY-MM-DD.log`
- Audit logs: `logs/audit-YYYY-MM-DD.log`
- Data lineage: `logs/data-lineage-YYYY-MM-DD.log`

## Testing

### Unit Tests
```bash
npm test
```

### Integration Tests
```bash
npm run test:integration
```

### Coverage Requirements
- Branches: 70%
- Functions: 70%
- Lines: 70%
- Statements: 70%

## Deployment

### Environment Setup
1. Configure environment variables
2. Set up MongoDB cluster
3. Set up Redis cluster
4. Configure TLS certificates
5. Set up monitoring and alerting
6. Configure backup procedures

### CI/CD Pipeline
1. Code checkout
2. Dependency installation
3. Linting
4. Unit tests
5. Integration tests
6. Security scanning
7. Build Docker image
8. Push to registry
9. Deploy to environment
10. Health check validation

## Support

For issues, questions, or contributions:
- GitHub Issues: https://github.com/ASC3Banu/AAVADemo/issues
- Documentation: See `/docs` folder
- Enterprise Support: Contact Enterprise Architecture Team

## License

Proprietary - Internal Use Only

## Version

1.0.0 - Initial Release