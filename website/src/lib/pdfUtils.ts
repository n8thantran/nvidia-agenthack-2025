import { PDFDocument, PDFForm, PDFTextField, PDFCheckBox, PDFRadioGroup } from 'pdf-lib'

export interface SafeFormData {
  companyName: string
  companyState: string
  investorName: string
  purchaseAmount: string
  valuationCap: string
  discountRate: string
  date: string
  title: string
}

export class PDFFormFiller {
  private pdfDoc: PDFDocument | null = null
  private form: PDFForm | null = null

  async loadPDF(pdfUrl: string): Promise<void> {
    try {
      const response = await fetch(pdfUrl)
      if (!response.ok) {
        throw new Error(`Failed to fetch PDF: ${response.statusText}`)
      }
      
      const pdfBytes = await response.arrayBuffer()
      this.pdfDoc = await PDFDocument.load(pdfBytes)
      this.form = this.pdfDoc.getForm()
      
      console.log('PDF loaded successfully')
      this.logFormFields()
    } catch (error) {
      console.error('Error loading PDF:', error)
      throw error
    }
  }

  private logFormFields(): void {
    if (!this.form) return

    const fields = this.form.getFields()
    console.log(`Found ${fields.length} form fields:`)
    
    fields.forEach((field, index) => {
      const fieldName = field.getName()
      const fieldType = field.constructor.name
      console.log(`${index + 1}. ${fieldName} (${fieldType})`)
    })
  }

  async fillForm(formData: SafeFormData): Promise<Uint8Array> {
    if (!this.form || !this.pdfDoc) {
      throw new Error('PDF not loaded. Call loadPDF first.')
    }

    try {
      // Try to fill common field names that might exist in the YC SAFE PDF
      await this.tryFillField('company_name', formData.companyName)
      await this.tryFillField('companyName', formData.companyName)
      await this.tryFillField('Company Name', formData.companyName)
      await this.tryFillField('company', formData.companyName)
      
      await this.tryFillField('investor_name', formData.investorName)
      await this.tryFillField('investorName', formData.investorName)
      await this.tryFillField('Investor Name', formData.investorName)
      await this.tryFillField('investor', formData.investorName)
      
      await this.tryFillField('purchase_amount', `$${parseFloat(formData.purchaseAmount).toLocaleString()}`)
      await this.tryFillField('purchaseAmount', `$${parseFloat(formData.purchaseAmount).toLocaleString()}`)
      await this.tryFillField('Purchase Amount', `$${parseFloat(formData.purchaseAmount).toLocaleString()}`)
      await this.tryFillField('amount', `$${parseFloat(formData.purchaseAmount).toLocaleString()}`)
      
      await this.tryFillField('valuation_cap', `$${parseFloat(formData.valuationCap).toLocaleString()}`)
      await this.tryFillField('valuationCap', `$${parseFloat(formData.valuationCap).toLocaleString()}`)
      await this.tryFillField('Valuation Cap', `$${parseFloat(formData.valuationCap).toLocaleString()}`)
      await this.tryFillField('cap', `$${parseFloat(formData.valuationCap).toLocaleString()}`)
      
      await this.tryFillField('state', formData.companyState)
      await this.tryFillField('State', formData.companyState)
      await this.tryFillField('incorporation_state', formData.companyState)
      
      await this.tryFillField('date', new Date(formData.date).toLocaleDateString())
      await this.tryFillField('Date', new Date(formData.date).toLocaleDateString())
      await this.tryFillField('signature_date', new Date(formData.date).toLocaleDateString())
      
      await this.tryFillField('title', formData.title)
      await this.tryFillField('Title', formData.title)
      await this.tryFillField('signatory_title', formData.title)

      // If no fillable fields found, we'll add text overlays
      const fields = this.form.getFields()
      if (fields.length === 0) {
        console.log('No form fields found, adding text overlays')
        await this.addTextOverlays(formData)
      }

      // Save and return the filled PDF
      const pdfBytes = await this.pdfDoc.save()
      console.log('PDF filled successfully')
      return pdfBytes
      
    } catch (error) {
      console.error('Error filling PDF form:', error)
      throw error
    }
  }

  private async tryFillField(fieldName: string, value: string): Promise<boolean> {
    if (!this.form) return false

    try {
      // Try as text field first
      const textField = this.form.getTextField(fieldName)
      textField.setText(value)
      console.log(`Filled text field: ${fieldName} = ${value}`)
      return true
    } catch (textError) {
      try {
        // Try as checkbox if it's a boolean-like value
        if (value.toLowerCase() === 'true' || value.toLowerCase() === 'checked') {
          const checkbox = this.form.getCheckBox(fieldName)
          checkbox.check()
          console.log(`Checked checkbox: ${fieldName}`)
          return true
        }
      } catch (checkboxError) {
        // Field doesn't exist or isn't accessible
        return false
      }
    }
    return false
  }

  private async addTextOverlays(formData: SafeFormData): Promise<void> {
    if (!this.pdfDoc) return

    const pages = this.pdfDoc.getPages()
    const firstPage = pages[0]
    const { width, height } = firstPage.getSize()

    // These coordinates would need to be adjusted based on the actual PDF layout
    // For now, we'll place text at common locations where SAFE info typically appears
    const fontSize = 10
    
    // Company name (usually near the top)
    firstPage.drawText(formData.companyName, {
      x: 100,
      y: height - 150,
      size: fontSize,
    })

    // Investor name
    firstPage.drawText(formData.investorName, {
      x: 100,
      y: height - 200,
      size: fontSize,
    })

    // Purchase amount
    firstPage.drawText(`$${parseFloat(formData.purchaseAmount).toLocaleString()}`, {
      x: 100,
      y: height - 250,
      size: fontSize,
    })

    // Valuation cap
    firstPage.drawText(`$${parseFloat(formData.valuationCap).toLocaleString()}`, {
      x: 100,
      y: height - 300,
      size: fontSize,
    })

    console.log('Added text overlays to PDF')
  }

  getFormFieldNames(): string[] {
    if (!this.form) return []
    
    return this.form.getFields().map(field => field.getName())
  }

  async inspectPDF(): Promise<{
    fieldCount: number
    fieldNames: string[]
    hasForm: boolean
  }> {
    if (!this.form || !this.pdfDoc) {
      throw new Error('PDF not loaded')
    }

    const fields = this.form.getFields()
    const fieldNames = fields.map(field => field.getName())

    return {
      fieldCount: fields.length,
      fieldNames,
      hasForm: fields.length > 0
    }
  }
}

// Utility function to download the filled PDF
export function downloadPDF(pdfBytes: Uint8Array, filename: string): void {
  const blob = new Blob([pdfBytes], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  URL.revokeObjectURL(url)
}