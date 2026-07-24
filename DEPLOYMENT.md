# GridPulse Production Deployment Guide

This guide details the deployment of the single, unified **GridPulse** enterprise application (`GridPulse.war`) to an **Apache Tomcat 10** server hosted on an **AWS EC2** instance, utilizing **Amazon RDS** for MySQL.

---

## Architecture Overview

```
[Developer Desktop] ──► [GitHub Repository] ──► [GitHub Actions (CI & Quality Scan)]
                                                               │
                                                               ▼
[Groq AI API] ◄─── [Apache Tomcat 10 (EC2)] ◄────────── [GridPulse.war]
                         │
                         ▼
                [Amazon RDS MySQL]
```

---

## 1. Prerequisite Infrastructure Setups

### A. AWS RDS Database (MySQL)
1. Launch a MySQL DB instance in AWS RDS.
2. Ensure **Port 3306** is open to your EC2 instance's security group.
3. Keep the Database Endpoint host, database name (`gridpulse`), master username, and password ready.

### B. AWS EC2 Linux Instance (Ubuntu 22.04 LTS recommended)
Ensure the instance's Security Group allows inbound connections on:
* **Port 22** (SSH)
* **Port 8080** (Default Tomcat HTTP port)
* **Port 80 / 443** (If using a reverse proxy like Nginx later)

---

## 2. Server Installation (On EC2)

Connect to your EC2 instance via SSH and execute:

```bash
# Update package index
sudo apt update && sudo apt upgrade -y

# Install OpenJDK 21
sudo apt install openjdk-21-jdk -y
java -version

# Download Apache Tomcat 10
cd /opt
sudo wget https://dlcdn.apache.org/tomcat/tomcat-10/v10.1.25/bin/apache-tomcat-10.1.25.tar.gz
sudo tar -xf apache-tomcat-10.1.25.tar.gz
sudo mv apache-tomcat-10.1.25 tomcat10
sudo rm apache-tomcat-10.1.25.tar.gz
```

---

## 3. Environment Variables Configuration

GridPulse reads database credentials, JWT properties, and AI access keys securely from environment variables.

To set these permanently for Apache Tomcat 10:
1. Open the Tomcat startup configuration script:
   ```bash
   sudo nano /opt/tomcat10/bin/setenv.sh
   ```
2. Insert the following lines, substituting your actual cloud parameters:
   ```bash
   # JVM and Spring Profile settings
   export JAVA_OPTS="-Dspring.profiles.active=prod -Djava.awt.headless=true -XX:+UseG1GC"

   # Database Settings (Amazon RDS)
   export SPRING_DATASOURCE_URL="jdbc:mysql://<your-rds-endpoint>:3306/gridpulse?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC"
   export SPRING_DATASOURCE_USERNAME="your_rds_username"
   export SPRING_DATASOURCE_PASSWORD="your_rds_password"
   export SPRING_JPA_DDL_AUTO="update"

   # Security Settings
   export JWT_SECRET="your_custom_secure_256_bit_jwt_hex_secret_here"
   export JWT_EXPIRATION_MS="86400000"
   export CORS_ALLOWED_ORIGINS="http://localhost:5173,http://your-ec2-ip-or-domain:8080"

   # Third-Party Integrations
   export GROQ_API_KEY="your_groq_api_key_here"
   export GROQ_MODEL="llama-3.3-70b-versatile"
   export DYNAMODB_MOCK="true"

   # Mail (Optional - configure if real SMTP notifications are needed)
   export SPRING_MAIL_HOST="smtp.gmail.com"
   export SPRING_MAIL_PORT="587"
   export SPRING_MAIL_USERNAME="your-email@gmail.com"
   export SPRING_MAIL_PASSWORD="your-app-password"
   ```
3. Save the file (`Ctrl+O`, `Enter`, `Ctrl+X`) and make it executable:
   ```bash
   sudo chmod +x /opt/tomcat10/bin/setenv.sh
   ```

---

## 4. Compile and Deploy the WAR

### A. Build the WAR locally (or let CI build it)
Run the automated build script on your development machine:
* **Windows (PowerShell)**: `./build-war.ps1`
* **Linux/macOS (Bash)**: `./build-war.sh`

This script builds the React client, copies the static production files into `backend/src/main/resources/static`, and packages everything into:
```
backend/target/GridPulse.war
```

### B. Upload and Deploy to Tomcat
1. Copy the WAR file to your EC2 instance (e.g., using SCP):
   ```bash
   scp -i your-key.pem backend/target/GridPulse.war ubuntu@<ec2-ip-address>:/home/ubuntu/
   ```
2. On the EC2 server, move the WAR file into the Tomcat deployment directory:
   ```bash
   sudo mv /home/ubuntu/GridPulse.war /opt/tomcat10/webapps/
   ```

---

## 5. Starting Tomcat & Verification

Start Tomcat using the startup script:
```bash
sudo /opt/tomcat10/bin/startup.sh
```

### A. Verifying the Deployment
1. **Frontend & Backend root**: Open your browser and navigate to:
   ```
   http://<your-ec2-ip-address>:8080/GridPulse/
   ```
   Tomcat will automatically extract the war, serve your embedded React frontend assets, and route API calls to `/api/...`.
2. **Health Check Endpoint**: Verify the app is alive and healthy by visiting:
   ```
   http://<your-ec2-ip-address>:8080/GridPulse/actuator/health
   ```
   It should return:
   ```json
   {
     "status": "UP"
   }
   ```

### B. Checking Logs
You can monitor the logs of your running application:
* **Tomcat Standard Out**:
  ```bash
  tail -f /opt/tomcat10/logs/catalina.out
  ```
* **Application Rolling Log File**:
  ```bash
  tail -f /opt/tomcat10/logs/gridpulse.log
  ```

---

## Troubleshooting

### Q1: I get a 404 error when navigating directly or refreshing pages
* **Solution**: The `SpaRedirectController` handles routing fallbacks for internal paths like `/dashboard`. Ensure you have accessed the app with the context root `/GridPulse/` (e.g. `http://<ip>:8080/GridPulse/dashboard`). If you want it on the root path `/` without the context, rename `GridPulse.war` to `ROOT.war` before copying it to the `webapps` directory.

### Q2: Access denied to database error
* **Solution**: Verify that `SPRING_DATASOURCE_USERNAME` and `SPRING_DATASOURCE_PASSWORD` are configured correctly in `setenv.sh`, and check that the AWS RDS Security Group permits incoming traffic on port `3306` from the EC2 instance's IP.
