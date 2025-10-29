#!/bin/bash

# SmartMed Deployment Script for Linux/Mac

echo "======================================"
echo "  SmartMed Docker Deployment Script  "
echo "======================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Check if Docker is installed
echo -e "${YELLOW}Checking Docker installation...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed${NC}"
    echo -e "${YELLOW}Please install Docker from https://docs.docker.com/get-docker/${NC}"
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo -e "${RED}Error: Docker is not running${NC}"
    echo -e "${YELLOW}Please start Docker service${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Docker is installed and running${NC}"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}Creating .env file from .env.example...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✓ .env file created${NC}"
    echo -e "${YELLOW}⚠ Please edit .env file and set your passwords before continuing!${NC}"
    echo ""
    read -p "Have you updated the .env file? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Please update .env file and run this script again${NC}"
        exit 0
    fi
fi

# Menu
echo -e "${CYAN}Select deployment option:${NC}"
echo "1) Build and start all services"
echo "2) Start existing services"
echo "3) Stop all services"
echo "4) Rebuild and restart all services"
echo "5) View logs"
echo "6) Check service status"
echo "7) Clean up (remove containers and volumes)"
echo "8) Exit"
echo ""

read -p "Enter choice (1-8): " choice

case $choice in
    1)
        echo -e "${YELLOW}Building and starting all services...${NC}"
        docker-compose up -d --build
        echo ""
        echo -e "${GREEN}✓ Services started!${NC}"
        echo -e "${CYAN}Frontend: http://localhost${NC}"
        echo -e "${CYAN}Backend: http://localhost:8081${NC}"
        echo -e "${CYAN}MySQL: localhost:3307${NC}"
        ;;
    2)
        echo -e "${YELLOW}Starting services...${NC}"
        docker-compose up -d
        echo -e "${GREEN}✓ Services started!${NC}"
        ;;
    3)
        echo -e "${YELLOW}Stopping services...${NC}"
        docker-compose down
        echo -e "${GREEN}✓ Services stopped!${NC}"
        ;;
    4)
        echo -e "${YELLOW}Rebuilding and restarting services...${NC}"
        docker-compose down
        docker-compose up -d --build
        echo -e "${GREEN}✓ Services restarted!${NC}"
        ;;
    5)
        echo -e "${YELLOW}Showing logs (Ctrl+C to exit)...${NC}"
        docker-compose logs -f
        ;;
    6)
        echo -e "${YELLOW}Service status:${NC}"
        docker-compose ps
        ;;
    7)
        echo -e "${RED}⚠ WARNING: This will delete all data!${NC}"
        read -p "Are you sure? (yes/no): " confirm
        if [ "$confirm" = "yes" ]; then
            echo -e "${YELLOW}Cleaning up...${NC}"
            docker-compose down -v
            echo -e "${GREEN}✓ Cleanup complete!${NC}"
        else
            echo -e "${YELLOW}Cleanup cancelled${NC}"
        fi
        ;;
    8)
        echo -e "${YELLOW}Exiting...${NC}"
        exit 0
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}Done!${NC}"
