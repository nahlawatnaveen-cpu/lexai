import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const deepseek = new OpenAI({
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

3. CLARIFYING QUESTIONS: Ask clarifying questions when the user's query is vague or lacks sufficient details for an accurate legal analysis.

4. CITATIONS: When discussing case law, provide proper citations (party names, AIR citation, year, court).

5. ACCURACY: Be precise about the law. If uncertain about recent amendments or judgments, acknowledge the limitation.

6. FORMAT: Use clear headings, bullet points, and numbered lists for readability when appropriate.`;

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: userData } = await supabase
      .from('users')
      .select('credits')
      .eq('id', user.id)
      .single();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const credits = (userData as any)?.credits ?? 50;

    if (credits <= 0) {
      return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 });
    }

    const { messages, chatId } = await request.json();

    const stream = await deepseek.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: LEGAL_SYSTEM_PROMPT },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 2000,
      stream: true,
    });

    const readableStream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            controller.enqueue(encoder.encode(content));
          }
        }
        
        controller.close();

        await supabase
          .from('users')
          .update({ credits: credits - 1 } as never)
          .eq('id', user.id);

        await supabase.from('usage').insert({
          user_id: user.id,
          action_type: 'chat',
          tokens_used: 1,
        } as never);

        if (chatId) {
          await supabase.from('messages').insert({
            chat_id: chatId,
            role: 'assistant',
            content: 'Streaming response completed',
          } as never);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/plain',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}
