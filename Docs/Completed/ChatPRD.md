# Chat Interface Specification

**Feature:** Chat/Q&A Interface  
**Priority:** HIGH  
**Estimated Effort:** Week 1-2

---

## Overview

**Purpose:** Allow users to ask follow-up questions about their financial data and recommendations using natural language.

**Component:** Floating chat widget (bottom-right corner)  
**AI Model:** GPT-4 with user context  
**Data Access:** User's signals, persona, and recent recommendations

---

## Component Specification

**Path:** `ui/operator-dashboard/components/Dashboard/ChatWidget.tsx`

```tsx
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export function ChatWidget({ userId }: { userId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, message: input }),
      });

      const data = await response.json();

      const assistantMessage: Message = {
        id: generateId(),
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen && (
        <Button
          size="lg"
          onClick={() => setIsOpen(true)}
          className="rounded-full shadow-lg"
        >
          <MessageCircle className="h-5 w-5 mr-2" />
          Ask a Question
        </Button>
      )}

      {isOpen && (
        <Card className="w-96 h-[500px] flex flex-col shadow-2xl">
          <CardHeader className="flex flex-row items-center justify-between border-b">
            <div>
              <CardTitle>Financial Q&A</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Ask about your finances
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Ask me anything about your finances!</p>
                <div className="mt-4 space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setInput("Why is my credit utilization important?")
                    }
                    className="w-full text-xs"
                  >
                    Why is my credit utilization important?
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setInput("How can I reduce my subscription costs?")
                    }
                    className="w-full text-xs"
                  >
                    How can I reduce subscription costs?
                  </Button>
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {format(message.timestamp, "HH:mm")}
                  </p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg p-3">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="border-t p-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="flex gap-2 w-full"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your question..."
                disabled={isLoading}
              />
              <Button
                type="submit"
                size="icon"
                disabled={isLoading || !input.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
            <p className="text-xs text-muted-foreground mt-2 text-center w-full">
              Educational information, not financial advice
            </p>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
```

---

## API Endpoint

```tsx
// POST /api/chat
interface ChatRequest {
  userId: string;
  message: string;
}

interface ChatResponse {
  response: string;
  sources?: string[]; // Which signals/recommendations were referenced
}
```

---

## Mock Implementation

**Path:** `ui/operator-dashboard/lib/api.ts`

```tsx
export async function sendChatMessage(
  userId: string,
  message: string
): Promise<ChatResponse> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
    return getMockChatResponse(message);
  }

  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, message }),
  });
  return response.json();
}

function getMockChatResponse(message: string): ChatResponse {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("utilization") || lowerMessage.includes("credit")) {
    return {
      response:
        "Credit utilization is the percentage of your available credit that you're using. Your Visa card is currently at 68% utilization ($3,400 of $5,000 limit). Lenders prefer to see utilization below 30%, as high utilization can impact your credit score. This is educational information, not financial advice.",
      sources: ["credit_signals", "recommendation_credit_101"],
    };
  }

  if (
    lowerMessage.includes("subscription") ||
    lowerMessage.includes("save money")
  ) {
    return {
      response:
        "Your 5 subscriptions total $127.50/month. To optimize: 1) Review which ones you actively use, 2) Check if you can downgrade any plans, 3) Look for annual payment discounts. Many people find 20-30% savings by auditing subscriptions quarterly. This is educational information, not financial advice.",
      sources: ["subscription_signals"],
    };
  }

  if (
    lowerMessage.includes("savings") ||
    lowerMessage.includes("emergency fund")
  ) {
    return {
      response:
        "You currently have $5,250 in savings, which provides about 0.8 months of emergency coverage based on your expenses. Financial experts often recommend 3-6 months of expenses for an emergency fund. Your savings are growing at 3.2% - that's great progress! This is educational information, not financial advice.",
      sources: ["savings_signals"],
    };
  }

  return {
    response:
      "I can help you understand your financial data and the recommendations you receive. Try asking about your credit utilization, subscriptions, savings, or any specific recommendation. This is educational information, not financial advice.",
    sources: [],
  };
}
```

---

## Suggested Questions

Pre-populate with context-aware suggested questions:

```tsx
const suggestedQuestions = {
  high_utilization: [
    "Why is my credit utilization important?",
    "How can I lower my credit utilization?",
    "Will paying down my balance help my credit score?",
  ],
  student: [
    "How can I reduce my coffee spending?",
    "What's a realistic budget for a student?",
    "How do I start building savings?",
  ],
  subscription_heavy: [
    "How can I reduce my subscription costs?",
    "Which subscriptions should I cancel?",
    "Are there cheaper alternatives to my current subscriptions?",
  ],
  savings_builder: [
    "How much should I have in emergency savings?",
    "What's the best way to automate savings?",
    "How do I accelerate my savings growth?",
  ],
  variable_income_budgeter: [
    "How do I budget with irregular income?",
    "How much buffer should I have?",
    "What's the best approach to saving with variable income?",
  ],
};
```

---

## Integration Points

1. **Dashboard Integration**: Render ChatWidget at bottom-right of dashboard
2. **Context Awareness**: Chat has access to user's persona, signals, and recommendations
3. **Disclaimer**: Always include "This is educational information, not financial advice"
4. **Analytics**: Track which questions users ask most frequently
