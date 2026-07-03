import { useState, useEffect, useRef } from 'react';
import api from './services/api';
import './App.css';

const SAMPLE_RESEARCH = `Title: The Impact of Agentic AI on Developer Velocity and Software Quality
Abstract: This study investigates the integration of agentic AI coding assistants within mid-to-large size engineering teams. Over a six-month observational study of 500 developers, we benchmarked coding velocity, commit quality, and general satisfaction.

Findings:
1. Coding tasks saw an average speedup of 35%, measured by ticket resolution times.
2. Junior engineers benefited the most, with an average velocity increase of 50%, whereas senior engineers saw a 15-20% boost.
3. Crucially, teams that bypassed human code reviews saw a 12% increase in regression bugs post-release.
4. Over 78% of developers reported decreased burnout and reduced cognitive load.

Conclusion: Agentic assistants accelerate individual coding output significantly, but maintaining software quality requires rigorous review pipelines.`;

function App() {
  // Input states
  const [inputText, setInputText] = useState('');
  
  // PDF states
  const [pdfFileName, setPdfFileName] = useState('');
  const [pdfExtractedText, setPdfExtractedText] = useState('');
  const [pdfStatus, setPdfStatus] = useState(''); // '', 'Uploading PDF...', 'Extracting text...', 'Ready to analyze'
  const [pdfError, setPdfError] = useState('');
  
  // General states
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [humanReview, setHumanReview] = useState('');
  const [error, setError] = useState(null);
  
  // UX: Toast notifications and Success Banner
  const [toast, setToast] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const fileInputRef = useRef(null);

  // Trigger floating toast message
  const triggerToast = (message) => {
    setToast(message);
  };

  // Automatically clear toast after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const loadSampleText = () => {
    setInputText(SAMPLE_RESEARCH);
    triggerToast("Sample text loaded!");
  };

  // "Clear All" resets the entire workspace back to clean state
  const clearAll = () => {
    setInputText('');
    setPdfFileName('');
    setPdfExtractedText('');
    setPdfStatus('');
    setPdfError('');
    setReport(null);
    setHumanReview('');
    setError(null);
    setShowSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    triggerToast("Workspace cleared!");
  };

  // Handle PDF file selection and upload
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate type (must be PDF)
    if (file.type !== 'application/pdf') {
      setPdfError("Invalid file type. Only PDF files are supported.");
      triggerToast("File type error");
      return;
    }

    setPdfFileName(file.name);
    setPdfError('');
    setPdfExtractedText('');
    setPdfStatus('Uploading PDF...');

    const formData = new FormData();
    formData.append('pdf', file);

    try {
      // Simulate/trigger transitioning into extracting text state shortly after
      setTimeout(() => {
        setPdfStatus('Extracting text...');
      }, 600);

      const response = await api.post('/upload-pdf', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setPdfExtractedText(response.data.text);
      setPdfStatus('Ready to analyze');
      triggerToast("PDF text extracted successfully!");
    } catch (err) {
      console.error("PDF upload failure:", err);
      const msg = err.response?.data?.error || err.message || "Failed to extract text from PDF.";
      setPdfError(msg);
      setPdfStatus('');
      setPdfFileName('');
    }
  };

  // Remove uploaded PDF
  const handleRemovePdf = () => {
    setPdfFileName('');
    setPdfExtractedText('');
    setPdfStatus('');
    setPdfError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    triggerToast("PDF removed!");
  };

  const handleGenerate = async () => {
    // Check if either pasted text or PDF text exists
    const hasPastedText = !!inputText.trim();
    const hasPdfText = !!pdfExtractedText.trim();

    if (!hasPastedText && !hasPdfText) {
      alert("Please paste some research text or upload a PDF document first.");
      return;
    }

    setLoading(true);
    setReport(null);
    setHumanReview('');
    setError(null);
    setShowSuccess(false);

    // Combine input types: pasted text + PDF text (if both exist, join with double newline)
    const combinedText = [
      hasPastedText ? `[Pasted Text Input]:\n${inputText}` : '',
      hasPdfText ? `[Extracted PDF Document Input]:\n${pdfExtractedText}` : ''
    ].filter(Boolean).join('\n\n---\n\n');

    try {
      const response = await api.post('/analyze', {
        text: combinedText
      });

      const data = response.data;
      setReport(data);
      setShowSuccess(true);
      triggerToast("Report generated successfully!");

      // Pre-populate the human review output box with a drafted markdown report
      const initialDraft = `# AI Research Analysis: Executive Report

## Executive Summary
${data.summary}

## Key Discoveries
${data.keyPoints.map(point => `- ${point}`).join('\n')}

## Vulnerabilities & Weak Claims
${data.weakClaims.map(claim => `- ${claim}`).join('\n')}

## Actionable Recommendations
${data.recommendations.map(rec => `- ${rec}`).join('\n')}

## Content Brief / Next Steps
${data.contentBrief}
`;
      setHumanReview(initialDraft);
    } catch (err) {
      console.error("API analysis failure:", err);
      const msg = err.response?.data?.error || err.message || "Failed to communicate with backend analysis engine.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Individual section copying helper
  const handleCopyText = (text, label) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    triggerToast(`${label} copied to clipboard!`);
  };

  const handleCopyList = (listArray, label) => {
    if (!listArray || listArray.length === 0) return;
    const formattedText = listArray.map(item => `• ${item}`).join('\n');
    handleCopyText(formattedText, label);
  };

  return (
    <div className="app-container">
      {/* Toast Notification */}
      {toast && (
        <div className="toast-notification">
          <span className="toast-icon">✓</span> {toast}
        </div>
      )}

      <header className="app-header">
        <div className="header-badge">AI Intelligence Workspace</div>
        <h1>AI Research-to-Output Agent</h1>
        <p className="subtitle">
          An elite AI analysis workspace designed to convert heavy documents, research reports, and PDF uploads into clear outputs.
        </p>
      </header>

      {/* Error Callout */}
      {error && (
        <div className="error-callout card fade-in">
          <div className="error-header">
            <span className="error-icon">❌</span>
            <h3>Analysis Failed</h3>
          </div>
          <p className="error-message">{error}</p>
        </div>
      )}

      <main className="app-workspace">
        {/* Left Input Workspace */}
        <section className="input-panel card">
          <div className="card-header">
            <h2>Source Material</h2>
            <div className="header-actions">
              <button className="btn-secondary btn-sm" onClick={loadSampleText} disabled={loading}>
                Load Sample
              </button>
              <button className="btn-danger-outline btn-sm" onClick={clearAll} disabled={loading}>
                Clear All
              </button>
            </div>
          </div>
          
          <div className="input-container">
            <textarea
              className="research-textarea"
              placeholder="Option 1: Paste your research text, paper abstract, or article body here..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={loading}
            />
            {inputText && (
              <div className="textarea-meta">
                Pasted characters: {inputText.length.toLocaleString()} | Paste words: {inputText.trim().split(/\s+/).filter(Boolean).length.toLocaleString()}
              </div>
            )}
          </div>

          {/* PDF Upload Section (Option 2) */}
          <div className="pdf-upload-container">
            <div className="pdf-upload-title">Option 2: Upload PDF Document</div>
            
            <div className={`pdf-dropzone ${pdfStatus ? 'active' : ''} ${pdfError ? 'error' : ''}`}>
              <input
                type="file"
                id="pdf-file-input"
                className="pdf-file-input"
                accept="application/pdf"
                onChange={handleFileChange}
                disabled={loading || pdfStatus === 'Uploading PDF...' || pdfStatus === 'Extracting text...'}
                ref={fileInputRef}
              />
              <label htmlFor="pdf-file-input" className="pdf-upload-label">
                <span className="upload-icon">📂</span>
                {pdfFileName ? (
                  <span className="file-name-highlight">{pdfFileName}</span>
                ) : (
                  <span>Click to choose PDF file</span>
                )}
              </label>

              {/* Extraction Statuses */}
              {pdfStatus && (
                <div className="pdf-status-indicator">
                  <span className="pulse-dot"></span>
                  <span className="pdf-status-text">{pdfStatus}</span>
                </div>
              )}

              {/* Error messages */}
              {pdfError && <div className="pdf-error-text">{pdfError}</div>}
            </div>

            {/* Extracted text preview panel */}
            {pdfExtractedText && (
              <div className="pdf-preview-box fade-in">
                <div className="pdf-preview-header">
                  <div className="pdf-preview-title">
                    📄 Extracted Text Preview (First 500 chars)
                  </div>
                  <button className="btn-remove-pdf btn-sm" onClick={handleRemovePdf} disabled={loading}>
                    Remove PDF
                  </button>
                </div>
                <div className="pdf-preview-content">
                  {pdfExtractedText.substring(0, 500)}
                  {pdfExtractedText.length > 500 ? ' ...' : ''}
                </div>
                <div className="pdf-preview-meta">
                  Extracted characters: {pdfExtractedText.length.toLocaleString()} | Words: {pdfExtractedText.trim().split(/\s+/).filter(Boolean).length.toLocaleString()}
                </div>
              </div>
            )}
          </div>

          <button 
            className={`btn-primary btn-generate ${loading ? 'loading' : ''}`}
            onClick={handleGenerate}
            disabled={loading || pdfStatus === 'Uploading PDF...' || pdfStatus === 'Extracting text...'}
          >
            {loading ? (
              <span className="spinner-container">
                <span className="spinner"></span>
                Processing Document...
              </span>
            ) : (
              'Generate Structured Report'
            )}
          </button>
        </section>

        {/* Right Output Workspace */}
        <section className="output-panel">
          {!report && !loading && (
            <div className="empty-state card">
              <div className="empty-icon">📊</div>
              <h3>No Report Generated</h3>
              <p>Input text and trigger analysis in the left panel to display structured research outputs.</p>
            </div>
          )}

          {loading && (
            <div className="loading-state card">
              <div className="skeleton-line title-skeleton"></div>
              <div className="skeleton-line body-skeleton-lg"></div>
              <div className="skeleton-line body-skeleton-md"></div>
              <div className="skeleton-line body-skeleton-sm"></div>
              <div className="skeleton-grid">
                <div className="skeleton-card"></div>
                <div className="skeleton-card"></div>
              </div>
            </div>
          )}

          {report && !loading && (
            <div className="report-container fade-in">
              {/* Success Notification Alert */}
              {showSuccess && (
                <div className="success-banner">
                  <div className="success-banner-content">
                    <span className="success-icon">✨</span>
                    <span>Structured analysis completed successfully! Review cards below.</span>
                  </div>
                  <button className="close-banner-btn" onClick={() => setShowSuccess(false)}>×</button>
                </div>
              )}

              {/* 1. Summary Card */}
              <div className="report-card card summary-card">
                <div className="card-header-compact">
                  <span className="badge summary-badge">Executive Summary</span>
                  <button 
                    className="btn-icon-copy" 
                    onClick={() => handleCopyText(report.summary, "Executive Summary")}
                    title="Copy Summary"
                  >
                    📋 Copy
                  </button>
                </div>
                <p className="summary-text">{report.summary}</p>
              </div>

              {/* 2. Key Discoveries Card */}
              <div className="report-card card key-points-card">
                <div className="card-header-compact">
                  <h3>🔑 Key Discoveries</h3>
                  <button 
                    className="btn-icon-copy" 
                    onClick={() => handleCopyList(report.keyPoints, "Key Discoveries")}
                    title="Copy Key Discoveries"
                  >
                    📋 Copy
                  </button>
                </div>
                <ul className="bullet-list">
                  {report.keyPoints.map((point, index) => (
                    <li key={index}>{point}</li>
                  ))}
                </ul>
              </div>

              {/* 3. Recommendations Card (Visually Highlighted) */}
              <div className="report-card card recommendations-card highlighted-green-card">
                <div className="card-header-compact">
                  <h3>🚀 Strategic Recommendations</h3>
                  <button 
                    className="btn-icon-copy" 
                    onClick={() => handleCopyList(report.recommendations, "Recommendations")}
                    title="Copy Recommendations"
                  >
                    📋 Copy
                  </button>
                </div>
                <ul className="bullet-list-highlighted">
                  {report.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>

              {/* 4. Weak Claims Card */}
              <div className="report-card card weak-claims-card highlighted-red-card">
                <div className="card-header-compact">
                  <h3>⚠️ Weak Claims & Gaps</h3>
                  <button 
                    className="btn-icon-copy" 
                    onClick={() => handleCopyList(report.weakClaims, "Weak Claims")}
                    title="Copy Weak Claims"
                  >
                    📋 Copy
                  </button>
                </div>
                <ul className="bullet-list-warning">
                  {report.weakClaims.map((claim, index) => (
                    <li key={index}>{claim}</li>
                  ))}
                </ul>
              </div>

              {/* 5. Content Brief Card (Distinct Monospace Styled Box) */}
              <div className="report-card card brief-card terminal-box">
                <div className="card-header-compact">
                  <h3>💻 Technical Content Brief</h3>
                  <button 
                    className="btn-icon-copy btn-icon-copy-terminal" 
                    onClick={() => handleCopyText(report.contentBrief, "Content Brief")}
                    title="Copy Content Brief"
                  >
                    📋 Copy
                  </button>
                </div>
                <pre className="brief-pre-text">
                  {report.contentBrief}
                </pre>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Human Review Panel (Visually Distinct) */}
      {report && !loading && (
        <section className="review-panel card distinct-review-card fade-in">
          <div className="card-header">
            <div>
              <div className="review-title-group">
                <h2>📝 Human Review & Final Draft</h2>
                <span className="draft-badge">Draft Editor</span>
              </div>
              <p className="card-subtitle">Refining notes directly triggers dynamic output. Copy final Markdown compile below.</p>
            </div>
            <button className="btn-primary btn-sm" onClick={() => handleCopyText(humanReview, "Final Report Draft")}>
              📋 Copy Complete Report
            </button>
          </div>
          <textarea
            className="review-textarea"
            placeholder="Edit before final use..."
            value={humanReview}
            onChange={(e) => setHumanReview(e.target.value)}
          />
        </section>
      )}

      <footer className="app-footer-info">
        <p>Built for AI Research-to-Output Automation Demo</p>
      </footer>
    </div>
  );
}

export default App;
