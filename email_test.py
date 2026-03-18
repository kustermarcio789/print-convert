"""
Additional test to verify actual email sending functionality
"""
import requests
import json
import os
from dotenv import load_dotenv

load_dotenv('frontend/.env')
BACKEND_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://pricing-audit-6.preview.emergentagent.com').rstrip('/')

def test_actual_email_sending():
    """Test email sending to the verified email address"""
    print("📧 Testing Actual Email Sending")
    print("-" * 40)
    
    # Use the verified email address from Resend configuration
    payload = {
        "recipient_email": "3dk.print.br@gmail.com",  # Verified email
        "recipient_name": "3DKPRINT Test",
        "orcamento_id": "ORC-TEST-2025-001",
        "tipo_servico": "Impressão 3D - Teste Backend",
        "descricao": "Teste de envio de email via API",
        "material": "PLA Premium",
        "quantidade": 1,
        "valor": 125.90,
        "prazo": "3 dias úteis",
        "observacoes": "Este é um teste automatizado do backend"
    }
    
    try:
        print("Testing actual email sending to verified address:")
        print(json.dumps(payload, indent=2, ensure_ascii=False))
        
        response = requests.post(
            f"{BACKEND_URL}/api/send-orcamento-email",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=15
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('status') == 'success':
                print("✅ Email sent successfully!")
                print(f"Email ID: {data.get('email_id', 'N/A')}")
                return True
            else:
                print(f"❌ Unexpected response: {data}")
                return False
        else:
            print(f"❌ Email sending failed with status {response.status_code}")
            data = response.json()
            print(f"Error details: {data.get('detail', 'No details')}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Email sending test failed with error: {str(e)}")
        return False

if __name__ == "__main__":
    success = test_actual_email_sending()
    print(f"\nResult: {'SUCCESS' if success else 'FAILED'}")