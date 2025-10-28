import requests
import sys
import json
from datetime import datetime

class HospitalityHubAPITester:
    def __init__(self, base_url="https://serveconnect-3.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.worker_token = None
        self.restaurant_token = None
        self.worker_user_id = None
        self.restaurant_user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
        else:
            print(f"❌ {name} - {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        if headers:
            test_headers.update(headers)

        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers)

            success = response.status_code == expected_status
            details = f"Status: {response.status_code}"
            if not success:
                details += f", Expected: {expected_status}"
                try:
                    error_data = response.json()
                    details += f", Error: {error_data.get('detail', 'Unknown error')}"
                except:
                    details += f", Response: {response.text[:100]}"

            self.log_test(name, success, details)
            return success, response.json() if success and response.content else {}

        except Exception as e:
            self.log_test(name, False, f"Exception: {str(e)}")
            return False, {}

    def test_api_health(self):
        """Test API health endpoint"""
        success, response = self.run_test(
            "API Health Check",
            "GET",
            "",
            200
        )
        return success

    def test_worker_registration(self):
        """Test worker registration"""
        timestamp = datetime.now().strftime('%H%M%S')
        worker_data = {
            "phone": f"+91987654{timestamp}",
            "password": "TestPass123!",
            "role": "worker",
            "name": f"Test Worker {timestamp}",
            "email": f"worker{timestamp}@test.com"
        }
        
        success, response = self.run_test(
            "Worker Registration",
            "POST",
            "auth/register",
            200,
            data=worker_data
        )
        
        if success and 'access_token' in response:
            self.worker_token = response['access_token']
            self.worker_user_id = response['user_id']
            return True
        return False

    def test_restaurant_registration(self):
        """Test restaurant registration"""
        timestamp = datetime.now().strftime('%H%M%S')
        restaurant_data = {
            "phone": f"+91876543{timestamp}",
            "password": "TestPass123!",
            "role": "restaurant",
            "name": f"Test Restaurant {timestamp}",
            "email": f"restaurant{timestamp}@test.com"
        }
        
        success, response = self.run_test(
            "Restaurant Registration",
            "POST",
            "auth/register",
            200,
            data=restaurant_data
        )
        
        if success and 'access_token' in response:
            self.restaurant_token = response['access_token']
            self.restaurant_user_id = response['user_id']
            return True
        return False

    def test_worker_login(self):
        """Test worker login"""
        if not self.worker_token:
            return False
            
        # We'll use the same credentials from registration
        timestamp = datetime.now().strftime('%H%M%S')
        login_data = {
            "phone": f"+91987654{timestamp}",
            "password": "TestPass123!"
        }
        
        success, response = self.run_test(
            "Worker Login",
            "POST",
            "auth/login",
            200,
            data=login_data
        )
        return success

    def test_worker_profile_creation(self):
        """Test worker profile creation"""
        if not self.worker_token:
            return False
            
        profile_data = {
            "location_city": "Mumbai",
            "experience_years": 2,
            "preferred_roles": ["waiter", "barista"],
            "preferred_shifts": ["morning", "evening"],
            "languages": ["Hindi", "English"],
            "availability": "immediate",
            "skills": ["customer_service", "multitasking"]
        }
        
        headers = {'Authorization': f'Bearer {self.worker_token}'}
        success, response = self.run_test(
            "Worker Profile Creation",
            "POST",
            "workers/profile",
            200,
            data=profile_data,
            headers=headers
        )
        return success

    def test_restaurant_profile_creation(self):
        """Test restaurant profile creation"""
        if not self.restaurant_token:
            return False
            
        profile_data = {
            "company_name": "Test Cafe Chain",
            "number_of_outlets": 5,
            "manager_name": "Test Manager",
            "location_cities": ["Mumbai", "Delhi"],
            "description": "A premium cafe chain serving quality food and beverages"
        }
        
        headers = {'Authorization': f'Bearer {self.restaurant_token}'}
        success, response = self.run_test(
            "Restaurant Profile Creation",
            "POST",
            "restaurants/profile",
            200,
            data=profile_data,
            headers=headers
        )
        return success

    def test_job_creation(self):
        """Test job posting by restaurant"""
        if not self.restaurant_token:
            return False
            
        job_data = {
            "title": "Experienced Barista Required",
            "role": "barista",
            "location_city": "Mumbai",
            "shift_timing": "morning",
            "experience_required": "1-2",
            "wage_min": 18000,
            "wage_max": 25000,
            "description": "Looking for an experienced barista to join our team",
            "requirements": ["Coffee making skills", "Customer service"],
            "benefits": ["Health insurance", "Flexible hours"]
        }
        
        headers = {'Authorization': f'Bearer {self.restaurant_token}'}
        success, response = self.run_test(
            "Job Creation",
            "POST",
            "jobs",
            200,
            data=job_data,
            headers=headers
        )
        
        if success and 'id' in response:
            self.job_id = response['id']
            return True
        return False

    def test_job_browsing(self):
        """Test job browsing (public endpoint)"""
        success, response = self.run_test(
            "Job Browsing",
            "GET",
            "jobs",
            200
        )
        return success

    def test_job_filtering(self):
        """Test job filtering"""
        success, response = self.run_test(
            "Job Filtering by Role",
            "GET",
            "jobs?role=barista",
            200
        )
        return success

    def test_job_application(self):
        """Test job application by worker"""
        if not self.worker_token or not hasattr(self, 'job_id'):
            return False
            
        headers = {'Authorization': f'Bearer {self.worker_token}'}
        success, response = self.run_test(
            "Job Application",
            "POST",
            f"applications/{self.job_id}",
            200,
            headers=headers
        )
        
        if success and 'id' in response:
            self.application_id = response['id']
            return True
        return False

    def test_worker_applications_view(self):
        """Test worker viewing their applications"""
        if not self.worker_token:
            return False
            
        headers = {'Authorization': f'Bearer {self.worker_token}'}
        success, response = self.run_test(
            "Worker Applications View",
            "GET",
            "workers/applications",
            200,
            headers=headers
        )
        return success

    def test_restaurant_applicants_view(self):
        """Test restaurant viewing job applicants"""
        if not self.restaurant_token or not hasattr(self, 'job_id'):
            return False
            
        headers = {'Authorization': f'Bearer {self.restaurant_token}'}
        success, response = self.run_test(
            "Restaurant Applicants View",
            "GET",
            f"restaurants/applications/{self.job_id}",
            200,
            headers=headers
        )
        return success

    def test_application_status_update(self):
        """Test updating application status"""
        if not self.restaurant_token or not hasattr(self, 'application_id'):
            return False
            
        status_data = {"status": "shortlisted"}
        headers = {'Authorization': f'Bearer {self.restaurant_token}'}
        success, response = self.run_test(
            "Application Status Update",
            "PUT",
            f"restaurants/applications/{self.application_id}",
            200,
            data=status_data,
            headers=headers
        )
        return success

    def test_restaurant_analytics(self):
        """Test restaurant analytics"""
        if not self.restaurant_token:
            return False
            
        headers = {'Authorization': f'Bearer {self.restaurant_token}'}
        success, response = self.run_test(
            "Restaurant Analytics",
            "GET",
            "restaurants/analytics",
            200,
            headers=headers
        )
        return success

    def test_otp_functionality(self):
        """Test OTP send and verify (mocked)"""
        timestamp = datetime.now().strftime('%H%M%S')
        phone = f"+91765432{timestamp}"
        
        # Test OTP send
        otp_data = {"phone": phone}
        success, response = self.run_test(
            "OTP Send",
            "POST",
            "auth/send-otp",
            200,
            data=otp_data
        )
        
        if success and 'otp' in response:
            # Test OTP verify
            verify_data = {"phone": phone, "otp": response['otp']}
            success, _ = self.run_test(
                "OTP Verify",
                "POST",
                "auth/verify-otp",
                200,
                data=verify_data
            )
            return success
        return False

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting HospitalityHub API Tests...")
        print(f"Testing against: {self.base_url}")
        print("=" * 50)

        # Basic API tests
        self.test_api_health()
        self.test_otp_functionality()

        # Authentication tests
        if self.test_worker_registration():
            self.test_worker_login()
            self.test_worker_profile_creation()

        if self.test_restaurant_registration():
            self.test_restaurant_profile_creation()
            if self.test_job_creation():
                self.test_job_application()
                self.test_restaurant_applicants_view()
                if hasattr(self, 'application_id'):
                    self.test_application_status_update()

        # Public endpoints
        self.test_job_browsing()
        self.test_job_filtering()

        # Worker-specific tests
        if self.worker_token:
            self.test_worker_applications_view()

        # Restaurant-specific tests
        if self.restaurant_token:
            self.test_restaurant_analytics()

        # Print results
        print("=" * 50)
        print(f"📊 Tests completed: {self.tests_passed}/{self.tests_run} passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return 0
        else:
            print("⚠️  Some tests failed. Check details above.")
            return 1

def main():
    tester = HospitalityHubAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())