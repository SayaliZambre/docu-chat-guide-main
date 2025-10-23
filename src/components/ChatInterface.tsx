import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2 } from "lucide-react";
import { ChatMessage } from "@/components/ChatMessage";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
  citations?: number[];
}

interface ChatInterfaceProps {
  pdfFile: File;
  onCitationClick: (page: number) => void;
}

export const ChatInterface = ({ pdfFile, onCitationClick }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Convert PDF to base64 for sending to edge function
      const reader = new FileReader();
      reader.readAsDataURL(pdfFile);
      
      reader.onload = async () => {
        const base64 = reader.result as string;
        
        const { data, error } = await supabase.functions.invoke("chat-with-pdf", {
          body: {
            question: input,
            pdfBase64: base64,
            conversationHistory: messages,
          },
        });

        if (error) throw error;

        const assistantMessage: Message = {
          role: "assistant",
          content: data.answer,
          citations: data.citations || [],
        };

        setMessages((prev) => [...prev, assistantMessage]);
      };
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to get response. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-card rounded-xl border border-border shadow-lg overflow-hidden animate-fade-in">
      <div className="p-4 border-b border-border bg-gradient-primary">
        <h2 className="text-lg font-semibold text-primary-foreground">Ask questions about your document</h2>
        <p className="text-sm text-primary-foreground/80">
          Get instant answers with page citations
        </p>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-center">
            <div className="space-y-2">
              <p className="text-muted-foreground">Start a conversation</p>
              <p className="text-sm text-muted-foreground">
                Ask anything about your document
              </p>
            </div>
          </div>
        )}
        {messages.map((message, index) => (
          <ChatMessage
            key={index}
            message={message}
            onCitationClick={onCitationClick}
          />
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-border bg-secondary/30">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || !input.trim()} size="icon">
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
