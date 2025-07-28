import { PDFDocument, PDFPage, rgb, StandardFonts } from 'pdf-lib'

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

export class YCSafePDFGenerator {
  private pdfDoc: PDFDocument | null = null
  private font: any = null
  private boldFont: any = null
  private pageWidth: number = 612 // Standard 8.5x11 inch page
  private pageHeight: number = 792
  private margin: number = 72 // 1 inch margins
  private lineHeight: number = 14

  // Generate a preview PDF with default placeholder data
  async createPreviewDocument(): Promise<Uint8Array> {
    const defaultData: SafeFormData = {
      companyName: '[COMPANY NAME]',
      companyState: '[STATE OF INCORPORATION]',
      investorName: '[INVESTOR NAME]',
      purchaseAmount: '100000',
      valuationCap: '10000000',
      discountRate: '20',
      date: new Date().toISOString().split('T')[0],
      title: '[TITLE]',
      founderName: '[FOUNDER NAME]',
      companyAddress: '[COMPANY ADDRESS]',
      companyEmail: '[COMPANY EMAIL]',
      investorTitle: '[INVESTOR TITLE]',
      investorAddress: '[INVESTOR ADDRESS]',
      investorEmail: '[INVESTOR EMAIL]'
    }

    return await this.createDocument(defaultData)
  }

  // Optimized version for live preview - only first page for better performance
  async createLivePreviewDocument(formData: SafeFormData): Promise<Uint8Array> {
    // Create new PDF document
    this.pdfDoc = await PDFDocument.create()
    
    // Embed fonts
    this.font = await this.pdfDoc.embedFont(StandardFonts.TimesRoman)
    this.boldFont = await this.pdfDoc.embedFont(StandardFonts.TimesRomanBold)

    // Only create the first page for live preview (faster)
    await this.createHeaderPage(formData)

    // Save and return PDF
    const pdfBytes = await this.pdfDoc.save()
    return pdfBytes
  }

  async createDocument(formData: SafeFormData): Promise<Uint8Array> {
    // Create new PDF document
    this.pdfDoc = await PDFDocument.create()
    
    // Embed fonts
    this.font = await this.pdfDoc.embedFont(StandardFonts.TimesRoman)
    this.boldFont = await this.pdfDoc.embedFont(StandardFonts.TimesRomanBold)

    // Create pages
    await this.createHeaderPage(formData)
    await this.createMainContentPage(formData)
    await this.createDefinitionsPage(formData)
    await this.createSignaturePage(formData)

    // Save and return PDF
    const pdfBytes = await this.pdfDoc.save()
    return pdfBytes
  }

  private async createHeaderPage(formData: SafeFormData): Promise<void> {
    if (!this.pdfDoc) return

    const page = this.pdfDoc.addPage([this.pageWidth, this.pageHeight])
    let yPosition = this.pageHeight - this.margin

    // Version and header info
    this.drawText(page, 'Version 1.2', 50, yPosition, 10)
    yPosition -= 20
    this.drawText(page, 'POST-MONEY VALUATION CAP', 50, yPosition, 10, this.boldFont)
    yPosition -= 30

    // Copyright notice
    const copyrightText = '© 2023 Y Combinator Management, LLC. This form is made available under a Creative Commons Attribution-NoDerivatives 4.0 License (International): https://creativecommons.org/licenses/by-nd/4.0/legalcode. You may modify this form so you can use it in transactions, but please do not publicly disseminate a modified version of the form without asking us first.'
    yPosition = this.drawWrappedText(page, copyrightText, this.margin, yPosition, 9, this.pageWidth - 2 * this.margin)
    yPosition -= 30

    // Securities disclaimer
    const disclaimerText = 'THIS INSTRUMENT AND ANY SECURITIES ISSUABLE PURSUANT HERETO HAVE NOT BEEN REGISTERED UNDER THE SECURITIES ACT OF 1933, AS AMENDED (THE "SECURITIES ACT"), OR UNDER THE SECURITIES LAWS OF CERTAIN STATES. THESE SECURITIES MAY NOT BE OFFERED, SOLD OR OTHERWISE TRANSFERRED, PLEDGED OR HYPOTHECATED EXCEPT AS PERMITTED IN THIS SAFE AND UNDER THE ACT AND APPLICABLE STATE SECURITIES LAWS PURSUANT TO AN EFFECTIVE REGISTRATION STATEMENT OR AN EXEMPTION THEREFROM.'
    yPosition = this.drawWrappedText(page, disclaimerText, this.margin, yPosition, 9, this.pageWidth - 2 * this.margin)
    yPosition -= 50

    // Company Name (centered)
    const companyNameWidth = this.boldFont.widthOfTextAtSize(formData.companyName, 16)
    const centerX = (this.pageWidth - companyNameWidth) / 2
    this.drawText(page, formData.companyName, centerX, yPosition, 16, this.boldFont)
    yPosition -= 40

    // SAFE title (centered)
    this.drawText(page, 'SAFE', this.pageWidth / 2 - 30, yPosition, 16, this.boldFont)
    yPosition -= 20
    this.drawText(page, '(Simple Agreement for Future Equity)', this.pageWidth / 2 - 120, yPosition, 12)
    yPosition -= 40

    // Main paragraph
    const mainParagraph = `THIS CERTIFIES THAT in exchange for the payment by ${formData.investorName} (the "Investor") of $${parseFloat(formData.purchaseAmount).toLocaleString()} (the "Purchase Amount") on or about ${new Date(formData.date).toLocaleDateString()}, ${formData.companyName}, a ${formData.companyState} corporation (the "Company"), issues to the Investor the right to certain shares of the Company's Capital Stock, subject to the terms described below.`
    yPosition = this.drawWrappedText(page, mainParagraph, this.margin, yPosition, 11, this.pageWidth - 2 * this.margin)
    yPosition -= 30

    // Form disclaimer
    const formDisclaimer = `This Safe is one of the forms available at http://ycombinator.com/documents and the Company and the Investor agree that neither one has modified the form, except to fill in blanks and bracketed terms.`
    yPosition = this.drawWrappedText(page, formDisclaimer, this.margin, yPosition, 11, this.pageWidth - 2 * this.margin)
    yPosition -= 30

    // Valuation cap
    const valuationCapText = `The "Post-Money Valuation Cap" is $${parseFloat(formData.valuationCap).toLocaleString()}. See Section 2 for certain additional defined terms.`
    yPosition = this.drawWrappedText(page, valuationCapText, this.margin, yPosition, 11, this.pageWidth - 2 * this.margin)
  }

  private async createMainContentPage(formData: SafeFormData): Promise<void> {
    if (!this.pdfDoc) return

    const page = this.pdfDoc.addPage([this.pageWidth, this.pageHeight])
    let yPosition = this.pageHeight - this.margin

    // Section 1: Events
    this.drawText(page, '1. Events', this.margin, yPosition, 12, this.boldFont)
    yPosition -= 30

    // (a) Equity Financing
    this.drawText(page, '(a)', this.margin + 20, yPosition, 11, this.boldFont)
    this.drawText(page, 'Equity Financing.', this.margin + 40, yPosition, 11, this.boldFont)
    yPosition -= 20

    const equityFinancingText = 'If there is an Equity Financing before the termination of this Safe, on the initial closing of such Equity Financing, this Safe will automatically convert into the greater of: (1) the number of shares of Standard Preferred Stock equal to the Purchase Amount divided by the lowest price per share of the Standard Preferred Stock; or (2) the number of shares of Safe Preferred Stock equal to the Purchase Amount divided by the Safe Price.'
    yPosition = this.drawWrappedText(page, equityFinancingText, this.margin + 40, yPosition, 11, this.pageWidth - 2 * this.margin - 40)
    yPosition -= 20

    const equityFinancingText2 = 'In connection with the automatic conversion of this Safe into shares of Standard Preferred Stock or Safe Preferred Stock, the Investor will execute and deliver to the Company all of the transaction documents related to the Equity Financing; provided, that such documents (i) are the same documents to be entered into with the purchasers of Standard Preferred Stock, with appropriate variations for the Safe Preferred Stock if applicable, and (ii) have customary exceptions to any drag-along applicable to the Investor, including (without limitation) limited representations, warranties, liability and indemnification obligations for the Investor.'
    yPosition = this.drawWrappedText(page, equityFinancingText2, this.margin + 40, yPosition, 11, this.pageWidth - 2 * this.margin - 40)
    yPosition -= 30

    // (b) Liquidity Event
    this.drawText(page, '(b)', this.margin + 20, yPosition, 11, this.boldFont)
    this.drawText(page, 'Liquidity Event.', this.margin + 40, yPosition, 11, this.boldFont)
    yPosition -= 20

    const liquidityEventText = 'If there is a Liquidity Event before the termination of this Safe, the Investor will automatically be entitled (subject to the liquidation priority set forth in Section 1(d) below) to receive a portion of Proceeds, due and payable to the Investor immediately prior to, or concurrent with, the consummation of such Liquidity Event, equal to the greater of (i) the Purchase Amount (the "Cash-Out Amount") or (ii) the amount payable on the number of shares of Common Stock equal to the Purchase Amount divided by the Liquidity Price (the "Conversion Amount"). If any of the Company\'s securityholders are given a choice as to the form and amount of Proceeds to be received in a Liquidity Event, the Investor will be given the same choice, provided that the Investor may not choose to receive a form of consideration that the Investor would be ineligible to receive as a result of the Investor\'s failure to satisfy any requirement or limitation generally applicable to the Company\'s securityholders, or under any applicable laws.'
    yPosition = this.drawWrappedText(page, liquidityEventText, this.margin + 40, yPosition, 11, this.pageWidth - 2 * this.margin - 40)
    yPosition -= 20

    const taxReorgText = 'Notwithstanding the foregoing, in connection with a Change of Control intended to qualify as a tax-free reorganization, the Company may reduce the cash portion of Proceeds payable to the Investor by the amount determined by its board of directors in good faith for such Change of Control to qualify as a tax-free reorganization for U.S. federal income tax purposes, provided that such reduction (A) does not reduce the total Proceeds payable to such Investor and (B) is applied in the same manner and on a pro rata basis to all securityholders who have equal priority to the Investor under Section 1(d).'
    yPosition = this.drawWrappedText(page, taxReorgText, this.margin + 40, yPosition, 11, this.pageWidth - 2 * this.margin - 40)
    yPosition -= 30

    // (c) Dissolution Event
    this.drawText(page, '(c)', this.margin + 20, yPosition, 11, this.boldFont)
    this.drawText(page, 'Dissolution Event.', this.margin + 40, yPosition, 11, this.boldFont)
    yPosition -= 20

    const dissolutionText = 'If there is a Dissolution Event before the termination of this Safe, the Investor will automatically be entitled (subject to the liquidation priority set forth in Section 1(d) below) to receive a portion of Proceeds equal to the Cash-Out Amount, due and payable to the Investor immediately prior to the consummation of the Dissolution Event.'
    yPosition = this.drawWrappedText(page, dissolutionText, this.margin + 40, yPosition, 11, this.pageWidth - 2 * this.margin - 40)
  }

  private async createDefinitionsPage(formData: SafeFormData): Promise<void> {
    if (!this.pdfDoc) return

    const page = this.pdfDoc.addPage([this.pageWidth, this.pageHeight])
    let yPosition = this.pageHeight - this.margin

    // Section 2: Definitions
    this.drawText(page, '2. Definitions', this.margin, yPosition, 12, this.boldFont)
    yPosition -= 30

    // Add definitions content...
    const definitions = [
      {
        term: '"Capital Stock"',
        definition: 'means the capital stock of the Company, including, without limitation, the "Common Stock" and the "Preferred Stock."'
      },
      {
        term: '"Change of Control"',
        definition: 'means (i) a transaction or series of related transactions in which any "person" or "group" (within the meaning of Section 13(d) and 14(d) of the Securities Exchange Act of 1934, as amended), becomes the "beneficial owner" (as defined in Rule 13d-3 under the Securities Exchange Act of 1934, as amended), directly or indirectly, of more than 50% of the outstanding voting securities of the Company having the right to vote for the election of members of the Company\'s board of directors, (ii) any reorganization, merger or consolidation of the Company, other than a transaction or series of related transactions in which the holders of the voting securities of the Company outstanding immediately prior to such transaction or series of related transactions retain, immediately after such transaction or series of related transactions, at least a majority of the total voting power represented by the outstanding voting securities of the Company or such other surviving or resulting entity or (iii) a sale, lease or other disposition of all or substantially all of the assets of the Company.'
      }
      // Add more definitions as needed
    ]

    for (const def of definitions) {
      this.drawText(page, def.term, this.margin, yPosition, 11, this.boldFont)
      yPosition -= 20
      yPosition = this.drawWrappedText(page, def.definition, this.margin + 20, yPosition, 11, this.pageWidth - 2 * this.margin - 20)
      yPosition -= 20
    }
  }

  private async createSignaturePage(formData: SafeFormData): Promise<void> {
    if (!this.pdfDoc) return

    const page = this.pdfDoc.addPage([this.pageWidth, this.pageHeight])
    let yPosition = this.pageHeight - this.margin

    // IN WITNESS WHEREOF clause
    const witnessText = 'IN WITNESS WHEREOF, the undersigned have caused this Safe to be duly executed and delivered.'
    yPosition = this.drawWrappedText(page, witnessText, this.margin, yPosition, 11, this.pageWidth - 2 * this.margin)
    yPosition -= 60

    // Company signature block
    this.drawText(page, formData.companyName.toUpperCase(), this.margin, yPosition, 12, this.boldFont)
    yPosition -= 40

    this.drawText(page, 'By:', this.margin, yPosition, 11)
    this.drawText(page, '_________________________', this.margin + 50, yPosition, 11)
    yPosition -= 25

    this.drawText(page, 'Name:', this.margin, yPosition, 11)
    this.drawText(page, formData.founderName || '[Founder Name]', this.margin + 50, yPosition, 11)
    yPosition -= 25

    this.drawText(page, 'Title:', this.margin, yPosition, 11)
    this.drawText(page, formData.title, this.margin + 50, yPosition, 11)
    yPosition -= 25

    this.drawText(page, 'Date:', this.margin, yPosition, 11)
    this.drawText(page, new Date(formData.date).toLocaleDateString(), this.margin + 50, yPosition, 11)
    yPosition -= 25

    if (formData.companyAddress) {
      this.drawText(page, 'Address:', this.margin, yPosition, 11)
      this.drawText(page, formData.companyAddress, this.margin + 60, yPosition, 11)
      yPosition -= 25
    }

    if (formData.companyEmail) {
      this.drawText(page, 'Email:', this.margin, yPosition, 11)
      this.drawText(page, formData.companyEmail, this.margin + 50, yPosition, 11)
      yPosition -= 40
    } else {
      yPosition -= 40
    }

    // Investor signature block
    this.drawText(page, 'INVESTOR:', this.margin, yPosition, 12, this.boldFont)
    yPosition -= 40

    this.drawText(page, 'By:', this.margin, yPosition, 11)
    this.drawText(page, '_________________________', this.margin + 50, yPosition, 11)
    yPosition -= 25

    this.drawText(page, 'Name:', this.margin, yPosition, 11)
    this.drawText(page, formData.investorName, this.margin + 50, yPosition, 11)
    yPosition -= 25

    if (formData.investorTitle) {
      this.drawText(page, 'Title:', this.margin, yPosition, 11)
      this.drawText(page, formData.investorTitle, this.margin + 50, yPosition, 11)
      yPosition -= 25
    }

    this.drawText(page, 'Date:', this.margin, yPosition, 11)
    this.drawText(page, new Date(formData.date).toLocaleDateString(), this.margin + 50, yPosition, 11)
    yPosition -= 25

    if (formData.investorAddress) {
      this.drawText(page, 'Address:', this.margin, yPosition, 11)
      this.drawText(page, formData.investorAddress, this.margin + 60, yPosition, 11)
      yPosition -= 25
    }

    if (formData.investorEmail) {
      this.drawText(page, 'Email:', this.margin, yPosition, 11)
      this.drawText(page, formData.investorEmail, this.margin + 50, yPosition, 11)
    }
  }

  private drawText(page: PDFPage, text: string, x: number, y: number, size: number, font?: any): void {
    page.drawText(text, {
      x,
      y,
      size,
      font: font || this.font,
      color: rgb(0, 0, 0)
    })
  }

  private drawWrappedText(page: PDFPage, text: string, x: number, y: number, size: number, maxWidth: number, font?: any): number {
    const usedFont = font || this.font
    const words = text.split(' ')
    let line = ''
    let currentY = y

    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' '
      const testWidth = usedFont.widthOfTextAtSize(testLine, size)

      if (testWidth > maxWidth && i > 0) {
        this.drawText(page, line.trim(), x, currentY, size, usedFont)
        line = words[i] + ' '
        currentY -= this.lineHeight
      } else {
        line = testLine
      }
    }

    if (line.trim()) {
      this.drawText(page, line.trim(), x, currentY, size, usedFont)
      currentY -= this.lineHeight
    }

    return currentY
  }
}

// Utility function to download the generated PDF
export function downloadGeneratedPDF(pdfBytes: Uint8Array, filename: string): void {
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

// Generate and download a preview PDF
export async function generatePreviewPDF(): Promise<void> {
  try {
    const generator = new YCSafePDFGenerator()
    const pdfBytes = await generator.createPreviewDocument()
    
    const filename = `YC-SAFE-Preview-${new Date().toISOString().split('T')[0]}.pdf`
    downloadGeneratedPDF(pdfBytes, filename)
    
    console.log('Preview PDF generated and downloaded successfully')
  } catch (error) {
    console.error('Error generating preview PDF:', error)
    throw error
  }
}