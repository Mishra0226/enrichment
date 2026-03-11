import React, { useState } from 'react';
import { Database, Users, Zap, ArrowRight } from 'lucide-react';
import FileUpload from './components/FileUpload';
import PersonaSelector from './components/PersonaSelector';
import DataGrid from './components/DataGrid';
import { enrichCompany, EnrichedContact } from './services/enrichmentService';
import { ALL_PERSONAS, PERSONA_GROUPS } from './config/personas';

export default function App() {
  const [step, setStep] = useState<'upload' | 'select' | 'enrich'>('upload');
  const [uploadedData, setUploadedData] = useState<any[]>([]);
  const [selectedPersonas, setSelectedPersonas] = useState<Set<string>>(
    new Set(ALL_PERSONAS.map((p) => p.title))
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [contacts, setContacts] = useState<EnrichedContact[]>([]);
  const [currentCompany, setCurrentCompany] = useState('');
  const [companiesProgress, setCompaniesProgress] = useState(0);
  const [companiesTotal, setCompaniesTotal] = useState(0);
  const [groupsProgress, setGroupsProgress] = useState(0);
  const [groupsTotal, setGroupsTotal] = useState(0);

  const handleUpload = (data: any[]) => {
    setUploadedData(data);
    setStep('select');
  };

  const handleStartEnrichment = async () => {
    setStep('enrich');
    setIsProcessing(true);
    setContacts([]);
    setCompaniesTotal(uploadedData.length);

    const activeGroups = PERSONA_GROUPS.filter((g) =>
      g.personas.some((p) => selectedPersonas.has(p.title))
    ).length;
    setGroupsTotal(activeGroups);

    let accumulated: EnrichedContact[] = [];

    for (let i = 0; i < uploadedData.length; i++) {
      const company = uploadedData[i]['Company Name']?.trim();
      if (!company) continue;
      const region = uploadedData[i]['Region']?.trim() || undefined;

      setCompaniesProgress(i);
      setCurrentCompany(company);
      setGroupsProgress(0);

      try {
        const results = await enrichCompany(company, region, selectedPersonas, (progress) => {
          setGroupsProgress(progress.completedGroups);
        });
        accumulated = [...accumulated, ...results];
        setContacts([...accumulated]);
      } catch (error) {
        console.error(`Error enriching ${company}:`, error);
      }
    }

    setCompaniesProgress(uploadedData.length);
    setIsProcessing(false);
  };

  const reset = () => {
    setContacts([]);
    setUploadedData([]);
    setStep('upload');
    setCompaniesProgress(0);
    setCompaniesTotal(0);
    setGroupsProgress(0);
    setGroupsTotal(0);
    setCurrentCompany('');
    setSelectedPersonas(new Set(ALL_PERSONAS.map((p) => p.title)));
  };

  const stepNum = step === 'upload' ? 1 : step === 'select' ? 2 : 3;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={reset}>
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
              <Database size={20} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">LeadEnrich</h1>
          </div>

          <div className="flex items-center space-x-4 text-sm font-medium text-slate-500">
            <div className={`flex items-center space-x-1.5 ${stepNum === 1 ? 'text-indigo-600' : ''}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${stepNum === 1 ? 'bg-indigo-100' : 'bg-slate-100'}`}>1</div>
              <span>Upload</span>
            </div>
            <ArrowRight size={14} className="text-slate-300" />
            <div className={`flex items-center space-x-1.5 ${stepNum === 2 ? 'text-indigo-600' : ''}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${stepNum === 2 ? 'bg-indigo-100' : 'bg-slate-100'}`}>2</div>
              <span>Personas</span>
            </div>
            <ArrowRight size={14} className="text-slate-300" />
            <div className={`flex items-center space-x-1.5 ${stepNum === 3 ? 'text-indigo-600' : ''}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${stepNum === 3 ? 'bg-indigo-100' : 'bg-slate-100'}`}>3</div>
              <span>Enrich</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {step === 'upload' && (
          <div className="space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-4">
              <h2 className="text-4xl font-extrabold tracking-tight text-slate-900">
                B2B Contact Enrichment
              </h2>
              <p className="text-lg text-slate-500 leading-relaxed">
                Upload your target accounts, choose which personas to search, and
                get enriched contacts with verified emails and profile links.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-12">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Users size={24} />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{ALL_PERSONAS.length} Personas</h3>
                <p className="text-sm text-slate-500">Choose which roles to search — or search all at once.</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Zap size={24} />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Optimized API</h3>
                <p className="text-sm text-slate-500">Batched queries — only {PERSONA_GROUPS.length} API calls per company.</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
                <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Database size={24} />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">10 Results/Call</h3>
                <p className="text-sm text-slate-500">Max results per query — up to {PERSONA_GROUPS.length * 10} contacts per company.</p>
              </div>
            </div>

            <FileUpload onUpload={handleUpload} />
          </div>
        )}

        {step === 'select' && (
          <PersonaSelector
            selected={selectedPersonas}
            onChange={setSelectedPersonas}
            onStartEnrichment={handleStartEnrichment}
            companyCount={uploadedData.length}
          />
        )}

        {step === 'enrich' && (
          <DataGrid
            contacts={contacts}
            isProcessing={isProcessing}
            currentCompany={currentCompany}
            companiesProgress={companiesProgress}
            companiesTotal={companiesTotal}
            groupsProgress={groupsProgress}
            groupsTotal={groupsTotal}
          />
        )}
      </main>
    </div>
  );
}
