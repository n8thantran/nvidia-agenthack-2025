'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Zap, 
  Play, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Users
} from 'lucide-react'

const simulationScenarios = [
  {
    id: 'founder-leaving',
    title: 'Founder Leaves Before Vesting',
    description: 'Simulate the impact of a co-founder leaving the company before their equity vests',
    category: 'Equity & Vesting',
    complexity: 'Medium',
    duration: '10-15 minutes',
    participants: ['Remaining Founders', 'Legal Counsel', 'Board of Directors'],
    outcomes: {
      best: 'Smooth transition with fair equity buyback and continued company growth',
      worst: 'Legal disputes, equity complications, and operational disruption',
      likely: 'Some equity forfeiture, need for new team member, temporary disruption'
    }
  },
  {
    id: 'ip-dispute',
    title: 'Intellectual Property Dispute',
    description: 'Explore scenarios where a former employee claims ownership of company IP',
    category: 'Intellectual Property',
    complexity: 'High',
    duration: '15-20 minutes',
    participants: ['Company Legal', 'Former Employee', 'Current Team', 'Investors'],
    outcomes: {
      best: 'Clear documentation proves company ownership, dispute resolved quickly',
      worst: 'Costly litigation, injunction on product, significant legal fees',
      likely: 'Settlement negotiation, some legal costs, IP assignment clarification'
    }
  },
  {
    id: 'investor-dilution',
    title: 'Investor Anti-Dilution Rights',
    description: 'See how down rounds and anti-dilution provisions affect founder ownership',
    category: 'Fundraising',
    complexity: 'High',
    duration: '12-18 minutes',
    participants: ['Founders', 'Existing Investors', 'New Investors', 'Legal Advisors'],
    outcomes: {
      best: 'Fair valuation maintained, minimal dilution, investor support continues',
      worst: 'Severe founder dilution, loss of control, investor conflicts',
      likely: 'Some dilution protection triggered, need for new investor terms'
    }
  },
  {
    id: 'regulatory-compliance',
    title: 'Regulatory Compliance Issue',
    description: 'Navigate potential compliance violations and regulatory responses',
    category: 'Compliance',
    complexity: 'High',
    duration: '20-25 minutes',
    participants: ['Compliance Team', 'Regulators', 'Legal Counsel', 'Board'],
    outcomes: {
      best: 'Proactive compliance, minor adjustments, continued operations',
      worst: 'Fines, operational restrictions, reputation damage',
      likely: 'Compliance plan implementation, some regulatory scrutiny'
    }
  }
]

export function LegalSimulation() {
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null)
  const [simulationState, setSimulationState] = useState<'idle' | 'running' | 'completed'>('idle')

  const startSimulation = (scenarioId: string) => {
    setSelectedScenario(scenarioId)
    setSimulationState('running')
    
    // Simulate running time
    setTimeout(() => {
      setSimulationState('completed')
    }, 3000)
  }

  const resetSimulation = () => {
    setSelectedScenario(null)
    setSimulationState('idle')
  }

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'Low': return 'text-green-600 bg-green-100'
      case 'Medium': return 'text-yellow-600 bg-yellow-100'
      case 'High': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getOutcomeIcon = (type: string) => {
    switch (type) {
      case 'best': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'worst': return <AlertTriangle className="w-4 h-4 text-red-500" />
      case 'likely': return <TrendingUp className="w-4 h-4 text-blue-500" />
      default: return null
    }
  }

  const selectedScenarioData = simulationScenarios.find(s => s.id === selectedScenario)

  if (simulationState === 'running') {
    return (
      <div className="flex flex-col h-full">
        <div className="border-b border-border p-6">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-semibold">Legal Simulation</h1>
          </div>
          <p className="text-muted-foreground">Running simulation...</p>
        </div>

        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="w-full max-w-md">
            <CardContent className="p-8 text-center">
              <Zap className="w-16 h-16 text-primary mx-auto mb-4 animate-pulse" />
              <h3 className="text-lg font-semibold mb-2">
                {selectedScenarioData?.title}
              </h3>
              <p className="text-muted-foreground mb-4">
                Analyzing legal scenarios and outcomes...
              </p>
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (simulationState === 'completed' && selectedScenarioData) {
    return (
      <div className="flex flex-col h-full">
        <div className="border-b border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Zap className="w-6 h-6 text-primary" />
                <h1 className="text-2xl font-semibold">Simulation Results</h1>
              </div>
              <p className="text-muted-foreground">{selectedScenarioData.title}</p>
            </div>
            <Button onClick={resetSimulation} variant="outline">
              Run Another Simulation
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Scenario Participants
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {selectedScenarioData.participants.map((participant, index) => (
                    <span key={index} className="px-3 py-1 bg-muted rounded-full text-sm">
                      {participant}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-green-200">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-green-700">
                    {getOutcomeIcon('best')}
                    Best Case Scenario
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{selectedScenarioData.outcomes.best}</p>
                </CardContent>
              </Card>

              <Card className="border-blue-200">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-blue-700">
                    {getOutcomeIcon('likely')}
                    Most Likely Outcome
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{selectedScenarioData.outcomes.likely}</p>
                </CardContent>
              </Card>

              <Card className="border-red-200">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-red-700">
                    {getOutcomeIcon('worst')}
                    Worst Case Scenario
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{selectedScenarioData.outcomes.worst}</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Key Takeaways & Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Preventive Measures</h4>
                      <p className="text-sm text-muted-foreground">
                        Implement clear documentation and agreements before issues arise
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Risk Mitigation</h4>
                      <p className="text-sm text-muted-foreground">
                        Regular legal reviews and compliance checks can prevent most issues
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Professional Support</h4>
                      <p className="text-sm text-muted-foreground">
                        Maintain relationships with qualified legal counsel for complex situations
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-border p-6">
        <div className="flex items-center gap-3 mb-2">
          <Zap className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-semibold">Legal Simulation Mode</h1>
          <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
            Beta
          </span>
        </div>
        <p className="text-muted-foreground">
          Simulate legal scenarios to understand potential outcomes and prepare for various situations
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">How Legal Simulation Works</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Our AI agents roleplay different stakeholders in legal scenarios, helping you understand 
                    potential outcomes and prepare for various situations that might arise in your startup journey.
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      10-25 minutes
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      Multiple perspectives
                    </span>
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      Outcome analysis
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div>
            <h2 className="text-lg font-semibold mb-4">Available Simulations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {simulationScenarios.map((scenario) => (
                <Card key={scenario.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{scenario.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {scenario.description}
                        </CardDescription>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getComplexityColor(scenario.complexity)}`}>
                        {scenario.complexity}
                      </span>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="px-2 py-1 bg-muted rounded-full">
                        {scenario.category}
                      </span>
                      <span>{scenario.duration}</span>
                    </div>
                    
                    <Button 
                      className="w-full"
                      onClick={() => startSimulation(scenario.id)}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Run Simulation
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}