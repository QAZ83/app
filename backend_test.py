#!/usr/bin/env python3
"""
AI Forge Studio Backend API Testing
Tests all backend endpoints for the GPU monitoring app
"""

import requests
import sys
import json
from datetime import datetime
import time

class AIForgeStudioTester:
    def __init__(self, base_url="https://ai-forge-75.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.session_id = None
        self.results = {
            "gpu_info": None,
            "benchmarks": {},
            "inference": None,
            "settings": None,
            "chat": None
        }

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED {details}")
        else:
            print(f"❌ {name} - FAILED {details}")
        return success

    def test_api_root(self):
        """Test API root endpoint"""
        try:
            response = requests.get(f"{self.api_url}/", timeout=10)
            success = response.status_code == 200
            if success:
                data = response.json()
                return self.log_test("API Root", True, f"- {data.get('message', '')}")
            else:
                return self.log_test("API Root", False, f"- Status: {response.status_code}")
        except Exception as e:
            return self.log_test("API Root", False, f"- Error: {str(e)}")

    def test_gpu_info(self):
        """Test GPU info endpoint"""
        try:
            response = requests.get(f"{self.api_url}/gpu/info", timeout=10)
            success = response.status_code == 200
            if success:
                data = response.json()
                self.results["gpu_info"] = data
                # Validate required fields
                required_fields = ['name', 'temperature', 'utilization', 'memory_total', 'memory_used']
                missing_fields = [f for f in required_fields if f not in data]
                if missing_fields:
                    return self.log_test("GPU Info", False, f"- Missing fields: {missing_fields}")
                
                # Check if it's RTX 5090
                if "RTX 5090" in data.get('name', ''):
                    return self.log_test("GPU Info", True, f"- GPU: {data['name']}, Temp: {data['temperature']}°C")
                else:
                    return self.log_test("GPU Info", False, f"- Expected RTX 5090, got: {data.get('name')}")
            else:
                return self.log_test("GPU Info", False, f"- Status: {response.status_code}")
        except Exception as e:
            return self.log_test("GPU Info", False, f"- Error: {str(e)}")

    def test_benchmarks(self):
        """Test all benchmark types"""
        benchmark_types = ["cuda", "tensorrt", "vulkan", "general"]
        all_passed = True
        
        for bench_type in benchmark_types:
            try:
                response = requests.post(f"{self.api_url}/benchmark/{bench_type}", timeout=15)
                success = response.status_code == 200
                if success:
                    data = response.json()
                    self.results["benchmarks"][bench_type] = data
                    # Validate benchmark result structure
                    required_fields = ['benchmark_type', 'score', 'fps', 'temperature']
                    missing_fields = [f for f in required_fields if f not in data]
                    if missing_fields:
                        success = False
                        self.log_test(f"Benchmark {bench_type.upper()}", False, f"- Missing fields: {missing_fields}")
                    else:
                        self.log_test(f"Benchmark {bench_type.upper()}", True, f"- Score: {data['score']}, FPS: {data['fps']}")
                else:
                    success = False
                    self.log_test(f"Benchmark {bench_type.upper()}", False, f"- Status: {response.status_code}")
                
                if not success:
                    all_passed = False
                    
            except Exception as e:
                all_passed = False
                self.log_test(f"Benchmark {bench_type.upper()}", False, f"- Error: {str(e)}")
        
        return all_passed

    def test_benchmark_history(self):
        """Test benchmark history endpoint"""
        try:
            response = requests.get(f"{self.api_url}/benchmark/history?limit=5", timeout=10)
            success = response.status_code == 200
            if success:
                data = response.json()
                return self.log_test("Benchmark History", True, f"- Found {len(data)} records")
            else:
                return self.log_test("Benchmark History", False, f"- Status: {response.status_code}")
        except Exception as e:
            return self.log_test("Benchmark History", False, f"- Error: {str(e)}")

    def test_inference(self):
        """Test inference endpoint"""
        try:
            payload = {
                "model_name": "ResNet50",
                "batch_size": 1,
                "precision": "FP16",
                "framework": "TensorRT"
            }
            response = requests.post(f"{self.api_url}/inference/run", json=payload, timeout=15)
            success = response.status_code == 200
            if success:
                data = response.json()
                self.results["inference"] = data
                # Validate inference result structure
                required_fields = ['model_name', 'latency_ms', 'throughput', 'precision', 'framework']
                missing_fields = [f for f in required_fields if f not in data]
                if missing_fields:
                    return self.log_test("Inference", False, f"- Missing fields: {missing_fields}")
                else:
                    return self.log_test("Inference", True, f"- Model: {data['model_name']}, Latency: {data['latency_ms']}ms")
            else:
                return self.log_test("Inference", False, f"- Status: {response.status_code}")
        except Exception as e:
            return self.log_test("Inference", False, f"- Error: {str(e)}")

    def test_inference_history(self):
        """Test inference history endpoint"""
        try:
            response = requests.get(f"{self.api_url}/inference/history?limit=5", timeout=10)
            success = response.status_code == 200
            if success:
                data = response.json()
                return self.log_test("Inference History", True, f"- Found {len(data)} records")
            else:
                return self.log_test("Inference History", False, f"- Status: {response.status_code}")
        except Exception as e:
            return self.log_test("Inference History", False, f"- Error: {str(e)}")

    def test_settings_get(self):
        """Test get settings endpoint"""
        try:
            response = requests.get(f"{self.api_url}/settings", timeout=10)
            success = response.status_code == 200
            if success:
                data = response.json()
                self.results["settings"] = data
                # Validate settings structure
                required_fields = ['models_directory', 'display_resolution', 'default_ai_model', 'language']
                missing_fields = [f for f in required_fields if f not in data]
                if missing_fields:
                    return self.log_test("Settings GET", False, f"- Missing fields: {missing_fields}")
                else:
                    return self.log_test("Settings GET", True, f"- Language: {data['language']}, Model: {data['default_ai_model']}")
            else:
                return self.log_test("Settings GET", False, f"- Status: {response.status_code}")
        except Exception as e:
            return self.log_test("Settings GET", False, f"- Error: {str(e)}")

    def test_settings_update(self):
        """Test update settings endpoint"""
        try:
            payload = {
                "theme": "dark",
                "language": "ar",
                "display_resolution": "2560x1440"
            }
            response = requests.put(f"{self.api_url}/settings", json=payload, timeout=10)
            success = response.status_code == 200
            if success:
                data = response.json()
                # Verify the update was applied
                if data.get('display_resolution') == "2560x1440":
                    return self.log_test("Settings UPDATE", True, f"- Updated resolution to {data['display_resolution']}")
                else:
                    return self.log_test("Settings UPDATE", False, f"- Update not applied correctly")
            else:
                return self.log_test("Settings UPDATE", False, f"- Status: {response.status_code}")
        except Exception as e:
            return self.log_test("Settings UPDATE", False, f"- Error: {str(e)}")

    def test_chat_presets(self):
        """Test chat presets endpoint"""
        try:
            response = requests.get(f"{self.api_url}/chat/presets", timeout=10)
            success = response.status_code == 200
            if success:
                data = response.json()
                presets = data.get('presets', [])
                if len(presets) >= 4:  # Should have 4 presets
                    return self.log_test("Chat Presets", True, f"- Found {len(presets)} presets")
                else:
                    return self.log_test("Chat Presets", False, f"- Expected 4+ presets, got {len(presets)}")
            else:
                return self.log_test("Chat Presets", False, f"- Status: {response.status_code}")
        except Exception as e:
            return self.log_test("Chat Presets", False, f"- Error: {str(e)}")

    def test_chat_message(self):
        """Test chat message endpoint"""
        try:
            payload = {
                "message": "مرحبا، كيف يمكنني تحسين أداء GPU؟",
                "session_id": None
            }
            response = requests.post(f"{self.api_url}/chat", json=payload, timeout=30)
            success = response.status_code == 200
            if success:
                data = response.json()
                self.results["chat"] = data
                self.session_id = data.get('session_id')
                # Validate chat response structure
                if 'response' in data and 'session_id' in data:
                    response_text = data['response'][:50] + "..." if len(data['response']) > 50 else data['response']
                    return self.log_test("Chat Message", True, f"- Response: {response_text}")
                else:
                    return self.log_test("Chat Message", False, f"- Missing response or session_id")
            else:
                return self.log_test("Chat Message", False, f"- Status: {response.status_code}")
        except Exception as e:
            return self.log_test("Chat Message", False, f"- Error: {str(e)}")

    def test_chat_preset(self):
        """Test chat with preset"""
        try:
            payload = {
                "message": "",
                "preset": "gpu_problem",
                "session_id": self.session_id
            }
            response = requests.post(f"{self.api_url}/chat", json=payload, timeout=30)
            success = response.status_code == 200
            if success:
                data = response.json()
                if 'response' in data:
                    return self.log_test("Chat Preset", True, f"- Preset response received")
                else:
                    return self.log_test("Chat Preset", False, f"- No response in data")
            else:
                return self.log_test("Chat Preset", False, f"- Status: {response.status_code}")
        except Exception as e:
            return self.log_test("Chat Preset", False, f"- Error: {str(e)}")

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting AI Forge Studio Backend API Tests")
        print("=" * 60)
        
        # Basic connectivity
        self.test_api_root()
        
        # GPU monitoring
        self.test_gpu_info()
        
        # Benchmarks
        self.test_benchmarks()
        self.test_benchmark_history()
        
        # Inference
        self.test_inference()
        self.test_inference_history()
        
        # Settings
        self.test_settings_get()
        self.test_settings_update()
        
        # AI Chat
        self.test_chat_presets()
        self.test_chat_message()
        if self.session_id:
            self.test_chat_preset()
        
        # Summary
        print("\n" + "=" * 60)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        success_rate = (self.tests_passed / self.tests_run) * 100 if self.tests_run > 0 else 0
        print(f"📈 Success Rate: {success_rate:.1f}%")
        
        if success_rate >= 80:
            print("🎉 Backend API tests mostly successful!")
            return 0
        else:
            print("⚠️  Backend API has significant issues!")
            return 1

def main():
    """Main test execution"""
    tester = AIForgeStudioTester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())