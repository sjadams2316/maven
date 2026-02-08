import { NextRequest, NextResponse } from 'next/server';
import { jsPDF } from 'jspdf';

interface SSScenario {
  claimingAge: number;
  monthlyBenefit: number;
  annualBenefit: number;
  percentOfPIA: number;
  cumulativeByAge80: number;
  cumulativeByAge85: number;
  lifetimeTotal: number;
}

interface BreakEvenResult {
  age1: number;
  age2: number;
  breakEvenAge: number;
  formattedBreakEven: string;
  monthsToRecoup: number;
}

interface SSAnalysis {
  fullRetirementAge: number;
  fullRetirementAgeMonths: number;
  primaryInsuranceAmount: number;
  scenarios: SSScenario[];
  breakEven62vsFRA: BreakEvenResult;
  breakEven62vs70: BreakEvenResult;
  breakEvenFRAvs70: BreakEvenResult;
  optimalClaimingAge: number;
  optimalStrategy: string;
  optimalExplanation: string;
  lifetimeAdvantage: number;
  lifetimeByLifeExpectancy: {
    lifeExpectancy: number;
    bestAge: number;
    bestLifetime: number;
  }[];
}

interface SSProfile {
  dateOfBirth?: string;
  lifeExpectancy?: number;
  benefitAt62?: number;
  benefitAtFRA?: number;
  benefitAt70?: number;
}

interface RecommendationSummary {
  headline: string;
  bullets: string[];
  actionItems: string[];
}

interface PDFRequest {
  profile: SSProfile;
  analysis: SSAnalysis;
  recommendation: RecommendationSummary;
  userName?: string;
}

function formatCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(2)}M`;
  }
  if (amount >= 1000) {
    return `$${Math.round(amount / 1000)}K`;
  }
  return `$${amount.toLocaleString()}`;
}

export async function POST(request: NextRequest) {
  try {
    const body: PDFRequest = await request.json();
    const { profile, analysis, recommendation, userName } = body;

    if (!analysis || !profile) {
      return NextResponse.json(
        { error: 'Missing required data' },
        { status: 400 }
      );
    }

    // Create PDF document
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'letter',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    let y = margin;

    // Colors
    const primaryColor: [number, number, number] = [99, 102, 241]; // Indigo
    const successColor: [number, number, number] = [16, 185, 129]; // Emerald
    const textColor: [number, number, number] = [31, 41, 55]; // Gray-800
    const lightText: [number, number, number] = [107, 114, 128]; // Gray-500

    // Helper functions
    const setColor = (color: [number, number, number]) => {
      doc.setTextColor(color[0], color[1], color[2]);
    };

    const drawLine = (y: number, color: [number, number, number] = [229, 231, 235]) => {
      doc.setDrawColor(color[0], color[1], color[2]);
      doc.line(margin, y, pageWidth - margin, y);
    };

    // ==========================================
    // COVER PAGE
    // ==========================================

    // Header bar
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, pageWidth, 35, 'F');

    // Maven logo text
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('Maven', margin, 22);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Financial Intelligence', margin, 28);

    y = 55;

    // Title
    setColor(textColor);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text('SOCIAL SECURITY', margin, y);
    y += 12;
    doc.text('OPTIMIZATION REPORT', margin, y);
    y += 15;

    // Prepared for
    drawLine(y);
    y += 10;
    setColor(lightText);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Prepared for:', margin, y);
    y += 6;
    setColor(textColor);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(userName || 'Social Security Analysis', margin, y);
    y += 8;
    setColor(lightText);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Report Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, margin, y);
    y += 15;

    // Optimal Strategy Box
    doc.setFillColor(successColor[0], successColor[1], successColor[2]);
    doc.roundedRect(margin, y, contentWidth, 40, 3, 3, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('OPTIMAL STRATEGY', margin + 10, y + 12);
    
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text(`Claim at Age ${analysis.optimalClaimingAge}`, margin + 10, y + 27);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const optimalScenario = analysis.scenarios.find(s => s.claimingAge === analysis.optimalClaimingAge);
    doc.text(`Monthly Benefit: $${optimalScenario?.monthlyBenefit.toLocaleString() || 'N/A'}`, margin + 10, y + 35);
    
    y += 55;

    // Key Numbers Grid
    const gridY = y;
    const cellWidth = contentWidth / 3;

    // Lifetime Total
    setColor(textColor);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Estimated Lifetime Total', margin, gridY);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(formatCurrency(optimalScenario?.lifetimeTotal || 0), margin, gridY + 8);

    // vs Age 62
    setColor(textColor);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Advantage vs. Age 62', margin + cellWidth, gridY);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    const advantageText = analysis.lifetimeAdvantage >= 0 
      ? `+${formatCurrency(analysis.lifetimeAdvantage)}`
      : formatCurrency(analysis.lifetimeAdvantage);
    if (analysis.lifetimeAdvantage >= 0) {
      setColor(successColor);
    }
    doc.text(advantageText, margin + cellWidth, gridY + 8);

    // Break-even Age
    setColor(textColor);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Break-even Age (62 vs 70)', margin + cellWidth * 2, gridY);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(`Age ${Math.round(analysis.breakEven62vs70.breakEvenAge)}`, margin + cellWidth * 2, gridY + 8);

    y = gridY + 25;
    drawLine(y);
    y += 15;

    // Executive Summary
    setColor(textColor);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Executive Summary', margin, y);
    y += 8;

    setColor(lightText);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    // Word wrap the explanation
    const splitExplanation = doc.splitTextToSize(analysis.optimalExplanation, contentWidth);
    doc.text(splitExplanation, margin, y);
    y += splitExplanation.length * 5 + 10;

    // Key Points
    if (recommendation?.bullets) {
      recommendation.bullets.forEach((bullet, idx) => {
        if (y > pageHeight - 40) {
          doc.addPage();
          y = margin;
        }
        setColor(primaryColor);
        doc.text('•', margin, y);
        setColor(textColor);
        doc.setFont('helvetica', 'normal');
        const lines = doc.splitTextToSize(bullet, contentWidth - 10);
        doc.text(lines, margin + 5, y);
        y += lines.length * 5 + 3;
      });
    }

    // ==========================================
    // PAGE 2: DETAILED ANALYSIS
    // ==========================================
    doc.addPage();
    y = margin;

    // Header
    setColor(primaryColor);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Claiming Age Comparison', margin, y);
    y += 15;

    // Table headers
    const colWidths = [25, 30, 25, 35, 35, 35];
    const colX = [margin];
    for (let i = 1; i < colWidths.length; i++) {
      colX.push(colX[i - 1] + colWidths[i - 1]);
    }

    doc.setFillColor(245, 245, 250);
    doc.rect(margin, y - 5, contentWidth, 10, 'F');
    
    setColor(lightText);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Age', colX[0], y);
    doc.text('Monthly', colX[1], y);
    doc.text('% PIA', colX[2], y);
    doc.text('By Age 80', colX[3], y);
    doc.text('By Age 85', colX[4], y);
    doc.text('Lifetime', colX[5], y);
    y += 8;

    drawLine(y - 3);
    y += 3;

    // Table rows
    doc.setFont('helvetica', 'normal');
    analysis.scenarios.forEach((scenario) => {
      const isOptimal = scenario.claimingAge === analysis.optimalClaimingAge;
      
      if (isOptimal) {
        doc.setFillColor(236, 253, 245);
        doc.rect(margin, y - 4, contentWidth, 8, 'F');
      }

      setColor(textColor);
      doc.setFontSize(9);
      
      const ageText = isOptimal ? `${scenario.claimingAge} ★` : `${scenario.claimingAge}`;
      doc.setFont('helvetica', isOptimal ? 'bold' : 'normal');
      doc.text(ageText, colX[0], y);
      
      doc.setFont('helvetica', 'normal');
      doc.text(`$${scenario.monthlyBenefit.toLocaleString()}`, colX[1], y);
      doc.text(`${scenario.percentOfPIA.toFixed(0)}%`, colX[2], y);
      doc.text(formatCurrency(scenario.cumulativeByAge80), colX[3], y);
      doc.text(formatCurrency(scenario.cumulativeByAge85), colX[4], y);
      doc.text(formatCurrency(scenario.lifetimeTotal), colX[5], y);
      
      y += 8;
    });

    y += 5;
    setColor(lightText);
    doc.setFontSize(8);
    doc.text(`★ Optimal based on life expectancy of ${profile.lifeExpectancy || 85}`, margin, y);
    y += 15;

    // Break-Even Analysis
    setColor(primaryColor);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Break-Even Analysis', margin, y);
    y += 10;

    const beData = [
      { label: '62 vs FRA', value: analysis.breakEven62vsFRA.formattedBreakEven },
      { label: '62 vs 70', value: analysis.breakEven62vs70.formattedBreakEven },
      { label: 'FRA vs 70', value: analysis.breakEvenFRAvs70.formattedBreakEven },
    ];

    beData.forEach((item, idx) => {
      doc.setFillColor(249, 250, 251);
      doc.roundedRect(margin + (idx * 58), y, 55, 20, 2, 2, 'F');
      
      setColor(lightText);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(item.label, margin + (idx * 58) + 5, y + 7);
      
      setColor(textColor);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(item.value, margin + (idx * 58) + 5, y + 15);
    });

    y += 35;

    // Life Expectancy Sensitivity
    setColor(primaryColor);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Longevity Sensitivity', margin, y);
    y += 8;

    setColor(lightText);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('The optimal claiming age changes based on how long you live:', margin, y);
    y += 10;

    analysis.lifetimeByLifeExpectancy.forEach((item, idx) => {
      if (idx < 6) {
        const boxX = margin + (idx * 28);
        const isSelected = item.lifeExpectancy === (profile.lifeExpectancy || 85);
        
        if (isSelected) {
          doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        } else {
          doc.setFillColor(245, 245, 250);
        }
        doc.roundedRect(boxX, y, 26, 22, 2, 2, 'F');
        
        if (isSelected) {
          doc.setTextColor(255, 255, 255);
        } else {
          setColor(lightText);
        }
        doc.setFontSize(8);
        doc.text(`Live to ${item.lifeExpectancy}`, boxX + 2, y + 7);
        
        if (isSelected) {
          doc.setTextColor(255, 255, 255);
        } else {
          setColor(textColor);
        }
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(`Age ${item.bestAge}`, boxX + 2, y + 16);
        doc.setFont('helvetica', 'normal');
      }
    });

    y += 35;

    // ==========================================
    // PAGE 3: ACTION PLAN
    // ==========================================
    doc.addPage();
    y = margin;

    setColor(primaryColor);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Your Action Plan', margin, y);
    y += 15;

    if (recommendation?.actionItems) {
      recommendation.actionItems.forEach((item, idx) => {
        // Checkbox
        doc.setDrawColor(200, 200, 200);
        doc.rect(margin, y - 3, 5, 5);
        
        setColor(textColor);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        const lines = doc.splitTextToSize(item, contentWidth - 15);
        doc.text(lines, margin + 10, y);
        y += lines.length * 6 + 5;
      });
    }

    y += 10;

    // Important information box
    doc.setFillColor(254, 243, 199);
    doc.roundedRect(margin, y, contentWidth, 35, 3, 3, 'F');
    
    setColor([180, 83, 9]);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Important Information', margin + 5, y + 10);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const disclaimer = 'This report is for educational purposes and general guidance only. It is not personalized financial, legal, or tax advice. Your actual Social Security benefits may differ based on your complete earnings history, legislation changes, and other factors. Please verify all information with the Social Security Administration and consult a qualified financial advisor before making decisions.';
    const disclaimerLines = doc.splitTextToSize(disclaimer, contentWidth - 10);
    doc.text(disclaimerLines, margin + 5, y + 17);

    y += 50;

    // Resources
    setColor(primaryColor);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Helpful Resources', margin, y);
    y += 8;

    setColor(textColor);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const resources = [
      'Social Security Administration: ssa.gov',
      'Your my Social Security account: ssa.gov/myaccount',
      'Social Security local offices: ssa.gov/locator',
      'Medicare enrollment: medicare.gov',
    ];
    
    resources.forEach((resource) => {
      doc.text(`• ${resource}`, margin, y);
      y += 6;
    });

    // Footer on all pages
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      
      // Footer line
      doc.setDrawColor(229, 231, 235);
      doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
      
      // Footer text
      doc.setTextColor(156, 163, 175);
      doc.setFontSize(8);
      doc.text('Generated by Maven • maven.finance', margin, pageHeight - 10);
      doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 20, pageHeight - 10);
    }

    // Generate PDF buffer
    const pdfBuffer = doc.output('arraybuffer');

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="social-security-analysis.pdf"`,
      },
    });

  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
