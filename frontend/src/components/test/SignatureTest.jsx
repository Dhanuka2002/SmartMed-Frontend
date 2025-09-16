import React, { useState } from 'react';
import SignatureDisplay from '../common/SignatureDisplay/SignatureDisplay';

const SignatureTest = () => {
  const [prescriptionId, setPrescriptionId] = useState('');

  return (
    <div style={{ padding: '2rem', background: '#f5f5f5', minHeight: '100vh' }}>
      <h1 style={{ marginBottom: '2rem' }}>Digital Signature Display Test</h1>
      
      <div style={{ marginBottom: '2rem' }}>
        <h2>Test by Prescription ID</h2>
        <p>Enter a prescription ID to fetch and display its signature:</p>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
          <input
            type="number"
            placeholder="Enter prescription ID (e.g., 1)"
            value={prescriptionId}
            onChange={(e) => setPrescriptionId(e.target.value)}
            style={{
              padding: '0.5rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
              width: '300px'
            }}
          />
          <button
            onClick={() => setPrescriptionId('')}
            style={{
              padding: '0.5rem 1rem',
              background: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Clear
          </button>
        </div>
        
        {prescriptionId && (
          <div style={{ maxWidth: '600px' }}>
            <h3>Signature for Prescription ID: {prescriptionId}</h3>
            <SignatureDisplay 
              prescriptionId={prescriptionId}
              onError={(error) => console.error('Signature error:', error)}
            />
          </div>
        )}
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2>Test with Mock Data</h2>
        <p>Example of how to use the component with direct signature data:</p>
        <div style={{ maxWidth: '600px' }}>
          <SignatureDisplay 
            signature="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==" 
            signedAt="2024-01-15T14:30:00.000Z"
            doctorName="Dr. John Smith"
            showHeader={true}
            showValidation={true}
          />
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2>Compact Version</h2>
        <p>Compact version for smaller spaces:</p>
        <div style={{ maxWidth: '400px' }}>
          <SignatureDisplay 
            signature="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==" 
            signedAt="2024-01-15T14:30:00.000Z"
            doctorName="Dr. Jane Doe"
            showHeader={false}
            showValidation={false}
            className="compact"
          />
        </div>
      </div>

      <div>
        <h2>No Signature State</h2>
        <p>How it looks when no signature is available:</p>
        <div style={{ maxWidth: '600px' }}>
          <SignatureDisplay 
            signature={null}
            doctorName="Dr. No Signature"
          />
        </div>
      </div>
    </div>
  );
};

export default SignatureTest;