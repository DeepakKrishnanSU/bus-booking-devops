# 🚌 Bus Booking System – DevOps Implementation

A full-stack **Bus Booking and Tracking Application** built using the MERN stack and enhanced with modern **DevOps practices** including Docker, Kubernetes, CI/CD, Terraform, and Ansible.

---

## 📌 Project Overview

This project demonstrates how a traditional web application can be transformed into a **DevOps-enabled system** with automation, scalability, and reliability.

The system allows users to:
- Search buses between locations
- View schedules and availability
- Book seats and generate tickets
- Manage bookings efficiently

---

## 🏗️ Architecture
```text
User (Browser)
      ↓
Frontend (React + NGINX)
      ↓
Backend (Node.js + Express)
      ↓
Database (MongoDB Atlas)
```
# DevOps Workflow

This project follows a streamlined CI/CD and Infrastructure as Code (IaC) pipeline to automate deployment and management.

### DevOps Flow:

**GitHub** → **Docker** → **Docker Hub** → **Kubernetes** → **Deployment**
  ↓  
**Terraform** + **Ansible**


---

## 🧰 Tech Stack

### 🌐 Application
- Frontend: React (Vite)
- Backend: Node.js, Express
- Database: MongoDB Atlas

### ⚙️ DevOps Tools
- Docker (Containerization)
- Kubernetes (Orchestration)
- GitHub Actions (CI/CD)
- Terraform (Infrastructure as Code)
- Ansible (Configuration Management)
- NGINX (Reverse Proxy)

---

## 🐳 Docker Setup

### Build Images
```bash
docker build -t bus-booking-app-main-frontend ./frontend
docker build -t bus-booking-app-main-backend ./backend
```

### Run with Docker Compose (optional)
```bash
docker-compose up
```

## ☸️ Kubernetes Deployment

### Apply configurations
```bash
kubectl apply -f k8s/
```

### Check pods
```bash
kubectl get pods
```

### Run service
```bash
minikube service frontend-service
```

## 🔄 CI/CD Pipeline
Implemented using GitHub Actions:
- Automatically installs dependencies
- Builds frontend and backend
- Creates Docker images
File:
```text
.github/workflows/main.yml
```

## 🌍 Docker Hub Images
- Frontend: deepakkrishnansu2005/frontend
- Backend: deepakkrishnansu2005/backend
```bash
docker pull deepakkrishnansu2005/frontend
docker pull deepakkrishnansu2005/backend
```

## 🏗️ Terraform (Infrastructure as Code)
Terraform is used to define infrastructure resources.

### Example:
```hcl
resource "aws_instance" "devops_server" {
  ami           = "ami-xxxx"
  instance_type = "t2.micro"
}
```

### Local Testing:
```bash
terraform init
terraform apply
```

## ⚙️ Ansible (Configuration Management)
Ansible automates environment setup and deployment.

### Example Tasks:
- Install Docker
- Start services
- Deploy containers

### Run Playbook:
```bash
ansible-playbook playbook.yml
```

## 🔍 Key Features
- ✅ Microservices Architecture
- ✅ Containerized Application
- ✅ Kubernetes Deployment (Scaling & Self-healing)
- ✅ Reverse Proxy using NGINX
- ✅ CI/CD Automation
- ✅ Infrastructure as Code (Terraform)
- ✅ Configuration Automation (Ansible)
- ✅ Health Check Endpoint (/health)

## 📊 Scalability & Reliability
- Kubernetes ReplicaSets ensure high availability
- Liveness probes enable self-healing
- NGINX ensures efficient request routing

## 🧠 DevOps Workflow
```text
1. Code pushed to GitHub
2. CI pipeline builds Docker images
3. Images stored in Docker Hub
4. Kubernetes pulls images and deploys
5. Terraform provisions infrastructure
6. Ansible configures environment
```

## 📌 Future Improvements
- Full cloud deployment (AWS/GCP)
- Monitoring (Prometheus + Grafana)
- Logging (ELK Stack)
- HTTPS & Domain setup

## 👨‍💻 Author
Deepak Krishnan S U

[LinkedIn](https://www.linkedin.com/in/deepak-krishnan-s-u-494a55291/)

## 📜 License
This project is for educational and academic purposes.
