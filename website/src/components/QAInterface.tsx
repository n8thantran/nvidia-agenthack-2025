'use client'

import { useState } from 'react'
import { useApp } from '@/context/AppContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Send, MessageSquare, Clock, User, Bot } from 'lucide-react'

const exampleQuestions = [
  "How do I issue founder stock?",
  "What does pro rata mean in a SAFE?",
  "What are the key terms in a Series A?",
  "How do I structure equity for co-founders?",
  "What is a vesting schedule?",
  "What should I include in an NDA?"
]

const mockAnswers: Record<string, string> = {
  "How do I issue founder stock?": "Issuing founder stock involves several key steps: 1) Determine the total number of authorized shares, 2) Set the par value (typically $0.001), 3) Execute a stock purchase agreement with each founder, 4) File an 83(b) election within 30 days if shares are subject to vesting, 5) Update your cap table and corporate records. Consider consulting with a startup attorney to ensure proper documentation and compliance with securities laws.",
  "What does pro rata mean in a SAFE?": "Pro rata rights in a SAFE (Simple Agreement for Future Equity) give the investor the right to participate in future funding rounds to maintain their ownership percentage. When you raise a Series A, SAFE holders with pro rata rights can invest additional money to prevent dilution. This is particularly important for early investors who want to maintain their stake as the company grows and raises more capital.",
  "What are the key terms in a Series A?": "Key Series A terms include: 1) Valuation (pre-money and post-money), 2) Liquidation preferences (usually 1x non-participating), 3) Anti-dilution provisions (weighted average), 4) Board composition, 5) Voting rights, 6) Drag-along and tag-along rights, 7) Information rights, 8) Pro rata participation rights, 9) Founder vesting acceleration triggers, 10) Employee option pool sizing (typically 10-20%)."
}

export function QAInterface() {
  const { state, dispatch } = useApp()
  const [question, setQuestion] = useState('')
  const [isAsking, setIsAsking] = useState(false)

  const handleAskQuestion = async (questionText: string) => {
    if (!questionText.trim()) return

    setIsAsking(true)
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const answer = mockAnswers[questionText] || 
      "This is a complex legal question that requires careful consideration of your specific circumstances. I recommend consulting with a qualified startup attorney who can provide personalized advice based on your situation. However, I can provide some general guidance on this topic..."

    const newSession = {
      id: Date.now().toString(),
      question: questionText,
      answer,
      timestamp: new Date(),
      category: 'General Legal'
    }

    dispatch({ type: 'ADD_QA_SESSION', payload: newSession })
    setQuestion('')
    setIsAsking(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleAskQuestion(question)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-border p-4">
        <div className="flex items-center gap-3 mb-1">
          <MessageSquare className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-semibold">Legal Q&A</h1>
        </div>
        <p className="text-muted-foreground text-sm">
          Ask legal questions in plain English and get AI-powered answers tailored for founders
        </p>
      </div>

      <div className="flex-1 flex min-h-0">
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto p-4">
            {state.qaSessions.length === 0 ? (
              <div className="space-y-4">
                <div className="text-center py-6">
                  <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <h3 className="text-base font-medium mb-1">Start your legal conversation</h3>
                  <p className="text-muted-foreground text-sm">
                    Ask any legal question about starting and running your company
                  </p>
                </div>

                <div>
                  <h3 className="font-medium mb-3 text-xs text-muted-foreground uppercase tracking-wide">
                    Popular Questions
                  </h3>
                  <div className="grid gap-2">
                    {exampleQuestions.map((q, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="justify-start h-auto p-3 text-left text-sm"
                        onClick={() => handleAskQuestion(q)}
                        disabled={isAsking}
                      >
                        <div>
                          <div className="font-medium">{q}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {state.qaSessions.map((session) => (
                  <div key={session.id} className="space-y-4">
                    <Card className="border-l-4 border-l-primary">
                      <CardContent className="pt-4">
                        <div className="flex items-start gap-3">
                          <User className="w-5 h-5 text-muted-foreground mt-0.5" />
                          <div className="flex-1">
                            <p className="font-medium">{session.question}</p>
                            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              {session.timestamp.toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-4">
                        <div className="flex items-start gap-3">
                          <Bot className="w-5 h-5 text-primary mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm leading-relaxed">{session.answer}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}

                {isAsking && (
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <Bot className="w-5 h-5 text-primary mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className="animate-pulse">Thinking...</div>
                            <div className="flex gap-1">
                              <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>

          <div className="border-t border-border p-4">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                placeholder="Ask a legal question..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                disabled={isAsking}
                className="flex-1 h-9"
              />
              <Button type="submit" disabled={isAsking || !question.trim()} size="sm">
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>

        <div className="w-64 border-l border-border p-4">
          <h3 className="font-medium mb-3 text-sm">Quick Tips</h3>
          <div className="space-y-3 text-xs">
            <div className="p-2 bg-muted rounded-md">
              <h4 className="font-medium mb-1">Be Specific</h4>
              <p className="text-muted-foreground">
                Include details about your situation for more accurate answers
              </p>
            </div>
            <div className="p-2 bg-muted rounded-md">
              <h4 className="font-medium mb-1">Ask Follow-ups</h4>
              <p className="text-muted-foreground">
                Don't hesitate to ask clarifying questions
              </p>
            </div>
            <div className="p-2 bg-muted rounded-md">
              <h4 className="font-medium mb-1">Consult a Lawyer</h4>
              <p className="text-muted-foreground">
                For important decisions, always get professional legal advice
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}