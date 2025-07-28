'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { YCSafePDFGenerator, downloadGeneratedPDF, generatePreviewPDF, type SafeFormData } from '@/lib/pdfGenerator'
import { 
  ArrowLeft,
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
  AlertCircle,
  Eye
} from 'lucide-react'

interface YCSafeFormProps {
  onBack: () => void
}

interface FormData {
  companyName: string
  companyState: string
  investorName: string
  purchaseAmount: string
  valuationCap: string
  discountRate: string
  date: string
  title: string
}

interface DocumentProgress {
  step: string
  completed: boolean
  current: boolean
}

const documentSteps: DocumentProgress[] = [
  { step: 'Initializing PDF document generator', completed: false, current: false },
  { step: 'Creating document structure and layout', completed: false, current: false },
  { step: 'Adding legal content and clauses', completed: false, current: false },
  { step: 'Inserting your data and information', completed: false, current: false },
  { step: 'Formatting and finalizing document', completed: false, current: false },
  { step: 'Generating final PDF', completed: false, current: false }
]

export function YCSafeForm({ onBack }: YCSafeFormProps) {
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
  const [currentStepIndex, setCurrentStepIndex] = useState(-1)
  const [steps, setSteps] = useState(documentSteps)
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false)

  const handleInputChange = (field: keyof SafeFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleGenerate = async () => {
    setIsGenerating(true)
    setCurrentStepIndex(0)
    setError(null)
    
    // Reset steps
    setSteps(documentSteps.map(step => ({ ...step, completed: false, current: false })))
    
    try {
      const pdfGenerator = new YCSafePDFGenerator()
      
      // Step 1: Initializing PDF document generator
      setSteps(prev => prev.map((step, index) => ({
        ...step,
        current: index === 0,
        completed: false
      })))
      setCurrentStepIndex(0)
      await new Promise(resolve => setTimeout(resolve, 800))
      
      setSteps(prev => prev.map((step, index) => ({
        ...step,
        current: false,
        completed: index === 0
      })))
      
      // Step 2: Creating document structure and layout
      setSteps(prev => prev.map((step, index) => ({
        ...step,
        current: index === 1,
        completed: index < 1
      })))
      setCurrentStepIndex(1)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setSteps(prev => prev.map((step, index) => ({
        ...step,
        current: false,
        completed: index <= 1
      })))
      
      // Step 3: Adding legal content and clauses
      setSteps(prev => prev.map((step, index) => ({
        ...step,
        current: index === 2,
        completed: index < 2
      })))
      setCurrentStepIndex(2)
      await new Promise(resolve => setTimeout(resolve, 1200))
      
      setSteps(prev => prev.map((step, index) => ({
        ...step,
        current: false,
        completed: index <= 2
      })))
      
      // Step 4: Inserting your data and information
      setSteps(prev => prev.map((step, index) => ({
        ...step,
        current: index === 3,
        completed: index < 3
      })))
      setCurrentStepIndex(3)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setSteps(prev => prev.map((step, index) => ({
        ...step,
        current: false,
        completed: index <= 3
      })))
      
      // Step 5: Formatting and finalizing document
      setSteps(prev => prev.map((step, index) => ({
        ...step,
        current: index === 4,
        completed: index < 4
      })))
      setCurrentStepIndex(4)
      await new Promise(resolve => setTimeout(resolve, 800))
      
      setSteps(prev => prev.map((step, index) => ({
        ...step,
        current: false,
        completed: index <= 4
      })))
      
      // Step 6: Generating final PDF
      setSteps(prev => prev.map((step, index) => ({
        ...step,
        current: index === 5,
        completed: index < 5
      })))
      setCurrentStepIndex(5)
      
      const generatedPdfBytes = await pdfGenerator.createDocument(formData)
      setPdfBytes(generatedPdfBytes)
      
      await new Promise(resolve => setTimeout(resolve, 600))
      
      // Mark all steps as completed
      setSteps(prev => prev.map(step => ({
        ...step,
        current: false,
        completed: true
      })))
      
      setIsGenerating(false)
      setIsComplete(true)
      
    } catch (error) {
      console.error('Error generating PDF:', error)
      setError(error instanceof Error ? error.message : 'An unknown error occurred')
      setIsGenerating(false)
    }
  }

  const isFormValid = () => {
    return formData.companyName && 
           formData.investorName && 
           formData.purchaseAmount && 
           formData.valuationCap &&
           parseFloat(formData.purchaseAmount) > 0 &&
           parseFloat(formData.valuationCap) > 0
  }

  const handleDownload = () => {
    if (pdfBytes) {
      const filename = `YC-SAFE-${formData.companyName.replace(/\s+/g, '-')}-${formData.date}.pdf`
      downloadGeneratedPDF(pdfBytes, filename)
    }
  }

  const handlePreview = async () => {
    setIsGeneratingPreview(true)
    try {
      await generatePreviewPDF()
    } catch (error) {
      console.error('Error generating preview:', error)
      alert('Error generating preview PDF. Please try again.')
    } finally {
      setIsGeneratingPreview(false)
    }
  }


  if (isComplete) {
    return (
      <div className="flex flex-col h-full">
        <div className="border-b border-border p-4">
          <div className="flex items-center gap-3 mb-1">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
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

  if (isGenerating || error) {
    return (
      <div className="flex flex-col h-full">
        <div className="border-b border-border p-4">
          <div className="flex items-center gap-3 mb-1">
            <Button variant="ghost" size="sm" onClick={onBack} disabled={isGenerating}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            {error ? (
              <AlertCircle className="w-5 h-5 text-red-500" />
            ) : (
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
            )}
            <h1 className="text-xl font-semibold">
              {error ? 'PDF Generation Failed' : 'Generating YC SAFE Document'}
            </h1>
          </div>
          <p className="text-muted-foreground text-sm">
            {error ? 'An error occurred while processing your document.' : 'Please wait while we generate your legal document...'}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>
                {error ? 'Error Details' : 'Document Generation Progress'}
              </CardTitle>
              <CardDescription>
                {error ? 'The following error occurred during PDF generation:' : 'Processing your YC SAFE agreement with the provided information'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error ? (
                <div className="space-y-4">
                  <Card className="bg-red-50 border-red-200">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-red-800 mb-1">Generation Failed</h4>
                          <p className="text-red-700 text-sm">{error}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <div className="flex gap-3">
                    <Button onClick={() => setError(null)} variant="outline" className="flex-1">
                      Try Again
                    </Button>
                    <Button onClick={onBack} className="flex-1">
                      Back to Templates
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {steps.map((step, index) => (
                    <div key={index} className="flex items-center gap-3">
                      {step.completed ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : step.current ? (
                        <Loader2 className="w-5 h-5 text-primary animate-spin" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30" />
                      )}
                      <span className={`text-sm ${step.completed ? 'text-green-600' : step.current ? 'text-primary' : 'text-muted-foreground'}`}>
                        {step.step}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-border p-4">
        <div className="flex items-center gap-3 mb-1">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <FileText className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-semibold">YC SAFE - Valuation Cap</h1>
        </div>
        <p className="text-muted-foreground text-sm">
          Fill out the form below to generate your Y Combinator Simple Agreement for Future Equity
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>SAFE Agreement Details</CardTitle>
            <CardDescription>
              Complete all required fields to generate your YC SAFE document
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  Company Name *
                </label>
                <Input
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  placeholder="e.g., Acme Corp Inc."
                />
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
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Investor Name *
                </label>
                <Input
                  value={formData.investorName}
                  onChange={(e) => handleInputChange('investorName', e.target.value)}
                  placeholder="e.g., John Smith or ABC Ventures"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Agreement Date
                </label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Purchase Amount *
                </label>
                <Input
                  type="number"
                  value={formData.purchaseAmount}
                  onChange={(e) => handleInputChange('purchaseAmount', e.target.value)}
                  placeholder="e.g., 100000"
                  min="0"
                  step="1000"
                />
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
                  placeholder="e.g., 10000000"
                  min="0"
                  step="100000"
                />
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
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Signatory Title
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="e.g., Chief Executive Officer"
                />
              </div>
            </div>

            {/* Company Signature Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Company Signature Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Founder/Signatory Name
                  </label>
                  <Input
                    value={formData.founderName}
                    onChange={(e) => handleInputChange('founderName', e.target.value)}
                    placeholder="e.g., John Smith"
                  />
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
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">
                    Company Email
                  </label>
                  <Input
                    type="email"
                    value={formData.companyEmail}
                    onChange={(e) => handleInputChange('companyEmail', e.target.value)}
                    placeholder="e.g., founder@company.com"
                  />
                </div>
              </div>
            </div>

            {/* Investor Signature Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Investor Information (Optional)</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Investor Title
                  </label>
                  <Input
                    value={formData.investorTitle}
                    onChange={(e) => handleInputChange('investorTitle', e.target.value)}
                    placeholder="e.g., Managing Partner"
                  />
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
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">
                    Investor Email
                  </label>
                  <Input
                    type="email"
                    value={formData.investorEmail}
                    onChange={(e) => handleInputChange('investorEmail', e.target.value)}
                    placeholder="e.g., investor@fund.com"
                  />
                </div>
              </div>
            </div>

            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <h4 className="font-medium text-sm mb-2">About YC SAFE</h4>
                <p className="text-sm text-muted-foreground">
                  The Y Combinator Simple Agreement for Future Equity (SAFE) is a financing contract that provides the investor 
                  the right to future equity in the company similar to a warrant, except without determining a specific price per share at the time of the initial investment.
                </p>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button 
                onClick={handlePreview}
                disabled={isGeneratingPreview}
                variant="outline"
                className="flex-1"
                size="lg"
              >
                {isGeneratingPreview ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Eye className="w-4 h-4 mr-2" />
                )}
                {isGeneratingPreview ? 'Generating...' : 'Preview Template'}
              </Button>

              <Button 
                onClick={handleGenerate}
                disabled={!isFormValid()}
                className="flex-1"
                size="lg"
              >
                <FileText className="w-4 h-4 mr-2" />
                Generate Document
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}