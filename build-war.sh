#!/bin/bash
set -e

echo "Starting GridPulse Build Automation..."

echo "Building React Frontend..."
cd frontend
npm install
npm run build
cd ..

echo "Preparing Static Resource Directory in Backend..."
rm -rf backend/src/main/resources/static
mkdir -p backend/src/main/resources/static

echo "Copying Static Assets..."
cp -r frontend/dist/* backend/src/main/resources/static/

echo "Packaging Backend into WAR..."
cd backend
mvn clean package -Dmaven.test.skip=true
cd ..

echo "GridPulse.war built successfully in backend/target/!"
