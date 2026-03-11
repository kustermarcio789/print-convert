import os
import asyncio
import logging
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr

load_dotenv()

import resend

resend.api_key = os.environ.get("RESEND_API_KEY", "")
SENDER_EMAIL = os.environ.get("SENDER_EMAIL", "onboarding@resend.dev")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="3DKPRINT API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class EmailRequest(BaseModel):
    recipient_email: EmailStr
    recipient_name: str = ""
    subject: str
    html_content: str


class OrcamentoEmailRequest(BaseModel):
    recipient_email: EmailStr
    recipient_name: str
    orcamento_id: str
    tipo_servico: str
    descricao: str = "Conforme solicitado"
    material: str = "A definir"
    quantidade: int = 1
    valor: float
    prazo: str = "A combinar"
    observacoes: str = ""


@app.get("/api/health")
async def health():
    return {"status": "ok"}


@app.post("/api/send-email")
async def send_email(request: EmailRequest):
    if not resend.api_key:
        raise HTTPException(status_code=500, detail="RESEND_API_KEY not configured")

    params = {
        "from": f"3DKPRINT <{SENDER_EMAIL}>",
        "to": [request.recipient_email],
        "subject": request.subject,
        "html": request.html_content,
    }

    try:
        email = await asyncio.to_thread(resend.Emails.send, params)
        return {
            "status": "success",
            "message": f"Email enviado para {request.recipient_email}",
            "email_id": email.get("id") if isinstance(email, dict) else str(email),
        }
    except Exception as e:
        logger.error(f"Failed to send email: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Falha ao enviar email: {str(e)}")


@app.post("/api/send-orcamento-email")
async def send_orcamento_email(request: OrcamentoEmailRequest):
    if not resend.api_key:
        raise HTTPException(status_code=500, detail="RESEND_API_KEY not configured")

    obs_block = ""
    if request.observacoes:
        obs_block = (
            "<div style='background: #fffbeb; border: 1px solid #fde68a; "
            "border-radius: 8px; padding: 16px; margin: 24px 0;'>"
            '<p style="color: #92400e; font-size: 14px; margin: 0;">'
            "<strong>Observacoes:</strong> " + request.observacoes + "</p></div>"
        )

    valor_fmt = f"R$ {request.valor:,.2f}"

    html_content = (
        '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">'
        '<div style="background: linear-gradient(135deg, #2563eb, #1d4ed8); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">'
        '<h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">3DKPRINT</h1>'
        '<p style="color: #bfdbfe; margin: 8px 0 0; font-size: 14px;">Impressao 3D Profissional</p>'
        '</div>'
        '<div style="padding: 30px; border: 1px solid #e5e7eb; border-top: none;">'
        '<h2 style="color: #1f2937; margin: 0 0 8px; font-size: 20px;">Proposta de Orcamento</h2>'
        f'<p style="color: #6b7280; margin: 0 0 24px; font-size: 14px;">Ref: {request.orcamento_id}</p>'
        '<p style="color: #374151; font-size: 15px; line-height: 1.6;">'
        f'Ola <strong>{request.recipient_name}</strong>,'
        '</p>'
        '<p style="color: #374151; font-size: 15px; line-height: 1.6;">'
        'Segue nossa proposta de orcamento conforme solicitado:'
        '</p>'
        '<table style="width: 100%; border-collapse: collapse; margin: 24px 0;">'
        '<tr style="border-bottom: 1px solid #e5e7eb;">'
        '<td style="padding: 12px 0; color: #6b7280; font-size: 14px; width: 40%;">Servico</td>'
        f'<td style="padding: 12px 0; color: #1f2937; font-size: 14px; font-weight: 600;">{request.tipo_servico}</td>'
        '</tr>'
        '<tr style="border-bottom: 1px solid #e5e7eb;">'
        '<td style="padding: 12px 0; color: #6b7280; font-size: 14px;">Descricao</td>'
        f'<td style="padding: 12px 0; color: #1f2937; font-size: 14px;">{request.descricao}</td>'
        '</tr>'
        '<tr style="border-bottom: 1px solid #e5e7eb;">'
        '<td style="padding: 12px 0; color: #6b7280; font-size: 14px;">Material</td>'
        f'<td style="padding: 12px 0; color: #1f2937; font-size: 14px;">{request.material}</td>'
        '</tr>'
        '<tr style="border-bottom: 1px solid #e5e7eb;">'
        '<td style="padding: 12px 0; color: #6b7280; font-size: 14px;">Quantidade</td>'
        f'<td style="padding: 12px 0; color: #1f2937; font-size: 14px;">{request.quantidade} unidade(s)</td>'
        '</tr>'
        '<tr style="border-bottom: 1px solid #e5e7eb;">'
        '<td style="padding: 12px 0; color: #6b7280; font-size: 14px;">Prazo</td>'
        f'<td style="padding: 12px 0; color: #1f2937; font-size: 14px;">{request.prazo}</td>'
        '</tr>'
        '</table>'
        '<div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">'
        '<p style="color: #166534; font-size: 14px; margin: 0 0 4px;">Valor Total</p>'
        f'<p style="color: #15803d; font-size: 32px; font-weight: bold; margin: 0;">{valor_fmt}</p>'
        '</div>'
        + obs_block +
        '<p style="color: #374151; font-size: 15px; line-height: 1.6;">'
        'Para aprovar este orcamento, responda este email ou entre em contato pelo WhatsApp.'
        '</p>'
        '<div style="text-align: center; margin: 30px 0;">'
        f'<a href="mailto:3dk.print.br@gmail.com?subject=Aprovacao%20Orcamento%20{request.orcamento_id}"'
        ' style="display: inline-block; background: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: 600; font-size: 14px;">'
        'Aprovar Orcamento'
        '</a>'
        '</div>'
        '<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />'
        '<p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">'
        'Este orcamento e valido por 15 dias.<br/>'
        '3DKPRINT - Impressao 3D Profissional<br/>'
        'Ourinhos - SP'
        '</p>'
        '</div>'
        '</div>'
    )

    params = {
        "from": f"3DKPRINT <{SENDER_EMAIL}>",
        "to": [request.recipient_email],
        "subject": f"Proposta de Orcamento {request.orcamento_id} - 3DKPRINT",
        "html": html_content,
    }

    try:
        email = await asyncio.to_thread(resend.Emails.send, params)
        return {
            "status": "success",
            "message": f"Email enviado para {request.recipient_email}",
            "email_id": email.get("id") if isinstance(email, dict) else str(email),
        }
    except Exception as e:
        logger.error(f"Failed to send orcamento email: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Falha ao enviar email: {str(e)}")
