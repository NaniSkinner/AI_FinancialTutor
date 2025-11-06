"use client";

import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Input,
  Label,
  Progress,
  Alert,
  AlertDescription,
  Button,
} from "@/components/Common";
import { Plus, Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import type { CreditCard, CreditUtilizationCalculatorProps } from "./types";
import { formatCurrency, calculateUtilization } from "./utils";

export function CreditUtilizationCalculator({
  initialCards = [],
}: CreditUtilizationCalculatorProps) {
  const [cards, setCards] = useState<CreditCard[]>(
    initialCards.length > 0 ? initialCards : [{ balance: 0, limit: 0 }]
  );

  const totalBalance = cards.reduce((sum, card) => sum + card.balance, 0);
  const totalLimit = cards.reduce((sum, card) => sum + card.limit, 0);
  const utilization = calculateUtilization(totalBalance, totalLimit);

  const addCard = () => {
    setCards([...cards, { balance: 0, limit: 0 }]);
  };

  const removeCard = (index: number) => {
    if (cards.length > 1) {
      setCards(cards.filter((_, i) => i !== index));
    }
  };

  const updateCard = (
    index: number,
    field: "balance" | "limit",
    value: number
  ) => {
    const newCards = [...cards];
    newCards[index][field] = Math.max(0, value);
    setCards(newCards);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl sm:text-2xl">
          Credit Utilization Calculator
        </CardTitle>
        <CardDescription>
          See how your credit card balances affect your utilization ratio
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 sm:space-y-6">
        {/* Cards Input */}
        <div className="space-y-4">
          {cards.map((card, index) => (
            <div
              key={index}
              className="flex gap-4 items-center p-4 border border-gray-200 rounded-lg"
            >
              <div className="flex-1 space-y-2">
                <Label className="text-xs">Balance</Label>
                <Input
                  type="number"
                  placeholder="Balance"
                  value={card.balance}
                  onChange={(e) =>
                    updateCard(index, "balance", Number(e.target.value))
                  }
                  min="0"
                />
              </div>
              <div className="flex-1 space-y-2">
                <Label className="text-xs">Limit</Label>
                <Input
                  type="number"
                  placeholder="Limit"
                  value={card.limit}
                  onChange={(e) =>
                    updateCard(index, "limit", Number(e.target.value))
                  }
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Util.</Label>
                <div className="text-sm font-medium">
                  {card.limit > 0
                    ? calculateUtilization(card.balance, card.limit).toFixed(0)
                    : 0}
                  %
                </div>
              </div>
              {cards.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCard(index)}
                  className="self-end"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}

          <Button variant="outline" onClick={addCard} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Another Card
          </Button>
        </div>

        {/* Results */}
        <div className="space-y-4 p-6 bg-linear-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-gray-200">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">
              Overall Credit Utilization
            </p>
            <p className="text-5xl font-bold">{utilization.toFixed(1)}%</p>
            <p className="text-sm text-gray-600 mt-2">
              ${formatCurrency(totalBalance)} of ${formatCurrency(totalLimit)}
            </p>
          </div>

          <div className="space-y-2">
            <Progress
              value={utilization}
              className={`h-4 ${
                utilization > 50
                  ? "[&>div]:bg-red-500"
                  : utilization > 30
                    ? "[&>div]:bg-yellow-500"
                    : "[&>div]:bg-green-500"
              }`}
            />
            <div className="flex justify-between text-xs text-gray-600">
              <span>0%</span>
              <span className="font-medium">30% (Ideal)</span>
              <span>100%</span>
            </div>
          </div>

          {/* Recommendations */}
          <div className="pt-4 border-t border-gray-300 space-y-2">
            {utilization > 50 && (
              <Alert variant="destructive">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5" />
                  <AlertDescription className="text-sm">
                    High utilization (&gt;50%) can negatively impact credit
                    scores. Consider paying down balances.
                  </AlertDescription>
                </div>
              </Alert>
            )}
            {utilization > 30 && utilization <= 50 && (
              <Alert className="bg-yellow-50 border-yellow-200">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                  <AlertDescription className="text-sm text-yellow-800">
                    Utilization between 30-50% may affect your credit. Aim to
                    get below 30%.
                  </AlertDescription>
                </div>
              </Alert>
            )}
            {utilization <= 30 && utilization > 0 && (
              <Alert className="bg-green-50 border-green-200">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                  <AlertDescription className="text-sm text-green-800">
                    Great job! Keeping utilization below 30% is ideal for credit
                    health.
                  </AlertDescription>
                </div>
              </Alert>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
