# 🚀 SmartMed Docker Quick Start

## Prerequisites
- Docker Desktop (Windows/Mac) or Docker Engine (Linux)
- At least 4GB RAM
- Ports 80, 8081, 3307 available

## 🎯 Quick Deploy (Windows)

```powershell
# 1. Setup environment
Copy-Item .env.example .env
# Edit .env and change passwords

# 2. Deploy using script
.\deploy.ps1

# OR manually:
docker-compose up -d --build
```

## 🎯 Quick Deploy (Linux/Mac)

```bash
# 1. Setup environment
cp .env.example .env
# Edit .env and change passwords

# 2. Deploy using script
chmod +x deploy.sh
./deploy.sh

# OR manually:
docker-compose up -d --build
```

## 📦 What Gets Deployed

### Services
1. **MySQL 8.0** - Database (Port 3307)
2. **Spring Boot Backend** - Java API (Port 8081)
3. **React Frontend** - Web UI (Port 80)

### Containers
- `smartmed-mysql` - MySQL database
- `smartmed-backend` - Spring Boot API
- `smartmed-frontend` - React app with Nginx

### Volumes
- `mysql_data` - Persistent database storage

### Network
- `smartmed-network` - Bridge network for inter-service communication

## 🌐 Access URLs

After deployment:
- **Frontend**: http://localhost
- **Backend API**: http://localhost:8081
- **Backend Health**: http://localhost:8081/actuator/health
- **MySQL**: localhost:3307

## ⚙️ Common Commands

```bash
# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend

# Check status
docker-compose ps

# Restart service
docker-compose restart backend

# Stop all
docker-compose down

# Stop and remove data
docker-compose down -v
```

## 🔧 Troubleshooting

### Backend won't start
```bash
# Check MySQL is ready
docker-compose logs mysql

# Restart backend
docker-compose restart backend
```

### Port conflicts
Edit `.env` file:
```env
FRONTEND_PORT=8080
BACKEND_PORT=8082
MYSQL_PORT=3308
```

### Database connection failed
```bash
# Check MySQL health
docker-compose exec mysql mysqladmin ping

# Verify credentials in .env match docker-compose.yml
```

## 📊 Monitoring

```bash
# Real-time resource usage
docker stats

# Health checks
curl http://localhost/health
curl http://localhost:8081/actuator/health
```

## 🗄️ Database Management

```bash
# Access MySQL shell
docker-compose exec mysql mysql -u smartmed_user -p

# Backup database
docker-compose exec mysql mysqldump -u root -p smartmed > backup.sql

# Restore database
docker-compose exec -T mysql mysql -u root -p smartmed < backup.sql
```

## 🔐 Security Checklist

- [ ] Changed all default passwords in `.env`
- [ ] Added `.env` to `.gitignore`
- [ ] Using strong passwords (16+ characters)
- [ ] Enabled firewall rules for production
- [ ] Planning SSL/TLS for production
- [ ] Regular database backups scheduled

## 📚 Full Documentation

See `README.Docker.md` for complete documentation including:
- Detailed configuration
- Production deployment
- Scaling strategies
- Advanced troubleshooting

## 🆘 Need Help?

1. Check logs: `docker-compose logs -f`
2. Review `README.Docker.md`
3. Verify `.env` configuration
4. Check Docker Desktop is running
5. Ensure ports are not in use

## 🎉 You're Ready!

Once deployed, access the application at http://localhost and start using SmartMed!
