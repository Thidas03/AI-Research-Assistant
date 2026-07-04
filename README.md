# 🤖 AI Research Assistant

An AI-powered full-stack web application that transforms unstructured research into structured, actionable insights using Google Gemini AI.

Users can paste text or upload PDF documents, and the application generates an executive summary, key discoveries, weak claims, strategic recommendations, and a technical content brief.

---

## 🚀 Live Demo

🌐 https://ai-research-assistant-cyan-seven.vercel.app/

---

## 📌 Features

- 📝 Analyze pasted text using AI
- 📄 Upload and summarize PDF documents
- 🤖 Google Gemini AI integration
- 📊 Structured AI-generated outputs:
  - Executive Summary
  - Key Discoveries
  - Weak Claims & Gaps
  - Strategic Recommendations
  - Technical Content Brief
- ✏️ Human Review panel for editing AI-generated content
- 📋 Copy generated results with a single click
- 📱 Responsive and modern user interface

---

## 🛠️ Tech Stack

### Frontend
- React
- Vite
- Axios
- CSS

### Backend
- Node.js
- Express.js

### AI & Processing
- Google Gemini API
- Multer
- PDF Parser

### Deployment
- Vercel

---

## 📂 Project Structure

```
AI-Research-Assistant/
│
├── client/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── server/
│   ├── src/
│   ├── routes/
│   ├── controllers/
│   └── package.json
│
└── README.md
```

---

## ⚙️ Installation

### Clone the repository

```bash
git clone https://github.com/Thidas03/AI-Research-Assistant.git
```

### Backend

```bash
cd server
npm install
```

Create a `.env` file:

```env
GEMINI_API_KEY=your_api_key_here
PORT=5000
```

Run the backend:

```bash
npm start
```

---

### Frontend

```bash
cd client
npm install
npm run dev
```

---

## 🔄 Workflow

1. User pastes text or uploads a PDF.
2. The backend extracts the text (for PDF uploads).
3. Content is sent to Google Gemini AI.
4. Gemini analyzes the input and generates structured insights.
5. Results are displayed in an editable format for human review.

---

## 📸 Screenshots

You can add screenshots of:

- Home page
- Text analysis
- PDF upload
- AI-generated results

---

## 🚧 Future Improvements

- OCR support for scanned PDFs
- Export reports as PDF or Word
- Authentication and user accounts
- Save analysis history
- Multi-document comparison
- Confidence scores for AI-generated insights

---

## ⚠️ Responsible AI

This application uses Google Gemini AI to generate summaries and recommendations. AI-generated content may occasionally contain inaccuracies or incomplete information. Users should review important outputs before making decisions based on them.

---

## 👨‍💻 Author

**Thidas Rathnayake**

Project developed as part of the **Catalist Media – Agent Prototyping Intern Builder Challenge (Option 3: AI Research-to-Output Agent).**

---

## 📄 License

This project is created for educational and portfolio purposes.
