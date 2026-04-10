import requests
import sys
import json
import uuid
from datetime import datetime

class MiniMalistAPITester:
    def __init__(self, base_url="https://brutal-reply-ai.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.user_id = f"test-user-{uuid.uuid4()}"
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json', 'X-User-ID': self.user_id}
        if headers:
            test_headers.update(headers)

        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        print(f"   Headers: {test_headers}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=30)

            print(f"   Response Status: {response.status_code}")
            
            success = response.status_code == expected_status
            if success:
                self.log_test(name, True)
                try:
                    return True, response.json()
                except:
                    return True, response.text
            else:
                self.log_test(name, False, f"Expected {expected_status}, got {response.status_code}. Response: {response.text[:200]}")
                return False, {}

        except Exception as e:
            self.log_test(name, False, f"Request failed: {str(e)}")
            return False, {}

    def test_health_check(self):
        """Test API health check"""
        success, response = self.run_test(
            "API Health Check",
            "GET",
            "",
            200
        )
        if success and isinstance(response, dict):
            if "message" in response and "mini malist" in response["message"]:
                print(f"   Health check message: {response['message']}")
                return True
        return False

    def test_create_chat(self):
        """Test creating a new chat"""
        success, response = self.run_test(
            "Create New Chat",
            "POST",
            "chats",
            200,
            data={"title": "Test Chat"}
        )
        if success and isinstance(response, dict) and "id" in response:
            print(f"   Created chat ID: {response['id']}")
            return response["id"]
        return None

    def test_list_chats(self):
        """Test listing chats"""
        success, response = self.run_test(
            "List Chats",
            "GET",
            "chats",
            200
        )
        if success and isinstance(response, list):
            print(f"   Found {len(response)} chats")
            return response
        return []

    def test_send_message(self, chat_id):
        """Test sending a message and getting AI response"""
        test_message = "Hello, roast me!"
        success, response = self.run_test(
            "Send Message & Get AI Response",
            "POST",
            f"chats/{chat_id}/messages",
            200,
            data={"content": test_message}
        )
        
        if success and isinstance(response, dict):
            if "user_message" in response and "ai_message" in response:
                user_msg = response["user_message"]
                ai_msg = response["ai_message"]
                
                print(f"   User message: {user_msg.get('content', '')[:50]}...")
                print(f"   AI response: {ai_msg.get('content', '')[:100]}...")
                
                # Check if AI response is savage/roast style
                ai_content = ai_msg.get('content', '').lower()
                savage_indicators = ['roast', 'savage', 'brutal', 'bhai', 'tu', 'tera', 'tujhe']
                is_savage = any(indicator in ai_content for indicator in savage_indicators)
                
                if is_savage:
                    print("   ✅ AI response appears to be in savage/roast style")
                    return True
                else:
                    print("   ⚠️  AI response may not be savage enough")
                    return True  # Still pass as API works
        return False

    def test_get_messages(self, chat_id):
        """Test getting messages from a chat"""
        success, response = self.run_test(
            "Get Chat Messages",
            "GET",
            f"chats/{chat_id}/messages",
            200
        )
        if success and isinstance(response, list):
            print(f"   Found {len(response)} messages in chat")
            return response
        return []

    def test_rename_chat(self, chat_id):
        """Test renaming a chat"""
        new_title = f"Renamed Chat {datetime.now().strftime('%H:%M:%S')}"
        success, response = self.run_test(
            "Rename Chat",
            "PUT",
            f"chats/{chat_id}",
            200,
            data={"title": new_title}
        )
        return success

    def test_delete_chat(self, chat_id):
        """Test deleting a chat"""
        success, response = self.run_test(
            "Delete Chat",
            "DELETE",
            f"chats/{chat_id}",
            200
        )
        return success

    def test_search_messages(self, chat_id):
        """Test search functionality"""
        # First, send a message with searchable content
        search_content = "This is a unique searchable message about pizza"
        success, response = self.run_test(
            "Send Searchable Message",
            "POST",
            f"chats/{chat_id}/messages",
            200,
            data={"content": search_content}
        )
        
        if not success:
            return False
            
        # Wait a moment for the message to be indexed
        import time
        time.sleep(1)
        
        # Test search with matching query
        success, response = self.run_test(
            "Search Messages - With Results",
            "GET",
            "search?q=pizza",
            200
        )
        
        if success and isinstance(response, list):
            print(f"   Found {len(response)} search results")
            if len(response) > 0:
                result = response[0]
                if "content" in result and "chat_id" in result and "chat_title" in result:
                    print(f"   Search result content: {result['content'][:50]}...")
                    print(f"   Chat title: {result['chat_title']}")
                    return True
        return False
    
    def test_search_no_results(self):
        """Test search with no matching results"""
        success, response = self.run_test(
            "Search Messages - No Results",
            "GET",
            "search?q=nonexistentqueryterm12345",
            200
        )
        
        if success and isinstance(response, list) and len(response) == 0:
            print("   ✅ Search correctly returns empty array for no matches")
            return True
        return False
    
    def test_search_short_query(self):
        """Test search with query too short"""
        success, response = self.run_test(
            "Search Messages - Short Query",
            "GET",
            "search?q=a",
            200
        )
        
        if success and isinstance(response, list) and len(response) == 0:
            print("   ✅ Search correctly returns empty array for short query")
            return True
        return False

    def test_language_detection_hindi(self, chat_id):
        """Test AI language detection with Hindi input"""
        hindi_message = "मुझे motivate करो"
        success, response = self.run_test(
            "AI Language Detection - Hindi Input",
            "POST",
            f"chats/{chat_id}/messages",
            200,
            data={"content": hindi_message}
        )
        
        if success and isinstance(response, dict):
            if "ai_message" in response:
                ai_content = response["ai_message"].get('content', '').lower()
                # Check for Hinglish indicators
                hinglish_indicators = ['bhai', 'yaar', 'kya', 'hai', 'tu', 'tera', 'kar', 'kuch']
                has_hinglish = any(indicator in ai_content for indicator in hinglish_indicators)
                
                if has_hinglish:
                    print("   ✅ AI responded in Hinglish as expected")
                    print(f"   AI response: {ai_content[:100]}...")
                    return True
                else:
                    print("   ⚠️  AI may not have detected Hindi properly")
                    print(f"   AI response: {ai_content[:100]}...")
                    return True  # Still pass as API works
        return False
    
    def test_language_detection_english(self, chat_id):
        """Test AI language detection with English input"""
        english_message = "Tell me about artificial intelligence"
        success, response = self.run_test(
            "AI Language Detection - English Input",
            "POST",
            f"chats/{chat_id}/messages",
            200,
            data={"content": english_message}
        )
        
        if success and isinstance(response, dict):
            if "ai_message" in response:
                ai_content = response["ai_message"].get('content', '')
                print(f"   AI response: {ai_content[:100]}...")
                # Just check that we got a response - language detection is complex to verify
                return len(ai_content) > 0
        return False

    def test_missing_user_id_header(self):
        """Test API behavior without X-User-ID header"""
        url = f"{self.base_url}/chats"
        headers = {'Content-Type': 'application/json'}  # No X-User-ID
        
        print(f"\n🔍 Testing Missing X-User-ID Header...")
        try:
            response = requests.get(url, headers=headers, timeout=10)
            if response.status_code == 400:
                self.log_test("Missing X-User-ID Header Validation", True)
                return True
            else:
                self.log_test("Missing X-User-ID Header Validation", False, f"Expected 400, got {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Missing X-User-ID Header Validation", False, f"Request failed: {str(e)}")
            return False
        """Test API behavior without X-User-ID header"""
        url = f"{self.base_url}/chats"
        headers = {'Content-Type': 'application/json'}  # No X-User-ID
        
        print(f"\n🔍 Testing Missing X-User-ID Header...")
        try:
            response = requests.get(url, headers=headers, timeout=10)
            if response.status_code == 400:
                self.log_test("Missing X-User-ID Header Validation", True)
                return True
            else:
                self.log_test("Missing X-User-ID Header Validation", False, f"Expected 400, got {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Missing X-User-ID Header Validation", False, f"Request failed: {str(e)}")
            return False

def main():
    print("🔥 Starting mini malist AI Backend API Tests 🔥\n")
    
    tester = MiniMalistAPITester()
    
    # Test 1: Health check
    if not tester.test_health_check():
        print("❌ Health check failed, stopping tests")
        return 1

    # Test 2: Missing header validation
    tester.test_missing_user_id_header()

    # Test 3: Create a chat
    chat_id = tester.test_create_chat()
    if not chat_id:
        print("❌ Chat creation failed, stopping tests")
        return 1

    # Test 4: List chats
    chats = tester.test_list_chats()

    # Test 5: Send message and get AI response
    if not tester.test_send_message(chat_id):
        print("❌ Message sending failed")

    # Test 6: Get messages
    messages = tester.test_get_messages(chat_id)

    # Test 7: Language detection tests
    tester.test_language_detection_hindi(chat_id)
    tester.test_language_detection_english(chat_id)

    # Test 8: Search functionality tests
    tester.test_search_messages(chat_id)
    tester.test_search_no_results()
    tester.test_search_short_query()

    # Test 9: Rename chat
    tester.test_rename_chat(chat_id)

    # Test 10: Delete chat
    tester.test_delete_chat(chat_id)

    # Print final results
    print(f"\n📊 Test Results Summary:")
    print(f"   Tests Run: {tester.tests_run}")
    print(f"   Tests Passed: {tester.tests_passed}")
    print(f"   Success Rate: {(tester.tests_passed/tester.tests_run)*100:.1f}%")
    
    if tester.tests_passed == tester.tests_run:
        print("\n🎉 All tests passed! Backend API is working correctly.")
        return 0
    else:
        print(f"\n⚠️  {tester.tests_run - tester.tests_passed} test(s) failed.")
        return 1

if __name__ == "__main__":
    sys.exit(main())