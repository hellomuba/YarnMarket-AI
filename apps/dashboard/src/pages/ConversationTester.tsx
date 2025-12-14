import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Mic,
  Image,
  Play,
  Brain,
  Zap,
  MessageCircle,
  Upload,
  TestTube,
  Activity
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Merchant } from '../types';

interface ConversationTesterProps {
  selectedMerchant: Merchant | null;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  type?: 'text' | 'image' | 'voice';
  metadata?: any;
  ragDebug?: {
    query: string;
    matches: number;
    processingTime: number;
    confidence: number;
  };
}

interface TestScenario {
  id: string;
  name: string;
  description: string;
  steps: Array<{
    input: string;
    expected?: string;
    type: 'text' | 'image';
  }>;
}

const testScenarios: TestScenario[] = [
  {
    id: 'basic-greeting',
    name: 'Basic Greeting Flow',
    description: 'Test greeting and product inquiry',
    steps: [
      { input: 'Good morning!', type: 'text' },
      { input: 'Wetin you dey sell?', type: 'text' }
    ]
  },
  {
    id: 'pidgin-negotiation',
    name: 'Pidgin Negotiation',
    description: 'Test price negotiation in Nigerian Pidgin',
    steps: [
      { input: 'I wan buy iPhone 14', type: 'text' },
      { input: '₦500,000 too much o! I fit do ₦400,000', type: 'text' }
    ]
  },
  {
    id: 'image-search',
    name: 'Image Product Search',
    description: 'Test image upload and product matching',
    steps: [
      { input: 'I dey find this shoe', type: 'image' }
    ]
  }
];

export const ConversationTester: React.FC<ConversationTesterProps> = ({
  selectedMerchant
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<TestScenario | null>(null);
  const [runningScenario, setRunningScenario] = useState(false);
  const [ragEnabled, setRagEnabled] = useState(true);
  const [debugMode, setDebugMode] = useState(true);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (text: string, type: 'text' | 'image' = 'text') => {
    if (!text.trim() && !uploadedImage) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date(),
      type
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Simulate API call to conversation engine
      setTimeout(() => {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: generateMockResponse(text, type),
          sender: 'ai',
          timestamp: new Date(),
          ragDebug: ragEnabled ? {
            query: text,
            matches: Math.floor(Math.random() * 5) + 1,
            processingTime: Math.floor(Math.random() * 200) + 100,
            confidence: Math.random() * 0.4 + 0.6
          } : undefined
        };

        setMessages(prev => [...prev, aiResponse]);
        setIsLoading(false);
      }, 1000 + Math.random() * 1000);
    } catch (error) {
      console.error('Failed to send message:', error);
      setIsLoading(false);
    }

    setInputText('');
    setUploadedImage(null);
  };

  const generateMockResponse = (_input: string, _type: string): string => {
    const responses = [
      "Oya customer! Welcome to my shop o! 🤝 I get everything wey you need for good price. Wetin you wan buy today?",
      "Chai! You get good taste o! 😍 This product na hot cake for market now. Na quality thing be this!",
      "Boss, make we talk business! This price na my final price o, but since you be good customer, I fit give you small discount. 💪",
      "I understand wetin you dey find! Let me show you something wey go sweet you pass that one. Check this one! 🔥"
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const runTestScenario = async (scenario: TestScenario) => {
    setSelectedScenario(scenario);
    setRunningScenario(true);
    setMessages([]);

    for (const step of scenario.steps) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      await sendMessage(step.input, step.type);
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    setRunningScenario(false);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedImage(file);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl shadow-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gradient">Conversation Tester</h1>
              <p className="text-sm text-slate-400">Test YarnMarket AI conversations with RAG enhancement</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <motion.div 
            className="flex items-center gap-2 glass px-4 py-2 rounded-lg"
            whileHover={{ scale: 1.02 }}
          >
            <Zap className={`w-4 h-4 ${ragEnabled ? 'text-green-400' : 'text-slate-500'}`} />
            <span className="text-sm">RAG</span>
            <button
              onClick={() => setRagEnabled(!ragEnabled)}
              className={`w-8 h-4 rounded-full transition-colors ${ragEnabled ? 'bg-green-500' : 'bg-slate-600'}`}
              data-testid="rag-toggle"
            >
              <div className={`w-3 h-3 rounded-full bg-white transition-transform ${ragEnabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </button>
          </motion.div>

          <motion.div 
            className="flex items-center gap-2 glass px-4 py-2 rounded-lg"
            whileHover={{ scale: 1.02 }}
          >
            <TestTube className={`w-4 h-4 ${debugMode ? 'text-blue-400' : 'text-slate-500'}`} />
            <span className="text-sm">Debug</span>
            <button
              onClick={() => setDebugMode(!debugMode)}
              className={`w-8 h-4 rounded-full transition-colors ${debugMode ? 'bg-blue-500' : 'bg-slate-600'}`}
              data-testid="debug-toggle"
            >
              <div className={`w-3 h-3 rounded-full bg-white transition-transform ${debugMode ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </button>
          </motion.div>
        </div>
      </div>

      <div className="flex-1 flex gap-6 p-6">
        {/* Test Scenarios Panel */}
        <Card className="w-80">
          <CardHeader>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <TestTube className="w-5 h-5 text-blue-400" />
              Test Scenarios
            </h3>
          </CardHeader>
          <CardContent className="space-y-3">
            {testScenarios.map((scenario) => (
              <motion.div
                key={scenario.id}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  selectedScenario?.id === scenario.id
                    ? 'border-blue-500/50 bg-blue-500/10'
                    : 'border-slate-700/50 hover:border-slate-600/50 hover:bg-slate-800/30'
                }`}
                onClick={() => setSelectedScenario(scenario)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <h4 className="font-medium text-sm">{scenario.name}</h4>
                <p className="text-xs text-slate-400 mt-1">{scenario.description}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-slate-500">{scenario.steps.length} steps</span>
                  <Button
                    size="sm"
                    variant="primary"
                    loading={runningScenario && selectedScenario?.id === scenario.id}
                    onClick={() => runTestScenario(scenario)}
                    icon={<Play className="w-3 h-3" />}
                  >
                    Run
                  </Button>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>

        {/* Chat Interface */}
        <Card className="flex-1 flex flex-col">
          <CardHeader className="border-b border-slate-700/50">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-green-400" />
                Conversation
              </h3>
              {selectedMerchant && (
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  {selectedMerchant.business_name}
                </div>
              )}
            </div>
          </CardHeader>
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs lg:max-w-md space-y-2`}>
                    <div
                      className={`px-4 py-3 rounded-2xl ${
                        message.sender === 'user'
                          ? 'bg-blue-600 text-white rounded-br-sm'
                          : 'glass text-slate-100 rounded-bl-sm'
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>

                    {/* RAG Debug Info */}
                    {debugMode && message.ragDebug && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="text-xs glass-dark rounded-lg p-3 font-mono"
                      >
                        <div className="flex items-center gap-2 text-yellow-400 mb-2">
                          <Activity className="w-3 h-3" />
                          RAG Debug
                        </div>
                        <div className="space-y-1 text-slate-300">
                          <div>Query: <span className="text-white">{message.ragDebug.query}</span></div>
                          <div>Matches: <span className="text-white">{message.ragDebug.matches}</span></div>
                          <div>Time: <span className="text-white">{message.ragDebug.processingTime}ms</span></div>
                          <div>Confidence: <span className="text-white">{(message.ragDebug.confidence * 100).toFixed(1)}%</span></div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="glass rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-slate-700/50 p-6">
            {uploadedImage && (
              <div className="mb-4 flex items-center gap-2 text-sm text-slate-400">
                <Image className="w-4 h-4" />
                <span>{uploadedImage.name}</span>
                <button
                  onClick={() => setUploadedImage(null)}
                  className="text-red-400 hover:text-red-300 ml-auto"
                >
                  Remove
                </button>
              </div>
            )}

            <div className="flex items-end gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type a message in any Nigerian language..."
                    className="flex-1 input-field"
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage(inputText)}
                    data-testid="message-input"
                  />
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    icon={<Upload className="w-4 h-4" />}
                  >
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsRecording(!isRecording)}
                    icon={<Mic className={`w-4 h-4 ${isRecording ? 'text-red-400' : ''}`} />}
                  >
                  </Button>
                </div>
              </div>

              <Button
                onClick={() => sendMessage(inputText)}
                disabled={isLoading || (!inputText.trim() && !uploadedImage)}
                icon={<Send className="w-4 h-4" />}
                data-testid="send-button"
              >
                Send
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
