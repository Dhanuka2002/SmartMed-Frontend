# SmartMed Docker Deployment Guide

## Quick Start

### Prerequisites
- Docker Engine 20.10+
- Docker Compose 2.0+
- At least 4GB RAM available
- Ports 80, 8081, and 3307 available

### Step 1: Setup Environment
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and set your passwords
# IMPORTANT: Change all default passwords!
```

### Step 2: Build and Run
```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Check service health
docker-compose ps
```

### Step 3: Access the Application
- **Frontend**: http://localhost
- **Backend API**: http://localhost:8081
- **MySQL**: localhost:3307

### Stop Services
```bash
# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: This deletes all data!)
docker-compose down -v
```

## Service Details

### Frontend (React + Vite + Nginx)
- Built with multi-stage Docker build
- Optimized nginx configuration
- Gzip compression enabled
- API proxy to backend
- Port: 80

### Backend (Spring Boot)
- Java 17 JRE Alpine
- Multi-stage Maven build
- Health check endpoint: `/actuator/health`
- Port: 8081

### Database (MySQL 8.0)
- Persistent volume for data
- Auto-initialization with triggers
- Port: 3307 (external)

## Deployment Commands

### Development
```bash
# Start services
docker-compose up

# Rebuild specific service
docker-compose up -d --build frontend
docker-compose up -d --build backend
```

### Production
```bash
# Build with no cache
docker-compose build --no-cache

# Start in detached mode
docker-compose up -d

# View logs
docker-compose logs -f backend
```

### Maintenance
```bash
# Restart a service
docker-compose restart backend

# Execute command in container
docker-compose exec backend sh
docker-compose exec mysql mysql -u smartmed_user -p smartmed

# Backup database
docker-compose exec mysql mysqldump -u root -p smartmed > backup.sql

# Restore database
docker-compose exec -T mysql mysql -u root -p smartmed < backup.sql
```

## Troubleshooting

### Backend can't connect to MySQL
```bash
# Check MySQL is healthy
docker-compose ps

# Check backend logs
docker-compose logs backend

# Restart backend
docker-compose restart backend
```

### Frontend can't reach backend
1. Check nginx configuration in `frontend/nginx.conf`
2. Verify backend is running: `curl http://localhost:8081/actuator/health`
3. Check network: `docker network inspect smartmed-frontend-dev_smartmed-network`

### Port conflicts
Edit `.env` file and change port mappings:
```
FRONTEND_PORT=8080
BACKEND_PORT=8082
MYSQL_PORT=3308
```

Then update `docker-compose.yml` ports section.

## Environment Variables

### MySQL
- `MYSQL_ROOT_PASSWORD`: Root user password
- `MYSQL_DATABASE`: Database name
- `MYSQL_USER`: Application user
- `MYSQL_PASSWORD`: Application user password

### Backend
- `SPRING_DATASOURCE_URL`: Database connection URL
- `SPRING_DATASOURCE_USERNAME`: Database username
- `SPRING_DATASOURCE_PASSWORD`: Database password
- `SPRING_PROFILES_ACTIVE`: Spring profile (dev/prod)

## Security Notes

1. **Change default passwords** in `.env`
2. **Don't commit** `.env` to version control
3. Use **secrets management** for production
4. Enable **SSL/TLS** for production (add reverse proxy like Traefik)
5. Configure **firewall rules** to restrict database access

## Scaling

To scale the backend:
```bash
docker-compose up -d --scale backend=3
```

For production, consider:
- Kubernetes deployment
- Load balancer
- Separate database server
- Redis for session management
- CDN for static assets

## Monitoring

### Health Checks
```bash
# Frontend
curl http://localhost/health

# Backend
curl http://localhost:8081/actuator/health

# MySQL
docker-compose exec mysql mysqladmin ping -h localhost
```

### Resource Usage
```bash
docker stats
```

## Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend

# Last 100 lines
docker-compose logs --tail=100 frontend
```

## Clean Up

```bash
# Stop and remove containers
docker-compose down

# Remove volumes (WARNING: Deletes all data)
docker-compose down -v

# Remove images
docker-compose down --rmi all

# Complete cleanup
docker system prune -a --volumes
```
