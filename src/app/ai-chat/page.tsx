// src/app/ai-chat/page.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Loader2, Volume2, Bot, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/context/auth-context';
import { generateChatResponse } from '@/ai/flows/chat-flow';
import { textToSpeech } from '@/ai/flows/tts-flow';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export default function AiChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [audioLoadingFor, setAudioLoadingFor] = useState<number | null>(null);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

  const { user, userData } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
   useEffect(() => {
    // Stop any playing audio when the component unmounts
    return () => {
      if (currentAudio) {
        currentAudio.pause();
        setCurrentAudio(null);
      }
    };
  }, [currentAudio]);

  const handleSendMessage = async () => {
    if (input.trim() === '' || isLoading) return;

    const newMessages: Message[] = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await generateChatResponse(input);
      setMessages([...newMessages, { role: 'assistant', content: response }]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      setMessages([
        ...newMessages,
        { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReadAloud = async (text: string, index: number) => {
    if (audioLoadingFor !== null) return; // Prevent multiple requests

    if (currentAudio) {
        currentAudio.pause();
        setCurrentAudio(null);
    }

    setAudioLoadingFor(index);
    try {
      const audioData = await textToSpeech(text);
      if (audioData.media) {
        const audio = new Audio(audioData.media);
        setCurrentAudio(audio);
        audio.play();
        audio.onended = () => setCurrentAudio(null);
      }
    } catch (error) {
      console.error('Error generating speech:', error);
    } finally {
      setAudioLoadingFor(null);
    }
  };


  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <Card className="h-[calc(100vh-8rem)] flex flex-col">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-3xl font-bold tracking-tight">AI Assistant</CardTitle>
          <CardDescription>Ask me anything! I can help you with ideas, code, and more.</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-6">
            {messages.length === 0 && (
                <div className="text-center text-muted-foreground pt-16">
                    <Bot size={48} className="mx-auto" />
                    <p className="mt-4">Start a conversation by typing below.</p>
                </div>
            )}
            {messages.map((message, index) => (
            <div key={index} className={`flex items-start gap-4 ${message.role === 'user' ? 'justify-end' : ''}`}>
              {message.role === 'assistant' && (
                <Avatar className="h-9 w-9 border">
                    <AvatarImage src="/icon-192x192.png" />
                    <AvatarFallback>AI</AvatarFallback>
                </Avatar>
              )}
              <div className={`max-w-md rounded-lg px-4 py-3 ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                <p className="whitespace-pre-wrap">{message.content}</p>
                {message.role === 'assistant' && (
                  <div className="mt-2 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleReadAloud(message.content, index)}
                      disabled={audioLoadingFor !== null}
                    >
                      {audioLoadingFor === index ? <Loader2 className="animate-spin" /> : <Volume2 />}
                    </Button>
                  </div>
                )}
              </div>
              {message.role === 'user' && (
                <Avatar className="h-9 w-9 border">
                    <AvatarImage src={userData?.avatarUrl} />
                    <AvatarFallback>
                        <User/>
                    </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
           <div ref={messagesEndRef} />
        </CardContent>
        <div className="border-t p-4">
          <div className="flex items-center gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button onClick={handleSendMessage} disabled={isLoading || input.trim() === ''}>
              {isLoading ? <Loader2 className="animate-spin" /> : <Send />}
              <span className="sr-only">Send</span>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
