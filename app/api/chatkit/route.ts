import { NextResponse } from 'next/server';
import { webSearchTool, Agent, AgentInputItem, Runner } from "@openai/agents";

const webSearchPreview = webSearchTool({
  userLocation: {
    type: "approximate",
    country: undefined,
    region: undefined,
    city: undefined,
    timezone: undefined
  },
  searchContextSize: "medium"
})

const myAgent = new Agent({
  name: "My agent",
  instructions: "あなたは、プロのWEBエンジニア向けの技術リサーチャーです。 ユーザーから依頼された技術トピックについて、Web検索(Browsing)ツールを使って最新の情報を調査します。 調査結果は、複数の情報源を比較・分析し、メリット・デメリット、主要なポイントを簡潔にまとめて日本語で回答してください。",
  model: "gpt-4.1",
  tools: [
    webSearchPreview
  ],
  modelSettings: {
    temperature: 1,
    topP: 1,
    maxTokens: 2048,
    store: true
  }
});

// type WorkflowInput = { input_as_text: string };
interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

/**
 * フロントのMessage[]を、Agent SDKのAgentInputItem[]に変換する
 */
function convertToAgentInput(messages: Message[]): AgentInputItem[] {
  return messages.map((msg) => {
    if (msg.role === 'user') {
      return {
        role: 'user',
        content: [{ type: 'input_text', text: msg.content }],
      };
    } else { // 'assistant' の場合
      return {
        role: 'assistant',
        status: 'completed', // ★アシスタントの過去の応答には 'status' が必須
        content: [{ type: 'output_text', text: msg.content }], // ★type は 'output_text'
      };
    }
  });
}

export const POST = async (req: Request) => {
  try {
    const { message, history } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const conversationHistory: AgentInputItem[] = [
      ...convertToAgentInput(history || []),
      {
        role: 'user',
        content: [{ type: 'input_text', text: message }],
      },
    ];

    const runner = new Runner({
      traceMetadata: {
        __trace_source__: 'agent-builder',
        workflow_id: process.env.WORKFLOW_ID || "",
      },
    });

    const myAgentResultTemp = await runner.run(myAgent, conversationHistory);

    if (!myAgentResultTemp.finalOutput) {
      throw new Error('Agent result is undefined');
    }

    const responseText = myAgentResultTemp.finalOutput;
    return NextResponse.json({
      response: responseText,
    });
  } catch (error) {
    console.error(error);
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
};
