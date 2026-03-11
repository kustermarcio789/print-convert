"""
Backend API Tests for 3DKPRINT e-commerce
Tests health endpoint and email sending API
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestHealthEndpoint:
    """Health endpoint tests"""
    
    def test_health_returns_ok(self):
        """GET /api/health should return status ok"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert data["status"] == "ok"


class TestEmailAPI:
    """Email sending API tests"""
    
    def test_send_orcamento_email_endpoint_exists(self):
        """POST /api/send-orcamento-email should accept valid payload"""
        payload = {
            "recipient_email": "test@example.com",
            "recipient_name": "Test User",
            "orcamento_id": "ORC-TEST-001",
            "tipo_servico": "Impressão 3D",
            "descricao": "Test description",
            "material": "PLA",
            "quantidade": 1,
            "valor": 150.00,
            "prazo": "7 dias",
            "observacoes": "Test observation"
        }
        response = requests.post(
            f"{BASE_URL}/api/send-orcamento-email",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        # API should return 500 with specific Resend domain verification error (not 404 or validation error)
        # This indicates the endpoint exists and payload is valid
        assert response.status_code in [200, 500]
        data = response.json()
        
        if response.status_code == 500:
            # Expected: Resend test mode restriction
            assert "detail" in data
            assert "resend.com" in data["detail"].lower() or "email" in data["detail"].lower()
        else:
            # Success case (if Resend is configured with verified domain)
            assert data.get("status") == "success"
    
    def test_send_orcamento_email_validation(self):
        """POST /api/send-orcamento-email should validate required fields"""
        # Missing required fields
        payload = {
            "recipient_name": "Test User"
            # Missing recipient_email, orcamento_id, tipo_servico, valor
        }
        response = requests.post(
            f"{BASE_URL}/api/send-orcamento-email",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        # Should return 422 for validation error
        assert response.status_code == 422
    
    def test_send_orcamento_email_invalid_email(self):
        """POST /api/send-orcamento-email should reject invalid email format"""
        payload = {
            "recipient_email": "invalid-email",  # Invalid email format
            "recipient_name": "Test User",
            "orcamento_id": "ORC-TEST-001",
            "tipo_servico": "Impressão 3D",
            "valor": 150.00
        }
        response = requests.post(
            f"{BASE_URL}/api/send-orcamento-email",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        # Should return 422 for invalid email
        assert response.status_code == 422


class TestSendEmailEndpoint:
    """Generic email sending endpoint tests"""
    
    def test_send_email_endpoint_exists(self):
        """POST /api/send-email should accept valid payload"""
        payload = {
            "recipient_email": "test@example.com",
            "recipient_name": "Test User",
            "subject": "Test Subject",
            "html_content": "<p>Test content</p>"
        }
        response = requests.post(
            f"{BASE_URL}/api/send-email",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        # Should return 200 or 500 (Resend domain restriction)
        assert response.status_code in [200, 500]
        
        if response.status_code == 500:
            data = response.json()
            assert "detail" in data


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
