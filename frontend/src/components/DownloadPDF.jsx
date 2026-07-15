import React from "react";
import jsPDF from "jspdf";
import { FaFilePdf } from "react-icons/fa";

function DownloadPDF({ filename, score, summary, pylint, security, complexity, ai }) {
  const download = () => {
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
    
    // Split text into lines to avoid overflow
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
      const refs = ai.refactoring || [];
      
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
  };

  return (
    <button className="btn-export" onClick={download}>
      <FaFilePdf />
      Download PDF Report
    </button>
  );
}

export default DownloadPDF;