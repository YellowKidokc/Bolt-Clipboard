import { useState } from 'react';
import { Bot, Send, AlertTriangle } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function AIAnalystChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        'I have access to all platform data — triggers, candidates, articles, and scoring stats. Ask me anything about the system.',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');

  const suggestedQuestions = [
    'What are the current statistics across all prophecy triggers?',
    'Which triggers are trending upward and why?',
    'How could we improve the scoring keywords for the Mark of the Beast trigger?',
    'Are there any gaps in our trigger coverage that we should be concerned about?',
    'Which candidates from the template bank received the most attention?',
    'Scoring methodology training',
  ];

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);

    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content:
          'This is a demonstration mode. In a production environment, I would analyze your platform data and provide detailed insights based on real-time scoring, trigger statistics, and feed analysis. To enable full AI analysis, configure your AI provider in the system settings.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    }, 1000);

    setInput('');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
        <div className="bg-zinc-950 border-b border-zinc-800 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center">
              <Bot className="w-6 h-6 text-black" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">AI Analyst Chat</h2>
              <p className="text-sm text-gray-400">
                Discuss data, scoring methodology, and get analysis feedback
              </p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-900/20 border-b border-yellow-500/30 p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-500/90">
              No AI providers configured. Add your OpenAI/Claude API_KEY in the system tab to start
              charting.
            </div>
          </div>
        </div>

        <div className="h-[500px] overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-black" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  message.role === 'user'
                    ? 'bg-yellow-500 text-black'
                    : 'bg-zinc-800 text-white border border-zinc-700'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <div
                  className={`text-xs mt-2 ${
                    message.role === 'user' ? 'text-black/70' : 'text-gray-500'
                  }`}
                >
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-semibold">U</span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="border-t border-zinc-800 bg-zinc-950">
          <div className="p-4">
            <div className="mb-4">
              <h3 className="text-sm text-gray-400 mb-2">INTEL CHAT - GPT-4 Mini</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => setInput(question)}
                    className="text-left text-xs px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-gray-300 rounded-md border border-zinc-700 transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about triggers, scoring, candidates, or methodology..."
                className="flex-1 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500"
              />
              <button
                onClick={handleSend}
                className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-black rounded-md transition-colors flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Send</span>
              </button>
            </div>
          </div>

          <div className="px-4 pb-4 text-xs text-gray-500">
            Northstar for raw LLM  | Using gpt-4-mini | Data extends to late 2024  | See
            platform notes you've written
          </div>
        </div>
      </div>

      <div className="mt-6 bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        <h3 className="text-white font-semibold mb-3">Prophecy Intelligence Analyst</h3>
        <p className="text-gray-400 text-sm mb-4">
          I have access to all platform data — triggers, candidates, articles, and scoring stats.
          Ask me anything about the system.
        </p>

        <div className="space-y-2 text-sm">
          <h4 className="text-white font-semibold">CHAT INFO</h4>
          <p className="text-gray-400">
            The analyst has access to all the platform data including:
          </p>
          <ul className="list-disc list-inside text-gray-400 space-y-1 ml-2">
            <li>All prophecy triggers and their scoring keywords</li>
            <li>Recent articles from template bank</li>
            <li>Scoring people and scores</li>
            <li>Scoring methodology training</li>
          </ul>

          <p className="text-gray-400 mt-4">
            It can suggest keyword clusters, identify gaps and trends, provide advice and feedback
            on the grading system.
          </p>
        </div>
      </div>
    </div>
  );
}
