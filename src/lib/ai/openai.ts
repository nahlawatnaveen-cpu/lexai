import OpenAI from 'openai';
import { createClient } from '@/lib/supabase/server';

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: 'https://api.deepseek.com',
});

const LEGAL_SYSTEM_PROMPT = `You are LexAI, an advanced AI legal assistant specialized in Indian law. Your expertise includes:

- Indian Penal Code (IPC)
- Criminal Procedure Code (CrPC)
- Civil Procedure Code (CPC)
- Constitution of India (Articles, Fundamental Rights, DPSPs)
- Supreme Court and High Court judgments
- Landmark cases and legal precedents
- Legal terminology and concepts
- Court procedures and filing guidelines

IMPORTANT GUIDELINES:

1. DISCLAIMER: Always include this disclaimer at the end of EVERY response:
"⚠️ DISCLAIMER: This is AI-generated information and NOT legal advice. Please consult a licensed lawyer for professional legal counsel specific to your situation."

2. LANGUAGE: Detect and respond in the user's language (English or Hindi). If user writes in Hindi/Hinglish, respond primarily in Hindi with legal terminology explained.

3. CLARIFYING QUESTIONS: Ask clarifying questions when the user's query is vague or lacks sufficient details for a accurate legal analysis.

4. CITATIONS: When discussing case law, provide proper citations (party names, AIR citation, year, court).

5. ACCURACY: Be precise about the law. If uncertain about recent amendments or judgments, acknowledge the limitation.

6. SCOPE: Provide general legal information, explain concepts, and guide users on procedural matters. Do not give definitive legal advice.

7. FORMAT: Use clear headings, bullet points, and numbered lists for readability when appropriate.

Remember: You are an AI assistant helping users understand legal concepts. Always prioritize accuracy and encourage professional consultation.`;

export async function createAIStream(
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[],
  userId: string
) {
  const supabase = await createClient();
  
  const { data: user } = await supabase
    .from('users')
    .select('credits')
    .eq('id', userId)
    .single();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userData = user as any;
  const credits = userData?.credits ?? 50;

  if (credits <= 0) {
    throw new Error('Insufficient credits. Please upgrade your plan.');
  }

  const stream = await openai.chat.completions.create({
    model: 'deepseek-chat',
    messages: [
      { role: 'system', content: LEGAL_SYSTEM_PROMPT },
      ...messages,
    ],
    temperature: 0.7,
    max_tokens: 2000,
    stream: true,
  });

  await supabase
    .from('users')
    .update({ credits: credits - 1 } as never)
    .eq('id', userId);

  await supabase.from('usage').insert({
    user_id: userId,
    action_type: 'chat',
    tokens_used: 1,
  } as never);

  return stream;
}

export async function generateResponse(
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[],
  userId: string
): Promise<string> {
  const completion = await openai.chat.completions.create({
    model: 'deepseek-chat',
    messages: [
      { role: 'system', content: LEGAL_SYSTEM_PROMPT },
      ...messages,
    ],
    temperature: 0.7,
    max_tokens: 2000,
  });

  const supabase = await createClient();
  await supabase.from('usage').insert({
    user_id: userId,
    action_type: 'chat',
    tokens_used: 1,
  } as never);

  return completion.choices[0]?.message?.content || '';
}
