"use client";

import { useRouter } from "next/navigation";
import { Shield, CreditCard, DollarSign, Calculator } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/Common";

export function QuickTools() {
  const router = useRouter();

  const tools = [
    {
      id: "emergency-fund",
      name: "Emergency Fund",
      icon: Shield,
      description: "Calculate your emergency fund goal",
      color: "bg-blue-50 text-blue-600 hover:bg-blue-100",
    },
    {
      id: "credit-health",
      name: "Credit Health",
      icon: CreditCard,
      description: "Check your credit utilization",
      color: "bg-purple-50 text-purple-600 hover:bg-purple-100",
    },
    {
      id: "subscription-audit",
      name: "Subscription Audit",
      icon: DollarSign,
      description: "Find subscription savings",
      color: "bg-green-50 text-green-600 hover:bg-green-100",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Financial Tools
          </CardTitle>
          <button
            onClick={() => router.push("/dashboard/tools")}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View All
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => router.push("/dashboard/tools")}
              className={`p-4 rounded-lg transition-all text-left ${tool.color}`}
            >
              <tool.icon className="h-6 w-6 mb-2" />
              <h3 className="font-semibold text-sm mb-1">{tool.name}</h3>
              <p className="text-xs opacity-75">{tool.description}</p>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
