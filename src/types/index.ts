export interface User {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  role: 'lawyer' | 'citizen';
  credits: number;
  createdAt: string;
  updatedAt: string;
}

export interface Chat {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages?: Message[];
}

export interface Message {
  id: string;
  chatId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface Document {
  id: string;
  userId: string;
  title: string;
  type: string;
  content: string;
  pdfUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CaseLaw {
  title: string;
  citation: string;
  summary: string;
  ratio: string;
  url: string;
  date: string;
  court: string;
}

export interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  fields: TemplateField[];
}

export interface TemplateField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'date' | 'select';
  required: boolean;
  options?: string[];
  placeholder?: string;
}

export interface CreditsInfo {
  used: number;
  total: number;
  remaining: number;
}
