import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Download, CheckCircle, AlertCircle, HelpCircle, Loader2 } from 'lucide-react';
import Papa from 'papaparse';

interface EnrichedContact {
  companyName: string;
  jobTitle: string;
  fullName: string;
  emailAddress: string;
  profileUrl?: string;
  verificationStatus: 'Verified' | 'Catch-All' | 'Invalid' | 'Unknown';
  verificationScore: number;
}

interface DataGridProps {
  contacts: EnrichedContact[];
  isProcessing: boolean;
  currentCompany: string;
  companiesProgress: number;
  companiesTotal: number;
  groupsProgress: number;
  groupsTotal: number;
}

export default function DataGrid({
  contacts,
  isProcessing,
  currentCompany,
  companiesProgress,
  companiesTotal,
  groupsProgress,
  groupsTotal,
}: DataGridProps) {
  const [exporting, setExporting] = useState(false);
  const wasProcessing = useRef(false);

  const handleExport = useCallback(() => {
    setExporting(true);

    const exportData = contacts.map((c) => ({
      'Company Name': c.companyName,
      'Title': c.jobTitle,
      'Full Name': c.fullName,
      'Email': c.emailAddress,
      'Profile URL': c.profileUrl || '',
      'Email Status': c.verificationStatus,
      'Verification Score': c.verificationScore,
    }));

    const csv = Papa.unparse(exportData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'enriched_contacts.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExporting(false);
  }, [contacts]);

  useEffect(() => {
    if (isProcessing) {
      wasProcessing.current = true;
    } else if (wasProcessing.current && contacts.length > 0) {
      wasProcessing.current = false;
      handleExport();
    }
  }, [isProcessing, contacts.length, handleExport]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Verified':
        return <CheckCircle className="text-emerald-500" size={16} />;
      case 'Catch-All':
        return <AlertCircle className="text-amber-500" size={16} />;
      case 'Invalid':
        return <AlertCircle className="text-red-500" size={16} />;
      default:
        return <HelpCircle className="text-slate-400" size={16} />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Verified':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Catch-All':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Invalid':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col h-[calc(100vh-12rem)]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Enrichment Results</h2>
          <p className="text-sm text-slate-500 mt-1">
            {isProcessing
              ? `Processing "${currentCompany}" (company ${companiesProgress + 1} of ${companiesTotal}) — ${groupsProgress}/${groupsTotal} groups — ${contacts.length} contacts`
              : `Completed enrichment for ${companiesTotal} ${companiesTotal === 1 ? 'company' : 'companies'}. ${contacts.length} contacts found.`}
          </p>
        </div>

        <div className="flex items-center space-x-4">
          {isProcessing && (
            <div className="flex items-center space-x-3 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full text-sm font-medium">
              <Loader2 className="animate-spin" size={16} />
              <span>Enriching...</span>
              <div className="w-32 h-1.5 bg-indigo-200 rounded-full overflow-hidden ml-2">
                <div
                  className="h-full bg-indigo-600 transition-all duration-300 ease-out"
                  style={{
                    width: `${companiesTotal > 0 ? ((companiesProgress + groupsProgress / Math.max(groupsTotal, 1)) / companiesTotal) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          )}

          <button
            onClick={handleExport}
            disabled={isProcessing || exporting || contacts.length === 0}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors
              ${isProcessing || contacts.length === 0
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
              }`}
          >
            <Download size={18} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-6 py-3 font-medium border-b border-slate-200">Company Name</th>
                <th className="px-6 py-3 font-medium border-b border-slate-200">Title</th>
                <th className="px-6 py-3 font-medium border-b border-slate-200">Full Name</th>
                <th className="px-6 py-3 font-medium border-b border-slate-200">Email</th>
                <th className="px-6 py-3 font-medium border-b border-slate-200">Profile URL</th>
                <th className="px-6 py-3 font-medium border-b border-slate-200">Email Status</th>
                <th className="px-6 py-3 font-medium border-b border-slate-200">Verification Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {contacts.length === 0 && !isProcessing && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400 italic">
                    No contacts found.
                  </td>
                </tr>
              )}
              {contacts.map((contact, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{contact.companyName}</td>
                  <td className="px-6 py-4 text-slate-700">{contact.jobTitle}</td>
                  <td className="px-6 py-4 font-medium text-slate-900">{contact.fullName}</td>
                  <td className="px-6 py-4 font-mono text-slate-600 text-xs">{contact.emailAddress}</td>
                  <td className="px-6 py-4">
                    {contact.profileUrl ? (
                      <a
                        href={contact.profileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-800 text-xs underline"
                      >
                        View
                      </a>
                    ) : (
                      <span className="text-slate-300 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs border ${getStatusBadge(contact.verificationStatus)}`}>
                      {getStatusIcon(contact.verificationStatus)}
                      <span className="font-medium">{contact.verificationStatus}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-mono text-xs">{contact.verificationScore}</td>
                </tr>
              ))}
              {isProcessing && (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center space-x-2 text-indigo-600">
                      <Loader2 className="animate-spin" size={14} />
                      <span className="text-sm">Searching at {currentCompany}...</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
