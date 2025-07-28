# Juri - AI Legal Assistant

A modern, AI-powered legal assistant for founders and entrepreneurs, built with Next.js and NVIDIA's Nemotron model.

## Features

- **AI-Powered Legal Q&A**: Ask legal questions and get intelligent responses
- **Document Analysis**: Upload PDFs and documents for context-aware analysis
- **Chat History**: Save and manage conversation history
- **Modern UI**: Clean, minimal interface inspired by modern SaaS applications
- **File Upload**: Support for PDF, DOC, DOCX, and TXT files

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Environment Configuration**:
   Create a `.env.local` file in the root directory:
   ```env
   NVIDIA_API_KEY=your_nvidia_api_key_here
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

3. **Get NVIDIA API Key**:
   - Visit [NVIDIA AI Playground](https://www.nvidia.com/en-us/ai-data-science/ai-playground/)
   - Sign up for API access
   - Get your API key from the dashboard

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## API Integration

The application uses NVIDIA's Nemotron model for legal Q&A:

- **Model**: `nvidia/llama-3.3-nemotron-super-49b-v1`
- **Base URL**: `https://integrate.api.nvidia.com/v1`
- **Features**: Document analysis, context-aware responses, legal expertise

## File Support

- **PDF**: Full text extraction and analysis
- **TXT**: Plain text files
- **DOC/DOCX**: Microsoft Word documents (basic support)

## Usage

1. **Ask Questions**: Type legal questions in the chat interface
2. **Upload Documents**: Click the upload button to attach files
3. **View History**: Use the dropdown to access previous conversations
4. **Get Insights**: AI analyzes documents and provides legal guidance

## Legal Disclaimer

This application provides general legal information and guidance. It is not a substitute for professional legal advice. Always consult with qualified legal professionals for specific legal matters.

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript
- **Styling**: Tailwind CSS
- **AI**: NVIDIA Nemotron Model
- **File Processing**: PDF-parse, File API
- **State Management**: React Context API
