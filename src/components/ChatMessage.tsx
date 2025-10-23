import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  citations?: number[];
}

interface ChatMessageProps {
  message: Message;
  onCitationClick: (page: number) => void;
}

export const ChatMessage = ({ message, onCitationClick }: ChatMessageProps) => {
  return (
    <div
      className={`flex ${
        message.role === "user" ? "justify-end" : "justify-start"
      } animate-fade-in`}
    >
      <div
        className={`max-w-[80%] rounded-xl p-4 ${
          message.role === "user"
            ? "bg-gradient-primary text-primary-foreground shadow-elegant"
            : "bg-secondary text-secondary-foreground"
        }`}
      >
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        {message.citations && message.citations.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-border/50">
            {message.citations.map((page) => (
              <Button
                key={page}
                variant="outline"
                size="sm"
                onClick={() => onCitationClick(page)}
                className="bg-accent/10 hover:bg-accent hover:text-accent-foreground transition-all shadow-sm"
              >
                <FileText className="w-3 h-3 mr-1" />
                Page {page}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
