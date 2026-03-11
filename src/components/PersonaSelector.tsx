import React from 'react';
import { CheckSquare, Square, Search } from 'lucide-react';
import { PERSONA_GROUPS, ALL_PERSONAS } from '../config/personas';

interface PersonaSelectorProps {
  selected: Set<string>;
  onChange: (selected: Set<string>) => void;
  onStartEnrichment: () => void;
  companyCount: number;
}

export default function PersonaSelector({
  selected,
  onChange,
  onStartEnrichment,
  companyCount,
}: PersonaSelectorProps) {
  const allTitles = ALL_PERSONAS.map((p) => p.title);
  const allSelected = allTitles.every((t) => selected.has(t));
  const noneSelected = selected.size === 0;

  const toggleAll = () => {
    if (allSelected) {
      onChange(new Set());
    } else {
      onChange(new Set(allTitles));
    }
  };

  const toggle = (title: string) => {
    const next = new Set(selected);
    if (next.has(title)) {
      next.delete(title);
    } else {
      next.add(title);
    }
    onChange(next);
  };

  const toggleGroup = (groupName: string) => {
    const group = PERSONA_GROUPS.find((g) => g.name === groupName);
    if (!group) return;
    const titles = group.personas.map((p) => p.title);
    const allGroupSelected = titles.every((t) => selected.has(t));
    const next = new Set(selected);
    if (allGroupSelected) {
      titles.forEach((t) => next.delete(t));
    } else {
      titles.forEach((t) => next.add(t));
    }
    onChange(next);
  };

  const activeGroupCount = PERSONA_GROUPS.filter((g) =>
    g.personas.some((p) => selected.has(p.title))
  ).length;

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Select Personas to Search</h2>
          <p className="text-sm text-slate-500 mt-1">
            {selected.size} of {allTitles.length} personas selected · {activeGroupCount} API {activeGroupCount === 1 ? 'call' : 'calls'} per company · {companyCount} {companyCount === 1 ? 'company' : 'companies'}
          </p>
        </div>
        <button
          onClick={toggleAll}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center space-x-1.5"
        >
          {allSelected ? <CheckSquare size={16} /> : <Square size={16} />}
          <span>{allSelected ? 'Deselect All' : 'Select All'}</span>
        </button>
      </div>

      <div className="space-y-4">
        {PERSONA_GROUPS.map((group) => {
          const titles = group.personas.map((p) => p.title);
          const groupAllSelected = titles.every((t) => selected.has(t));
          const groupSomeSelected = titles.some((t) => selected.has(t));

          return (
            <div
              key={group.name}
              className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm"
            >
              <button
                onClick={() => toggleGroup(group.name)}
                className="flex items-center space-x-2 w-full text-left mb-3"
              >
                <div className={`w-4 h-4 rounded border flex items-center justify-center text-white text-xs
                  ${groupAllSelected ? 'bg-indigo-600 border-indigo-600' : groupSomeSelected ? 'bg-indigo-300 border-indigo-300' : 'border-slate-300'}`}
                >
                  {(groupAllSelected || groupSomeSelected) && '✓'}
                </div>
                <span className="text-sm font-semibold text-slate-900">{group.name}</span>
                <span className="text-xs text-slate-400 ml-auto">
                  {titles.filter((t) => selected.has(t)).length}/{titles.length}
                </span>
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {group.personas.map((persona) => {
                  const isSelected = selected.has(persona.title);
                  return (
                    <button
                      key={persona.title}
                      onClick={() => toggle(persona.title)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-left text-sm transition-colors
                        ${isSelected ? 'bg-indigo-50 text-indigo-800' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                      <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-white text-[10px]
                        ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'}`}
                      >
                        {isSelected && '✓'}
                      </div>
                      <span>{persona.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-2">
        <p className="text-xs text-slate-400">
          Total: {activeGroupCount * companyCount} API {activeGroupCount * companyCount === 1 ? 'call' : 'calls'} · {activeGroupCount * companyCount * 10} max results
        </p>
        <button
          onClick={onStartEnrichment}
          disabled={noneSelected}
          className={`flex items-center space-x-2 px-6 py-2.5 rounded-lg font-medium transition-colors
            ${noneSelected
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
            }`}
        >
          <Search size={18} />
          <span>Start Enrichment</span>
        </button>
      </div>
    </div>
  );
}
