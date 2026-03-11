import React, { useState, useRef } from 'react';
import { UploadCloud, FileText } from 'lucide-react';
import Papa from 'papaparse';

interface FileUploadProps {
  onUpload: (data: any[]) => void;
}

export default function FileUpload({ onUpload }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFile = (file: File) => {
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setError('Please upload a valid CSV file.');
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as any[];
        if (data.length === 0) {
          setError('The CSV file is empty.');
          return;
        }

        if (data.length > 200) {
          setError('Please upload a CSV with up to 200 rows.');
          return;
        }

        const firstRow = data[0];
        if (!('Company Name' in firstRow)) {
          setError('Missing required column: Company Name');
          return;
        }

        setError(null);
        onUpload(data);
      },
      error: (error) => {
        setError(`Error reading file: ${error.message}`);
      }
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div 
        className={`border-2 border-dashed rounded-2xl p-12 text-center transition-colors duration-200 ease-in-out cursor-pointer
          ${isDragging ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-300 hover:border-slate-400 bg-white'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept=".csv" 
          className="hidden" 
        />
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className={`p-4 rounded-full ${isDragging ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
            <UploadCloud size={32} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Upload Target Accounts</h3>
            <p className="text-sm text-slate-500 mt-1">Drag and drop your CSV file here, or click to browse</p>
          </div>
          <div className="flex items-center space-x-2 text-xs text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full">
            <FileText size={14} />
            <span>Up to 200 companies supported</span>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 flex items-start">
          <span className="font-medium mr-2">Error:</span> {error}
        </div>
      )}

      <div className="mt-8 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h4 className="text-sm font-semibold text-slate-900 mb-3">Required CSV Format</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50">
              <tr>
                <th className="px-4 py-2 font-medium">Company Name*</th>
                <th className="px-4 py-2 font-medium text-slate-400">Region <span className="normal-case">(optional)</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="px-4 py-3 font-mono text-slate-700">Google</td>
                <td className="px-4 py-3 font-mono text-slate-700">United States</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-slate-700">Microsoft</td>
                <td className="px-4 py-3 font-mono text-slate-700">EMEA</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-slate-700">Stripe</td>
                <td className="px-4 py-3 font-mono text-slate-400 italic">—</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-400 mt-3">
          We search 29 personas and aliases per company. Add an optional "Region" column to filter by geography.
        </p>
      </div>
    </div>
  );
}
