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
