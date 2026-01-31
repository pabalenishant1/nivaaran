'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Save, MoreVertical, User } from 'lucide-react';

interface PatientCase {
  case_id: string;
  patient_inputs: {
    name?: string;
    age: string;
    gender: string;
    complaint: string;
    duration: string;
    history: string;
    language: string;
  };
  ocr_text: string;
  ai_summary: string;
  aiSummary?: string;
  doctor_notes: string;
  status: string;
  timestamp: string;
}

export default function DoctorDashboard() {
  const [cases, setCases] = useState<PatientCase[]>([]);
  const [selectedCase, setSelectedCase] = useState<PatientCase | null>(null);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showRef, setShowRef] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch('/api/cases');
        const data: PatientCase[] = await response.json();
        const sorted = data.sort((a: PatientCase, b: PatientCase) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setCases(sorted);
        if (!selectedCase && sorted.length > 0) {
          // Optional: auto-select first case
        }
      } catch (error) {
        console.error('Failed to fetch cases:', error);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [selectedCase]);

  const handleCaseClick = (patientCase: PatientCase) => {
    setSelectedCase(patientCase);
    setNotes(patientCase.doctor_notes || '');
  };

  const handleSaveNotes = async () => {
    if (!selectedCase) return;
    setIsSaving(true);
    try {
      const response = await fetch('https://nivaaran-q9op.onrender.com/doctor-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          case_id: selectedCase.case_id,
          doctor_notes: notes,
        }),
      });

      if (response.ok) {
        const updatedCases = cases.map(c => 
          c.case_id === selectedCase.case_id ? { ...c, doctor_notes: notes } : c
        );
        setCases(updatedCases);
      } else {
        alert('Failed to save notes');
      }
    } catch (error) {
      console.error('Error saving notes:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Helper to format date
  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    }).format(date);
  };

  return (
    <div className="flex h-screen bg-[#F9FAFB] font-sans overflow-hidden">
      
      {/* Sidebar - Fixed Width */}
      <aside className="w-[340px] bg-white border-r border-gray-200 flex flex-col flex-shrink-0 z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        {/* Logo Header */}
        <div className="h-20 px-6 flex items-center border-b border-gray-100">
           <Image src="/logo-full-black.svg" alt="Nivaaran" width={120} height={32} priority />
        </div>

        {/* Search / Filter (Optional placeholder based on typical design) */}
        {/* <div className="p-4 border-b border-gray-100">
            <div className="bg-gray-50 rounded-lg px-3 py-2 flex items-center gap-2 text-gray-400">
                <Search className="w-4 h-4" />
                <span className="text-sm">Search patients...</span>
            </div>
        </div> */}

        {/* Queue Header */}
        <div className="px-6 py-5 flex items-center justify-between bg-white">
           <h2 className="text-sm font-bold text-slate-800">Patient Queue</h2>
           <span className="bg-[#E0F2F1] text-[#0F3D3E] text-xs font-bold px-2.5 py-1 rounded-full">{cases.length}</span>
        </div>

        {/* Patient List */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
           {isLoading && cases.length === 0 ? (
               <div className="text-center py-10 text-slate-400 text-sm">Loading...</div>
           ) : cases.length === 0 ? (
               <div className="text-center py-10 text-slate-400 text-sm">No active cases</div>
           ) : (
               cases.map((c) => (
                   <div 
                       key={c.case_id}
                       onClick={() => handleCaseClick(c)}
                       className={`p-4 rounded-lg cursor-pointer transition-all duration-200 border group ${
                           selectedCase?.case_id === c.case_id 
                               ? 'bg-[#F0FDF4] border-[#16A34A] shadow-sm' 
                               : 'bg-white border-gray-100 hover:border-gray-300 hover:shadow-sm'
                       }`}
                   >
                       {/* Row 1: Name & Time */}
                       <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-slate-900 text-[15px] group-hover:text-[#0F3D3E] transition-colors">
                               {c.patient_inputs.name || 'Patient'}
                           </h3>
                           <span className="text-xs text-slate-400 font-medium">{formatTime(c.timestamp)}</span>
                       </div>

                       {/* Row 2: Demographics & ID */}
                       <div className="flex items-center gap-2 mb-3 text-xs text-slate-500">
                           <span className="font-semibold">{c.patient_inputs.age} {c.patient_inputs.gender.charAt(0)}</span>
                           <span className="text-slate-300">•</span>
                           <span>#{c.case_id.slice(0, 7).toUpperCase()}</span>
                       </div>

                       {/* Row 3: Complaint Snippet */}
                       <p className="text-sm text-slate-600 mb-3 line-clamp-2 italic">
                           {c.patient_inputs.complaint}
                       </p>

                       {/* Row 4: Status Badge */}
                       <div className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide ${
                           selectedCase?.case_id === c.case_id 
                            ? 'bg-[#16A34A] text-white' 
                            : 'bg-gray-100 text-gray-500'
                       }`}>
                           {selectedCase?.case_id === c.case_id ? 'Ready for Review' : 'Processing'}
                       </div>
                   </div>
               ))
           )}
        </div>

        {/* Doctor Profile (Footer) */}
        <div className="p-4 border-t border-gray-100 bg-white">
            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center border border-slate-200 font-bold text-sm">
                    DK
                </div>
                <div className="flex-1">
                    <p className="text-sm font-bold text-slate-900">Dr. Kapoor</p>
                    <p className="text-xs text-slate-500">Cardiology</p>
                </div>
                <MoreVertical className="w-4 h-4 text-slate-400" />
            </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#F5F6F7]">
         {selectedCase ? (
            <div className="h-full flex flex-col">
                {/* Top Header */}
                <header className="h-20 px-8 flex items-center justify-between bg-white border-b border-gray-200 flex-shrink-0">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-xl font-bold text-slate-900">
                                {selectedCase.patient_inputs.name || 'Patient'}
                            </h1>
                            <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded font-medium border border-slate-200">
                                {selectedCase.patient_inputs.age} Years, {selectedCase.patient_inputs.gender}
                            </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">Case ID: #{selectedCase.case_id.toUpperCase()}</p>
                    </div>
                </header>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-5xl mx-auto space-y-6">
                        
                        {/* AI Summary Card */}
                        <Card className="p-0 overflow-hidden rounded-2xl border-gray-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)]">
                            <div className="bg-[#0F3D3E] px-6 py-4 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"/>
                                <h3 className="text-white font-bold text-sm tracking-wide uppercase">AI Assessment Summary</h3>
                            </div>
                            <div className="p-6 bg-white">
                                <p className="text-slate-700 leading-7 whitespace-pre-line text-[15px]">
                                    {selectedCase.aiSummary || selectedCase.ai_summary}
                                </p>
                            </div>
                        </Card>

                        <div className="grid grid-cols-12 gap-6">
                            {/* Patient Data */}
                            <div className="col-span-7 space-y-6">
                                <Card className="p-0 overflow-hidden rounded-2xl border-gray-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)]">
                                  <div className="bg-[#0F3D3E]/5 px-6 py-3">
                                    <h4 className="text-xs font-bold text-[#0F3D3E] uppercase tracking-wider">Patient Reported Data</h4>
                                  </div>
                                  <div className="p-6 bg-white">
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-3 gap-4 pb-4 border-b border-gray-50">
                                            <span className="text-sm text-slate-500">Chief Complaint</span>
                                            <span className="col-span-2 text-sm font-medium text-slate-900">{selectedCase.patient_inputs.complaint}</span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4 pb-4 border-b border-gray-50">
                                            <span className="text-sm text-slate-500">Duration</span>
                                            <span className="col-span-2 text-sm font-medium text-slate-900">{selectedCase.patient_inputs.duration}</span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4">
                                            <span className="text-sm text-slate-500">Medical History</span>
                                            <span className="col-span-2 text-sm font-medium text-slate-900">{selectedCase.patient_inputs.history || 'None reported'}</span>
                                        </div>
                                    </div>
                                  </div>
                                </Card>

                                {/* Doctor Notes */}
                                <Card className="p-0 overflow-hidden rounded-2xl border-gray-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)]">
                                  <div className="bg-[#0F3D3E]/5 px-6 py-3 flex items-center justify-between">
                                    <h4 className="text-xs font-bold text-[#0F3D3E] uppercase tracking-wider">Clinical Notes</h4>
                                    <span className="text-[10px] text-slate-500">Auto-saves</span>
                                  </div>
                                  <div className="p-6 bg-white">
                                    <Textarea 
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Type your findings here..."
                                        className="min-h-[120px] bg-slate-50 border-gray-200 focus:bg-white transition-colors"
                                    />
                                    <div className="mt-4">
                                        <Button 
                                            onClick={handleSaveNotes} 
                                            disabled={isSaving} 
                                            className="w-full bg-[#0F3D3E] hover:bg-[#092526] text-white h-12 text-base font-semibold shadow-md hover:shadow-lg transition-all"
                                        >
                                            {isSaving ? (
                                                'Saving...'
                                            ) : (
                                                <>
                                                    <Save className="w-4 h-4 mr-2" /> Save Clinical Record
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                  </div>
                                </Card>
                            </div>

                            {/* Right Panel: Reference Documents (Collapsible) */}
                            <div className="col-span-5 space-y-6">
                                <Card className="p-0 overflow-hidden rounded-2xl border-gray-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] h-full">
                                  <div className="bg-[#0F3D3E]/5 px-6 py-3 flex items-center justify-between">
                                    <h4 className="text-xs font-bold text-[#0F3D3E] uppercase tracking-wider">Reference Document</h4>
                                    <Button 
                                      variant="outline" 
                                      className="text-xs"
                                      onClick={() => setShowRef(prev => !prev)}
                                    >
                                      View Original (for reference)
                                    </Button>
                                  </div>
                                  <div className="p-6 bg-white">
                                    {selectedCase.ocr_text && showRef ? (
                                      <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                        <div className="flex items-center gap-2 mb-2">
                                          <FileText className="w-4 h-4 text-[#0F3D3E]" />
                                          <span className="text-xs font-bold text-[#0F3D3E]">Medical Report</span>
                                        </div>
                                        <p className="text-xs text-slate-600 font-mono leading-relaxed">
                                          {selectedCase.ocr_text}
                                        </p>
                                      </div>
                                    ) : (
                                      <div className="text-xs text-slate-400">
                                        {selectedCase.ocr_text ? 'Hidden — expand to view original text' : 'No documents uploaded'}
                                      </div>
                                    )}
                                  </div>
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
         ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <User className="w-8 h-8 opacity-20" />
                </div>
                <p>Select a patient from the queue to view details</p>
            </div>
         )}
      </main>
    </div>
  );
}
