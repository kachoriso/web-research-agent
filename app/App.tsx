'use client';

import { ChatKit, useChatKit } from '@openai/chatkit-react';

const CHATKIT_DOMAIN_KEY = process.env.CHATKIT_DOMAIN_KEY;

if (!CHATKIT_DOMAIN_KEY) {
  throw new Error(
    'CHATKIT_DOMAIN_KEY is not set. Did you forget to set it in Vercel or .env.local?'
  );
}

export default function Home() {
  const chatkit = useChatKit({
    api: {
      url: '/api/chatkit',
      domainKey: CHATKIT_DOMAIN_KEY || "",
    },
    theme: {
      radius: 'round',
      color: { accent: { primary: '#007bff', level: 1 } },
    },
    startScreen: {
      greeting: '技術記事リサーチャー',
      prompts: [
        {
          label: 'React vs Vue',
          prompt: 'ReactとVueの最新の比較を詳細に教えて',
        },
        {
          label: 'Next.js 15 の新機能',
          prompt: 'Next.js 15の主要な新機能をまとめて',
        },
      ],
    },
    composer: {
      placeholder: '技術トピックを入力してください...',
    },
    onError: ({ error }) => {
      console.error('ChatKit Frontend Error', error);
    },
  });

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <ChatKit control={chatkit.control} className="block h-full w-full" />
    </div>
  );
}