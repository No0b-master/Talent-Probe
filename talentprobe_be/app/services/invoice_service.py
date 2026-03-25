from datetime import datetime
from io import BytesIO


class InvoiceService:
    company_name = "Taleef Technologies"
    company_email = "info@taleeftech.com"

    def build_subscription_invoice(
        self,
        transaction_ref: str,
        user_full_name: str,
        user_email: str,
        plan_name: str,
        plan_code: str,
        amount_usd: float,
        period_start: datetime,
        period_end: datetime,
        issued_at: datetime,
    ) -> bytes:
        try:
            from reportlab.lib.pagesizes import A4
            from reportlab.pdfgen import canvas
        except Exception as exc:
            raise ValueError("reportlab is required for invoice PDF generation") from exc

        buffer = BytesIO()
        pdf = canvas.Canvas(buffer, pagesize=A4)
        width, height = A4

        y = height - 60

        pdf.setFont("Helvetica-Bold", 18)
        pdf.drawString(40, y, self.company_name)

        y -= 24
        pdf.setFont("Helvetica", 10)
        pdf.drawString(40, y, f"Billing contact: {self.company_email}")

        y -= 32
        pdf.setFont("Helvetica-Bold", 14)
        pdf.drawString(40, y, "Invoice")

        y -= 20
        pdf.setFont("Helvetica", 11)
        pdf.drawString(40, y, f"Transaction Ref: {transaction_ref}")

        y -= 16
        pdf.drawString(40, y, f"Issued At (UTC): {issued_at.strftime('%Y-%m-%d %H:%M:%S')}")

        y -= 28
        pdf.setFont("Helvetica-Bold", 12)
        pdf.drawString(40, y, "Billed To")

        y -= 18
        pdf.setFont("Helvetica", 11)
        pdf.drawString(40, y, f"Name: {user_full_name}")

        y -= 16
        pdf.drawString(40, y, f"Email: {user_email}")

        y -= 28
        pdf.setFont("Helvetica-Bold", 12)
        pdf.drawString(40, y, "Plan Details")

        y -= 18
        pdf.setFont("Helvetica", 11)
        pdf.drawString(40, y, f"Plan: {plan_name} ({plan_code})")

        y -= 16
        pdf.drawString(40, y, f"Billing Period: {period_start.strftime('%Y-%m-%d')} to {period_end.strftime('%Y-%m-%d')}")

        y -= 16
        pdf.drawString(40, y, f"Amount: USD {amount_usd:.2f}")

        y -= 42
        pdf.setFont("Helvetica", 10)
        pdf.drawString(40, y, "This is a system-generated invoice for TalentProbe subscription services.")

        y -= 14
        pdf.drawString(40, y, "Thank you for your business.")

        pdf.showPage()
        pdf.save()

        buffer.seek(0)
        return buffer.read()
