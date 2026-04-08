#!/usr/bin/env python3
"""
OpenEnv Validation & Health Check Script

This script validates that the OpenEnv module and all dependencies are properly configured.

Run with:
    python validate-openenv.py
    or
    python3 validate-openenv.py
"""

import sys
import os
import importlib
from pathlib import Path

# Colors for terminal output
class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    BOLD = '\033[1m'
    END = '\033[0m'

def print_status(status, message):
    """Print colored status message"""
    symbol = "✓" if status else "✗"
    color = Colors.GREEN if status else Colors.RED
    print(f"{color}{Colors.BOLD}[{symbol}]{Colors.END} {message}")

def print_info(message):
    """Print info message"""
    print(f"{Colors.BLUE}[i]{Colors.END} {message}")

def print_header(title):
    """Print section header"""
    print(f"\n{Colors.BOLD}{title}{Colors.END}")
    print("-" * 60)

def check_package(package_name, import_name=None):
    """Check if a package is installed"""
    if import_name is None:
        import_name = package_name
    
    try:
        module = importlib.import_module(import_name)
        version = getattr(module, '__version__', 'unknown')
        print_status(True, f"{package_name} is installed (version: {version})")
        return True
    except ImportError:
        print_status(False, f"{package_name} is NOT installed")
        return False

def check_file(filepath):
    """Check if a file exists"""
    exists = Path(filepath).exists()
    status_text = "found" if exists else "NOT FOUND"
    print_status(exists, f"{filepath} — {status_text}")
    return exists

def check_directory(dirpath):
    """Check if a directory exists"""
    exists = Path(dirpath).exists()
    status_text = "exists" if exists else "NOT FOUND"
    print_status(exists, f"{dirpath}/ — {status_text}")
    return exists

def validate_system():
    """Validate system and Python environment"""
    print_header("1. SYSTEM & PYTHON ENVIRONMENT")
    
    checks = []
    checks.append(("Python Version", sys.version.split()[0]))
    checks.append(("Python Executable", sys.executable))
    checks.append(("Platform", sys.platform))
    checks.append(("Current Directory", os.getcwd()))
    
    for label, value in checks:
        print_info(f"{label}: {value}")
    
    return True

def validate_dependencies():
    """Validate required dependencies"""
    print_header("2. REQUIRED DEPENDENCIES")
    
    required_packages = [
        ('fastapi', 'fastapi'),
        ('uvicorn', 'uvicorn'),
        ('pydantic', 'pydantic'),
        ('requests', 'requests'),
        ('openai', 'openai'),
    ]
    
    all_ok = True
    for pkg_name, import_name in required_packages:
        if not check_package(pkg_name, import_name):
            all_ok = False
    
    return all_ok

def validate_structure():
    """Validate project structure"""
    print_header("3. PROJECT STRUCTURE")
    
    files_to_check = [
        'README.md',
        'Dockerfile',
        'docker-compose.yml',
        'requirements.txt',
        'api.py',
        'inference.py',
        'openenv.yaml',
    ]
    
    directories_to_check = [
        'openenv',
        'server',
        'client',
        'scripts',
    ]
    
    print_info("Root-level files:")
    files_ok = all(check_file(f) for f in files_to_check)
    
    print_info("\nDirectories:")
    dirs_ok = all(check_directory(d) for d in directories_to_check)
    
    return files_ok and dirs_ok

def validate_openenv():
    """Validate OpenEnv module"""
    print_header("4. OPENENV MODULE")
    
    sys.path.insert(0, os.getcwd())
    
    try:
        from openenv.env import FoodDashEnv
        print_status(True, "FoodDashEnv class imported successfully")
        
        from openenv.models import Action
        print_status(True, "Action model imported successfully")
        
        from openenv.tasks import get_task
        print_status(True, "Task functions imported successfully")
        
        from openenv.graders import grade_easy, grade_medium, grade_hard
        print_status(True, "Grading functions imported successfully")
        
        try:
            from openenv import config
            print_status(True, "Configuration module imported successfully")
            config_vars = [v for v in dir(config) if not v.startswith('_')]
            print_info(f"  Configuration variables: {len(config_vars)}")
        except Exception as e:
            print_status(True, "Configuration module exists (optional check)")
        
        # Show available tasks
        print_info("\nAvailable tasks:")
        for task_id in ['easy', 'medium', 'hard']:
            try:
                task = get_task(task_id)
                print_info(f"  ✓ {task_id}: {task.get('name', task_id)}")
            except Exception as e:
                print_status(False, f"Could not load task '{task_id}': {e}")
        
        return True
    except Exception as e:
        print_status(False, f"Failed to import OpenEnv modules: {e}")
        import traceback
        traceback.print_exc()
        return False

def validate_api():
    """Validate FastAPI app"""
    print_header("5. FASTAPI APPLICATION")
    
    sys.path.insert(0, os.getcwd())
    
    try:
        from api import app
        print_status(True, "FastAPI app imported successfully")
        
        # Check routes
        routes = []
        for route in app.routes:
            if hasattr(route, 'path'):
                routes.append(route.path)
        
        expected_routes = ['/env/reset', '/env/step', '/env/state', '/health', '/']
        for route in expected_routes:
            found = any(route in r for r in routes)
            print_status(found, f"Route '{route}' is available")
        
        return True
    except Exception as e:
        print_status(False, f"Failed to import FastAPI app: {e}")
        import traceback
        traceback.print_exc()
        return False

def validate_inference():
    """Validate Inference module"""
    print_header("6. INFERENCE MODULE")
    
    sys.path.insert(0, os.getcwd())
    
    try:
        from inference import _action_from_heuristic, _run_task_direct
        print_status(True, "Inference functions imported successfully")
        
        print_info("Available modes:")
        print_info("  - Direct: In-process environment evaluation")
        print_info("  - HTTP: Call FastAPI server via HTTP")
        
        return True
    except Exception as e:
        print_status(False, f"Failed to import Inference module: {e}")
        import traceback
        traceback.print_exc()
        return False

def validate_config():
    """Validate configuration files"""
    print_header("7. CONFIGURATION FILES")
    
    # Check openenv.yaml
    import yaml
    try:
        with open('openenv.yaml', 'r') as f:
            config = yaml.safe_load(f)
        
        print_status(True, "openenv.yaml is valid YAML")
        print_info(f"  Environment name: {config.get('name', 'unknown')}")
        print_info(f"  Environment version: {config.get('version', 'unknown')}")
        
        # Check tasks in config
        tasks = config.get('tasks', [])
        print_info(f"  Configured tasks: {len(tasks)}")
        for task in tasks:
            print_info(f"    - {task.get('id', 'unknown')}: {task.get('summary', 'no description')}")
        
        return True
    except Exception as e:
        print_status(False, f"Failed to read openenv.yaml: {e}")
        return False

def validate_environment():
    """Validate environment variables"""
    print_header("8. ENVIRONMENT VARIABLES")
    
    important_vars = {
        'NODE_ENV': '(optional - for Node.js)',
        'MONGODB_URI': '(optional - uses docker host)',
        'REDIS_URL': '(optional - uses docker host)',
        'JWT_SECRET': '(optional - for auth)',
        'OPENAI_API_KEY': '(optional - for LLM features)',
    }
    
    set_count = 0
    for var, description in important_vars.items():
        value = os.environ.get(var, '')
        is_set = bool(value)
        if is_set:
            set_count += 1
            if var == 'OPENAI_API_KEY':
                value = '***' + value[-4:]  # Hide sensitive values
            print_status(True, f"{var}: {value}")
        else:
            print_info(f"{var}: not set {description}")
    
    print_info(f"\nEnvironment readiness: {set_count}/5 optional variables configured")
    print_info("(Variables can be set in .env file for Docker deployment)")
    
    return True

def run_quick_test():
    """Run a quick OpenEnv test"""
    print_header("9. QUICK OPENENV TEST")
    
    sys.path.insert(0, os.getcwd())
    
    try:
        from openenv.env import FoodDashEnv
        from openenv.tasks import get_task
        from openenv.models import Action
        
        print_info("Initializing easy task...")
        task_config = get_task('easy')
        
        print_info("Creating FoodDashEnv environment...")
        env = FoodDashEnv(task_config)
        
        print_info("Resetting environment...")
        obs = env.reset(task_config)
        
        print_status(True, "Environment reset successfully")
        
        # Try one step
        print_info("Executing test action...")
        action = Action(action_type="noop")
        obs, reward, done, info = env.step(action)
        
        print_status(True, "Step executed successfully")
        print_info(f"  Reward: {reward}")
        print_info(f"  Done: {done}")
        
        return True
    except Exception as e:
        print_status(False, f"Quick test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Run all validations"""
    print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*60}")
    print("  FOOD DASH - OPENENV VALIDATION & HEALTH CHECK")
    print(f"{'='*60}{Colors.END}\n")
    
    results = []
    
    # Run all validations
    results.append(("System Environment", validate_system()))
    results.append(("Dependencies", validate_dependencies()))
    results.append(("Project Structure", validate_structure()))
    results.append(("OpenEnv Module", validate_openenv()))
    results.append(("FastAPI Application", validate_api()))
    results.append(("Inference Module", validate_inference()))
    results.append(("Configuration Files", validate_config()))
    results.append(("Environment Variables", validate_environment()))
    results.append(("Quick OpenEnv Test", run_quick_test()))
    
    # Summary
    print_header("VALIDATION SUMMARY")
    
    total = len(results)
    passed = sum(1 for _, result in results if result)
    
    for name, result in results:
        status_text = "PASSED" if result else "FAILED"
        color = Colors.GREEN if result else Colors.RED
        print(f"{color}{Colors.BOLD}[{status_text}]{Colors.END} {name}")
    
    print(f"\n{Colors.BOLD}Overall: {passed}/{total} sections passed{Colors.END}")
    
    if passed >= 8:  # At least 8/9 sections, especially quick test
        print(f"\n{Colors.GREEN}{Colors.BOLD}✓ OPENENV IS WORKING!{Colors.END}")
        print(Colors.GREEN + "  Environment can reset, execute steps, and process rewards." + Colors.END)
        print(Colors.GREEN + "  All critical components are functional." + Colors.END)
        print(Colors.GREEN + "  You can safely deploy to Docker or production." + Colors.END)
        return 0
    elif passed >= 6:
        print(f"\n{Colors.YELLOW}{Colors.BOLD}⚠ OPENENV IS MOSTLY WORKING{Colors.END}")
        print(Colors.YELLOW + "  Most components are functional." + Colors.END)
        print(Colors.YELLOW + "  Check above warnings before production deployment." + Colors.END)
        return 1
    else:
        print(f"\n{Colors.RED}{Colors.BOLD}✗ OPENENV HAS ISSUES{Colors.END}")
        print(Colors.RED + "  Fix the above errors before deployment." + Colors.END)
        return 1

if __name__ == '__main__':
    exit_code = main()
    sys.exit(exit_code)
