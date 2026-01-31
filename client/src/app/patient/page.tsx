'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronDown, CloudUpload, ArrowRight, X } from 'lucide-react';
import { Card } from '@/components/ui/card';

// Simple language dictionary for patient-side UI (en/hi/mr)
type Language = 'en' | 'hi' | 'mr';
const DICT: Record<Language, {
  pageTitle: string;
  faq: string;
  languageCardTitle: string;
  languageCardSubtitle: string;
  languageSelectPlaceholder: string;
  languageNameEN: string;
  languageNameHI: string;
  languageNameMR: string;
  basicInfoTitle: string;
  nameLabel: string;
  namePlaceholder: string;
  ageLabel: string;
  agePlaceholder: string;
  genderLabel: string;
  genderSelect: string;
  genderMale: string;
  genderFemale: string;
  genderOther: string;
  complaintLabel: string;
  complaintPlaceholder: string;
  durationLabel: string;
  durationPlaceholder: string;
  historyLabel: string;
  historyPlaceholder: string;
  uploadTitle: string;
  uploadClick: string;
  uploadSub: string;
  previewTitle: string;
  previewSubtitle: string;
  patientInfoTitle: string;
  healthComplaintTitle: string;
  medicalHistoryTitle: string;
  noComplaintPlaceholder: string;
  noneListedPlaceholder: string;
  submit: string;
  submitting: string;
  termsNotice: string;
}> = {
  en: {
    pageTitle: 'Patient Intake',
    faq: 'FAQs',
    languageCardTitle: 'Select your preferred language',
    languageCardSubtitle: 'Our assistant can chat with you in multiple languages.',
    languageSelectPlaceholder: 'Select language',
    languageNameEN: 'English (US)',
    languageNameHI: 'Hindi',
    languageNameMR: 'Marathi',
    basicInfoTitle: 'BASIC INFORMATION',
    nameLabel: 'Name',
    namePlaceholder: 'e.g. Ramesh Gupta',
    ageLabel: 'Age',
    agePlaceholder: 'e.g. 32',
    genderLabel: 'Gender',
    genderSelect: 'Select gender',
    genderMale: 'Male',
    genderFemale: 'Female',
    genderOther: 'Other',
    complaintLabel: 'Chief Complaint',
    complaintPlaceholder: 'Please describe your symptoms in detail...',
    durationLabel: 'Duration',
    durationPlaceholder: 'e.g. 3 days, 1 week',
    historyLabel: 'Medical History',
    historyPlaceholder: 'e.g. Diabetes, Hypertension',
    uploadTitle: 'UPLOAD DOCUMENTS (OPTIONAL)',
    uploadClick: 'Click to upload or drag and drop',
    uploadSub: 'Previous prescription or medical report (max. 10MB)',
    previewTitle: 'Preview',
    previewSubtitle: 'Review your details before submission',
    patientInfoTitle: 'Patient Information',
    healthComplaintTitle: 'Health Complaint',
    medicalHistoryTitle: 'Medical History',
    noComplaintPlaceholder: 'No details added yet...',
    noneListedPlaceholder: 'None listed',
    submit: 'Submit Case',
    submitting: 'Submitting...',
    termsNotice: 'By clicking the button, you agree to our Terms and Privacy Policy.',
  },
  hi: {
    pageTitle: 'रोगी विवरण',
    faq: 'प्रश्नोत्तर',
    languageCardTitle: 'अपनी पसंदीदा भाषा चुनें',
    languageCardSubtitle: 'हमारा सहायक कई भाषाओं में आपसे बात कर सकता है।',
    languageSelectPlaceholder: 'भाषा चुनें',
    languageNameEN: 'अंग्रेज़ी (US)',
    languageNameHI: 'हिंदी',
    languageNameMR: 'मराठी',
    basicInfoTitle: 'मूल जानकारी',
    nameLabel: 'नाम',
    namePlaceholder: 'उदा. रमेश गुप्ता',
    ageLabel: 'आयु',
    agePlaceholder: 'उदा. 32',
    genderLabel: 'लिंग',
    genderSelect: 'लिंग चुनें',
    genderMale: 'पुरुष',
    genderFemale: 'महिला',
    genderOther: 'अन्य',
    complaintLabel: 'मुख्य शिकायत',
    complaintPlaceholder: 'कृपया अपने लक्षणों का विस्तृत वर्णन करें...',
    durationLabel: 'अवधि',
    durationPlaceholder: 'उदा. 3 दिन, 1 सप्ताह',
    historyLabel: 'चिकित्सा इतिहास',
    historyPlaceholder: 'उदा. मधुमेह, उच्च रक्तचाप',
    uploadTitle: 'दस्तावेज़ अपलोड करें (वैकल्पिक)',
    uploadClick: 'अपलोड करने के लिए क्लिक करें या खींचें और छोड़ें',
    uploadSub: 'पिछला पर्चा या मेडिकल रिपोर्ट (अधिकतम 10MB)',
    previewTitle: 'पूर्वावलोकन',
    previewSubtitle: 'सबमिट करने से पहले अपनी जानकारी देखें',
    patientInfoTitle: 'रोगी जानकारी',
    healthComplaintTitle: 'स्वास्थ्य शिकायत',
    medicalHistoryTitle: 'चिकित्सा इतिहास',
    noComplaintPlaceholder: 'अब तक कोई विवरण नहीं जोड़ा गया...',
    noneListedPlaceholder: 'कुछ नहीं',
    submit: 'प्रेषित करें',
    submitting: 'प्रेषण हो रहा है...',
    termsNotice: 'बटन पर क्लिक करके, आप हमारी शर्तों और गोपनीयता नीति से सहमत हैं।',
  },
  mr: {
    pageTitle: 'रुग्ण नोंद',
    faq: 'प्रश्नोत्तर',
    languageCardTitle: 'आपली पसंतीची भाषा निवडा',
    languageCardSubtitle: 'आमचा सहाय्यक अनेक भाषांमध्ये तुमच्याशी बोलू शकतो.',
    languageSelectPlaceholder: 'भाषा निवडा',
    languageNameEN: 'इंग्रजी (US)',
    languageNameHI: 'हिंदी',
    languageNameMR: 'मराठी',
    basicInfoTitle: 'मूलभूत माहिती',
    nameLabel: 'नाव',
    namePlaceholder: 'उदा. रमेश गुप्ता',
    ageLabel: 'वय',
    agePlaceholder: 'उदा. 32',
    genderLabel: 'लिंग',
    genderSelect: 'लिंग निवडा',
    genderMale: 'पुरुष',
    genderFemale: 'स्त्री',
    genderOther: 'इतर',
    complaintLabel: 'मुख्य तक्रार',
    complaintPlaceholder: 'कृपया आपल्या लक्षणांचे सविस्तर वर्णन करा...',
    durationLabel: 'कालावधी',
    durationPlaceholder: 'उदा. 3 दिवस, 1 आठवडा',
    historyLabel: 'वैद्यकीय इतिहास',
    historyPlaceholder: 'उदा. मधुमेह, उच्च रक्तदाब',
    uploadTitle: 'दस्तऐवज अपलोड करा (ऐच्छिक)',
    uploadClick: 'अपलोड करण्यासाठी क्लिक करा किंवा ड्रॅग आणि ड्रॉप करा',
    uploadSub: 'मागील प्रिस्क्रिप्शन किंवा वैद्यकीय अहवाल (कमाल 10MB)',
    previewTitle: 'पूर्वदृश्य',
    previewSubtitle: 'सबमिट करण्यापूर्वी तुमचे तपशील पहा',
    patientInfoTitle: 'रुग्ण माहिती',
    healthComplaintTitle: 'आरोग्य तक्रार',
    medicalHistoryTitle: 'वैद्यकीय इतिहास',
    noComplaintPlaceholder: 'आतापर्यंत कोणतेही तपशील जोडलेले नाहीत...',
    noneListedPlaceholder: 'काहीही नाही',
    submit: 'सबमिट',
    submitting: 'सबमिट करत आहे...',
    termsNotice: 'बटन क्लिक करून, तुम्ही आमच्या अटी आणि गोपनीयता धोरणास सहमती देता.',
  }
} as const;

export default function PatientIntake() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    complaint: '',
    duration: '',
    history: '',
    language: 'en' as Language
  });
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.age || !formData.gender || !formData.complaint || !formData.duration) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => data.append(key, value));
      if (files.length > 0) {
        for (const f of files) data.append('prescription', f);
      }

      const response = await fetch('/api/create-case', {
        method: 'POST',
        body: data,
      });

      if (!response.ok) throw new Error('Failed to submit case');
      const result = await response.json();
      alert(`Case Submitted Successfully! ID: ${result.case_id}`);
      
      // Reset form
      setFormData({ name: '', age: '', gender: '', complaint: '', duration: '', history: '', language: 'en' });
      setFiles([]);
    } catch (err) {
      console.error(err);
      alert('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans text-slate-900">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 h-[72px] sticky top-0 z-50">
        <div className="max-w-[1440px] mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex-shrink-0">
             <Image src="/logo-full-black.svg" alt="Nivaaran" width={110} height={28} priority />
          </div>
          <button className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
            {DICT[formData.language].faq} <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </nav>

      <main className="max-w-[1440px] mx-auto px-6 py-10">
        <div className="flex flex-col lg:flex-row gap-8 xl:gap-12 items-start">
          
          {/* Left Column - Form Area */}
          <div className="flex-1 w-full max-w-4xl">
            
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <h1 className="text-[32px] font-bold tracking-tight text-[#0F3D3E]">{DICT[formData.language].pageTitle}</h1>
              <div className="flex bg-white p-1 rounded-full border border-gray-200 shadow-sm">
                {['en', 'hi', 'mr'].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => handleSelectChange('language', lang)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                      formData.language === lang 
                        ? 'bg-slate-900 text-white shadow-md' 
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {lang === 'en' ? DICT[formData.language].languageNameEN : lang === 'hi' ? DICT[formData.language].languageNameHI : DICT[formData.language].languageNameMR}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              
              {/* Language Selection Card */}
              <Card className="p-8 rounded-2xl border-gray-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] bg-white">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-1">{DICT[formData.language].languageCardTitle}</h3>
                    <p className="text-slate-500 text-sm">{DICT[formData.language].languageCardSubtitle}</p>
                  </div>
                  <div className="w-full md:w-[240px]">
                    <Select 
                      value={formData.language} 
                      onValueChange={(val) => handleSelectChange('language', val)}
                    >
                      <SelectTrigger className="h-11 border-gray-200 rounded-lg focus:ring-[#0F3D3E] focus:border-[#0F3D3E]">
                        <SelectValue placeholder={DICT[formData.language].languageSelectPlaceholder} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">{DICT[formData.language].languageNameEN}</SelectItem>
                        <SelectItem value="hi">{DICT[formData.language].languageNameHI}</SelectItem>
                        <SelectItem value="mr">{DICT[formData.language].languageNameMR}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>

              {/* Main Intake Form Card */}
              <Card className="p-8 rounded-2xl border-gray-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] bg-white">
                
                {/* Basic Information Section */}
                <div className="mb-10">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">{DICT[formData.language].basicInfoTitle}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">
                        {DICT[formData.language].nameLabel} <span className="text-red-500">*</span>
                      </label>
                      <Input 
                        name="name"
                        placeholder={DICT[formData.language].namePlaceholder}
                        value={formData.name}
                        onChange={handleChange}
                        className="h-12 border-gray-200 rounded-lg focus-visible:ring-[#0F3D3E] focus-visible:ring-offset-0 bg-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">
                        {DICT[formData.language].ageLabel} <span className="text-red-500">*</span>
                      </label>
                      <Input 
                        name="age"
                        type="number"
                        placeholder={DICT[formData.language].agePlaceholder}
                        value={formData.age}
                        onChange={handleChange}
                        className="h-12 border-gray-200 rounded-lg focus-visible:ring-[#0F3D3E] focus-visible:ring-offset-0 bg-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">
                        {DICT[formData.language].genderLabel} <span className="text-red-500">*</span>
                      </label>
                      <Select 
                        value={formData.gender} 
                        onValueChange={(val) => handleSelectChange('gender', val)}
                      >
                        <SelectTrigger className="h-12 border-gray-200 rounded-lg focus:ring-[#0F3D3E] focus:ring-offset-0">
                          <SelectValue placeholder={DICT[formData.language].genderSelect} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">{DICT[formData.language].genderMale}</SelectItem>
                          <SelectItem value="Female">{DICT[formData.language].genderFemale}</SelectItem>
                          <SelectItem value="Other">{DICT[formData.language].genderOther}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Health Complaint Section */}
                <div className="mb-10">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">{DICT[formData.language].healthComplaintTitle.toUpperCase()}</h4>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">
                      {DICT[formData.language].complaintLabel} <span className="text-red-500">*</span>
                    </label>
                    <Textarea 
                      name="complaint"
                      placeholder={DICT[formData.language].complaintPlaceholder}
                      className="min-h-[120px] border-gray-200 rounded-lg resize-none p-4 focus-visible:ring-[#0F3D3E] focus-visible:ring-offset-0 bg-white"
                      value={formData.complaint}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Medical History Section */}
                <div className="mb-10">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">{DICT[formData.language].medicalHistoryTitle.toUpperCase()}</h4>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">
                        {DICT[formData.language].durationLabel} <span className="text-red-500">*</span>
                      </label>
                      <Input 
                        name="duration"
                        placeholder={DICT[formData.language].durationPlaceholder}
                        value={formData.duration}
                        onChange={handleChange}
                        className="h-12 border-gray-200 rounded-lg focus-visible:ring-[#0F3D3E] focus-visible:ring-offset-0 bg-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">
                        {DICT[formData.language].historyLabel}
                      </label>
                      <Input 
                        name="history"
                        placeholder={DICT[formData.language].historyPlaceholder}
                        value={formData.history}
                        onChange={handleChange}
                        className="h-12 border-gray-200 rounded-lg focus-visible:ring-[#0F3D3E] focus-visible:ring-offset-0 bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Upload Section */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">{DICT[formData.language].uploadTitle}</h4>
                  <div 
                    className={`border-2 border-dashed rounded-xl p-8 transition-all duration-200 flex flex-col items-center justify-center text-center cursor-pointer
                      ${isDragging ? 'border-[#0F3D3E] bg-[#0F3D3E]/5' : 'border-gray-200 hover:border-[#0F3D3E]/50 hover:bg-gray-50'}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      className="hidden" 
                      onChange={handleFileChange}
                      accept="image/*,.pdf"
                      multiple
                    />
                    
                    {files.length > 0 ? (
                      <div className="w-full space-y-2">
                        {files.map((f, i) => (
                          <div key={`${f.name}-${i}`} className="flex items-center justify-between bg-[#0F3D3E]/10 px-4 py-2 rounded-lg text-[#0F3D3E]">
                            <span className="font-medium truncate max-w-[200px]">{f.name}</span>
                            <button 
                              onClick={(e) => { e.stopPropagation(); setFiles(prev => prev.filter((_, idx) => idx !== i)); }}
                              className="hover:bg-[#0F3D3E]/20 rounded-full p-1"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                           <CloudUpload className="w-6 h-6 text-slate-400" />
                        </div>
                        <p className="text-sm font-medium text-slate-900 mb-1">{DICT[formData.language].uploadClick}</p>
                        <p className="text-xs text-slate-500">{DICT[formData.language].uploadSub}</p>
                      </>
                    )}
                  </div>
                </div>

              </Card>
            </div>
          </div>

          {/* Right Column - Summary Card */}
          <div className="w-full lg:w-[380px] xl:w-[420px] sticky top-24">
            <Card className="bg-[#F8FAFC] border-none shadow-none rounded-3xl p-6 md:p-8">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-[#0F3D3E] mb-1">{DICT[formData.language].previewTitle}</h2>
                <p className="text-sm text-slate-500">{DICT[formData.language].previewSubtitle}</p>
              </div>
              
              <div className="w-full h-px bg-slate-200 mb-6" />

              <div className="space-y-8">
                {/* Patient Info Summary */}
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-4">{DICT[formData.language].patientInfoTitle}</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">{DICT[formData.language].nameLabel}</span>
                      <span className="font-medium text-slate-900">{formData.name || '—'}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">{DICT[formData.language].ageLabel}</span>
                      <span className="font-medium text-slate-900">{formData.age || '—'}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">{DICT[formData.language].genderLabel}</span>
                      <span className="font-medium text-slate-900">{formData.gender || '—'}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">{DICT[formData.language].durationLabel}</span>
                      <span className="font-medium text-slate-900">{formData.duration || '—'}</span>
                    </div>
                  </div>
                </div>

                {/* Health Complaint Summary */}
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-3">{DICT[formData.language].healthComplaintTitle}</h4>
                  <div className="min-h-[60px] p-3 rounded-lg bg-white border border-slate-100 text-sm text-slate-600 leading-relaxed">
                    {formData.complaint || <span className="text-slate-300 italic">{DICT[formData.language].noComplaintPlaceholder}</span>}
                  </div>
                </div>

                {/* Medical History Summary */}
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-3">{DICT[formData.language].medicalHistoryTitle}</h4>
                  <div className="min-h-[40px] p-3 rounded-lg bg-white border border-slate-100 text-sm text-slate-600">
                    {formData.history || <span className="text-slate-300 italic">{DICT[formData.language].noneListedPlaceholder}</span>}
                  </div>
                </div>

                <Button 
                  onClick={handleSubmit} 
                  disabled={isSubmitting}
                  className="w-full h-12 bg-[#0F3D3E] hover:bg-[#092526] text-white rounded-xl text-sm font-medium shadow-[0_4px_14px_0_rgba(15,61,62,0.39)] transition-all hover:shadow-[0_6px_20px_rgba(15,61,62,0.23)] flex items-center justify-center gap-2 mt-4"
                >
                  {isSubmitting ? DICT[formData.language].submitting : (
                    <>
                      {DICT[formData.language].submit} <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>

                <p className="text-[10px] text-center text-slate-400 px-4 leading-tight">
                  {DICT[formData.language].termsNotice}
                </p>

              </div>
            </Card>
          </div>

        </div>
      </main>
    </div>
  );
}
