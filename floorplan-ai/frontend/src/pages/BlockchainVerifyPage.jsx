import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { 
  Loader2, 
  ShieldCheck, 
  ShieldAlert, 
  Upload, 
  ArrowLeft, 
  FileJson,
  Search,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { generateReportHash } from '../services/reportHasher';
import { checkHashOnChain } from '../services/stellar';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function BlockchainVerifyPage() {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null); // 'matched', 'mismatch', 'not_found'
  const [onChainData, setOnChainData] = useState(null);
  const [fileDetails, setFileDetails] = useState(null);
  const navigate = useNavigate();

  const onDrop = async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setFileDetails({ name: file.name, size: (file.size / 1024).toFixed(2) + ' KB' });
    setIsVerifying(true);
    setVerificationResult(null);
    setOnChainData(null);
    
    const toastId = toast.loading('Reading and verifying report integrity...');

    try {
      const text = await file.text();
      let reportData;
      try {
        reportData = JSON.parse(text);
      } catch (e) {
        throw new Error("Invalid JSON file. Please upload a valid report.");
      }

      // 1. Generate Hash locally
      const localHash = await generateReportHash(reportData);

      // 2. Extract Project ID
      const projectId = reportData.projectId || (reportData.metadata && reportData.metadata.projectId);
      
      if (!projectId) {
        throw new Error("Project ID not found in the report metadata.");
      }

      // 3. Fetch from chain
      const result = await checkHashOnChain(projectId);

      if (!result) {
        setVerificationResult('not_found');
        toast.error('No record found on-chain for this Project ID', { id: toastId });
      } else {
        const onChainHash = result.document_hash;
        setOnChainData(result);
        
        if (localHash === onChainHash) {
          setVerificationResult('matched');
          toast.success('Report Verified: Authentic!', { id: toastId });
        } else {
          setVerificationResult('mismatch');
          toast.error('Tamper Alert: Hash Mismatch!', { id: toastId });
        }
      }
    } catch (err) {
      console.error('Verification error:', err);
      toast.error(err.message || 'Failed to verify file', { id: toastId });
    } finally {
      setIsVerifying(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/json': ['.json'] },
    multiple: false
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-24 pb-16 min-h-screen bg-gray-50"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/')}
            className="p-3 bg-white border-4 border-black shadow-[4px_4px_0_0_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
          >
            <ArrowLeft className="w-6 h-6 text-black stroke-[3]" />
          </button>
          <div>
            <h1 className="text-3xl font-black text-black pixel-text uppercase tracking-widest">
              Blockchain Verification
            </h1>
            <p className="text-gray-600 font-bold pixel-text uppercase tracking-wider text-xs">
              Verify report integrity via Stellar Soroban Oracle
            </p>
          </div>
        </div>

        {/* Upload Section */}
        <div className="space-y-6">
          <div 
            {...getRootProps()} 
            className={`voxel-panel p-12 border-4 border-dashed cursor-pointer transition-all flex flex-col items-center justify-center gap-4
              ${isDragActive ? 'bg-yellow-50 border-yellow-400 border-solid' : 'bg-white border-black'}
              ${isVerifying ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <input {...getInputProps()} disabled={isVerifying} />
            <div className={`p-4 rounded-full ${isDragActive ? 'bg-yellow-400' : 'bg-gray-100'}`}>
              {isVerifying ? (
                <Loader2 className="w-12 h-12 text-black animate-spin" />
              ) : (
                <Upload className="w-12 h-12 text-black" />
              )}
            </div>
            
            <div className="text-center">
              <p className="text-xl font-black text-black pixel-text uppercase">
                {isDragActive ? "Drop the report here" : "Upload JSON Report"}
              </p>
              <p className="text-gray-500 font-bold pixel-text uppercase text-xs mt-2">
                Drag & Drop or Click to browse
              </p>
            </div>
          </div>

          {/* Verification Results */}
          {verificationResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`voxel-panel p-6 border-4 border-black shadow-[6px_6px_0_0_#000] ${
                verificationResult === 'matched' ? 'bg-green-50' : 
                verificationResult === 'mismatch' ? 'bg-red-50' : 'bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-4 mb-4">
                {verificationResult === 'matched' ? (
                  <CheckCircle2 className="w-10 h-10 text-green-600" />
                ) : verificationResult === 'mismatch' ? (
                  <XCircle className="w-10 h-10 text-red-600" />
                ) : (
                  <Search className="w-10 h-10 text-gray-400" />
                )}
                
                <div>
                  <h3 className={`text-2xl font-black pixel-text uppercase ${
                    verificationResult === 'matched' ? 'text-green-800' : 
                    verificationResult === 'mismatch' ? 'text-red-800' : 'text-gray-700'
                  }`}>
                    {verificationResult === 'matched' ? "Verified: Authentic" : 
                     verificationResult === 'mismatch' ? "Tampered: Hash Mismatch" : 
                     "Record Not Found"}
                  </h3>
                  <p className="text-xs font-bold font-mono opacity-70">
                    File: {fileDetails?.name} ({fileDetails?.size})
                  </p>
                </div>
              </div>

              {onChainData && (
                <div className="bg-white/50 border-2 border-black/10 p-4 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-black pixel-text text-gray-500 uppercase">On-Chain Hash</span>
                    <span className="font-mono break-all text-right ml-4">{onChainData.document_hash}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-black pixel-text text-gray-500 uppercase">Staged At</span>
                    <span className="font-bold">{new Date(Number(onChainData.timestamp) * 1000).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-black pixel-text text-gray-500 uppercase">Recorded Cost</span>
                    <span className="font-bold">₹{Number(onChainData.cost_mid).toLocaleString()}</span>
                  </div>
                </div>
              )}

              <div className="mt-6 flex flex-col gap-2">
                <p className="text-xs font-bold italic opacity-60">
                  {verificationResult === 'matched' 
                    ? "This document exactly matches the proof-of-existence hash stored on the Stellar blockchain."
                    : verificationResult === 'mismatch'
                    ? "WARNING: The content of this document has been modified since it was anchored on the blockchain."
                    : "No anchoring record exists for this project ID. Ensure the project was submitted to the Testnet."}
                </p>
              </div>
            </motion.div>
          )}

          {/* Info Section */}
          <div className="bg-blue-50 border-4 border-blue-200 p-6 flex gap-4">
            <ShieldCheck className="w-8 h-8 text-blue-600 shrink-0" />
            <div>
              <h4 className="font-black pixel-text text-blue-800 uppercase text-sm mb-1">How it works</h4>
              <p className="text-xs font-bold text-blue-700 leading-relaxed">
                We generate a SHA-256 fingerprint of your JSON file locally in the browser. 
                This fingerprint is then compared to the immutable record stored on the Stellar Blockchain. 
                Even a single character change in the file will result in a completely different hash.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
