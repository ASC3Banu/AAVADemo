# AI-Powered Logistics Monitoring System

## Overview
Enterprise-grade backend system for AI-powered logistics monitoring and tracking.

## Features
- ✅ RESTful API with OpenAPI 3.0 specification
- ✅ OAuth 2.0 authentication with JWT tokens
- ✅ Role-Based Access Control (RBAC)
- ✅ Multi-Factor Authentication (MFA)
- ✅ AES-256 encryption for sensitive data
- ✅ TLS 1.3 for data in transit
- ✅ Comprehensive audit logging
- ✅ Data lineage tracking
- ✅ PII/PHI/PCI data filtering
- ✅ Rate limiting (Standard/Premium/Enterprise tiers)
- ✅ AI-powered predictive analytics
- ✅ Real-time shipment tracking
- ✅ Webhook integrations
- ✅ Prometheus metrics

## Compliance
- ✅ SOC 2 Type II
- ✅ GDPR
- ✅ PCI-DSS
- ✅ ISO 27001

## Technology Stack
- **Framework:** FastAPI 0.109.0
- **Database:** PostgreSQL 15
- **Cache:** Redis 7
- **Language:** Python 3.11
- **Monitoring:** Prometheus

## Project Structure
```
src/
├── main.py                 # Application entry point
├── controllers/            # API controllers
│   ├── auth_controller.py
│   ├── shipment_controller.py
│   ├── analytics_controller.py
│   ├── notification_controller.py
│   └── integration_controller.py
├── services/               # Business logic
│   ├── auth_service.py
│   ├── shipment_service.py
│   ├── analytics_service.py
│   ├── notification_service.py
│   └── integration_service.py
├── repositories/           # Data access layer
│   ├── user_repository.py
│   ├── shipment_repository.py
│   ├── analytics_repository.py
│   ├── notification_repository.py
│   └── integration_repository.py
├── models/                 # Data models
│   ├── auth_models.py
│   ├── shipment_models.py
│   ├── analytics_models.py
│   ├── notification_models.py
│   └── integration_models.py
├── resources/              # Cross-cutting concerns
│   ├── encryption_service.py
│   ├── audit_logger.py
│   ├── rate_limiter.py
│   ├── rbac.py
│   ├── pii_filter.py
│   ├── data_lineage.py
│   └── ml_service.py
├── configs/                # Configuration
│   ├── app_config.py
│   ├── database.py
│   ├── logging_config.py
│   └── security_config.py
└── tests/                  # Test suite
    ├── test_auth_controller.py
    ├── test_shipment_controller.py
    ├── test_analytics_service.py
    ├── test_encryption_service.py
    ├── test_rate_limiter.py
    ├── test_pii_filter.py
    └── test_integration.py
```

## Installation

### Prerequisites
- Python 3.11+
- PostgreSQL 15+
- Redis 7+
- Docker (optional)

### Local Setup
1. Clone the repository
```bash
git clone https://github.com/ASC3Banu/AAVADemo.git
cd AAVADemo
```

2. Create virtual environment
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies
```bash
pip install -r requirements.txt
```

4. Configure environment
```bash
cp .env.example .env
# Edit .env with your configuration
```

5. Initialize database
```bash
alembic upgrade head
```

6. Run application
```bash
uvicorn src.main:app --reload
```

### Docker Setup
```bash
docker-compose up -d
```

## API Documentation
Once running, access:
- Swagger UI: http://localhost:8000/api/docs
- ReDoc: http://localhost:8000/api/redoc
- OpenAPI JSON: http://localhost:8000/api/openapi.json

## Testing
```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=src --cov-report=html

# Run specific test file
pytest src/tests/test_auth_controller.py
```

## Monitoring
- Health Check: http://localhost:8000/health
- Metrics: http://localhost:8000/metrics
- Prometheus: http://localhost:9090

## Security

### Authentication
1. Obtain access token:
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \n  -H "Content-Type: application/json" \n  -d '{"email":"user@example.com","password":"SecurePass123!"}'
```

2. Use token in requests:
```bash
curl -X GET http://localhost:8000/api/v1/shipments \n  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Rate Limiting
- Standard: 1,000 requests/hour
- Premium: 10,000 requests/hour
- Enterprise: 100,000 requests/hour

## Deployment

### Production Checklist
- [ ] Change all default secrets in `.env`
- [ ] Enable HTTPS/TLS 1.3
- [ ] Configure firewall rules
- [ ] Set up database backups
- [ ] Configure log rotation
- [ ] Enable monitoring alerts
- [ ] Review RBAC permissions
- [ ] Conduct security audit
- [ ] Load test the system
- [ ] Document runbooks

## Contributing
1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## License
Proprietary - All rights reserved

## Support
For support, contact: api-support@logistics-monitoring.example.com

## Version History
- v1.0.0 (2024) - Initial release

## Audit Log
All operations are logged in:
- `logs/app.log` - Application logs
- `logs/audit.log` - Audit trail
- `logs/data_lineage.log` - Data lineage tracking

## Compliance Documentation
See `/docs` folder for:
- Security policies
- Compliance certifications
- Audit reports
- Architecture diagrams