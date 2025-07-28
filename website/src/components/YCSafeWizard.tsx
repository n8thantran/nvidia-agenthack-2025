'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { YCSafePDFGenerator, downloadGeneratedPDF, type SafeFormData } from '@/lib/pdfGenerator'
import { 
  ArrowLeft,
  ArrowRight,
  FileText,
  Download,
  CheckCircle,
  Loader2,
  DollarSign,
  Building,
  User,
  MapPin,
  Calendar,
  Hash,
  Check,
  LucideIcon
} from 'lucide-react'

interface YCSafeWizardProps {
  onBack: () => void
}

interface WizardStep {
  id: string
  title: string
  description: string
  icon: LucideIcon
  fields: (keyof SafeFormData)[]
}

const wizardSteps: WizardStep[] = [
  {
    id: 'company-basics',
    title: 'Company Information',
    description: 'Tell us about your company',
    icon: Building,
    fields: ['companyName', 'companyState']
  },
  {
    id: 'investment-terms',
    title: 'Investment Terms',
    description: 'Set the key terms of your SAFE',
    icon: DollarSign,
    fields: ['purchaseAmount', 'valuationCap', 'discountRate']
  },
  {
    id: 'investor-details',
    title: 'Investor Information',
    description: 'Add details about your investor',
    icon: User,
    fields: ['investorName', 'investorTitle', 'investorAddress', 'investorEmail']
  },
  {
    id: 'company-contact',
    title: 'Company Details',
    description: 'Your company contact information',
    icon: MapPin,
    fields: ['founderName', 'title', 'companyAddress', 'companyEmail']
  },
  {
    id: 'agreement-date',
    title: 'Finalize Agreement',
    description: 'Set the date and review',
    icon: Calendar,
    fields: ['date']
  }
]

export function YCSafeWizard({ onBack }: YCSafeWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<SafeFormData>({
    companyName: '',
    companyState: 'Delaware',
    investorName: '',
    purchaseAmount: '',
    valuationCap: '',
    discountRate: '20',
    date: new Date().toISOString().split('T')[0],
    title: 'Chief Executive Officer',
    founderName: '',
    companyAddress: '',
    companyEmail: '',
    investorTitle: '',
    investorAddress: '',
    investorEmail: ''
  })
  
  const [isGenerating, setIsGenerating] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [error, setError] = useState<string | null>(null)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())

  const handleInputChange = (field: keyof SafeFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const isStepValid = (stepIndex: number): boolean => {
    const step = wizardSteps[stepIndex]
    return step.fields.every(field => {
      const value = formData[field]
      if (field === 'purchaseAmount' || field === 'valuationCap') {
        return value && parseFloat(value) > 0
      }
      // Required fields (marked with * in the original form)
      const requiredFields = ['companyName', 'investorName', 'purchaseAmount', 'valuationCap']
      if (requiredFields.includes(field)) {
        return value && value.trim() !== ''
      }
      return true // Optional fields are always valid
    })
  }

  const handleNext = () => {
    if (currentStep < wizardSteps.length - 1) {
      if (isStepValid(currentStep)) {
        setCompletedSteps(prev => new Set([...prev, currentStep]))
        setCurrentStep(currentStep + 1)
      }
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleStepClick = (stepIndex: number) => {
    // Allow jumping to any previous step or the next step if current is valid
    if (stepIndex <= currentStep || (stepIndex === currentStep + 1 && isStepValid(currentStep))) {
      if (isStepValid(currentStep)) {
        setCompletedSteps(prev => new Set([...prev, currentStep]))
      }
      setCurrentStep(stepIndex)
    }
  }

  const handleGenerate = async () => {
    setIsGenerating(true)
    setError(null)
    
    try {
      const generator = new YCSafePDFGenerator()
      const generatedPdfBytes = await generator.createDocument(formData)
      setPdfBytes(generatedPdfBytes)
      setIsComplete(true)
    } catch (error) {
      console.error('Error generating PDF:', error)
      setError(error instanceof Error ? error.message : 'An unknown error occurred')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = () => {
    if (pdfBytes) {
      const filename = `YC-SAFE-${formData.companyName.replace(/\s+/g, '-')}-${formData.date}.pdf`
      downloadGeneratedPDF(pdfBytes, filename)
    }
  }

  if (isComplete) {
    return (
      <div className="flex flex-col h-full">
        <div className="border-b border-border p-4">
          <div className="flex items-center gap-3 mb-1">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <h1 className="text-xl font-semibold">YC SAFE Generated Successfully</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Your YC SAFE document has been generated and is ready for download
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Document Ready
              </CardTitle>
              <CardDescription>
                Your YC SAFE document has been generated with the following details:
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Company</label>
                  <p className="font-medium">{formData.companyName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Investor</label>
                  <p className="font-medium">{formData.investorName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Purchase Amount</label>
                  <p className="font-medium">${parseFloat(formData.purchaseAmount).toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Valuation Cap</label>
                  <p className="font-medium">${parseFloat(formData.valuationCap).toLocaleString()}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={handleDownload} className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  Download Document
                </Button>
                <Button variant="outline" onClick={() => setIsComplete(false)}>
                  Edit Details
                </Button>
              </div>

              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <h4 className="font-medium text-sm mb-2">Important Notice</h4>
                  <p className="text-sm text-muted-foreground">
                    This document is AI-generated for demonstration purposes. Please have all legal documents reviewed by qualified legal counsel before execution.
                  </p>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const currentStepData = wizardSteps[currentStep]
  const StepIcon = currentStepData.icon

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-border p-4">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <FileText className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-semibold">YC SAFE - Valuation Cap</h1>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          {wizardSteps.map((step, index) => {
            const isCompleted = completedSteps.has(index)
            const isCurrent = index === currentStep
            const isAccessible = index <= currentStep || (index === currentStep + 1 && isStepValid(currentStep))
            
            return (
              <div key={step.id} className="flex items-center">
                <div 
                  className={`flex items-center gap-2 cursor-pointer transition-all ${
                    isAccessible ? 'hover:text-primary' : 'cursor-not-allowed'
                  }`}
                  onClick={() => isAccessible && handleStepClick(index)}
                >
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all ${
                    isCompleted 
                      ? 'bg-green-500 border-green-500 text-white' 
                      : isCurrent 
                        ? 'border-primary bg-primary text-white' 
                        : isAccessible
                          ? 'border-muted-foreground text-muted-foreground hover:border-primary'
                          : 'border-muted text-muted-foreground'
                  }`}>
                    {isCompleted ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <span className="text-xs font-medium">{index + 1}</span>
                    )}
                  </div>
                  <span className={`text-xs font-medium hidden sm:block ${
                    isCurrent ? 'text-primary' : isCompleted ? 'text-green-600' : 'text-muted-foreground'
                  }`}>
                    {step.title}
                  </span>
                </div>
                {index < wizardSteps.length - 1 && (
                  <div className={`w-12 h-0.5 mx-2 ${
                    isCompleted ? 'bg-green-500' : 'bg-muted'
                  }`} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <StepIcon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle>{currentStepData.title}</CardTitle>
                <CardDescription>{currentStepData.description}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {renderStepContent(currentStep, formData, handleInputChange)}
            
            {/* Navigation */}
            <div className="flex justify-between mt-8">
              <Button 
                variant="outline" 
                onClick={handlePrevious}
                disabled={currentStep === 0}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              
              {currentStep === wizardSteps.length - 1 ? (
                <Button 
                  onClick={handleGenerate}
                  disabled={!isStepValid(currentStep) || isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mr-2" />
                      Generate Document
                    </>
                  )}
                </Button>
              ) : (
                <Button 
                  onClick={handleNext}
                  disabled={!isStepValid(currentStep)}
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function renderStepContent(
  stepIndex: number, 
  formData: SafeFormData, 
  handleInputChange: (field: keyof SafeFormData, value: string) => void
) {
  switch (stepIndex) {
    case 0: // Company Information
      return (
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Building className="w-4 h-4" />
              Company Name *
            </label>
            <Input
              value={formData.companyName}
              onChange={(e) => handleInputChange('companyName', e.target.value)}
              placeholder="e.g., Acme Corp Inc."
              className="text-lg p-3"
            />
            <p className="text-xs text-muted-foreground">
              Enter your company&apos;s full legal name as it appears in your incorporation documents
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              State of Incorporation
            </label>
            <Input
              value={formData.companyState}
              onChange={(e) => handleInputChange('companyState', e.target.value)}
              placeholder="e.g., Delaware"
              className="text-lg p-3"
            />
            <p className="text-xs text-muted-foreground">
              The state where your company was incorporated (most startups use Delaware)
            </p>
          </div>
        </div>
      )

    case 1: // Investment Terms
      return (
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Purchase Amount *
            </label>
            <Input
              type="number"
              value={formData.purchaseAmount}
              onChange={(e) => handleInputChange('purchaseAmount', e.target.value)}
              placeholder="100000"
              min="0"
              step="1000"
              className="text-lg p-3"
            />
            <p className="text-xs text-muted-foreground">
              The amount of money the investor is investing in your company
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Valuation Cap *
            </label>
            <Input
              type="number"
              value={formData.valuationCap}
              onChange={(e) => handleInputChange('valuationCap', e.target.value)}
              placeholder="10000000"
              min="0"
              step="100000"
              className="text-lg p-3"
            />
            <p className="text-xs text-muted-foreground">
              The maximum company valuation at which the SAFE will convert to equity
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Hash className="w-4 h-4" />
              Discount Rate (%)
            </label>
            <Input
              type="number"
              value={formData.discountRate}
              onChange={(e) => handleInputChange('discountRate', e.target.value)}
              placeholder="20"
              min="0"
              max="50"
              className="text-lg p-3"
            />
            <p className="text-xs text-muted-foreground">
              The discount percentage applied when converting to equity (typically 15-25%)
            </p>
          </div>
        </div>
      )

    case 2: // Investor Details
      return (
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <User className="w-4 h-4" />
              Investor Name *
            </label>
            <Input
              value={formData.investorName}
              onChange={(e) => handleInputChange('investorName', e.target.value)}
              placeholder="e.g., John Smith or ABC Ventures"
              className="text-lg p-3"
            />
            <p className="text-xs text-muted-foreground">
              Full name of the individual investor or fund making the investment
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Investor Title
            </label>
            <Input
              value={formData.investorTitle}
              onChange={(e) => handleInputChange('investorTitle', e.target.value)}
              placeholder="e.g., Managing Partner"
              className="text-lg p-3"
            />
            <p className="text-xs text-muted-foreground">
              The investor&apos;s title or role (optional)
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Investor Address
            </label>
            <Input
              value={formData.investorAddress}
              onChange={(e) => handleInputChange('investorAddress', e.target.value)}
              placeholder="e.g., 456 Investor Ave, New York, NY 10001"
              className="text-lg p-3"
            />
            <p className="text-xs text-muted-foreground">
              The investor&apos;s business address (optional)
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Investor Email
            </label>
            <Input
              type="email"
              value={formData.investorEmail}
              onChange={(e) => handleInputChange('investorEmail', e.target.value)}
              placeholder="e.g., investor@fund.com"
              className="text-lg p-3"
            />
            <p className="text-xs text-muted-foreground">
              The investor&apos;s email address (optional)
            </p>
          </div>
        </div>
      )

    case 3: // Company Contact
      return (
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <User className="w-4 h-4" />
              Founder/Signatory Name
            </label>
            <Input
              value={formData.founderName}
              onChange={(e) => handleInputChange('founderName', e.target.value)}
              placeholder="e.g., John Smith"
              className="text-lg p-3"
            />
            <p className="text-xs text-muted-foreground">
              Name of the person who will sign the document on behalf of the company
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Signatory Title
            </label>
            <Input
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="e.g., Chief Executive Officer"
              className="text-lg p-3"
            />
            <p className="text-xs text-muted-foreground">
              The title of the person signing (typically CEO or President)
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Company Address
            </label>
            <Input
              value={formData.companyAddress}
              onChange={(e) => handleInputChange('companyAddress', e.target.value)}
              placeholder="e.g., 123 Main St, San Francisco, CA 94105"
              className="text-lg p-3"
            />
            <p className="text-xs text-muted-foreground">
              Your company&apos;s business address
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Company Email
            </label>
            <Input
              type="email"
              value={formData.companyEmail}
              onChange={(e) => handleInputChange('companyEmail', e.target.value)}
              placeholder="e.g., founder@company.com"
              className="text-lg p-3"
            />
            <p className="text-xs text-muted-foreground">
              Your company&apos;s official email address
            </p>
          </div>
        </div>
      )

    case 4: // Agreement Date
      return (
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Agreement Date
            </label>
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              className="text-lg p-3"
            />
            <p className="text-xs text-muted-foreground">
              The date when this SAFE agreement becomes effective
            </p>
          </div>

          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <h4 className="font-medium text-sm mb-2">Review Your Information</h4>
              <div className="grid grid-cols-1 gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Company:</span>
                  <span>{formData.companyName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Investor:</span>
                  <span>{formData.investorName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Investment:</span>
                  <span>${parseFloat(formData.purchaseAmount || '0').toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Valuation Cap:</span>
                  <span>${parseFloat(formData.valuationCap || '0').toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )

    default:
      return null
  }
}