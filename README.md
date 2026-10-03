<div align="center">

# 🎨 ComicCraft AI

### 🤖 AI-Powered Comic Story & Comic Panel Generator

<img src="https://skillicons.dev/icons?i=python,typescript,fastapi,jinja,html,css,js,github,git,vscode,netlify&theme=dark" alt="Technology icons">
<p>
<img src="https://img.shields.io/badge/Python-3.13-3776AB?style=for-the-badge&logo=python&logoColor=white">
    <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white">
<img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white">
<img src="https://img.shields.io/badge/Google%20Gemini-AI-4285F4?style=for-the-badge&logo=google&logoColor=white">
<img src="https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=black">
<img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white">
<img src="https://img.shields.io/badge/FPDF2-PDF-E34F26?style=for-the-badge">
</p>

**Turn a story idea into a structured comic experience with AI-generated story content, comic panels, layout, and PDF export.**

</div>

---

## ✨ About

**ComicCraft AI** is a web application that transforms a user's story prompt into a multi-panel comic workflow.

It combines **FastAPI**, **Google Gemini AI**, **Jinja2**, image-generation support, comic layout processing, and PDF export to create a complete AI-powered comic generation experience.

---

## 🚀 Features

- 📝 Custom story prompts
- 🤖 AI-powered story generation
- 💬 AI-generated dialogue and narration
- 🎭 Five-panel comic workflow
- 🖼️ Image generation / placeholder support
- 🎨 Comic panel layout builder
- 📄 PDF export
- 🌐 Responsive web interface
- 🔌 JSON API
- ☁️ Render deployment support
- 🔐 Environment-based API secrets
- 🧪 Pytest testing

---

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| 🐍 Python | Core programming language |
| ⚡ FastAPI | Backend API and web server |
| 🤖 Google Gemini | AI story and dialogue generation |
| 🎨 Jinja2 | HTML template rendering |
| 🖼️ Pillow | Image processing |
| 📄 FPDF2 | PDF generation |
| 🧪 Pytest | Application testing |
| 🚀 Uvicorn | ASGI server |
| ☁️ Render | Cloud deployment |
| 🐙 GitHub | Version control |

---

## 🧩 Application Architecture

```text
                    🎨 ComicCraft AI
                           │
                           ▼
                    🌐 Web Interface
                           │
                           ▼
                    ⚡ FastAPI Backend
                           │
          ┌────────────────┼────────────────┐
          │                │                │
          ▼                ▼                ▼
      🤖 Gemini AI    🖼️ Image Engine   📄 PDF Engine
          │                │                │
          ▼                ▼                ▼
   Story + Dialogue    Comic Panels      PDF Export
          │                │                │
          └────────────────┼────────────────┘
                           ▼
                     🎨 Comic Preview
