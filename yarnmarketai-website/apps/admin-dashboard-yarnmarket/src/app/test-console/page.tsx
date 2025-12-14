'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Send,
  Loader2,
  MessageSquare,
  Phone,
  Bot,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  Trash2,
  Settings,
  TestTube,
  Play
} from 'lucide-react';
import { toast } from 'sonner';
import { merchantsApi, testConsoleApi } from '@/lib/api';
import { Merchant, Message } from '@/types';

interface TestMessage {
  id: string;
  content: string;
  type: 'user' | 'ai';
  timestamp: Date;
  status: 'sending' | 'sent' | 'error';
  processing_time?: number;
  ai_response?: string;
}

interface TestScenario {
  id: string;
  name: string;
  description: string;
  messages: string[];
}

const defaultScenarios: TestScenario[] = [
  {
    id: 'greeting',
    name: 'Basic Greeting',
    description: 'Test basic greeting and response',
    messages: ['Hello', 'How are you doing?']
  },
  {
    id: 'pidgin_inquiry',
    name: 'Pidgin Product Inquiry',
    description: 'Test product inquiry in Nigerian Pidgin',
    messages: ['Wetin you dey sell?', 'How much dis phone cost?']
  },
  {
    id: 'price_negotiation',
    name: 'Price Negotiation',
    description: 'Test price negotiation flow',
    messages: [
      'I wan buy iPhone 13',
      'How much?',
      'Too much o! Wetin be your last price?',
      'I fit do ₦200,000'
    ]
  },
  {
    id: 'customer_service',
    name: 'Customer Service',
    description: 'Test customer service scenarios',
    messages: [
      'I bought phone yesterday but e no dey work',
      'The screen black and e no dey come on',
      'Wetin I fit do?'
    ]
  }
];

const MessageBubble: React.FC<{ message: TestMessage }> = ({ message }) => {
  const isUser = message.type === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[70%] ${isUser ? 'order-2' : 'order-1'}`}>
        <div
          className={`rounded-lg p-3 ${
            isUser
              ? 'bg-green-600 text-white'
              : 'bg-slate-700 text-slate-100'
          }`}
        >
          <p className="text-sm">{message.content}</p>
          {message.ai_response && (
            <p className="text-sm mt-2 pt-2 border-t border-opacity-20">
              {message.ai_response}
            </p>
          )}
        </div>
        
        <div className={`flex items-center mt-1 text-xs text-slate-400 ${
          isUser ? 'justify-end' : 'justify-start'
        }`}>
          <div className="flex items-center space-x-2">
            {isUser ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
            <span>{message.timestamp.toLocaleTimeString()}</span>
            
            {message.status === 'sending' && (
              <Loader2 className="h-3 w-3 animate-spin" />
            )}
            {message.status === 'sent' && (
              <CheckCircle className="h-3 w-3 text-green-500" />
            )}
            {message.status === 'error' && (
              <AlertCircle className="h-3 w-3 text-red-500" />
            )}
            
            {message.processing_time && (
              <span className="text-slate-500">
                ({message.processing_time.toFixed(2)}s)
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ScenarioCard: React.FC<{
  scenario: TestScenario;
  onRun: (scenario: TestScenario) => void;
  isRunning: boolean;
}> = ({ scenario, onRun, isRunning }) => {
  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-white font-medium">{scenario.name}</h3>
          <p className="text-slate-400 text-sm mt-1">{scenario.description}</p>
        </div>
        <button
          onClick={() => onRun(scenario)}
          disabled={isRunning}
          className="inline-flex items-center px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRunning ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Play className="h-4 w-4 mr-2" />
          )}
          Run
        </button>
      </div>
      
      <div className="space-y-2">
        <div className="text-xs text-slate-500">
          {scenario.messages.length} messages:
        </div>
        <div className="space-y-1">
          {scenario.messages.map((msg, idx) => (
            <div key={idx} className="text-xs bg-slate-700/50 rounded p-2">
              {msg}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function TestConsolePage() {
  const [selectedMerchant, setSelectedMerchant] = useState<string>('');
  const [testMessages, setTestMessages] = useState<TestMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [testPhone, setTestPhone] = useState('+234909876543');
  const [isRunningScenario, setIsRunningScenario] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: merchants } = useQuery({
    queryKey: ['merchants'],
    queryFn: merchantsApi.getAll,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (data: { merchant_id: string; message: string; from_phone: string }) => {
      const response = await testConsoleApi.sendMessage(data);
      return response;
    },
    onSuccess: (response, variables) => {
      // Update the message status to sent and add AI response
      setTestMessages(prev =>
        prev.map(msg =>
          msg.id === response.message_id
            ? {
                ...msg,
                status: 'sent',
                processing_time: response.processing_time,
                ai_response: response.ai_response
              }
            : msg
        )
      );
    },
    onError: (error: any, variables) => {
      console.error('Failed to send message:', error);
      // Update message status to error
      const messageId = `temp_${Date.now()}`;
      setTestMessages(prev =>
        prev.map(msg =>
          msg.content === variables.message && msg.status === 'sending'
            ? { ...msg, status: 'error' }
            : msg
        )
      );
    },
  });

  const runScenarioMutation = useMutation({
    mutationFn: async (data: { merchant_id: string; scenario: TestScenario; from_phone: string }) => {
      const results = [];
      for (const message of data.scenario.messages) {
        const response = await testConsoleApi.sendMessage({
          merchant_id: data.merchant_id,
          message,
          from_phone: data.from_phone
        });
        results.push({ message, response });
        // Add delay between messages
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
      return results;
    },
    onMutate: (variables) => {
      setIsRunningScenario(true);
      // Add all scenario messages to the chat
      const newMessages = variables.scenario.messages.map((msg, idx) => ({
        id: `scenario_${Date.now()}_${idx}`,
        content: msg,
        type: 'user' as const,
        timestamp: new Date(),
        status: 'sending' as const,
      }));
      setTestMessages(prev => [...prev, ...newMessages]);
    },
    onSuccess: (results) => {
      // Update all messages with responses
      results.forEach(({ message, response }, idx) => {
        setTimeout(() => {
          setTestMessages(prev =>
            prev.map(msg =>
              msg.content === message && msg.status === 'sending'
                ? {
                    ...msg,
                    status: 'sent',
                    processing_time: response.processing_time,
                    ai_response: response.ai_response
                  }
                : msg
            )
          );
        }, idx * 100); // Stagger the updates
      });
    },
    onSettled: () => {
      setIsRunningScenario(false);
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [testMessages]);

  const handleSendMessage = () => {
    if (!currentMessage.trim() || !selectedMerchant) {
      toast.error('Please select a merchant and enter a message');
      return;
    }

    const newMessage: TestMessage = {
      id: `msg_${Date.now()}`,
      content: currentMessage,
      type: 'user',
      timestamp: new Date(),
      status: 'sending',
    };

    setTestMessages(prev => [...prev, newMessage]);
    
    sendMessageMutation.mutate({
      merchant_id: selectedMerchant,
      message: currentMessage,
      from_phone: testPhone,
    });

    setCurrentMessage('');
  };

  const handleRunScenario = (scenario: TestScenario) => {
    if (!selectedMerchant) {
      toast.error('Please select a merchant first');
      return;
    }

    runScenarioMutation.mutate({
      merchant_id: selectedMerchant,
      scenario,
      from_phone: testPhone,
    });
  };

  const clearMessages = () => {
    setTestMessages([]);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Test Console</h1>
          <p className="text-slate-400">Test conversations with AI merchants</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Interface */}
        <div className="lg:col-span-2 space-y-6">
          {/* Configuration */}
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
            <h2 className="text-lg font-semibold text-white mb-4">Configuration</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Select Merchant
                </label>
                <select
                  value={selectedMerchant}
                  onChange={(e) => setSelectedMerchant(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Choose a merchant...</option>
                  {merchants?.map((merchant) => (
                    <option key={merchant.id} value={merchant.id}>
                      {merchant.business_name} ({merchant.phone_number})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Test Phone Number
                </label>
                <input
                  type="text"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="+234..."
                />
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="bg-slate-800 rounded-lg border border-slate-700 flex flex-col h-96">
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <h2 className="text-lg font-semibold text-white">Conversation</h2>
              <button
                onClick={clearMessages}
                className="text-slate-400 hover:text-white p-2 rounded-md hover:bg-slate-700"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              {testMessages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-500">No messages yet</p>
                  <p className="text-slate-600 text-sm">Send a message or run a scenario to start testing</p>
                </div>
              ) : (
                testMessages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-slate-700">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!currentMessage.trim() || !selectedMerchant || sendMessageMutation.isPending}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendMessageMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Test Scenarios */}
        <div className="space-y-6">
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
              <TestTube className="h-5 w-5 mr-2" />
              Test Scenarios
            </h2>
            <p className="text-slate-400 text-sm mb-4">
              Run predefined test scenarios to validate conversation flows
            </p>
            
            <div className="space-y-4">
              {defaultScenarios.map((scenario) => (
                <ScenarioCard
                  key={scenario.id}
                  scenario={scenario}
                  onRun={handleRunScenario}
                  isRunning={isRunningScenario}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
