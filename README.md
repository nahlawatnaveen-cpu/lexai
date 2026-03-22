# LexAI - AI-Powered Legal Assistant for India

An intelligent AI-powered legal assistant for lawyers and ordinary citizens in India. Built with Next.js 14, Supabase, and OpenAI GPT-4o.

![LexAI Banner](https://img.shields.io/badge/LexAI-Legal%20Assistant-blue)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## Features

### 1. Google Login
- One-click "Continue with Google" authentication
- User profile with name, email, and profile picture
- Role selection: "Lawyer" or "Citizen"

### 2. AI Legal Chat
- Beautiful chat interface powered by GPT-4o
- System prompt specialized in Indian law (IPC, CrPC, CPC, Constitution)
- Supports Hindi + English
- Streaming responses
- Chat history with automatic saving

### 3. Document Drafting Tool
- Templates: FIR, Legal Notice, Affidavit, Agreement, Petition, Will
- AI-assisted document generation
- Export capabilities
- Personal document library

### 4. Case Law Search
- Search Supreme Court and High Court judgments
- AI-powered summarization
- Links to official sources (IndianKanoon, SCI)
- Relevance-based results

### 5. Additional Features
- Dark/Light mode toggle
- Fully responsive (mobile-first)
- Credits system (50 free queries)
- Privacy-first design
- Professional legal-themed UI

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, Server Actions
- **Database**: Supabase PostgreSQL
- **Authentication**: Supabase Auth (Google OAuth)
- **AI**: OpenAI GPT-4o, Vercel AI SDK
- **Search**: Tavily API
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account
- An OpenAI API key
- A Tavily API key (optional, for case law search)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/lexai.git
cd lexai
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Fill in the required values:

```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI (Required)
OPENAI_API_KEY=your_openai_api_key

# Tavily (Optional - for case law search)
TAVILY_API_KEY=your_tavily_api_key

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Set Up Supabase

#### 4.1 Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Get your project URL and anon key from Settings > API

#### 4.2 Create Database Tables

Run the following SQL in the Supabase SQL Editor:

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'citizen' CHECK (role IN ('lawyer', 'citizen')),
  credits INTEGER DEFAULT 50,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chats table
CREATE TABLE chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents table
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  content TEXT NOT NULL,
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Usage tracking table
CREATE TABLE usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('chat', 'document', 'search')),
  tokens_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own chats" ON chats FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own chats" ON chats FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own chats" ON chats FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can update own chats" ON chats FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own messages" ON messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM chats WHERE chats.id = messages.chat_id AND chats.user_id = auth.uid())
);
CREATE POLICY "Users can create own messages" ON messages FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM chats WHERE chats.id = messages.chat_id AND chats.user_id = auth.uid())
);
CREATE POLICY "Users can delete own messages" ON messages FOR DELETE USING (
  EXISTS (SELECT 1 FROM chats WHERE chats.id = messages.chat_id AND chats.user_id = auth.uid())
);

CREATE POLICY "Users can view own documents" ON documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own documents" ON documents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own documents" ON documents FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can update own documents" ON documents FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own usage" ON usage FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own usage" ON usage FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_chats_user_id ON chats(user_id);
CREATE INDEX idx_chats_updated_at ON chats(updated_at DESC);
CREATE INDEX idx_messages_chat_id ON messages(chat_id);
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_usage_user_id ON usage(user_id);
```

#### 4.3 Set Up Google OAuth

1. Go to Supabase Dashboard > Authentication > Providers > Google
2. Enable Google OAuth
3. Get your Google OAuth credentials from [Google Cloud Console](https://console.cloud.google.com)
4. Add authorized redirect URI: `https://your-project-ref.supabase.co/auth/v1/callback`
5. Configure the following in Supabase:
   - Client ID
   - Client Secret

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
lexai/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API Routes
│   │   ├── auth/              # Auth pages
│   │   ├── chat/              # Chat pages
│   │   ├── dashboard/         # Dashboard
│   │   ├── documents/         # Document pages
│   │   ├── search/            # Case law search
│   │   ├── settings/          # Settings page
│   │   └── globals.css        # Global styles
│   ├── components/
│   │   ├── layout/            # Layout components
│   │   └── ui/               # shadcn/ui components
│   ├── lib/
│   │   ├── ai/                # AI utilities
│   │   ├── documents/         # Document generation
│   │   └── supabase/          # Supabase clients
│   ├── actions/              # Server Actions
│   └── types/                 # TypeScript types
├── public/                    # Static assets
├── .env.example               # Environment template
├── next.config.js            # Next.js config
├── package.json              # Dependencies
├── tailwind.config.ts        # Tailwind config
└── tsconfig.json             # TypeScript config
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `OPENAI_API_KEY` | OpenAI API key | Yes |
| `TAVILY_API_KEY` | Tavily API key for search | No |
| `NEXT_PUBLIC_APP_URL` | Application URL | Yes |

## API Routes

### POST /api/chat
Stream AI responses for chat.

```json
{
  "messages": [{ "role": "user", "content": "..." }],
  "chatId": "uuid"
}
```

### POST /api/search
Search for case law.

```json
{
  "searchQuery": "Supreme Court Article 21"
}
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project to Vercel
3. Add environment variables
4. Deploy!

### Other Platforms

Build for production:
```bash
npm run build
npm start
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Disclaimer

**Important**: LexAI provides general legal information only. This is NOT legal advice and should not be treated as a substitute for professional legal consultation. Always verify information from official sources and consult qualified lawyers for specific legal matters.

## Support

- Create an issue on GitHub
- Email: support@lexai.com

---

Built with ❤️ for the Indian legal community
