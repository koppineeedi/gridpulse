@echo off
rem ==============================================================================
rem GridPulse Enterprise Smart Grid Monitoring System - Apache Tomcat 10 Environment Setup (Windows)
rem Place this file in: %CATALINA_BASE%\bin\setenv.bat
rem ==============================================================================

rem 1. Groq AI Engine API Key
set "GROQ_API_KEY=gsk_your_live_groq_api_key_here"

rem 2. Database Configuration (AWS RDS MySQL)
set "SPRING_DATASOURCE_URL=jdbc:mysql://gridpulse-db.cxy8c02umj4p.ap-south-1.rds.amazonaws.com:3306/gridpulse?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
set "SPRING_DATASOURCE_USERNAME=root"
set "SPRING_DATASOURCE_PASSWORD=Vamsi1122#"

rem 3. JVM Options
set "CATALINA_OPTS=%CATALINA_OPTS% -Xms512m -Xmx2048m -XX:+UseG1GC"

echo GridPulse Tomcat Environment Variables Configured.
