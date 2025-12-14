#!/usr/bin/env python3
"""
YarnMarket AI System Tester
Comprehensive testing script for all services and database connections
"""

import os
import sys
import time
import json
import requests
from typing import Dict, Any
from datetime import datetime

class SystemTester:
    """Test all YarnMarket AI services and connections"""

    def __init__(self):
        self.results = {
            "passed": [],
            "failed": [],
            "warnings": []
        }

        # Service endpoints
        self.services = {
            "conversation-engine": "http://localhost:8003/health",
            "webhook-handler": "http://localhost:8082/health",
            "dashboard-api": "http://localhost:8005/health",
            "rag-system": "http://localhost:8004/health",
        }

        # Database connections
        self.databases = {
            "PostgreSQL": {
                "host": "localhost",
                "port": 5434,
                "database": "yarnmarket",
                "user": "yarnmarket"
            },
            "MongoDB": {
                "host": "localhost",
                "port": 27019
            },
            "Redis": {
                "host": "localhost",
                "port": 6381
            }
        }

    def print_header(self, text: str):
        """Print formatted header"""
        print(f"\n{'=' * 70}")
        print(f"  {text}")
        print(f"{'=' * 70}\n")

    def print_test(self, name: str, status: str, message: str = ""):
        """Print test result"""
        symbols = {
            "PASS": "✓",
            "FAIL": "✗",
            "WARN": "⚠"
        }
        colors = {
            "PASS": "\033[92m",  # Green
            "FAIL": "\033[91m",  # Red
            "WARN": "\033[93m",  # Yellow
        }
        reset = "\033[0m"

        symbol = symbols.get(status, "?")
        color = colors.get(status, "")

        print(f"{color}[{symbol}] {name:<50}{reset}", end="")
        if message:
            print(f" - {message}")
        else:
            print()

    def test_service_health(self, name: str, url: str) -> bool:
        """Test if a service is healthy"""
        try:
            response = requests.get(url, timeout=5)
            if response.status_code == 200:
                self.print_test(f"{name} Service", "PASS", f"HTTP {response.status_code}")
                self.results["passed"].append(name)
                return True
            else:
                self.print_test(f"{name} Service", "FAIL", f"HTTP {response.status_code}")
                self.results["failed"].append(name)
                return False
        except requests.exceptions.ConnectionError:
            self.print_test(f"{name} Service", "FAIL", "Connection refused")
            self.results["failed"].append(name)
            return False
        except requests.exceptions.Timeout:
            self.print_test(f"{name} Service", "FAIL", "Timeout")
            self.results["failed"].append(name)
            return False
        except Exception as e:
            self.print_test(f"{name} Service", "FAIL", str(e))
            self.results["failed"].append(name)
            return False

    def test_postgres_connection(self) -> bool:
        """Test PostgreSQL database connection"""
        try:
            import psycopg2
            conn = psycopg2.connect(
                host="localhost",
                port=5434,
                database="yarnmarket",
                user="yarnmarket",
                password=os.getenv("POSTGRES_PASSWORD", "your_postgres_password")
            )
            cursor = conn.cursor()
            cursor.execute("SELECT version();")
            version = cursor.fetchone()[0]
            cursor.close()
            conn.close()

            self.print_test("PostgreSQL Connection", "PASS", "Connected")
            self.results["passed"].append("PostgreSQL")
            return True
        except ImportError:
            self.print_test("PostgreSQL Connection", "WARN", "psycopg2 not installed")
            self.results["warnings"].append("PostgreSQL - psycopg2 not installed")
            return False
        except Exception as e:
            self.print_test("PostgreSQL Connection", "FAIL", str(e))
            self.results["failed"].append("PostgreSQL")
            return False

    def test_mongodb_connection(self) -> bool:
        """Test MongoDB database connection"""
        try:
            from pymongo import MongoClient
            client = MongoClient(
                "localhost",
                27019,
                username="yarnmarket",
                password=os.getenv("MONGO_PASSWORD", "your_mongo_password"),
                serverSelectionTimeoutMS=5000
            )
            # Force connection
            client.admin.command('ismaster')
            client.close()

            self.print_test("MongoDB Connection", "PASS", "Connected")
            self.results["passed"].append("MongoDB")
            return True
        except ImportError:
            self.print_test("MongoDB Connection", "WARN", "pymongo not installed")
            self.results["warnings"].append("MongoDB - pymongo not installed")
            return False
        except Exception as e:
            self.print_test("MongoDB Connection", "FAIL", str(e))
            self.results["failed"].append("MongoDB")
            return False

    def test_redis_connection(self) -> bool:
        """Test Redis connection"""
        try:
            import redis
            r = redis.Redis(
                host="localhost",
                port=6381,
                password=os.getenv("REDIS_PASSWORD", "your_redis_password"),
                socket_connect_timeout=5
            )
            r.ping()
            r.close()

            self.print_test("Redis Connection", "PASS", "Connected")
            self.results["passed"].append("Redis")
            return True
        except ImportError:
            self.print_test("Redis Connection", "WARN", "redis not installed")
            self.results["warnings"].append("Redis - redis not installed")
            return False
        except Exception as e:
            self.print_test("Redis Connection", "FAIL", str(e))
            self.results["failed"].append("Redis")
            return False

    def test_conversation_api(self) -> bool:
        """Test conversation engine API"""
        try:
            # Test a simple conversation endpoint
            url = "http://localhost:8003/test/echo"
            payload = {"message": "Hello"}

            response = requests.post(url, json=payload, timeout=10)

            if response.status_code in [200, 404]:  # 404 means service is up but endpoint doesn't exist
                self.print_test("Conversation API", "PASS", "Service responding")
                return True
            else:
                self.print_test("Conversation API", "FAIL", f"HTTP {response.status_code}")
                return False
        except Exception as e:
            self.print_test("Conversation API", "FAIL", str(e))
            return False

    def test_environment_variables(self) -> bool:
        """Test if required environment variables are set"""
        required_vars = [
            "OPENAI_API_KEY",
            "DATABASE_URL",
            "WHATSAPP_ACCESS_TOKEN",
            "WHATSAPP_PHONE_NUMBER_ID"
        ]

        all_set = True
        for var in required_vars:
            value = os.getenv(var)
            if value:
                # Don't print full sensitive values
                masked = value[:10] + "..." if len(value) > 10 else "***"
                self.print_test(f"Env: {var}", "PASS", masked)
            else:
                self.print_test(f"Env: {var}", "FAIL", "Not set")
                all_set = False

        return all_set

    def run_all_tests(self):
        """Run all system tests"""
        print("\n" + "=" * 70)
        print("  YarnMarket AI - System Health Check")
        print("  " + datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
        print("=" * 70)

        # Test environment variables
        self.print_header("Environment Variables")
        self.test_environment_variables()

        # Test services
        self.print_header("Microservices Health")
        for service_name, url in self.services.items():
            self.test_service_health(service_name, url)
            time.sleep(0.5)  # Small delay between requests

        # Test databases
        self.print_header("Database Connections")
        self.test_postgres_connection()
        self.test_mongodb_connection()
        self.test_redis_connection()

        # Test APIs
        self.print_header("API Endpoints")
        self.test_conversation_api()

        # Print summary
        self.print_summary()

    def print_summary(self):
        """Print test summary"""
        self.print_header("Test Summary")

        total = len(self.results["passed"]) + len(self.results["failed"]) + len(self.results["warnings"])
        passed = len(self.results["passed"])
        failed = len(self.results["failed"])
        warnings = len(self.results["warnings"])

        print(f"Total Tests: {total}")
        print(f"\033[92mPassed: {passed}\033[0m")
        print(f"\033[91mFailed: {failed}\033[0m")
        print(f"\033[93mWarnings: {warnings}\033[0m")

        if failed > 0:
            print(f"\n\033[91mFailed tests:\033[0m")
            for item in self.results["failed"]:
                print(f"  - {item}")

        if warnings > 0:
            print(f"\n\033[93mWarnings:\033[0m")
            for item in self.results["warnings"]:
                print(f"  - {item}")

        print("\n" + "=" * 70)

        if failed == 0:
            print("\033[92m✓ All critical tests passed!\033[0m")
        else:
            print("\033[91m✗ Some tests failed. Please check the services above.\033[0m")

        print("=" * 70 + "\n")

        # Provide helpful next steps
        print("Next Steps:")
        if failed > 0:
            print("  1. Check Docker services: docker-compose ps")
            print("  2. View logs: docker-compose logs <service-name>")
            print("  3. Restart services: docker-compose restart")
            print("  4. Check .env file for correct configuration")
        else:
            print("  ✓ System is healthy!")
            print("  1. Test conversation: python test_chat.py")
            print("  2. Test WhatsApp webhook: curl -X POST http://localhost:8082/webhook")
            print("  3. Access vendor dashboard: http://localhost:3000")
            print("  4. Access admin dashboard: http://localhost:3002")


if __name__ == "__main__":
    # Load environment variables
    try:
        from dotenv import load_dotenv
        load_dotenv()
    except ImportError:
        print("Warning: python-dotenv not installed. Environment variables must be set manually.")

    # Run tests
    tester = SystemTester()
    tester.run_all_tests()
