import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import WorkspaceView from './components/WorkspaceView';
import Toast from './components/Toast';
import {
  SAMPLE_RENTAL_AGREEMENT,
  SAMPLE_EMPLOYMENT_V1,
  SAMPLE_ADVERSARIAL_INJECTION,
} from './data/sampleContracts';

export default function App() {
  const [currentView, setCurrentView] = useState('landing');
  const [documentData, setDocumentData] = useState(null);
  const [auditData, setAuditData] = useState(null);
  const [toast, setToast] = useState(null);

  // Ingestion animation states
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(1);

  // Fetch telemetry on load
  useEffect(() => {
    fetchPrivacyAudit();
  }, []);

  const fetchPrivacyAudit = async () => {
    try {
      const res = await fetch('/api/privacy-audit');
      if (res.ok) {
        const data = await res.json();
        setAuditData(data);
      }
    } catch (err) {
      console.warn('Could not fetch privacy audit:', err);
    }
  };

  const uploadAndProcessFile = async (file) => {
    if (!file) return;

    setIsProcessing(true);
    setProcessingStep(1);

    const formData = new FormData();
    formData.append('file', file);

    // Staged step progression for judge visual feedback
    const stepTimer1 = setTimeout(() => setProcessingStep(2), 350);
    const stepTimer2 = setTimeout(() => setProcessingStep(3), 750);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Upload failed');
      }

      const data = await res.json();
      setDocumentData(data);

      // Smooth transition to Stage 2 Workspace
      setTimeout(() => {
        setIsProcessing(false);
        setCurrentView('workspace');
        setToast({ message: `Loaded ${file.name || 'document'} successfully.`, type: 'success' });
      }, 950);
    } catch (err) {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setIsProcessing(false);
      alert(`Document Processing Error: ${err.message}`);
    }
  };

  const handleLoadSample = async (sampleKey) => {
    let content = '';
    let filename = '';

    if (sampleKey === 'rental') {
      content = SAMPLE_RENTAL_AGREEMENT;
      filename = 'Sample_Residential_Rental_Agreement.txt';
    } else if (sampleKey === 'employment') {
      content = SAMPLE_EMPLOYMENT_V1;
      filename = 'Sample_Employment_Contract.txt';
    } else if (sampleKey === 'adversarial') {
      content = SAMPLE_ADVERSARIAL_INJECTION;
      filename = 'Adversarial_Prompt_Injection_Contract.txt';
    }

    if (!content) return;

    const blob = new Blob([content], { type: 'text/plain' });
    const file = new File([blob], filename, { type: 'text/plain' });
    await uploadAndProcessFile(file);
  };

  const handleWipeSession = async () => {
    if (
      !window.confirm(
        'Are you sure you want to securely wipe the active document and all in-memory indexes from RAM?'
      )
    ) {
      return;
    }

    try {
      const res = await fetch('/api/wipe', { method: 'POST' });
      await res.json();

      setDocumentData(null);
      setCurrentView('landing');
      setToast({
        message: 'Session wiped from local memory',
        type: 'success',
      });
      fetchPrivacyAudit();
    } catch (err) {
      alert(`Error wiping session: ${err.message}`);
    }
  };

  return (
    <>
      {currentView === 'landing' ? (
        <LandingPage
          onLoadSample={handleLoadSample}
          onUploadFile={uploadAndProcessFile}
          isSessionActive={Boolean(documentData && documentData.clauses?.length > 0)}
          onEnterWorkspace={() => setCurrentView('workspace')}
          auditData={auditData}
          isProcessing={isProcessing}
          processingStep={processingStep}
        />
      ) : (
        <WorkspaceView
          documentData={documentData}
          onBackToLanding={() => setCurrentView('landing')}
          onWipeSession={handleWipeSession}
          onUploadFile={uploadAndProcessFile}
          onLoadSample={handleLoadSample}
          auditData={auditData}
          onRefreshAudit={fetchPrivacyAudit}
        />
      )}

      <Toast toast={toast} onClose={() => setToast(null)} />
    </>
  );
}
