'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { YCSafeForm } from '@/components/YCSafeForm'
import { 
  PlusCircle, 
  FileText, 
  Users, 
  Shield, 
  Briefcase,
  ArrowRight,
  Star
} from 'lucide-react'

const documentTemplates = [
  {
    id: 'yc-safe',
    title: 'YC SAFE - Valuation Cap',
    description: 'Y Combinator Simple Agreement for Future Equity with valuation cap',
    icon: FileText,
    category: 'Fundraising',
    popularity: 5,
    estimatedTime: '10 minutes'
  },
  {
    id: 'founder-agreement',
    title: 'Founder Agreement',
    description: 'Define equity splits, vesting schedules, and responsibilities',
    icon: Users,
    category: 'Founding',
    popularity: 5,
    estimatedTime: '15 minutes'
  },
  {
    id: 'nda',
    title: 'Non-Disclosure Agreement',
    description: 'Protect confidential information in business discussions',
    icon: Shield,
    category: 'Legal Protection',
    popularity: 4,
    estimatedTime: '10 minutes'
  },
  {
    id: 'ip-assignment',
    title: 'IP Assignment Agreement',
    description: 'Transfer intellectual property rights to the company',
    icon: Briefcase,
    category: 'Intellectual Property',
    popularity: 4,
    estimatedTime: '12 minutes'
  },
  {
    id: 'consultant-agreement',
    title: 'Consultant Agreement',
    description: 'Engage external consultants with clear terms and deliverables',
    icon: FileText,
    category: 'Employment',
    popularity: 3,
    estimatedTime: '20 minutes'
  },
  {
    id: 'employment-agreement',
    title: 'Employment Agreement',
    description: 'Hire employees with comprehensive terms and conditions',
    icon: Users,
    category: 'Employment',
    popularity: 4,
    estimatedTime: '25 minutes'
  },
  {
    id: 'board-resolution',
    title: 'Board Resolution',
    description: 'Document important company decisions and authorizations',
    icon: FileText,
    category: 'Corporate Governance',
    popularity: 3,
    estimatedTime: '8 minutes'
  }
]

export function DocumentGenerator() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showYCSafeForm, setShowYCSafeForm] = useState(false)

  const categories = ['all', ...Array.from(new Set(documentTemplates.map(t => t.category)))]

  const filteredTemplates = documentTemplates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory
    const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const handleGenerateDocument = (templateId: string) => {
    if (templateId === 'yc-safe') {
      setShowYCSafeForm(true)
    } else {
      // For other templates, show placeholder functionality
      const template = documentTemplates.find(t => t.id === templateId)
      alert(`${template?.title} generator would open here! This feature is currently being developed.`)
    }
  }

  if (showYCSafeForm) {
    return <YCSafeForm onBack={() => setShowYCSafeForm(false)} />
  }

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-border p-4">
        <div className="flex items-center gap-3 mb-1">
          <PlusCircle className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-semibold">Document Generator</h1>
        </div>
        <p className="text-muted-foreground text-sm">
          Generate custom legal documents by filling out simple forms
        </p>
      </div>

      <div className="border-b border-border p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search document templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-9"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="capitalize text-xs"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {filteredTemplates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((template) => {
              const Icon = template.icon
              return (
                <Card 
                  key={template.id} 
                  className="hover:shadow-md transition-shadow cursor-pointer"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-sm">{template.title}</CardTitle>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: template.popularity }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <CardDescription className="text-xs">
                      {template.description}
                    </CardDescription>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="px-2 py-1 bg-muted rounded-full">
                        {template.category}
                      </span>
                      <span>{template.estimatedTime}</span>
                    </div>
                    
                    <Button 
                      className="w-full"
                      size="sm"
                      onClick={() => handleGenerateDocument(template.id)}
                    >
                      Generate Document
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <PlusCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-base font-medium mb-1">No templates found</h3>
            <p className="text-muted-foreground text-sm">
              Try adjusting your search terms or category filter
            </p>
          </div>
        )}
      </div>

      <div className="border-t border-border p-4">
        <Card className="bg-muted/50">
          <CardContent className="p-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Star className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h4 className="font-medium text-xs">Custom Document Requests</h4>
                <p className="text-xs text-muted-foreground">
                  Need a specific document? Contact us to add new templates to our library.
                </p>
              </div>
              <Button variant="outline" size="sm" className="ml-auto text-xs">
                Request Template
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}