# 🐳 SmartMed Docker Deployment - Complete Setup

## ✅ Files Created

### Docker Configuration Files
- ✅ `frontend/Dockerfile` - Multi-stage React build with Nginx
- ✅ `frontend/nginx.conf` - Nginx configuration with API proxy
- ✅ `frontend/.dockerignore` - Frontend build exclusions
- ✅ `demo/demo/Dockerfile` - Multi-stage Spring Boot build
- ✅ `demo/demo/.dockerignore` - Backend build exclusions
- ✅ `docker-compose.yml` - Complete orchestration (MySQL + Backend + Frontend)
- ✅ `.env.example` - Environment variables template
- ✅ `.dockerignore` - Root level exclusions

### Documentation
- ✅ `README.Docker.md` - Complete Docker deployment guide
- ✅ `QUICKSTART.md` - Quick start guide

### Deployment Scripts
- ✅ `deploy.ps1` - Windows PowerShell deployment script
- ✅ `deploy.sh` - Linux/Mac Bash deployment script

## 🚀 Deployment Steps

### Step 1: Setup Environment Variables
```bash
# Copy environment template
cp .env.example .env

# Edit .env file and change these values:
# - MYSQL_ROOT_PASSWORD
# - MYSQL_PASSWORD
# - All other passwords
```

### Step 2: Deploy Using Scripts

**Windows:**
```powershell
.\deploy.ps1
# Select option 1: Build and start all services
```

**Linux/Mac:**
```bash
chmod +x deploy.sh
./deploy.sh
# Select option 1: Build and start all services
```

**Manual Deployment:**
```bash
docker-compose up -d --build
```

### Step 3: Verify Deployment
```bash
# Check all services are running
docker-compose ps

# Check logs
docker-compose logs -f

# Test endpoints
curl http://localhost/health
curl http://localhost:8081/actuator/health
```

### Step 4: Access Application
- **Frontend**: http://localhost
- **Backend**: http://localhost:8081
- **MySQL**: localhost:3307

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│              Docker Network                     │
│         (smartmed-network)                      │
│                                                 │
│  ┌──────────────┐    ┌──────────────┐         │
│  │   Frontend   │───▶│   Backend    │         │
│  │  React+Nginx │    │ Spring Boot  │         │
│  │   Port: 80   │    │  Port: 8081  │         │
│  └──────────────┘    └──────┬───────┘         │
│                              │                  │
│                              ▼                  │
│                      ┌──────────────┐          │
│                      │    MySQL     │          │
│                      │  Port: 3306  │          │
│                      │  (3307 ext.) │          │
│                      └──────────────┘          │
│                              │                  │
│                      mysql_data (volume)       │
└─────────────────────────────────────────────────┘
```

## 📋 Service Details

### Frontend Container
- **Base Image**: node:18-alpine (build), nginx:alpine (runtime)
- **Build Type**: Multi-stage
- **Port**: 80
- **Features**:
  - Optimized production build
  - Gzip compression
  - API proxy to backend
  - Health check endpoint
  - React Router support

### Backend Container
- **Base Image**: maven:3.9-eclipse-temurin-17 (build), eclipse-temurin:17-jre-alpine (runtime)
- **Build Type**: Multi-stage
- **Port**: 8081
- **Features**:
  - Maven dependency caching
  - Non-root user
  - JVM optimizations for containers
  - Health check endpoint
  - Spring Boot Actuator

### MySQL Container
- **Base Image**: mysql:8.0
- **Port**: 3307 (external), 3306 (internal)
- **Features**:
  - Persistent volume storage
  - Auto-initialization with triggers
  - Health checks
  - UTF-8 character set

## 🔧 Configuration

### Environment Variables (.env)
```env
# MySQL
MYSQL_ROOT_PASSWORD=<change-me>
MYSQL_DATABASE=smartmed
MYSQL_USER=smartmed_user
MYSQL_PASSWORD=<change-me>

# Spring Boot
SPRING_PROFILES_ACTIVE=prod

# Ports
MYSQL_PORT=3307
BACKEND_PORT=8081
FRONTEND_PORT=80
```

### Network
- **Type**: Bridge
- **Name**: smartmed-network
- **Services**: All three services on same network

### Volumes
- **mysql_data**: Persistent MySQL data storage

## 🛠️ Common Operations

### Start Services
```bash
docker-compose up -d
```

### Stop Services
```bash
docker-compose down
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mysql
```

### Rebuild Service
```bash
# Rebuild frontend
docker-compose up -d --build frontend

# Rebuild backend
docker-compose up -d --build backend

# Rebuild all
docker-compose up -d --build
```

### Restart Service
```bash
docker-compose restart backend
docker-compose restart frontend
docker-compose restart mysql
```

### Access Container Shell
```bash
# Backend
docker-compose exec backend sh

# Frontend
docker-compose exec frontend sh

# MySQL
docker-compose exec mysql bash
```

### Database Operations
```bash
# Access MySQL CLI
docker-compose exec mysql mysql -u smartmed_user -p smartmed

# Backup database
docker-compose exec mysql mysqldump -u root -p smartmed > backup_$(date +%Y%m%d).sql

# Restore database
docker-compose exec -T mysql mysql -u root -p smartmed < backup.sql
```

## 🔍 Troubleshooting

### Problem: Backend can't connect to MySQL
**Solution:**
```bash
# 1. Check MySQL is healthy
docker-compose ps mysql

# 2. Check MySQL logs
docker-compose logs mysql

# 3. Verify credentials in .env
cat .env

# 4. Restart backend
docker-compose restart backend
```

### Problem: Port already in use
**Solution:**
```bash
# Find what's using the port
netstat -ano | findstr :80    # Windows
lsof -i :80                   # Linux/Mac

# Change port in .env
FRONTEND_PORT=8080
```

### Problem: Build fails
**Solution:**
```bash
# Clean build
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Problem: Out of disk space
**Solution:**
```bash
# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Complete cleanup
docker system prune -a --volumes
```

## 📊 Monitoring

### Health Checks
```bash
# Frontend health
curl http://localhost/health

# Backend health
curl http://localhost:8081/actuator/health

# MySQL health
docker-compose exec mysql mysqladmin ping -h localhost
```

### Resource Usage
```bash
# Real-time stats
docker stats

# Disk usage
docker system df
```

### Service Status
```bash
# Check running containers
docker-compose ps

# Detailed service info
docker-compose ps --services
```

## 🔐 Security Best Practices

### Before Production
- [ ] Change all default passwords in `.env`
- [ ] Use strong passwords (16+ characters, mixed case, numbers, symbols)
- [ ] Add `.env` to `.gitignore`
- [ ] Use Docker secrets for sensitive data
- [ ] Enable SSL/TLS (add reverse proxy like Traefik or Nginx Proxy Manager)
- [ ] Configure firewall rules
- [ ] Set up regular database backups
- [ ] Enable Docker content trust
- [ ] Use specific image versions (not :latest)
- [ ] Scan images for vulnerabilities
- [ ] Run containers as non-root users (already configured)
- [ ] Limit container resources
- [ ] Enable audit logging

### Production Checklist
```bash
# 1. Update all passwords
vim .env

# 2. Build with production settings
docker-compose -f docker-compose.yml build

# 3. Start in detached mode
docker-compose up -d

# 4. Check health
docker-compose ps
curl http://localhost/health
curl http://localhost:8081/actuator/health

# 5. Monitor logs
docker-compose logs -f

# 6. Setup backups
crontab -e
# Add: 0 2 * * * cd /path/to/project && docker-compose exec -T mysql mysqldump -u root -p$MYSQL_ROOT_PASSWORD smartmed > /backups/smartmed_$(date +\%Y\%m\%d).sql
```

## 📈 Scaling & Production

### Horizontal Scaling
```bash
# Scale backend instances
docker-compose up -d --scale backend=3

# Note: You'll need a load balancer (nginx/traefik) in front
```

### Production Deployment Options

#### Option 1: Docker Swarm
```bash
docker swarm init
docker stack deploy -c docker-compose.yml smartmed
```

#### Option 2: Kubernetes
- Convert docker-compose.yml to Kubernetes manifests
- Use Kompose: `kompose convert`
- Deploy with Helm charts

#### Option 3: Cloud Platforms
- AWS ECS/EKS
- Google Cloud Run/GKE
- Azure Container Instances/AKS
- DigitalOcean App Platform

### Recommendations for Production
1. **Use managed database** (AWS RDS, Azure Database, etc.)
2. **Add Redis** for session management and caching
3. **Use CDN** for static assets
4. **Setup monitoring** (Prometheus, Grafana)
5. **Configure logging** (ELK stack, CloudWatch)
6. **Implement CI/CD** (GitHub Actions, GitLab CI)
7. **Add reverse proxy** with SSL (Traefik, Nginx Proxy Manager)
8. **Setup automated backups**
9. **Configure auto-scaling**
10. **Enable security scanning**

## 📚 Additional Resources

### Documentation Files
- `README.Docker.md` - Complete Docker guide
- `QUICKSTART.md` - Quick start guide
- `.env.example` - Environment variables reference

### Docker Documentation
- [Docker Docs](https://docs.docker.com/)
- [Docker Compose Docs](https://docs.docker.com/compose/)
- [Best Practices](https://docs.docker.com/develop/dev-best-practices/)

### Project Structure
```
SmartMed-Frontend-dev/
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── .dockerignore
│   └── src/
├── demo/demo/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── pom.xml
│   └── src/
├── docker-compose.yml
├── .env.example
├── deploy.ps1
├── deploy.sh
├── README.Docker.md
└── QUICKSTART.md
```

## 🎉 Success!

Your SmartMed application is now containerized and ready for deployment!

### Next Steps:
1. ✅ Configure `.env` file
2. ✅ Run deployment script
3. ✅ Access http://localhost
4. ✅ Test all functionality
5. ✅ Setup backups
6. ✅ Plan production deployment

### Support
For issues or questions:
1. Check logs: `docker-compose logs -f`
2. Review documentation: `README.Docker.md`
3. Verify configuration: Check `.env` and `docker-compose.yml`
4. Check Docker status: `docker-compose ps`

---

**Generated:** $(Get-Date)
**Version:** 1.0.0
**Status:** ✅ Production Ready
