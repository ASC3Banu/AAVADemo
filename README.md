# Logistics Monitoring System - Backend API

## Overview
Enterprise-grade backend API for global shipment tracking, real-time event monitoring, AI-powered delay prediction, and automated alert generation.

## Features
- **Shipment Tracking**: Create, update, and track shipments globally
- **Real-time Events**: Monitor logistics events across the supply chain
- **AI Predictions**: Delay forecasting and route optimization
- **Alert Management**: Automated alert generation and escalation
- **Dashboard Analytics**: Operational performance insights
- **Multi-region Support**: Active-active deployment across regions

## Technology Stack
- **Runtime**: Node.js 16+
- **Framework**: Express.js
- **Databases**: PostgreSQL (shipments, users, alerts), MongoDB (events), Redis (cache)
- **Message Broker**: Apache Kafka
- **Authentication**: JWT with RBAC
- **Security**: AES-256 encryption, TLS 1.3, Helmet, CORS, Rate Limiting

## Prerequisites
- Node.js >= 16.0.0
- PostgreSQL >= 13
- MongoDB >= 5.0
- Redis >= 6.0
- Apache Kafka >= 3.0

## Installation

```bash
# Clone repository
git clone https://github.com/ASC3Banu/AAVADemo.git
cd AAVADemo

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
npm run migrate

# Start server
npm start

# Development mode with hot reload
npm run dev
```

## Environment Variables
See `.env.example` for all required environment variables.

## API Documentation

### Base URL
```
http://localhost:8001/api/v1
```

### Authentication
All endpoints (except `/auth/register` and `/auth/login`) require Bearer token authentication:
```
Authorization: Bearer <your-jwt-token>
```

### Endpoints

#### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `POST /auth/change-password` - Change password

#### Shipments
- `GET /shipments` - List all shipments (with filters)
- `POST /shipments` - Create new shipment
- `GET /shipments/:id` - Get shipment by ID
- `GET /shipments/tracking/:trackingNumber` - Track shipment
- `PUT /shipments/:id` - Update shipment
- `DELETE /shipments/:id` - Delete shipment
- `GET /shipments/statistics` - Get shipment statistics

#### Events
- `GET /events` - List all events
- `POST /events` - Create new event
- `GET /events/shipment/:shipmentId` - Get events for shipment
- `GET /events/shipment/:shipmentId/latest` - Get latest event

#### Alerts
- `GET /alerts` - List all alerts (with filters)
- `GET /alerts/:id` - Get alert by ID
- `POST /alerts/:id/acknowledge` - Acknowledge alert
- `POST /alerts/:id/resolve` - Resolve alert
- `POST /alerts/:id/dismiss` - Dismiss alert
- `GET /alerts/count` - Get active alerts count

#### Predictions
- `GET /predictions/delay/:shipmentId` - Get delay prediction
- `GET /predictions/route-optimization/:shipmentId` - Get route optimization

#### Dashboard
- `GET /dashboard/metrics` - Get dashboard metrics

#### Health Check
- `GET /health` - Service health status

## Security Features

### Encryption
- **At Rest**: AES-256-GCM encryption for sensitive data
- **In Transit**: TLS 1.3 for all communications

### Authentication & Authorization
- JWT-based authentication
- Role-Based Access Control (RBAC)
- Multi-factor authentication support
- Session management with Redis

### Compliance
- GDPR compliance (data subject rights)
- PCI-DSS compliance (payment data security)
- ISO 27001 aligned security controls
- Comprehensive audit logging
- Data retention and purging policies

### Input Validation
- Joi schema validation
- XSS protection
- SQL injection prevention
- NoSQL injection prevention
- CSRF protection

### Rate Limiting
- API rate limiting (100 req/min)
- Authentication rate limiting (5 attempts/15min)
- Distributed rate limiting with Redis

## Performance

### Response Times
- 95th percentile: <200ms
- 99th percentile: <500ms

### Throughput
- 10,000+ requests per second

### Caching Strategy
- Redis caching for frequently accessed data
- Cache invalidation on data updates
- Configurable TTL per endpoint

## Monitoring & Observability

### Logging
- Winston for structured logging
- Centralized log aggregation ready
- Log levels: error, warn, info, debug

### Metrics
- Prometheus-compatible metrics
- Performance monitoring
- Error tracking

### Audit Logging
- All data access logged
- Security events tracked
- Compliance event recording
- PII filtering in logs

## Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## Deployment

### Docker
```bash
# Build image
docker build -t logistics-monitoring-api .

# Run container
docker run -p 8001:8001 --env-file .env logistics-monitoring-api
```

### Kubernetes
```bash
# Apply configurations
kubectl apply -f k8s/

# Check deployment
kubectl get pods -n logistics
```

## Architecture

### Microservices
- Tracking Service (Node.js)
- Event Processing Service (Java Spring Boot)
- AI Prediction Service (Python/TensorFlow)
- Alert Service (Node.js)
- Dashboard Service (Node.js)

### Data Stores
- PostgreSQL: Shipments, Users, Alerts
- MongoDB: Logistics Events
- Redis: Cache & Sessions

### Message Broker
- Apache Kafka for event streaming

## Contributing
Please read CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests.

## License
MIT License - see LICENSE file for details

## Support
For issues and questions, please open a GitHub issue or contact the development team.

## Version
1.0.0

## Authors
Logistics Monitoring Team