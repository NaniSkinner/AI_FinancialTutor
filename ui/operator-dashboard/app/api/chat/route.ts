import { NextRequest, NextResponse } from "next/server";
import { mockUserSignals, getMockDashboardData } from "@/lib/mockData";

// Environment configuration
const USE_CHAT_AI = process.env.NEXT_PUBLIC_USE_CHAT_AI === "true";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

interface ChatRequest {
  userId: string;
  message: string;
  persona?: string;
}

interface ChatResponse {
  response: string;
  sources?: string[];
}

const DISCLAIMER_TEXT =
  "This is educational information, not financial advice.";

/**
 * POST /api/chat
 * Handles chat messages and returns responses
 */
export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { userId, message, persona } = body;

    // Validate request
    if (!userId || !message) {
      return NextResponse.json(
        { error: "Missing required fields: userId and message" },
        { status: 400 }
      );
    }

    if (message.trim().length === 0 || message.length > 1000) {
      return NextResponse.json(
        { error: "Message must be between 1 and 1000 characters" },
        { status: 400 }
      );
    }

    // Route to AI or keyword-based response
    let response: ChatResponse;

    if (USE_CHAT_AI && OPENAI_API_KEY) {
      // AI-powered response with user context
      response = await getAIResponse(userId, message, persona);
    } else {
      // Keyword-based mock response
      response = getKeywordResponse(userId, message, persona);
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Generate AI-powered response using OpenAI
 */
async function getAIResponse(
  userId: string,
  message: string,
  persona?: string
): Promise<ChatResponse> {
  // Get user context from mock data
  const userSignals = mockUserSignals[userId];
  const userDashboardData = getMockDashboardData(userId);
  const userContext = userSignals || userDashboardData.signals;

  // Build context string for the AI
  const contextString = `
User Persona: ${persona || userContext.persona_30d.primary}
Credit Utilization: ${userContext.signals.credit.aggregate_utilization_pct}%
Total Credit: $${userContext.signals.credit.total_credit_available}
Subscriptions: ${userContext.signals.subscriptions.recurring_merchant_count} ($${userContext.signals.subscriptions.monthly_recurring_spend}/month)
Savings: $${userContext.signals.savings.total_savings_balance} (${userContext.signals.savings.emergency_fund_months} months emergency fund)
Income Type: ${userContext.signals.income.income_type}
`.trim();

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are a helpful financial education assistant for SpendSense. Your role is to provide educational information about personal finance, NOT financial advice. 

User's Financial Context:
${contextString}

Guidelines:
- Be empathetic, encouraging, and non-judgmental
- Provide educational information, not specific advice
- Reference the user's actual data when relevant
- Keep responses concise (2-3 paragraphs max)
- Always end with: "${DISCLAIMER_TEXT}"
- Never shame or criticize financial behaviors
- Focus on education and understanding, not prescriptive advice`,
          },
          {
            role: "user",
            content: message,
          },
        ],
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || "";

    return {
      response: aiResponse,
      sources: ["ai_generated", "user_context"],
    };
  } catch (error) {
    console.error("OpenAI API error:", error);
    // Fallback to keyword response on error
    return getKeywordResponse(userId, message, persona);
  }
}

/**
 * Generate keyword-based response (mock data mode)
 */
function getKeywordResponse(
  userId: string,
  message: string,
  persona?: string
): ChatResponse {
  const lowerMessage = message.toLowerCase();

  // Get user data if available
  const userSignals = mockUserSignals[userId];
  const userDashboardData = getMockDashboardData(userId);

  // Credit utilization questions
  if (
    lowerMessage.includes("utilization") ||
    lowerMessage.includes("credit") ||
    lowerMessage.includes("credit score")
  ) {
    const utilization =
      userSignals?.signals.credit.aggregate_utilization_pct ||
      userDashboardData.signals.signals.credit.aggregate_utilization_pct ||
      68;
    const creditUsed =
      userSignals?.signals.credit.total_credit_used ||
      userDashboardData.signals.signals.credit.total_credit_used ||
      5500;
    const creditAvailable =
      userSignals?.signals.credit.total_credit_available ||
      userDashboardData.signals.signals.credit.total_credit_available ||
      8000;

    return {
      response: `Credit utilization is the percentage of your available credit that you're using. Your current utilization is ${utilization}% ($${creditUsed.toLocaleString()} of $${creditAvailable.toLocaleString()} limit). Financial experts generally recommend keeping utilization below 30%, as high utilization can impact your credit score. Lower utilization shows lenders that you're not overly dependent on credit. ${DISCLAIMER_TEXT}`,
      sources: ["credit_signals", "recommendation_credit_101"],
    };
  }

  // Subscription questions
  if (
    lowerMessage.includes("subscription") ||
    lowerMessage.includes("save money") ||
    lowerMessage.includes("recurring")
  ) {
    const subscriptionCount =
      userSignals?.signals.subscriptions.recurring_merchant_count ||
      userDashboardData.signals.signals.subscriptions
        .recurring_merchant_count ||
      5;
    const subscriptionSpend =
      userSignals?.signals.subscriptions.monthly_recurring_spend ||
      userDashboardData.signals.signals.subscriptions.monthly_recurring_spend ||
      127.5;

    return {
      response: `You have ${subscriptionCount} active subscriptions totaling $${subscriptionSpend.toFixed(2)}/month. To optimize: 1) Review which ones you actively use each month, 2) Check if you can downgrade any premium plans, 3) Look for annual payment discounts (often 10-20% savings), 4) Cancel duplicates (like multiple streaming services). Many people find they can save 20-30% by auditing subscriptions quarterly. ${DISCLAIMER_TEXT}`,
      sources: ["subscription_signals"],
    };
  }

  // Savings and emergency fund questions
  if (
    lowerMessage.includes("savings") ||
    lowerMessage.includes("emergency fund") ||
    lowerMessage.includes("save")
  ) {
    const savingsBalance =
      userSignals?.signals.savings.total_savings_balance ||
      userDashboardData.signals.signals.savings.total_savings_balance ||
      5250;
    const emergencyMonths =
      userSignals?.signals.savings.emergency_fund_months ||
      userDashboardData.signals.signals.savings.emergency_fund_months ||
      2.1;
    const growthRate =
      userSignals?.signals.savings.savings_growth_rate_pct ||
      userDashboardData.signals.signals.savings.savings_growth_rate_pct ||
      3.2;

    return {
      response: `You currently have $${savingsBalance.toLocaleString()} in savings, which provides about ${emergencyMonths.toFixed(1)} months of emergency coverage. Financial experts often recommend 3-6 months of expenses for an emergency fund. Your savings are growing at ${growthRate.toFixed(1)}% - ${growthRate > 5 ? "that's great progress!" : "consider setting up automatic transfers to accelerate growth."} ${DISCLAIMER_TEXT}`,
      sources: ["savings_signals"],
    };
  }

  // Interest charges
  if (
    lowerMessage.includes("interest") ||
    lowerMessage.includes("charges") ||
    lowerMessage.includes("apr")
  ) {
    const hasInterest =
      userSignals?.signals.credit.any_interest_charges ||
      userDashboardData.signals.signals.credit.any_interest_charges;

    if (hasInterest) {
      return {
        response: `You're currently paying interest charges on your credit cards. Interest on credit cards typically compounds daily, which can significantly increase the total amount you pay over time. Strategies to reduce interest: 1) Pay more than the minimum payment, 2) Focus on paying down high-interest cards first, 3) Consider a balance transfer to a 0% APR card if eligible. Even small extra payments can make a big difference over time. ${DISCLAIMER_TEXT}`,
        sources: ["credit_signals", "interest_education"],
      };
    } else {
      return {
        response: `Great news! You're not currently paying interest charges, which means you're paying your balance in full each month. This is an excellent habit that saves you money and helps build good credit. Keep it up! ${DISCLAIMER_TEXT}`,
        sources: ["credit_signals"],
      };
    }
  }

  // Variable income / budgeting
  if (
    lowerMessage.includes("budget") ||
    lowerMessage.includes("irregular income") ||
    lowerMessage.includes("variable income") ||
    lowerMessage.includes("freelance")
  ) {
    const incomeType =
      userSignals?.signals.income.income_type ||
      userDashboardData.signals.signals.income.income_type;
    const cashBuffer =
      userSignals?.signals.income.cash_flow_buffer_months ||
      userDashboardData.signals.signals.income.cash_flow_buffer_months ||
      0.8;

    if (incomeType === "variable" || incomeType === "irregular") {
      return {
        response: `With variable income, budgeting requires a different approach. Your current cash flow buffer is ${cashBuffer.toFixed(1)} months. Strategies: 1) Budget based on your lowest monthly income, 2) Build a larger emergency fund (aim for 6-9 months vs 3-6), 3) Track income patterns to spot trends, 4) Set aside extra during high-income months for leaner periods. ${DISCLAIMER_TEXT}`,
        sources: ["income_signals", "variable_income_guide"],
      };
    } else {
      return {
        response: `With steady income, you can create a consistent monthly budget. Your current cash flow buffer is ${cashBuffer.toFixed(1)} months. Basic budgeting steps: 1) List all fixed expenses (rent, utilities, subscriptions), 2) Set savings goals (automate if possible), 3) Track discretionary spending, 4) Review and adjust monthly. The 50/30/20 rule (50% needs, 30% wants, 20% savings) is a good starting framework. ${DISCLAIMER_TEXT}`,
        sources: ["income_signals", "budgeting_basics"],
      };
    }
  }

  // Persona-specific questions
  if (persona === "student" && lowerMessage.includes("coffee")) {
    return {
      response: `Coffee shop visits can add up quickly! At $5 per visit, 5 days a week equals about $100/month. Alternatives: 1) Make coffee at home (saves ~80%), 2) Bring a thermos to campus, 3) Limit to 1-2 shop visits per week as a treat, 4) Look for student discounts. Small daily expenses like this are called "latte factors" and cutting them can free up significant money for savings or reducing debt. ${DISCLAIMER_TEXT}`,
      sources: ["student_budgeting"],
    };
  }

  // Default response
  return {
    response: `I can help you understand your financial data! I have access to information about your credit utilization, subscriptions, savings, income patterns, and the recommendations you've received. Try asking specific questions like: "Why is my credit utilization important?", "How can I reduce my subscription costs?", or "How much should I save for emergencies?" ${DISCLAIMER_TEXT}`,
    sources: [],
  };
}
