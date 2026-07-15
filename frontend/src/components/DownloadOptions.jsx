import React from "react";
import jsPDF from "jspdf";
import { FaFilePdf, FaFileWord, FaFileAlt } from "react-icons/fa";

function DownloadOptions({ filename, score, summary, pylint, security, complexity, ai }) {
  
  // 1. PDF Download
  const downloadPDF = () => {
    const pdf = new jsPDF();
    
    // Page 1: Cover Header
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(22);
    pdf.setTextColor(33, 43, 63); // Navy slate
    pdf.text("Code Review Audit Report", 20, 30);
    
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Audited file: ${filename || "Snippet Code"}`, 20, 40);
    pdf.text(`Date of Audit: ${new Date().toLocaleString()}`, 20, 46);
    
    // Quality ratings card
    pdf.setFillColor(243, 244, 246);
    pdf.rect(20, 56, 170, 30, "F");
    
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(14);
    pdf.setTextColor(33, 43, 63);
    pdf.text("Audit Quality Ratings", 25, 64);
    
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "normal");
    const pylintScore = pylint?.score !== undefined ? pylint.score : 100;
    pdf.text(`Static Code Score: ${pylintScore}/100`, 25, 72);
    
    if (ai?.enabled) {
      pdf.text(`AI Review Score: ${ai.score}/100`, 25, 78);
    } else {
      pdf.text("AI Review Score: N/A (Mistral Key not configured)", 25, 78);
    }
    
    // Summary
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(13);
    pdf.setTextColor(33, 43, 63);
    pdf.text("Executive Summary", 20, 98);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10.5);
    pdf.setTextColor(50, 50, 50);
    
    const splitSummary = pdf.splitTextToSize(summary || "No summary provided.", 170);
    pdf.text(splitSummary, 20, 106);
    
    let y = 106 + (splitSummary.length * 5) + 12;
    
    // Static findings section
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(13);
    pdf.setTextColor(33, 43, 63);
    pdf.text("Static Analysis Findings", 20, y);
    y += 8;
    
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(80, 80, 80);
    
    const pylintFindings = Array.isArray(pylint) ? pylint : (pylint?.findings || []);
    const banditFindings = security?.results || [];
    const staticIssues = [
      ...pylintFindings.map(f => `[LINT] Line ${f.line}: ${f.message} (${f.symbol})`),
      ...banditFindings.map(f => `[SECURITY] Line ${f.line}: ${f.message} (${f.severity})`)
    ];
    
    if (staticIssues.length === 0) {
      pdf.text("- No linting or security warnings detected.", 20, y);
      y += 6;
    } else {
      staticIssues.slice(0, 8).forEach(issue => {
        if (y > 270) {
          pdf.addPage();
          y = 20;
        }
        const splitIssue = pdf.splitTextToSize(issue, 170);
        pdf.text(splitIssue, 20, y);
        y += splitIssue.length * 5;
      });
      if (staticIssues.length > 8) {
        pdf.text(`- ...and ${staticIssues.length - 8} more findings.`, 20, y);
        y += 6;
      }
    }
    
    // Complexity
    y += 6;
    if (y > 260) {
      pdf.addPage();
      y = 20;
    }
    
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(13);
    pdf.setTextColor(33, 43, 63);
    pdf.text("Radon Code Complexity", 20, y);
    y += 8;
    
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10.5);
    pdf.setTextColor(80, 80, 80);
    
    const miScore = complexity?.mi?.score !== undefined ? complexity.mi.score : 100;
    const miRank = complexity?.mi?.rank || "A (High)";
    pdf.text(`Maintainability Index: ${miScore} (Rank ${miRank})`, 20, y);
    y += 6;
    
    const ccBlocks = complexity?.complexity || [];
    if (ccBlocks.length > 0) {
      pdf.text(`Analyzed functions/methods complexity summary:`, 20, y);
      y += 6;
      ccBlocks.slice(0, 5).forEach(block => {
        pdf.text(`- [${block.type.toUpperCase()}] ${block.name}: complexity ${block.complexity} (Rank ${block.rank})`, 25, y);
        y += 5.5;
      });
    }
    
    // AI findings
    if (ai?.enabled) {
      y += 8;
      if (y > 250) {
        pdf.addPage();
        y = 20;
      }
      
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(13);
      pdf.setTextColor(33, 43, 63);
      pdf.text("AI Code Review Recommendations", 20, y);
      y += 8;
      
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      pdf.setTextColor(50, 50, 50);
      
      const bugs = ai.bugs || [];
      const opts = ai.optimizations || [];
      
      if (bugs.length > 0) {
        pdf.setFont("helvetica", "bold");
        pdf.text("Bugs Found:", 20, y);
        y += 5;
        pdf.setFont("helvetica", "normal");
        bugs.forEach(bug => {
          if (y > 270) { pdf.addPage(); y = 20; }
          const split = pdf.splitTextToSize(`- ${bug}`, 170);
          pdf.text(split, 20, y);
          y += split.length * 5;
        });
      }
      
      if (opts.length > 0) {
        y += 4;
        if (y > 270) { pdf.addPage(); y = 20; }
        pdf.setFont("helvetica", "bold");
        pdf.text("Performance Optimizations:", 20, y);
        y += 5;
        pdf.setFont("helvetica", "normal");
        opts.forEach(opt => {
          if (y > 270) { pdf.addPage(); y = 20; }
          const split = pdf.splitTextToSize(`- ${opt}`, 170);
          pdf.text(split, 20, y);
          y += split.length * 5;
        });
      }
    }
    
    pdf.save(`AI_Audit_Report_${filename || "code"}.pdf`);
    triggerReportDownloadedNotification();
  };

  // 2. DOCX Download (using wordprocessingml document format)
  const downloadDOCX = () => {
    let html = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><title>Code Review Audit Report</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        h1 { color: #1e3a8a; border-bottom: 2px solid #1e3a8a; padding-bottom: 8px; }
        h2 { color: #2563eb; margin-top: 24px; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; }
        .score-card { background: #f3f4f6; border-left: 4px solid #3b82f6; padding: 12px; margin: 16px 0; }
        ul { padding-left: 20px; }
        li { margin-bottom: 6px; }
      </style>
      </head>
      <body>
        <h1>Code Review Audit Report</h1>
        <p><strong>Audited file:</strong> ${filename || "Snippet Code"}</p>
        <p><strong>Date of Audit:</strong> ${new Date().toLocaleString()}</p>
        
        <div class="score-card">
          <h3>Audit Quality Rating: <strong>${score}/100</strong></h3>
        </div>

        <h2>Executive Summary</h2>
        <p>${summary || "No summary provided."}</p>

        <h2>Static Analysis Findings</h2>
    `;
    
    const pylintFindings = Array.isArray(pylint) ? pylint : (pylint?.findings || []);
    const banditFindings = security?.results || [];
    
    if (pylintFindings.length === 0 && banditFindings.length === 0) {
      html += `<p>- No linting or security warnings detected.</p>`;
    } else {
      html += `<ul>`;
      pylintFindings.forEach(f => {
        html += `<li><strong>[LINT] Line ${f.line}:</strong> ${f.message} (${f.symbol})</li>`;
      });
      banditFindings.forEach(f => {
        html += `<li><strong>[SECURITY] Line ${f.line}:</strong> ${f.message} (${f.severity})</li>`;
      });
      html += `</ul>`;
    }

    const miScore = complexity?.mi?.score !== undefined ? complexity.mi.score : 100;
    const miRank = complexity?.mi?.rank || "A (High)";
    html += `
      <h2>Radon Complexity Stats</h2>
      <p><strong>Maintainability Index:</strong> ${miScore} (Rank ${miRank})</p>
    `;
    const ccBlocks = complexity?.complexity || [];
    if (ccBlocks.length > 0) {
      html += `<ul>`;
      ccBlocks.forEach(block => {
        html += `<li>[${block.type.toUpperCase()}] ${block.name}: complexity ${block.complexity} (Rank ${block.rank})</li>`;
      });
      html += `</ul>`;
    }

    if (ai?.enabled) {
      html += `<h2>AI Review Recommendations</h2>`;
      const bugs = ai.bugs || [];
      const opts = ai.optimizations || [];
      const refs = ai.refactoring || [];
      
      if (bugs.length > 0) {
        html += `<h3>Bugs Found:</h3><ul>`;
        bugs.forEach(bug => { html += `<li>${bug}</li>`; });
        html += `</ul>`;
      }
      if (opts.length > 0) {
        html += `<h3>Performance Optimizations:</h3><ul>`;
        opts.forEach(opt => { html += `<li>${opt}</li>`; });
        html += `</ul>`;
      }
      if (refs.length > 0) {
        html += `<h3>Refactoring & Best Practices:</h3><ul>`;
        refs.forEach(ref => { html += `<li>${ref}</li>`; });
        html += `</ul>`;
      }
    }

    html += `</body></html>`;

    const blob = new Blob(['\ufeff' + html], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `AI_Audit_Report_${filename || "code"}.doc`;
    link.click();
    URL.revokeObjectURL(url);
    triggerReportDownloadedNotification();
  };

  // 3. TXT Download
  const downloadTXT = () => {
    let text = `AI CODE REVIEW AUDIT REPORT: ${filename || "Snippet Code"}\n`;
    text += `Date of Audit: ${new Date().toLocaleString()}\n`;
    text += `========================================================\n\n`;
    text += `Overall Score: ${score}/100\n\n`;
    text += `SUMMARY:\n${summary || "No summary provided."}\n\n`;
    
    text += `STATIC CODE FINDINGS:\n`;
    const pylintFindings = Array.isArray(pylint) ? pylint : (pylint?.findings || []);
    const banditFindings = security?.results || [];
    if (pylintFindings.length === 0 && banditFindings.length === 0) {
      text += `- No linting or security warnings detected.\n`;
    } else {
      pylintFindings.forEach(f => {
        text += `- [LINT] Line ${f.line}: ${f.message} (${f.symbol})\n`;
      });
      banditFindings.forEach(f => {
        text += `- [SECURITY] Line ${f.line}: ${f.message} (${f.severity})\n`;
      });
    }
    
    text += `\nCOMPLEXITY STATS:\n`;
    const miScore = complexity?.mi?.score !== undefined ? complexity.mi.score : 100;
    const miRank = complexity?.mi?.rank || "A (High)";
    text += `- Maintainability Index: ${miScore} (Rank ${miRank})\n`;
    const ccBlocks = complexity?.complexity || [];
    ccBlocks.forEach(block => {
      text += `- [${block.type.toUpperCase()}] ${block.name}: complexity ${block.complexity} (Rank ${block.rank})\n`;
    });

    if (ai?.enabled) {
      text += `\nAI REVIEW RECOMMENDATIONS:\n`;
      const bugs = ai.bugs || [];
      const opts = ai.optimizations || [];
      const refs = ai.refactoring || [];
      
      if (bugs.length > 0) {
        text += `\nBugs Found:\n`;
        bugs.forEach(bug => { text += `- ${bug}\n`; });
      }
      if (opts.length > 0) {
        text += `\nPerformance Optimizations:\n`;
        opts.forEach(opt => { text += `- ${opt}\n`; });
      }
      if (refs.length > 0) {
        text += `\nRefactoring & Best Practices:\n`;
        refs.forEach(ref => { text += `- ${ref}\n`; });
      }
    }

    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `AI_Audit_Report_${filename || "code"}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    triggerReportDownloadedNotification();
  };

  const triggerReportDownloadedNotification = () => {
    // Notify window for app action listener
    const event = new CustomEvent("report_downloaded", { 
      detail: { filename: filename || "Report" } 
    });
    window.dispatchEvent(event);
  };

  return (
    <div className="export-panel" style={{ display: "flex", gap: "10px", marginTop: "0px" }}>
      <button className="btn-export" onClick={downloadPDF} title="Download PDF Report">
        <FaFilePdf /> PDF
      </button>
      <button 
        className="btn-export" 
        onClick={downloadDOCX} 
        style={{ background: "linear-gradient(135deg, #2b579a 0%, #1e3a8a 100%)", boxShadow: "0 4px 12px rgba(43, 87, 154, 0.25)" }}
        title="Download Word Doc"
      >
        <FaFileWord /> Word
      </button>
      <button 
        className="btn-export" 
        onClick={downloadTXT} 
        style={{ background: "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)", boxShadow: "0 4px 12px rgba(107, 114, 128, 0.25)" }}
        title="Download Plain Text"
      >
        <FaFileAlt /> Text
      </button>
    </div>
  );
}

export default DownloadOptions;
