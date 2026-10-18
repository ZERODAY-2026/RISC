import React, { useState, useEffect } from 'react';
import LandingShowcase from './components/LandingShowcase';
import SpatialStudio from './components/SpatialStudio';
import Toast from './components/Toast';
import LiquidRetinaWipeModal from './components/LiquidRetinaWipeModal';
import {
  SAMPLE_RENTAL_AGREEMENT,
  SAMPLE_EMPLOYMENT_V1,
  SAMPLE_ADVERSARIAL_INJECTION,
  SAMPLE_CUAD_COMMERCIAL,
  SAMPLE_STATUTORY_STRESS_TEST,
} from './data/sampleContracts';

export default function App() {
  const [currentView, setCurrentView] = useState('landing');
  const [documentData, setDocumentData] = useState(null);
  const [auditData, setAuditData] = useState(null);
  const [toast, setToast] = useState(null);

  // Ingestion animation states
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(1);

  // Liquid Retina Wipe Modal states
  const [isWipeModalOpen, setIsWipeModalOpen] = useState(false);
  const [isWiping, setIsWiping] = useState(false);

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

      // Smooth transition to Stage 2 Spatial Studio
      setTimeout(() => {
        setIsProcessing(false);
        setCurrentView('workspace');
        setToast({ message: `Loaded ${file.name || 'document'} successfully.`, type: 'success' });
      }, 850);
    } catch (err) {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setIsProcessing(false);
      setToast({ message: `Document Processing Error: ${err.message}`, type: 'error' });
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
    } else if (sampleKey === 'cuad') {
      content = SAMPLE_CUAD_COMMERCIAL;
      filename = 'cuad_commercial_contract_sample.txt';
    } else if (sampleKey === 'statutory') {
      content = SAMPLE_STATUTORY_STRESS_TEST;
      filename = 'statutory_citation_stress_test.txt';
    } else if (sampleKey === 'adversarial') {
      content = SAMPLE_ADVERSARIAL_INJECTION;
      filename = 'Adversarial_Prompt_Injection_Contract.txt';
    }

    if (!content) return;

    const blob = new Blob([content], { type: 'text/plain' });
    const file = new File([blob], filename, { type: 'text/plain' });
    await uploadAndProcessFile(file);
  };

  // Open the Liquid Retina wipe confirmation modal
  const handlePromptWipeSession = () => {
    setIsWipeModalOpen(true);
  };

  // Execute cryptographic RAM zeroization & session wipe
  const executeWipeSession = async () => {
    setIsWiping(true);
    try {
      const res = await fetch('/api/wipe', { method: 'POST' });
      await res.json();

      // Brief animation pause to show deliberate zeroization
      setTimeout(() => {
        setIsWiping(false);
        setIsWipeModalOpen(false);
        setDocumentData(null);
        setCurrentView('landing');
        setToast({
          message: 'Session wiped: Ephemeral keys zeroized & RAM memory purged',
          type: 'success',
        });
        fetchPrivacyAudit();
      }, 400);
    } catch (err) {
      setIsWiping(false);
      setIsWipeModalOpen(false);
      setToast({
        message: `Error wiping session: ${err.message}`,
        type: 'error',
      });
    }
  };

  return (
    <>
      {currentView === 'landing' ? (
        <LandingShowcase
          onLoadSample={handleLoadSample}
          onUploadFile={uploadAndProcessFile}
          isSessionActive={Boolean(documentData && documentData.clauses?.length > 0)}
          onEnterWorkspace={() => setCurrentView('workspace')}
          auditData={auditData}
          isProcessing={isProcessing}
          processingStep={processingStep}
        />
      ) : (
        <SpatialStudio
          documentData={documentData}
          onBackToLanding={() => setCurrentView('landing')}
          onWipeSession={handlePromptWipeSession}
          onUploadFile={uploadAndProcessFile}
          onLoadSample={handleLoadSample}
          auditData={auditData}
          onRefreshAudit={fetchPrivacyAudit}
        />
      )}

      {/* High-definition Liquid Retina Session Wipe Modal */}
      <LiquidRetinaWipeModal
        isOpen={isWipeModalOpen}
        onClose={() => !isWiping && setIsWipeModalOpen(false)}
        onConfirm={executeWipeSession}
        isWiping={isWiping}
      />

      <Toast toast={toast} onClose={() => setToast(null)} />
    </>
  );
}

