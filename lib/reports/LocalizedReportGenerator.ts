import { jsPDF } from 'jspdf'
import { formatCurrency, formatPercentage, formatDate, formatNumber } from '@/lib/utils/formatters'
import { PortfolioItem } from '@/lib/types/portfolio'

interface ReportData {
  portfolio: {
    items: PortfolioItem[]
    totalValue: number
    totalProfitLoss: number
    totalProfitLossPercent: number
  }
  generatedAt: Date
  userId?: string
}

interface ReportOptions {
  locale: string
  currency: string
  bilingual?: boolean
  includeCharts?: boolean
}

export class LocalizedReportGenerator {
  private pdf: jsPDF
  private yPosition: number = 20
  private pageHeight: number = 280
  private margin: number = 20
  
  constructor() {
    this.pdf = new jsPDF()
  }

  /**
   * Generate a PDF portfolio report in the user's language
   */
  async generatePDF(data: ReportData, options: ReportOptions): Promise<Blob> {
    const { locale, currency, bilingual = false } = options
    
    // Reset position
    this.yPosition = 20
    
    // Add header
    this.addHeader(locale, bilingual)
    
    // Add portfolio summary
    this.addPortfolioSummary(data.portfolio, locale, currency, bilingual)
    
    // Add holdings details
    this.addHoldingsDetails(data.portfolio.items, locale, currency, bilingual)
    
    // Add footer
    this.addFooter(data.generatedAt, locale)
    
    // Return as blob
    return this.pdf.output('blob')
  }

  /**
   * Send a localized email report
   */
  async emailReport(userId: string, locale: string, reportBlob: Blob): Promise<void> {
    // In a real implementation, this would send an email via your backend
    const formData = new FormData()
    formData.append('userId', userId)
    formData.append('locale', locale)
    formData.append('report', reportBlob, `portfolio-report-${formatDate(new Date(), locale)}.pdf`)
    
    try {
      const response = await fetch('/api/reports/email', {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        throw new Error('Failed to send email report')
      }
    } catch (error) {
      console.error('Error sending email report:', error)
      throw error
    }
  }

  private addHeader(locale: string, bilingual: boolean) {
    // Logo placeholder
    this.pdf.setFontSize(24)
    this.pdf.setFont('helvetica', 'bold')
    this.pdf.text('QuoantB', this.margin, this.yPosition)
    
    this.yPosition += 10
    
    // Title
    this.pdf.setFontSize(18)
    const title = locale === 'ar' ? 'تقرير المحفظة الاستثمارية' : 'Portfolio Report'
    this.pdf.text(title, this.margin, this.yPosition)
    
    if (bilingual && locale === 'ar') {
      this.yPosition += 7
      this.pdf.setFontSize(14)
      this.pdf.setFont('helvetica', 'normal')
      this.pdf.text('Portfolio Report', this.margin, this.yPosition)
    }
    
    this.yPosition += 15
  }

  private addPortfolioSummary(
    portfolio: ReportData['portfolio'],
    locale: string,
    currency: string,
    bilingual: boolean
  ) {
    // Summary box
    this.pdf.setDrawColor(200, 200, 200)
    this.pdf.rect(this.margin, this.yPosition, 170, 40, 'S')
    
    const summaryY = this.yPosition + 10
    
    // Total Value
    this.pdf.setFontSize(12)
    this.pdf.setFont('helvetica', 'bold')
    const totalValueLabel = locale === 'ar' ? 'القيمة الإجمالية:' : 'Total Value:'
    this.pdf.text(totalValueLabel, this.margin + 5, summaryY)
    
    this.pdf.setFont('helvetica', 'normal')
    const totalValue = formatCurrency(portfolio.totalValue, currency, locale === 'ar')
    this.pdf.text(totalValue, this.margin + 60, summaryY)
    
    // Total Return
    const returnY = summaryY + 10
    this.pdf.setFont('helvetica', 'bold')
    const totalReturnLabel = locale === 'ar' ? 'العائد الإجمالي:' : 'Total Return:'
    this.pdf.text(totalReturnLabel, this.margin + 5, returnY)
    
    this.pdf.setFont('helvetica', 'normal')
    const returnColor = portfolio.totalProfitLoss >= 0 ? [0, 128, 0] : [255, 0, 0]
    this.pdf.setTextColor(...returnColor)
    const totalReturn = `${formatCurrency(portfolio.totalProfitLoss, currency, locale === 'ar')} (${formatPercentage(portfolio.totalProfitLossPercent, locale === 'ar')})`
    this.pdf.text(totalReturn, this.margin + 60, returnY)
    this.pdf.setTextColor(0, 0, 0)
    
    // Holdings Count
    const holdingsY = returnY + 10
    this.pdf.setFont('helvetica', 'bold')
    const holdingsLabel = locale === 'ar' ? 'عدد الأسهم:' : 'Holdings:'
    this.pdf.text(holdingsLabel, this.margin + 5, holdingsY)
    
    this.pdf.setFont('helvetica', 'normal')
    this.pdf.text(portfolio.items.length.toString(), this.margin + 60, holdingsY)
    
    this.yPosition += 50
  }

  private addHoldingsDetails(
    items: PortfolioItem[],
    locale: string,
    currency: string,
    bilingual: boolean
  ) {
    // Section title
    this.pdf.setFontSize(16)
    this.pdf.setFont('helvetica', 'bold')
    const holdingsTitle = locale === 'ar' ? 'تفاصيل المحفظة' : 'Portfolio Holdings'
    this.pdf.text(holdingsTitle, this.margin, this.yPosition)
    
    this.yPosition += 10
    
    // Table headers
    this.pdf.setFontSize(10)
    this.pdf.setFont('helvetica', 'bold')
    
    const headers = locale === 'ar' 
      ? ['الرمز', 'الكمية', 'السعر', 'القيمة', 'الربح/الخسارة']
      : ['Symbol', 'Qty', 'Price', 'Value', 'P&L']
    
    const columnWidths = [30, 25, 30, 40, 45]
    let xPos = this.margin
    
    headers.forEach((header, index) => {
      this.pdf.text(header, xPos, this.yPosition)
      xPos += columnWidths[index]
    })
    
    this.yPosition += 5
    this.pdf.line(this.margin, this.yPosition, 190, this.yPosition)
    this.yPosition += 5
    
    // Table rows
    this.pdf.setFont('helvetica', 'normal')
    
    items.forEach((item) => {
      if (this.yPosition > this.pageHeight - 30) {
        this.pdf.addPage()
        this.yPosition = 20
      }
      
      xPos = this.margin
      
      // Symbol
      this.pdf.text(item.symbol, xPos, this.yPosition)
      xPos += columnWidths[0]
      
      // Quantity
      this.pdf.text(formatNumber(item.quantity, locale), xPos, this.yPosition)
      xPos += columnWidths[1]
      
      // Current Price
      this.pdf.text(formatCurrency(item.currentPrice, currency, locale === 'ar'), xPos, this.yPosition)
      xPos += columnWidths[2]
      
      // Total Value
      const totalValue = item.quantity * item.currentPrice
      this.pdf.text(formatCurrency(totalValue, currency, locale === 'ar'), xPos, this.yPosition)
      xPos += columnWidths[3]
      
      // P&L
      const profitLoss = item.profitLoss || 0
      const profitLossPercent = item.profitLossPercent || 0
      const plColor = profitLoss >= 0 ? [0, 128, 0] : [255, 0, 0]
      this.pdf.setTextColor(...plColor)
      this.pdf.text(
        `${formatCurrency(profitLoss, currency, locale === 'ar')} (${formatPercentage(profitLossPercent, locale === 'ar')})`,
        xPos,
        this.yPosition
      )
      this.pdf.setTextColor(0, 0, 0)
      
      this.yPosition += 7
    })
  }

  private addFooter(generatedAt: Date, locale: string) {
    // Add page numbers
    const pageCount = this.pdf.internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      this.pdf.setPage(i)
      this.pdf.setFontSize(10)
      this.pdf.setFont('helvetica', 'normal')
      
      // Page number
      const pageText = locale === 'ar' ? `صفحة ${i} من ${pageCount}` : `Page ${i} of ${pageCount}`
      this.pdf.text(pageText, 105, 285, { align: 'center' })
      
      // Generation date
      const dateText = locale === 'ar' 
        ? `تم الإنشاء: ${formatDate(generatedAt, locale)}`
        : `Generated: ${formatDate(generatedAt, locale)}`
      this.pdf.text(dateText, this.margin, 285)
      
      // Disclaimer
      this.pdf.setFontSize(8)
      const disclaimer = locale === 'ar'
        ? 'هذا التقرير لأغراض إعلامية فقط وليس نصيحة مالية.'
        : 'This report is for informational purposes only and is not financial advice.'
      this.pdf.text(disclaimer, 105, 290, { align: 'center' })
    }
  }

  /**
   * Generate a CSV export of portfolio data
   */
  generateCSV(data: ReportData, locale: string): string {
    const headers = locale === 'ar'
      ? ['الرمز', 'الكمية', 'سعر الشراء', 'السعر الحالي', 'القيمة', 'الربح/الخسارة', 'النسبة المئوية']
      : ['Symbol', 'Quantity', 'Buy Price', 'Current Price', 'Value', 'P&L', 'Percentage']
    
    const rows = data.portfolio.items.map(item => [
      item.symbol,
      item.quantity.toString(),
      item.averageCost.toFixed(2),
      item.currentPrice.toFixed(2),
      (item.quantity * item.currentPrice).toFixed(2),
      (item.profitLoss || 0).toFixed(2),
      `${(item.profitLossPercent || 0).toFixed(2)}%`
    ])
    
    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')
    
    return csv
  }
}