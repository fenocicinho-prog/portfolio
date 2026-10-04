"""Build public/main.pdf from content/cv-data.json using the user's supplied CV layout.

Run from the repository root with: python3 scripts/generate_cv.py
"""
import json
from html import escape
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph
from reportlab.lib.utils import ImageReader

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "main.pdf"
AVATAR = ROOT / "assets" / "cv-avatar.jpg"
FONT_DIR = Path("/usr/share/fonts/truetype/noto")
CV = json.loads((ROOT / "content" / "cv-data.json").read_text(encoding="utf-8"))

pdfmetrics.registerFont(TTFont("FenoSans", str(FONT_DIR / "NotoSans-Regular.ttf")))
pdfmetrics.registerFont(TTFont("FenoSans-Bold", str(FONT_DIR / "NotoSans-Bold.ttf")))
pdfmetrics.registerFont(TTFont("FenoSans-Italic", str(FONT_DIR / "NotoSans-Italic.ttf")))
pdfmetrics.registerFontFamily("FenoSans", normal="FenoSans", bold="FenoSans-Bold", italic="FenoSans-Italic", boldItalic="FenoSans-Bold")

PAGE_W, PAGE_H = A4
BLACK = colors.HexColor("#07090c")
TEXT = colors.HexColor("#17191c")
MUTED = colors.HexColor("#555a61")
PALE_BLUE = colors.HexColor("#e5effc")
RULE = colors.HexColor("#22252a")
WHITE = colors.white
BODY = ParagraphStyle("Body", fontName="FenoSans", fontSize=7.45, leading=9.4, textColor=TEXT, alignment=TA_LEFT)
SMALL = ParagraphStyle("Small", fontName="FenoSans", fontSize=6.9, leading=8.8, textColor=TEXT, alignment=TA_LEFT)
PROJECT_BODY = ParagraphStyle("ProjectBody", fontName="FenoSans", fontSize=7.0, leading=8.7, textColor=TEXT, alignment=TA_LEFT)


def paragraph(c, text, x, top, width, style=BODY):
    p = Paragraph(text, style)
    _, height = p.wrap(width, PAGE_H)
    p.drawOn(c, x, top - height)
    return top - height


def sidebar_bar(c, text, x, top, width):
    height = 21
    c.setFillColor(BLACK)
    c.rect(x, top - height, width, height, stroke=0, fill=1)
    c.setFillColor(WHITE)
    c.setFont("FenoSans-Bold", 8.4)
    c.drawString(x + 8, top - 14.3, text.upper())
    return top - height - 13


def main_bar(c, text, x, top, width, icon):
    bar_x = x + 25
    bar_h = 22
    draw_icon(c, icon, x + 2, top - 19)
    c.setFillColor(BLACK)
    c.rect(bar_x, top - bar_h, width - 25, bar_h, stroke=0, fill=1)
    c.setFillColor(WHITE)
    c.setFont("FenoSans-Bold", 8.1)
    c.drawString(bar_x + 9, top - 14.8, text.upper())
    return top - bar_h - 12


def draw_icon(c, kind, x, y):
    c.saveState()
    c.setStrokeColor(BLACK)
    c.setFillColor(WHITE)
    c.setLineWidth(1.25)
    if kind == "briefcase":
        c.roundRect(x + 1, y + 2, 18, 12, 2, stroke=1, fill=0)
        c.roundRect(x + 6, y + 14, 8, 4, 1.2, stroke=1, fill=0)
        c.line(x + 1, y + 9, x + 19, y + 9)
        c.line(x + 8, y + 8, x + 12, y + 8)
    elif kind == "cap":
        path = c.beginPath()
        path.moveTo(x, y + 10)
        path.lineTo(x + 10, y + 16)
        path.lineTo(x + 21, y + 10)
        path.lineTo(x + 10, y + 4)
        path.close()
        c.drawPath(path, stroke=1, fill=0)
        c.line(x + 4, y + 8, x + 4, y + 3)
        c.line(x + 4, y + 3, x + 10, y + 1)
        c.line(x + 16, y + 8, x + 16, y + 5)
        c.line(x + 21, y + 10, x + 21, y + 5)
    c.restoreState()


def contact_item(c, label, value, x, top, width):
    c.setFillColor(BLACK)
    c.setFont("FenoSans-Bold", 7.4)
    c.drawString(x, top - 7.5, label.upper())
    value_style = ParagraphStyle("ContactValue", fontName="FenoSans", fontSize=7.05, leading=8.8, textColor=TEXT)
    return paragraph(c, escape(value), x, top - 12, width, value_style) - 7


def project_row(c, project, x, top, width):
    status_style = ParagraphStyle("Status", fontName="FenoSans-Bold", fontSize=6.2, leading=7.4, textColor=MUTED)
    status_p = Paragraph(escape(project["status"].upper()), status_style)
    _, status_h = status_p.wrap(61, PAGE_H)
    text_x = x + 71
    text_w = width - 71
    title = Paragraph(escape(project["name"]), ParagraphStyle("ProjectTitle", fontName="FenoSans-Bold", fontSize=8.3, leading=10, textColor=BLACK))
    _, title_h = title.wrap(text_w, PAGE_H)
    stack = Paragraph(escape(project["stack"]), ParagraphStyle("ProjectStack", fontName="FenoSans", fontSize=6.6, leading=8, textColor=MUTED))
    _, stack_h = stack.wrap(text_w, PAGE_H)
    details = Paragraph(escape(project["details"]), PROJECT_BODY)
    _, details_h = details.wrap(text_w, PAGE_H)
    gap = 2
    content_h = title_h + gap + stack_h + gap + details_h
    row_h = max(content_h, status_h) + 7
    status_p.drawOn(c, x, top - status_h - 1)
    title.drawOn(c, text_x, top - title_h)
    stack.drawOn(c, text_x, top - title_h - gap - stack_h)
    details.drawOn(c, text_x, top - title_h - gap - stack_h - gap - details_h)
    bottom = top - row_h
    c.setStrokeColor(colors.HexColor("#d6d9dd"))
    c.setLineWidth(0.45)
    c.line(text_x, bottom, x + width, bottom)
    return bottom - 8


def training_row(c, label, title, text, x, top, width):
    left_w = 70
    label_p = Paragraph(escape(label.upper()), ParagraphStyle("TrainingLabel", fontName="FenoSans-Bold", fontSize=6.2, leading=7.6, textColor=MUTED))
    _, label_h = label_p.wrap(left_w - 5, PAGE_H)
    text_x = x + left_w
    text_w = width - left_w
    title_p = Paragraph(escape(title), ParagraphStyle("TrainingTitle", fontName="FenoSans-Bold", fontSize=8.1, leading=9.8, textColor=BLACK))
    _, title_h = title_p.wrap(text_w, PAGE_H)
    body_p = Paragraph(escape(text), PROJECT_BODY)
    _, body_h = body_p.wrap(text_w, PAGE_H)
    label_p.drawOn(c, x, top - label_h)
    title_p.drawOn(c, text_x, top - title_h)
    body_p.drawOn(c, text_x, top - title_h - 3 - body_h)
    return top - max(label_h, title_h + 3 + body_h) - 11


def build():
    c = canvas.Canvas(str(OUT), pagesize=A4, pageCompression=1)
    c.setTitle(f"CV — {CV['fullName']}")
    c.setAuthor(CV["fullName"])
    c.setSubject(CV["roleDisplay"] + " — " + CV["location"])
    c.setKeywords("Cicinho Feno, développeur, Full Stack, Madagascar, CV")

    # Pale-blue title band and square headshot reproduce the user-provided layout.
    band_h = 143
    c.setFillColor(PALE_BLUE)
    c.rect(0, PAGE_H - band_h, PAGE_W, band_h, stroke=0, fill=1)
    avatar_size = 153
    avatar_x = 32
    avatar_y = PAGE_H - 29 - avatar_size
    c.drawImage(ImageReader(str(AVATAR)), avatar_x, avatar_y, width=avatar_size, height=avatar_size, mask="auto")
    c.setStrokeColor(colors.HexColor("#c3d3e7"))
    c.setLineWidth(0.7)
    c.rect(avatar_x, avatar_y, avatar_size, avatar_size, stroke=1, fill=0)

    title_x = 231
    c.setFillColor(BLACK)
    c.setFont("FenoSans-Bold", 22)
    c.drawString(title_x, PAGE_H - 51, CV["fullName"].upper())
    c.setFont("FenoSans-Italic", 14)
    c.drawString(title_x + 1, PAGE_H - 79, CV["roleDisplay"])
    c.setStrokeColor(BLACK)
    c.setLineWidth(1.2)
    c.line(title_x, PAGE_H - 101, PAGE_W - 31, PAGE_H - 101)
    c.setFont("FenoSans", 7.4)
    c.setFillColor(TEXT)
    c.drawString(title_x, PAGE_H - 119, f"{CV['ageDisplay']} · {CV['location']} · Disponible pour projets")

    sidebar_x, sidebar_w = 29, 154
    divider_x = 198
    main_x, main_w = 222, PAGE_W - 252
    c.setStrokeColor(BLACK)
    c.setLineWidth(1.1)
    c.line(divider_x, 36, divider_x, PAGE_H - 242)

    # Main column summary, set just below the title strip and alongside the portrait.
    summary_top = PAGE_H - 174
    paragraph(c, escape(CV["profile"]), main_x + 2, summary_top, main_w - 3, BODY)

    # Sidebar: contact, capabilities, and current self-directed practice.
    sy = sidebar_bar(c, "Profil & contact", sidebar_x, PAGE_H - 221, sidebar_w)
    sy = contact_item(c, "Localisation", "Nosy Be, Madagascar", sidebar_x + 2, sy, sidebar_w - 5)
    sy = contact_item(c, "E-mail", "fenocicinho@gmail.com", sidebar_x + 2, sy, sidebar_w - 5)
    sy = contact_item(c, "Téléphone / WhatsApp", CV["whatsapp"], sidebar_x + 2, sy, sidebar_w - 5)
    sy = contact_item(c, "GitHub", "github.com/fenocicinho-prog", sidebar_x + 2, sy, sidebar_w - 5)

    sy = sidebar_bar(c, "Compétences", sidebar_x, sy - 1, sidebar_w)
    for skill in CV["skills"]:
        c.setFillColor(BLACK)
        c.circle(sidebar_x + 4, sy - 4.2, 1.2, stroke=0, fill=1)
        skill_p = Paragraph(escape(skill), ParagraphStyle("Skill", fontName="FenoSans", fontSize=7.05, leading=8.4, textColor=TEXT))
        _, skill_h = skill_p.wrap(sidebar_w - 16, PAGE_H)
        skill_p.drawOn(c, sidebar_x + 11, sy - skill_h)
        sy -= max(12, skill_h + 3)

    sy = sidebar_bar(c, "Pratique actuelle", sidebar_x, sy - 1, sidebar_w)
    practice = "Cybersécurité explorée en autodidacte, avec des ressources en ligne et par curiosité, sans professeur."
    sy = paragraph(c, escape(practice), sidebar_x + 2, sy, sidebar_w - 5, SMALL)
    sy -= 8
    interest = "Apprentissage continu des technologies avec l’aide d’outils d’IA."
    paragraph(c, escape(interest), sidebar_x + 2, sy, sidebar_w - 5, SMALL)

    # Main column: selected work first, then education and honest learning history.
    my = main_bar(c, "Projets informatiques", main_x, PAGE_H - 242, main_w, "briefcase")
    for project in (p for p in CV["projects"] if p["inCv"]):
        my = project_row(c, project, main_x, my, main_w)

    my -= 1
    my = main_bar(c, "Formations & apprentissage", main_x, my, main_w, "cap")
    education = CV["education"]
    my = training_row(c, "Formation générale", education["title"], education["details"], main_x, my, main_w)

    learning = CV["learning"]
    learning_text = (
        f"{learning['provider']}, dirigée par {learning['director']}. "
        f"Technologies abordées : {', '.join(learning['topics'])}. "
        f"{learning['nuance']}"
    )
    my = training_row(c, f"Depuis {learning['startDate']}", learning["title"], learning_text, main_x, my, main_w)

    my = training_row(c, "Autodidacte", "Progression avec l’aide de l’IA", CV["selfDirectedLearning"], main_x, my, main_w)
    training_row(c, "Pratique personnelle", "Cybersécurité", CV["cybersecurity"], main_x, my, main_w)

    c.setStrokeColor(colors.HexColor("#cbd0d6"))
    c.setLineWidth(0.55)
    c.line(29, 29, PAGE_W - 29, 29)
    c.setFillColor(MUTED)
    c.setFont("FenoSans", 6.5)
    c.drawCentredString(PAGE_W / 2, 17, "CV portfolio · Mise à jour : octobre 2026 · Projets et références disponibles sur GitHub")

    c.showPage()
    c.save()
    print(f"CV generated: {OUT}")
    print(f"Last training content ends at y={my:.1f} pt; sidebar ends at y={sy:.1f} pt")


if __name__ == "__main__":
    build()
