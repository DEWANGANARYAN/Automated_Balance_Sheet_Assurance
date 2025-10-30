"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Sparkles, Send, Loader2 } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m your Balance Sheet Assurance AI Assistant. I can help you with financial data queries, variance analysis, entity status, and compliance checks. What would you like to know?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // Simulate AI response with financial context
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const response = generateAIResponse(userMessage);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'I apologize, but I encountered an error processing your request. Please try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateAIResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('pending') || lowerQuery.includes('review')) {
      return 'Based on current data, there are 15 trial reports pending review across Finance and Operations departments. The oldest pending report is from Entity ENT-FIN-003, submitted 12 days ago. Would you like me to show you the detailed breakdown by department?';
    }
    
    if (lowerQuery.includes('variance') || lowerQuery.includes('anomal')) {
      return 'I\'ve detected 8 significant variances this month. The most critical is a 45.2% QoQ increase in Account 2100 (Long-term Loans) for Entity ENT-OPS-005, which exceeds the 30% threshold. This requires immediate attention. The variance is primarily driven by a new equipment financing transaction. Would you like the full variance analysis report?';
    }
    
    if (lowerQuery.includes('overdue') || lowerQuery.includes('late')) {
      return 'Currently, there are 7 overdue assignments: 3 in North America region, 2 in Europe, and 2 in Asia Pacific. The most critical is a reviewer assignment for Entity ENT-FIN-008 that\'s been overdue for 8 days. I can send automated reminders to the assigned stakeholders if you\'d like.';
    }
    
    if (lowerQuery.includes('compliance') || lowerQuery.includes('audit')) {
      return 'Compliance status: 94% of entities are compliant. 3 entities have trial balance discrepancies exceeding tolerance (>$5,000). Entity ENT-FIN-002 has a $45,000 difference that requires reconciliation. All entities are current on quarterly reporting except ENT-SAL-006 which is 2 days overdue. Would you like me to generate a compliance summary report?';
    }
    
    if (lowerQuery.includes('entity') || lowerQuery.includes('department')) {
      return 'We currently manage 50 entities across 5 departments and 5 regions. Finance department has the most entities (15), followed by Operations (12). Status breakdown: 45 active, 5 inactive. 32 entities have completed their latest trial balance reviews. Would you like a specific department or region analysis?';
    }
    
    if (lowerQuery.includes('stakeholder') || lowerQuery.includes('assigned')) {
      return 'There are 20 active stakeholders: 8 Makers, 6 Checkers, 4 Approvers, and 2 Admins. Current workload distribution shows Checker #2 (Maria Garcia) has the highest load with 10 active assignments. 3 stakeholders have overdue tasks. Would you like me to suggest workload rebalancing?';
    }
    
    if (lowerQuery.includes('balance') || lowerQuery.includes('debit') || lowerQuery.includes('credit')) {
      return 'Latest trial balance summary: Total debits across all entities: $487.5M, Total credits: $487.3M. Overall balance difference: $200K (0.04%). 27 entities have perfect balance (0 difference), 18 have minor variances within tolerance, and 5 require attention. Would you like the entity-by-entity breakdown?';
    }
    
    return `I understand you're asking about "${query}". I can provide insights on pending reviews, variance analysis, compliance status, entity performance, stakeholder workload, and financial data queries. Could you be more specific about what information you need? For example, you could ask about "pending reviews in Finance department" or "variance anomalies this quarter".`;
  };

  return (
    <Card className="flex flex-col h-full">
      <div className="flex items-center gap-2 p-4 border-b">
        <Sparkles className="h-5 w-5 text-primary" />
        <h2 className="font-semibold">AI Assistant</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
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
      </div>
      
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about financial data, variances, or compliance..."
            className="min-h-[60px] resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </Card>
  );
}
