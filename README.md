# GridPulse ⚡ — Smart Grid Monitoring & AI Incident Dispatch System

[![Java Version](https://img.shields.io/badge/Java-17%20%7C%2021-007396?style=for-the-badge&logo=java&logoColor=white)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.1-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![AWS RDS](https://img.shields.io/badge/AWS%20RDS-MySQL%208.4-527FFF?style=for-the-badge&logo=amazon-rds&logoColor=white)](https://aws.amazon.com/rds/)
[![Groq AI](https://img.shields.io/badge/AI-Groq%20Llama%203.3%2070B-F05032?style=for-the-badge&logo=openai&logoColor=white)](https://groq.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

**GridPulse** is an enterprise-grade, real-time smart grid monitoring and automated incident dispatch platform. It bridges grid telecommunications telemetry with Artificial Intelligence to automatically monitor electrical substations across **28 Indian states**, detect thermal/electrical anomalies, diagnose root causes in sub-seconds using LLM AI, and dispatch specialized field technicians based on active workload and domain expertise.

---

## 📋 Table of Contents
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Technology Stack](#-technology-stack)
- [User Roles & Workflows](#-user-roles--workflows)
- [Automated AI Diagnostic Dispatch](#-automated-ai-diagnostic-dispatch)
- [Getting Started Locally](#-getting-started-locally)
- [Enterprise WAR Packaging & Tomcat 10 Deployment](#-enterprise-war-packaging--tomcat-10-deployment)
- [Database Schema](#-database-schema)
- [API Documentation](#-api-documentation)
- [CI/CD & SonarQube Quality Analysis](#-cicd--sonarqube-quality-analysis)
- [License](#-license)

---

## 🚀 Key Features

* **28 Indian State Grids Live Telemetry:** Continuous tracking of voltage ($V$), current ($A$), and temperature ($^\circ C$) across major state substations (*Maharashtra, Gujarat, Tamil Nadu, Uttar Pradesh, Karnataka, etc.*).
* **Sub-Second LLM Root-Cause Diagnosis:** Instant fault classification and repair recommendations powered by **Groq Llama 3.3 70B** via LangChain4j.
* **Workload-Balanced Automated Dispatch:** Smart assignment of repair tickets based on technician domain specialization (*Transformer, Cable, High Voltage*), status, and active workload counts.
* **Unified Single WAR Architecture:** React 18 Single Page Application (SPA) embedded directly inside Spring Boot 3 web application (`GridPulse.war`) with fallback routing for Apache Tomcat 10.
* **Production Configuration Externalization:** Dedicated `prod` profile with environment variable dynamic bindings (`application-prod.yml` & `setenv.sh`).
* **Secure Authentication & OTP Workflows:** JWT stateless security, BCrypt password hashing, and step-validated email OTP password reset.
* **Production Logback Logging:** Rolling daily file logging (`logs/gridpulse.log`) with 30-day automated retention and gzip compression.

---

## 🏗️ System Architecture

```
                  ┌─────────────────────────────────────────┐
                  │         Client Web Browser (SPA)        │
                  └────────────────────┬────────────────────┘
                                       │
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │         Apache Tomcat 10 Server         │
                  │             (GridPulse.war)             │
                  └────────────────────┬────────────────────┘
                                       │
           ┌───────────────────────────┴───────────────────────────┐
           ▼                                                       ▼
┌────────────────────┐                                   ┌────────────────────┐
│  Spring Security   │                                   │   Embedded React   │
│   (JWT Filter)     │                                   │    Static Build    │
└──────────┬─────────┘                                   └────────────────────┘
           │
           ▼
┌────────────────────┐          Anomalies          ┌──────────────────────────┐
│ REST Controllers & │ ──────────────────────────► │  LangChain4j Groq Agent  │
│  Business Services │ ◄────────────────────────── │  (Llama-3.3-70b-versatile)│
└──────────┬─────────┘        AI Diagnosis         └──────────────────────────┘
           │
           ▼
┌────────────────────┐
│   AWS RDS MySQL    │
│  (Cloud Database)  │
└────────────────────┘
```

---

## 🛠️ Technology Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Recharts, Lucide Icons | Responsive glassmorphic UI, telemetry graphs, role-specific views |
| **Backend** | Java 17 / 21, Spring Boot 3.3.1, Spring Security, Spring Data JPA | RESTful APIs, JWT Auth, Actuator Health Endpoints |
| **AI Engine** | LangChain4j 0.31.0, Groq API (`llama-3.3-70b-versatile`) | Real-time incident diagnosis, repair procedure generation |
| **Database** | AWS RDS (MySQL 8.4 Community Edition) | Enterprise cloud relational storage for grid telemetry and users |
| **Packaging & Server** | Apache Tomcat 10, Maven WAR Packaging | Single-file WAR deployment with Spring Servlet Initializer |
| **DevOps & CI/CD** | GitHub Actions, SonarQube, Logback | Automated build pipelines, code quality gate, daily log rolling |

---

## 👥 User Roles & Workflows

1. **`ADMIN` (System Administrator):**
   * Manages user accounts and registers technicians.
   * Links technician profiles to employee accounts.
   * Views system audit trails and grid capacity limits.

2. **`OPERATOR` (Grid Control Room Operator):**
   * Monitors real-time telemetry across all 28 state substations.
   * Reviews AI-generated diagnostic incidents.
   * Manually overrides technician ticket dispatches.

3. **`TECHNICIAN` (Field Service Technician):**
   * Accesses dedicated technician portal.
   * Receives auto-assigned repair tickets based on specialization.
   * Updates repair status (`ASSIGNED` $\rightarrow$ `IN_PROGRESS` $\rightarrow$ `RESOLVED`).

---

## ⚡ Automated AI Diagnostic Dispatch

When telemetry readings breach safety thresholds (e.g. Temp $> 85^\circ\text{C}$, Voltage $< 180\text{V}$ or $> 250\text{V}$):

1. **Threshold Trigger:** GridPulse telemetry service flags the anomaly.
2. **LangChain4j Analysis:** Telemetry values are sent to Groq AI (`llama-3.3-70b-versatile`).
3. **Structured Output:** Groq AI returns JSON containing:
   * **Probable Fault & Root Cause**
   * **Recommended Repair Steps**
   * **Priority Level** (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`)
   * **Technician Specialization** (e.g. *Transformer Specialist*)
4. **Smart Dispatch:** GridPulse queries available technicians, selects the one with the lowest active workload, creates a repair ticket in AWS RDS, and sends an automated notification email.

---

## 💻 Getting Started Locally

### Prerequisites
* **JDK 17 or 21**
* **Node.js 18 or 20**
* **Maven 3.8+**
* **MySQL 8.x** (or AWS RDS instance)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/Gridpulse-Smart-grid-monitor.git
cd Gridpulse-Smart-grid-monitor
```

### 2. Configure Local Database (`backend/src/main/resources/application.yml`)
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/gridpulse?createDatabaseIfNotExist=true&allowPublicKeyRetrieval=true&useSSL=false&serverTimezone=UTC
    username: root
    password: YOUR_LOCAL_MYSQL_PASSWORD
```

### 3. Run Backend Application
```bash
cd backend
mvn spring-boot:run
```
*(Backend API runs at `http://localhost:8080`)*

### 4. Run Frontend Application
```bash
cd frontend
npm install
npm run dev
```
*(Frontend UI runs at `http://localhost:5173`)*

---

## 📦 Enterprise WAR Packaging & Tomcat 10 Deployment

GridPulse is configured to build a **single production WAR** (`GridPulse.war`) containing all embedded React frontend static assets.

### Automated Build Scripts

* **Windows PowerShell:**
  ```powershell
  ./build-war.ps1
  ```
* **Linux / macOS Bash:**
  ```bash
  chmod +x build-war.sh
  ./build-war.sh
  ```

The generated file `GridPulse.war` will be created inside `backend/target/`.

### Deployment to Apache Tomcat 10 (AWS EC2)

1. Copy `GridPulse.war` to Tomcat's `webapps/` directory on your EC2 instance.
2. Copy the deployment template from `deployment/tomcat/setenv.sh` into Tomcat's `bin/setenv.sh`:
   ```bash
   cp deployment/tomcat/setenv.sh /opt/tomcat/bin/setenv.sh
   chmod +x /opt/tomcat/bin/setenv.sh
   ```
   *(Ensure `GROQ_API_KEY` and database credentials are properly set in `setenv.sh`)*
3. Start Tomcat:
   ```bash
   sudo /opt/tomcat10/bin/startup.sh
   ```
4. Access the web application at: `http://<YOUR-EC2-IP>:8080/GridPulse/`

---

## 🗄️ Database Schema

```
 ┌─────────────────┐       ┌─────────────────┐       ┌──────────────────┐
 │      users      │       │   substations   │       │   technicians    │
 ├─────────────────┤       ├─────────────────┤       ├──────────────────┤
 │ id (PK)         │       │ id (PK)         │       │ id (PK)          │
 │ username (UQ)   │       │ name            │       │ user_id (FK) ────┼──┐
 │ password        │       │ location        │       │ name             │  │
 │ email           │       │ status          │       │ specialization   │  │
 │ role            │       │ voltage         │       │ status           │  │
 │ full_name       │       │ current         │       │ active_tickets   │  │
 └────────┬────────┘       │ temperature     │       └────────┬─────────┘  │
          │                └────────┬────────┘                │            │
          │                         │                         │            │
          └─────────────────────────┼─────────────────────────┘            │
                                    │                                      │
                                    ▼                                      │
                           ┌─────────────────┐                             │
                           │ repair_tickets  │                             │
                           ├─────────────────┤                             │
                           │ id (PK)         │                             │
                           │ substation_id(FK) ◄───────────────────────────┘
                           │ technician_id(FK)
                           │ probable_fault  │
                           │ recommended_rep │
                           │ priority        │
                           │ status          │
                           │ created_at      │
                           └─────────────────┘
```

---

## 📡 API Documentation

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Public | Authenticates user & returns JWT token |
| `POST` | `/api/auth/register` | ADMIN | Registers a new employee or technician |
| `POST` | `/api/auth/forgot-password/send-otp` | Public | Sends 6-digit verification OTP via email |
| `POST` | `/api/auth/forgot-password/reset` | Public | Verifies OTP and resets user password |
| `GET` | `/api/substations` | Authenticated | Fetches live metrics for all 28 state grids |
| `GET` | `/api/substations/{id}` | Authenticated | Fetches telemetry details for a specific substation |
| `GET` | `/api/tickets` | Authenticated | Retrieves repair tickets (filtered by user role) |
| `PUT` | `/api/tickets/{id}/status` | TECHNICIAN | Updates repair status (`IN_PROGRESS`, `RESOLVED`) |
| `GET` | `/api/technicians` | ADMIN/OPERATOR | Lists all technicians and active workload counts |
| `GET` | `/actuator/health` | Public | Health status endpoint for production monitoring |

---

## 🔄 CI/CD & SonarQube Quality Analysis

GridPulse includes a GitHub Actions pipeline (`.github/workflows/build.yml`) that triggers automatically on push to `main`:

```yaml
Developer Push -> GitHub Actions Pipeline
   ├── Step 1: Checkout Repository
   ├── Step 2: Setup Java 21 & Node.js 20
   ├── Step 3: npm install & npm run build
   ├── Step 4: Copy static build to backend resources
   ├── Step 5: mvn clean verify (Unit & Integration Tests)
   ├── Step 6: SonarQube Code Quality Analysis Scan
   └── Step 7: Upload GridPulse.war Artifact
```

To run SonarQube analysis manually:
```bash
mvn sonar:sonar \
  -Dsonar.projectKey=GridPulse \
  -Dsonar.host.url=http://localhost:9000 \
  -Dsonar.login=YOUR_SONAR_TOKEN
```

---

## 📜 License

This project is open-source under the [MIT License](LICENSE).
