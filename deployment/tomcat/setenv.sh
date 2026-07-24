#!/bin/bash
# ==============================================================================
# GridPulse Enterprise Smart Grid Monitoring System - Apache Tomcat 10 Environment Setup
# Place this file in: $CATALINA_BASE/bin/setenv.sh (or /opt/tomcat/bin/setenv.sh)
# Grant execute permissions: chmod +x setenv.sh
# ==============================================================================

# 1. Groq AI Engine API Key (Replace with your live production key)
export GROQ_API_KEY="gsk_your_live_groq_api_key_here"

# 2. Database Configuration (AWS RDS MySQL)
export SPRING_DATASOURCE_URL="jdbc:mysql://gridpulse-db.cxy8c02umj4p.ap-south-1.rds.amazonaws.com:3306/gridpulse?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
export SPRING_DATASOURCE_USERNAME="root"
export SPRING_DATASOURCE_PASSWORD="Vamsi1122#"

# 3. JWT Security Secret
export GRIDPULSE_JWT_SECRET="9a67471a79b16bb185cfb52e399588b444747c32bf2542a1772f4e24cf8fef7f"

# 4. JVM Heap and Performance Tuning Options
export CATALINA_OPTS="$CATALINA_OPTS -Xms512m -Xmx2048m -XX:+UseG1GC -Djava.awt.headless=true"

echo "GridPulse Tomcat 10 Environment Variables Loaded Successfully."
