@echo off
set "JAVA_HOME=C:\Program Files\Java\latest\jdk-21"
set "PATH=%JAVA_HOME%\bin;%PATH%"
echo ===================================================
echo   Starting HireAI Spring Boot Backend on Port 8080
echo ===================================================
cd /d "%~dp0backend"
"D:\PROGRAM FILES\IntelliJ IDEA\IntelliJ IDEA Community Edition 2025.1\plugins\maven\lib\maven3\bin\mvn.cmd" spring-boot:run
pause
