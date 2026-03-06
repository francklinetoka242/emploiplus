from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from io import BytesIO

# Create a simple PDF
c = canvas.Canvas("/tmp/test_cv.pdf", pagesize=letter)
c.drawString(100, 750, "Test CV")
c.drawString(100, 730, "Name: John Doe")
c.drawString(100, 710, "Email: john@example.com")
c.drawString(100, 690, "Experience: 5 years in software development")
c.drawString(100, 670, "Skills: Python, JavaScript, Node.js")
c.save()
print("PDF created at /tmp/test_cv.pdf")
