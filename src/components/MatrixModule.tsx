/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Grid, 
  HelpCircle, 
  ChevronRight, 
  ShieldAlert, 
  Check, 
  Building2,
  FolderOpen,
  Search,
  Maximize2
} from 'lucide-react';
import { Risk, TenantConfig } from '../types';

interface MatrixModuleProps {
  risks: Risk[];
  tenantConfig: TenantConfig;
  onAddLog: (action: string, details: string) => void;
}

export default function MatrixModule({
  risks,
  tenantConfig,
  onAddLog
}: MatrixModuleProps) {
  const [matrixType, setMatrixType] = useState<'brut' | 'net'>('brut');
  const [selectedCell, setSelectedCell] = useState<{ y: number; x: number } | null>(null);
  
  // Local Filter States
  const [entityFilter, setEntityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Filter risk base list
  const filteredRisks = risks.filter(r => {
    const matchEntity = entityFilter === 'all' || r.entityId === entityFilter;
    const matchCat = categoryFilter === 'all' || r.categoryId === categoryFilter;
    return matchEntity && matchCat;
  });

  const getCriticality = (score: number) => {
    const found = tenantConfig.matrixThresholds.find(t => score >= t.minScore && score <= t.maxScore);
    return found || tenantConfig.matrixThresholds[0];
  };

  // Matrix sizes from 3 to 10
  const size = tenantConfig.matrixSize;

  // Render Brut Matrix (Frequency Y vs Impact X)
  // Y: Frequency goes from size down to 1
  // X: Impact goes from 1 up to size
  const freqValues = Array.from({ length: size }, (_, i) => size - i); // size, size-1... 1
  const impactValues = Array.from({ length: size }, (_, i) => i + 1); // 1, 2... size

  // IFACI Net Risk parameters (Risque brut Y vs Maitrise X)
  // Let's model a 4x4 or 5x5 showing:
  // Y: Risque Brut score bracket (ranges)
  // X: Éléments de maîtrise (1 to 4)
  const brutBrackets = [
    { label: 'Sévère (12-16)', min: 12, max: 16 },
    { label: 'Majeur (8-11)', min: 8, max: 11 },
    { label: 'Modéré (4-7)', min: 4, max: 7 },
    { label: 'Faible (1-3)', min: 1, max: 3 }
  ];
  const controlValues = [1, 2, 3, 4]; // Maîtrisé, Acceptable, Insuffisant, Faible

  const getCellClassNameForBrut = (f: number, i: number) => {
    const product = f * i;
    // We map product approximation to tenant thresholds
    // But since scores for net range up to 64, we normalize product score scale for Brut matrix colors
    const ratio = tenantConfig.matrixSize === 4 ? (16 / 64) : (25 / 25);
    const scoreVal = product / ratio;
    const crit = getCriticality(scoreVal);
    
    // Choose beautiful background color
    if (crit.label.includes('faible') || crit.label.includes('Mineur')) return 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-200';
    if (crit.label.includes('modéré') || crit.label.includes('Modéré')) return 'bg-amber-100 text-amber-850 hover:bg-amber-200 border-amber-200';
    if (crit.label.includes('significatif') || crit.label.includes('Critique')) return 'bg-orange-100 text-orange-850 hover:bg-orange-200 border-orange-200';
    return 'bg-rose-150 text-rose-800 hover:bg-rose-200 border-rose-300';
  };

  const getCellClassNameForNet = (brutMin: number, controlVal: number) => {
    // Estimating average brut (e.g. min * controlVal)
    const midBrut = brutMin; 
    let netScore = midBrut * controlVal;
    
    if (tenantConfig.formula.expression === '(P * I) - M') {
      netScore = Math.max(0, midBrut - controlVal);
    }

    const crit = getCriticality(netScore);
    if (crit.label.includes('faible') || crit.label.includes('Mineur')) return 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-200';
    if (crit.label.includes('modéré') || crit.label.includes('Modéré')) return 'bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200';
    if (crit.label.includes('significatif') || crit.label.includes('Critique')) return 'bg-orange-100 text-orange-800 hover:bg-orange-200 border-orange-200';
    return 'bg-rose-150 text-rose-800 hover:bg-rose-200 border-rose-300';
  };

  // Risks inside a selected Brut Cell
  const getRisksInBrutCell = (f: number, i: number) => {
    return filteredRisks.filter(r => r.frequencyValue === f && r.impactValue === i);
  };

  // Risks inside a selected Net Cell (Brut bracket vs Maîtrise value)
  const getRisksInNetCell = (brutMin: number, brutMax: number, m: number) => {
    return filteredRisks.filter(r => r.scoreBrut >= brutMin && r.scoreBrut <= brutMax && r.controlValue === m);
  };

  const currentCellRisks = selectedCell 
    ? (matrixType === 'brut' 
        ? getRisksInBrutCell(selectedCell.y, selectedCell.x)
        : getRisksInNetCell(selectedCell.y, selectedCell.y + 3, selectedCell.x) // approximations
      )
    : [];

  const handleCellClick = (y: number, x: number) => {
    setSelectedCell({ y, x });
    onAddLog('Drill-down Matrice', `Filtre interactif appliqué sur la coordonnée [Y=${y}, X=${x}]`);
  };

  return (
    <div className="flex-1 p-6 bg-slate-50 overflow-y-auto space-y-6 text-slate-800 text-xs">
      
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Grid className="w-5 h-5 text-indigo-650" />
            Matrice Analytique des Risques (Heatmap)
          </h2>
          <p className="text-slate-500 text-[11px]">
            Visualisation bi-dimensionnelle de la cartographie. Cliquez sur n'importe quelle cellule pour filtrer et inspecter les risques (drill-down).
          </p>
        </div>

        {/* Matrix selector tab */}
        <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
          <button
            onClick={() => { setMatrixType('brut'); setSelectedCell(null); }}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              matrixType === 'brut' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            🔥 1. Risque Brut (P x I)
          </button>
          <button
            onClick={() => { setMatrixType('net'); setSelectedCell(null); }}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              matrixType === 'net' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            🛡️ 2. Risque Net (Brut x Maîtrise)
          </button>
        </div>
      </div>

      {/* Advanced Filter options for the Matrix heatmap */}
      <div className="flex flex-wrap items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
        <span className="font-bold text-slate-400 uppercase text-[10px] mr-2">Filtrer Heatmap :</span>
        <div className="flex items-center gap-2">
          <Building2 className="w-3.5 h-3.5 text-slate-400" />
          <select 
            value={entityFilter}
            onChange={(e) => { setEntityFilter(e.target.value); setSelectedCell(null); }}
            className="bg-slate-50 border border-slate-200 text-slate-700 font-semibold rounded px-2 py-1 text-xs"
          >
            <option value="all">Toutes les entités</option>
            {tenantConfig.entities.map(e => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <FolderOpen className="w-3.5 h-3.5 text-slate-400" />
          <select 
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setSelectedCell(null); }}
            className="bg-slate-50 border border-slate-200 text-slate-700 font-semibold rounded px-2 py-1 text-xs"
          >
            <option value="all">Toutes les catégories</option>
            {tenantConfig.categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Layout Split: Heatmap on left, Risks on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* HEATMAP SCREEN */}
        <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-800">
            {matrixType === 'brut' 
              ? `Grille d'Évaluation de Sévérité Brute (${size}x${size})`
              : "Grille d'Appréciation du Risque Net (Matrice Risque Brut vs Maîtrise)"}
          </h3>

          {/* Brut Heatmap */}
          {matrixType === 'brut' ? (
            <div className="space-y-1">
              {/* Y Axis: Frequency */}
              {freqValues.map((f) => (
                <div key={f} className="flex items-stretch">
                  <div className="w-24 shrink-0 flex items-center pr-2 text-right justify-end font-semibold text-slate-500 text-[11px]">
                    {tenantConfig.scales.frequency.find(item => item.value === f)?.label || `Cotation ${f}`}
                  </div>
                  <div className="flex-1 grid grid-cols-4 sm:grid-cols-5 md:grid-cols-4 gap-1" style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}>
                    {impactValues.map((i) => {
                      const cellsCount = getRisksInBrutCell(f, i).length;
                      const cellSelected = selectedCell && selectedCell.y === f && selectedCell.x === i;
                      return (
                        <div
                          key={i}
                          onClick={() => handleCellClick(f, i)}
                          className={`h-20 flex flex-col items-center justify-center border rounded-lg cursor-pointer transition relative ${getCellClassNameForBrut(f, i)} ${
                            cellSelected ? 'ring-4 ring-indigo-600 ring-offset-1 border-transparent scale-98 shadow-md z-10' : ''
                          }`}
                        >
                          {/* Cell Coordinates Indicator */}
                          <span className="absolute top-1 left-2 font-mono text-[9px] text-slate-400/90 font-bold">
                            P{f}, I{i}
                          </span>
                          
                          {/* Risks bubble count inside */}
                          {cellsCount > 0 ? (
                            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-extrabold flex items-center justify-center shadow-md animate-pulse">
                              {cellsCount}
                            </div>
                          ) : (
                            <span className="text-slate-300 text-xs">-</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* X Axis: Impact bottom labels */}
              <div className="flex pt-2">
                <div className="w-24 shrink-0"></div>
                <div className="flex-1 grid gap-1 text-center font-bold text-slate-500 text-[10px]" style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}>
                  {impactValues.map((i) => (
                    <div key={i} className="pt-1 select-none leading-none">
                      <p className="text-slate-600 font-mono text-[11px] font-black">I={i}</p>
                      <p className="text-[9px] text-slate-400 font-normal truncate mt-0.5">
                        {tenantConfig.scales.impact.find(item => item.value === i)?.label || `Impact ${i}`}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* IFACI Net Heatmap: Bracket vs Control */
            <div className="space-y-1">
              {brutBrackets.map((bracket) => (
                <div key={bracket.min} className="flex items-stretch">
                  <div className="w-24 shrink-0 flex items-center pr-2 text-right justify-end font-semibold text-slate-500 text-[11px]">
                    {bracket.label}
                  </div>
                  <div className="flex-1 grid grid-cols-4 gap-1">
                    {controlValues.map((coef) => {
                      const cellsCount = getRisksInNetCell(bracket.min, bracket.max, coef).length;
                      const cellSelected = selectedCell && selectedCell.y === bracket.min && selectedCell.x === coef;
                      return (
                        <div
                          key={coef}
                          onClick={() => handleCellClick(bracket.min, coef)}
                          className={`h-22 flex flex-col items-center justify-center border rounded-lg cursor-pointer transition relative ${getCellClassNameForNet(bracket.min, coef)} ${
                            cellSelected ? 'ring-4 ring-indigo-600 ring-offset-1 border-transparent scale-98 shadow-md z-10' : ''
                          }`}
                        >
                          <span className="absolute top-1 left-2 font-mono text-[9px] text-slate-400/90 font-bold">
                            Brut x Maîtrise{coef}
                          </span>
                          
                          {cellsCount > 0 ? (
                            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-extrabold flex items-center justify-center shadow-md animate-pulse">
                              {cellsCount}
                            </div>
                          ) : (
                            <span className="text-slate-300 text-xs">-</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* X Axis: Control bottom labels */}
              <div className="flex pt-2">
                <div className="w-24 shrink-0"></div>
                <div className="flex-1 grid grid-cols-4 gap-1 text-center font-bold text-slate-500 text-[10px]">
                  {controlValues.map((coef) => (
                    <div key={coef} className="pt-1 select-none leading-none">
                      <p className="text-slate-600 font-mono text-[11px] font-black">M={coef}</p>
                      <p className="text-[9px] text-slate-400 font-normal truncate mt-0.5">
                        {tenantConfig.scales.control.find(item => item.value === coef)?.label || `Maitrise ${coef}`}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Color legends matching thresholds */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap justify-between gap-3 text-[10px]">
            {tenantConfig.matrixThresholds.map((t, idx) => (
              <div key={idx} className="flex items-center gap-1.5 p-1 px-2.5 rounded bg-slate-50 border border-slate-150">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: t.textColor }}></span>
                <span className="font-bold text-slate-700">{t.label} :</span>
                <span className="text-slate-500 font-mono font-medium">({t.minScore}-{t.maxScore})</span>
              </div>
            ))}
          </div>
        </div>

        {/* DRILL DOWN RESULTS LIST */}
        <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Maximize2 className="w-4 h-4 text-purple-600" />
              Drill-down : Détails de la Cellule Sélectionnée
            </h3>

            {!selectedCell ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <Grid className="w-10 h-10 text-slate-200 mx-auto" />
                <p className="font-semibold text-xs text-slate-500">Aucune sélection active</p>
                <p className="text-[10px] max-w-[200px] mx-auto text-slate-400">
                  Cliquez sur n'importe quelle cellule colorée dans la grille de gauche pour lister instantanément les risques associés.
                </p>
              </div>
            ) : currentCellRisks.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <p className="font-bold text-indigo-600 text-[11px]">Zéro risque</p>
                <p className="text-[10px] text-slate-400 mt-1">Aucun incident de risque n'est encore positionné sur cette criticité.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                <p className="font-bold text-slate-800 text-[10px] uppercase">
                  {currentCellRisks.length} {currentCellRisks.length > 1 ? 'Risques Identifiés' : 'Risque Identifié'} :
                </p>
                
                {currentCellRisks.map((risk) => {
                  const crit = getCriticality(risk.scoreResiduel);
                  return (
                    <div 
                      key={risk.id}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-lg hover:border-indigo-300 transition-all space-y-2"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-mono font-bold text-slate-700 bg-slate-200 px-1.5 py-0.5 rounded text-[9.5px]">
                          {risk.id}
                        </span>
                        <span 
                          className="px-2 py-0.5 rounded text-[9px] font-bold"
                          style={{ backgroundColor: crit.color, color: crit.textColor }}
                        >
                          Net: {risk.scoreResiduel}
                        </span>
                      </div>
                      <p className="font-bold text-slate-800 text-[11.5px] leading-tight">{risk.title}</p>
                      
                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1.5 border-t border-slate-200/40">
                        <span>P: {risk.frequencyValue} | I: {risk.impactValue} | M: {risk.controlValue}</span>
                        <span className="font-semibold text-slate-500">Score Brut: {risk.scoreBrut}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded text-[10px] text-blue-850 flex items-start gap-1.5">
            <HelpCircle className="w-4 h-4 text-blue-600 shrink-0 select-none mt-0.5" />
            <p>
              <strong>Qu'est-ce que le Drill-Down ?</strong> C'est la possibilité offerte par le système GRC de descendre de la vision macro (les statistiques de la Heatmap) à la vision micro (les fiches individuelles correspondantes) en un clic.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
