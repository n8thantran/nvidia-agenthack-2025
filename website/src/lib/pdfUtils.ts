import { PDFDocument, PDFForm, PDFTextField, PDFCheckBox, PDFRadioGroup, PDFPage, rgb } from 'pdf-lib'

export interface SafeFormData {
  companyName: string
  companyState: string
  investorName: string
  purchaseAmount: string
  valuationCap: string
  discountRate: string
  date: string
  title: string
  founderName: string
  companyAddress: string
  companyEmail: string
  investorTitle: string
  investorAddress: string
  investorEmail: string
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
      let fieldsFound = false

      // Try to fill common field names that might exist in the YC SAFE PDF
      fieldsFound = await this.tryFillField('company_name', formData.companyName) || fieldsFound
      fieldsFound = await this.tryFillField('companyName', formData.companyName) || fieldsFound
      fieldsFound = await this.tryFillField('Company Name', formData.companyName) || fieldsFound
      fieldsFound = await this.tryFillField('company', formData.companyName) || fieldsFound
      
      fieldsFound = await this.tryFillField('investor_name', formData.investorName) || fieldsFound
      fieldsFound = await this.tryFillField('investorName', formData.investorName) || fieldsFound
      fieldsFound = await this.tryFillField('Investor Name', formData.investorName) || fieldsFound
      fieldsFound = await this.tryFillField('investor', formData.investorName) || fieldsFound
      
      fieldsFound = await this.tryFillField('purchase_amount', `$${parseFloat(formData.purchaseAmount).toLocaleString()}`) || fieldsFound
      fieldsFound = await this.tryFillField('purchaseAmount', `$${parseFloat(formData.purchaseAmount).toLocaleString()}`) || fieldsFound
      fieldsFound = await this.tryFillField('Purchase Amount', `$${parseFloat(formData.purchaseAmount).toLocaleString()}`) || fieldsFound
      fieldsFound = await this.tryFillField('amount', `$${parseFloat(formData.purchaseAmount).toLocaleString()}`) || fieldsFound
      
      fieldsFound = await this.tryFillField('valuation_cap', `$${parseFloat(formData.valuationCap).toLocaleString()}`) || fieldsFound
      fieldsFound = await this.tryFillField('valuationCap', `$${parseFloat(formData.valuationCap).toLocaleString()}`) || fieldsFound
      fieldsFound = await this.tryFillField('Valuation Cap', `$${parseFloat(formData.valuationCap).toLocaleString()}`) || fieldsFound
      fieldsFound = await this.tryFillField('cap', `$${parseFloat(formData.valuationCap).toLocaleString()}`) || fieldsFound
      
      fieldsFound = await this.tryFillField('state', formData.companyState) || fieldsFound
      fieldsFound = await this.tryFillField('State', formData.companyState) || fieldsFound
      fieldsFound = await this.tryFillField('incorporation_state', formData.companyState) || fieldsFound
      
      fieldsFound = await this.tryFillField('date', new Date(formData.date).toLocaleDateString()) || fieldsFound
      fieldsFound = await this.tryFillField('Date', new Date(formData.date).toLocaleDateString()) || fieldsFound
      fieldsFound = await this.tryFillField('signature_date', new Date(formData.date).toLocaleDateString()) || fieldsFound
      
      fieldsFound = await this.tryFillField('title', formData.title) || fieldsFound
      fieldsFound = await this.tryFillField('Title', formData.title) || fieldsFound
      fieldsFound = await this.tryFillField('signatory_title', formData.title) || fieldsFound

      // Always add text overlays as the PDF likely doesn't have fillable fields
      console.log('Adding text overlays for YC SAFE document')
      await this.addTextOverlays(formData)

      // Save and return the filled PDF
      const pdfBytes = await this.pdfDoc.save()
      console.log('PDF filled successfully with text overlays')
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
    
    // Define the exact replacements based on the YC SAFE template
    const replacements = [
      // Page 1 - Main document fields
      {
        search: '[COMPANY NAME]',
        replacement: formData.companyName,
        fontSize: 12,
        bold: true
      },
      {
        search: '[Investor Name]',
        replacement: formData.investorName,
        fontSize: 10,
        bold: false
      },
      {
        search: '$[_____________]',
        replacement: `$${parseFloat(formData.purchaseAmount).toLocaleString()}`,
        fontSize: 10,
        bold: false
      },
      {
        search: '[Date of Safe]',
        replacement: new Date(formData.date).toLocaleDateString(),
        fontSize: 10,
        bold: false
      },
      {
        search: '[Company Name]',
        replacement: formData.companyName,
        fontSize: 10,
        bold: false
      },
      {
        search: '[State of Incorporation]',
        replacement: formData.companyState,
        fontSize: 10,
        bold: false
      },
      {
        search: 'The "Post-Money Valuation Cap" is $[_____________]',
        replacement: `The "Post-Money Valuation Cap" is $${parseFloat(formData.valuationCap).toLocaleString()}`,
        fontSize: 10,
        bold: false
      }
    ]

    // Process each page
    for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
      const page = pages[pageIndex]
      await this.fillTextOnPage(page, replacements, formData)
    }

    console.log('Applied text overlays based on YC SAFE template structure')
  }

  private async fillTextOnPage(page: PDFPage, replacements: any[], formData: SafeFormData): Promise<void> {
    const { width, height } = page.getSize()
    
    // Based on standard YC SAFE layout, place text at estimated positions
    // These coordinates are based on common PDF layouts for YC SAFE documents
    
    // Header company name (centered, top of document)
    this.drawTextAtPosition(page, formData.companyName, {
      x: width / 2 - (formData.companyName.length * 6), // Center roughly
      y: height - 140,
      size: 14,
      bold: true
    })

    // Main content area - these positions are estimated based on typical YC SAFE layout
    const mainContentY = height - 220 // Start of main content
    
    // "THIS CERTIFIES THAT in exchange for the payment by [Investor Name]"
    this.drawTextAtPosition(page, formData.investorName, {
      x: 330, // After "payment by "
      y: mainContentY,
      size: 10
    })

    // Purchase amount in the same line: "$[_____________]"
    this.drawTextAtPosition(page, `$${parseFloat(formData.purchaseAmount).toLocaleString()}`, {
      x: 485, // After "of "
      y: mainContentY,
      size: 10
    })

    // Date field: "on or about [Date of Safe]"
    this.drawTextAtPosition(page, new Date(formData.date).toLocaleDateString(), {
      x: 140, // After "on or about "
      y: mainContentY - 15, // Next line
      size: 10
    })

    // Company name in body: "[Company Name], a [State of Incorporation] corporation"
    this.drawTextAtPosition(page, formData.companyName, {
      x: 195, // Start of line after some text
      y: mainContentY - 15,
      size: 10
    })

    // State of incorporation
    this.drawTextAtPosition(page, formData.companyState, {
      x: 275 + (formData.companyName.length * 6), // After company name
      y: mainContentY - 15,
      size: 10
    })

    // Post-Money Valuation Cap section
    this.drawTextAtPosition(page, `$${parseFloat(formData.valuationCap).toLocaleString()}`, {
      x: 245, // After "Post-Money Valuation Cap" is $"
      y: mainContentY - 50, // A few lines down
      size: 10
    })

    // Add signature section if this is the last page or signature page
    this.addSignatureSection(page, formData, height)
  }

  private addSignatureSection(page: PDFPage, formData: SafeFormData, height: number): void {
    // Signature section typically appears near the bottom of the last page
    const signatureY = 200 // From bottom of page
    
    // Company signature block
    this.drawTextAtPosition(page, '[COMPANY]', {
      x: 50,
      y: signatureY,
      size: 10,
      bold: true
    })

    // Replace [COMPANY] with actual company name
    this.drawTextAtPosition(page, formData.companyName, {
      x: 120,
      y: signatureY,
      size: 10,
      bold: true
    })

    // By: line
    this.drawTextAtPosition(page, 'By:', {
      x: 50,
      y: signatureY - 30,
      size: 10
    })

    // Founder name
    if (formData.founderName) {
      this.drawTextAtPosition(page, formData.founderName, {
        x: 100,
        y: signatureY - 30,
        size: 10
      })
    }

    // Name: line
    this.drawTextAtPosition(page, 'Name:', {
      x: 50,
      y: signatureY - 50,
      size: 10
    })

    // Title: line
    this.drawTextAtPosition(page, 'Title:', {
      x: 50,
      y: signatureY - 70,
      size: 10
    })

    this.drawTextAtPosition(page, formData.title, {
      x: 100,
      y: signatureY - 70,
      size: 10
    })

    // Address: line
    this.drawTextAtPosition(page, 'Address:', {
      x: 50,
      y: signatureY - 90,
      size: 10
    })

    if (formData.companyAddress) {
      this.drawTextAtPosition(page, formData.companyAddress, {
        x: 120,
        y: signatureY - 90,
        size: 10
      })
    }

    // Email: line
    this.drawTextAtPosition(page, 'Email:', {
      x: 50,
      y: signatureY - 110,
      size: 10
    })

    if (formData.companyEmail) {
      this.drawTextAtPosition(page, formData.companyEmail, {
        x: 100,
        y: signatureY - 110,
        size: 10
      })
    }

    // INVESTOR section
    this.drawTextAtPosition(page, 'INVESTOR:', {
      x: 50,
      y: signatureY - 150,
      size: 10,
      bold: true
    })

    // Investor By: line
    this.drawTextAtPosition(page, 'By:', {
      x: 50,
      y: signatureY - 180,
      size: 10
    })

    // Investor Name
    this.drawTextAtPosition(page, 'Name:', {
      x: 50,
      y: signatureY - 200,
      size: 10
    })

    this.drawTextAtPosition(page, formData.investorName, {
      x: 100,
      y: signatureY - 200,
      size: 10
    })

    // Investor Title
    this.drawTextAtPosition(page, 'Title:', {
      x: 50,
      y: signatureY - 220,
      size: 10
    })

    if (formData.investorTitle) {
      this.drawTextAtPosition(page, formData.investorTitle, {
        x: 100,
        y: signatureY - 220,
        size: 10
      })
    }

    // Investor Address
    this.drawTextAtPosition(page, 'Address:', {
      x: 50,
      y: signatureY - 240,
      size: 10
    })

    if (formData.investorAddress) {
      this.drawTextAtPosition(page, formData.investorAddress, {
        x: 120,
        y: signatureY - 240,
        size: 10
      })
    }

    // Investor Email
    this.drawTextAtPosition(page, 'Email:', {
      x: 50,
      y: signatureY - 260,
      size: 10
    })

    if (formData.investorEmail) {
      this.drawTextAtPosition(page, formData.investorEmail, {
        x: 100,
        y: signatureY - 260,
        size: 10
      })
    }
  }

  private drawTextAtPosition(page: PDFPage, text: string, options: {
    x: number
    y: number
    size: number
    bold?: boolean
    color?: any
  }): void {
    try {
      page.drawText(text, {
        x: options.x,
        y: options.y,
        size: options.size,
        color: options.color || rgb(0, 0, 0) // Default to black
      })
    } catch (error) {
      console.warn(`Failed to draw text "${text}" at position (${options.x}, ${options.y}):`, error)
    }
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