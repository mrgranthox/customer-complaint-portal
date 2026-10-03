import React, { useState } from 'react';
import { 
  HelpCircle, 
  BookOpen, 
  User, 
  Briefcase, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  FileText, 
  CreditCard, 
  Smartphone, 
  Building2, 
  ChevronRight,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { GCBLogo } from './GCBLogo';

export const UserGuide: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'customer' | 'staff' | 'manager' | 'faq' | 'glossary'>('customer');
  const [searchQuery, setSearchQuery] = useState('');

  const faqs = [
    {
      q: 'Can other customers or strangers see my complaints?',
      a: 'No, absolutely not. The system has built-in bank privacy shields (called IDOR protection). Every customer can only access their own dispute records. Even if someone tries to guess your complaint number, the system blocks them.'
    },
    {
      q: 'What should I do if an ATM fails to dispense my cash?',
      a: 'Click "+ Lodge New Complaint" and select "ATM / Cash Dispense Error". Note down the ATM location and approximate time. You will get a unique tracking code (e.g., GCB-20261003-8821). Officers check the ATM electronic log and reverse the funds directly into your account.'
    },
    {
      q: 'How long does it take for a complaint to be resolved?',
      a: 'Every complaint has an automatic countdown timer based on priority: Urgent cases (fraud or unauthorized debit) are targeted within 24 hours, High priority (ATM cash errors) within 48 hours, and general inquiries within 72–120 hours.'
    },
    {
      q: 'What happens if a bank officer takes too long?',
      a: 'The system alerts the Branch Manager automatically! When a case gets close to its deadline, the timer turns amber, and if overdue, it turns red (Breached). The manager can immediately re-assign it or step in.'
    },
    {
      q: 'How do I test different roles in this demo app?',
      a: 'Look at the top-right corner of your screen! Use the "Persona Switcher" buttons to switch instantly between Customer (Ama Mansah), Investigation Officer (Kwesi Mensah), and Branch Manager (Ebenezer Tetteh).'
    }
  ];

  const glossaryTerms = [
    {
      term: 'CCTS',
      definition: 'Customer Complaint Tracking System — GCB Bank\'s digital platform for managing and resolving all customer grievances in one place.'
    },
    {
      term: 'SLA (Service Level Agreement)',
      definition: 'A strict bank promise guaranteeing how many hours we have to investigate and resolve your problem before it is flagged as late.'
    },
    {
      term: 'Triage',
      definition: 'The initial review step where a supervisor checks a new complaint and assigns it to the most qualified specialist officer.'
    },
    {
      term: 'Reference Number',
      definition: 'A unique code (like GCB-20261003-8821) given to every complaint so customers and staff can find the exact case in seconds.'
    },
    {
      term: 'Audit Trail',
      definition: 'An unalterable digital logbook that records every note, action, time, and staff member involved in your case for full transparency.'
    },
    {
      term: 'IDOR Protection',
      definition: 'A security wall ensuring that no customer can ever open or peek into another customer\'s dispute files.'
    }
  ];

  const filteredFaqs = faqs.filter(
    f => f.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
         f.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-700/60 relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30 mb-3">
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>Friendly Help Center & User Manual</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            How Can We Help You Today?
          </h1>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            Welcome to the plain-English guide for the GCB Bank Customer Complaint Tracking System. 
            No technical jargon—just clear, step-by-step instructions on how to lodge disputes, track investigations, and resolve banking issues.
          </p>

          {/* Quick Search */}
          <div className="mt-5 relative max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search help topics, FAQs, or glossary..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-amber-400 transition-colors"
            />
          </div>
        </div>

        {/* Decorative Bank Watermark */}
        <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none hidden sm:block">
          <GCBLogo size="xl" />
        </div>
      </div>

      {/* Navigation Pills */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveSection('customer')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeSection === 'customer'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <User className="w-4 h-4" />
          <span>For Bank Customers</span>
        </button>

        <button
          onClick={() => setActiveSection('staff')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeSection === 'staff'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>For Bank Staff & Officers</span>
        </button>

        <button
          onClick={() => setActiveSection('manager')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeSection === 'manager'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>For Branch Managers</span>
        </button>

        <button
          onClick={() => setActiveSection('faq')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeSection === 'faq'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Frequently Asked Questions</span>
        </button>

        <button
          onClick={() => setActiveSection('glossary')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeSection === 'glossary'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Jargon Buster (Dictionary)</span>
        </button>
      </div>

      {/* SECTION 1: CUSTOMERS */}
      {activeSection === 'customer' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <User className="w-5 h-5 text-amber-600" />
              <span>Customer Guide: How to Lodge & Track Your Dispute</span>
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Follow these simple steps whenever you experience an issue with an ATM, debit card, or electronic transfer.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              {/* Step 1 */}
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 relative">
                <div className="w-8 h-8 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center text-sm shadow-xs mb-3">
                  1
                </div>
                <h3 className="font-bold text-sm text-slate-900">Lodge Your Dispute</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Click the gold <span className="font-semibold text-slate-800">"+ Lodge New Complaint"</span> button at the top of your screen.
                  Pick the right category (such as ATM cash failure or debit card error), write a quick note, and select the branch where it occurred.
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 relative">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-xs mb-3">
                  2
                </div>
                <h3 className="font-bold text-sm text-slate-900">Save Your Reference Code</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  The system will instantly generate your official tracking code (like <code className="bg-white px-1.5 py-0.5 rounded border border-slate-300 font-mono text-[11px] text-amber-700 font-bold">GCB-20261003-8821</code>).
                  You can quote this number at any GCB branch or over the phone.
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 relative">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shadow-xs mb-3">
                  3
                </div>
                <h3 className="font-bold text-sm text-slate-900">Watch the Work Live</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Click <span className="font-semibold text-slate-800">"View Timeline"</span> on your dashboard at any time. You can see when an officer starts investigating, read their notes, and receive confirmation when funds are refunded!
                </p>
              </div>
            </div>
          </div>

          {/* Meaning of Status Badges */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3">
              What Do the Color Badges Mean on My Screen?
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex items-start space-x-3 p-3 rounded-xl bg-amber-50 border border-amber-200">
                <span className="w-3 h-3 rounded-full bg-amber-500 mt-1 shrink-0"></span>
                <div>
                  <h4 className="text-xs font-bold text-amber-900">Submitted (Yellow)</h4>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    Your complaint has been safely received by the bank and is in the queue for officer review.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-xl bg-blue-50 border border-blue-200">
                <span className="w-3 h-3 rounded-full bg-blue-600 mt-1 shrink-0"></span>
                <div>
                  <h4 className="text-xs font-bold text-blue-900">In Progress (Blue)</h4>
                  <p className="text-[11px] text-blue-800 mt-0.5">
                    An officer is actively investigating the electronic logs, contacting switches, or reviewing camera footage.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="w-3 h-3 rounded-full bg-emerald-600 mt-1 shrink-0"></span>
                <div>
                  <h4 className="text-xs font-bold text-emerald-900">Resolved (Green)</h4>
                  <p className="text-[11px] text-emerald-800 mt-0.5">
                    The bank has completed the work. Refunds or adjustments have been posted and a full explanation is provided.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: STAFF */}
      {activeSection === 'staff' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-600" />
              <span>Investigation Officer Guide: Solving Cases Efficiently</span>
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Instructions for bank resolution officers handling customer case files.
            </p>

            <div className="space-y-4 mt-6">
              <div className="flex items-start space-x-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-700 font-bold shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">1. Monitor Your SLA Countdown Timer</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Every case has a countdown clock. Green means on track; amber means less than 12 hours remaining; red means overdue. Always investigate high-severity and expiring cases first.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-700 font-bold shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">2. Log Clear, Factual Update Notes</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Whenever you take an action (e.g. review ATM journal tapes or call the customer), write a short note in the case dossier. These notes create an immutable history that protects both you and the bank.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 font-bold shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">3. Provide Root Cause & Formal Resolution</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    To close a complaint, write the root cause (e.g., "ATM mechanical cassette jam") and the corrective action (e.g., "GHS 500 credited back to customer account"). Once resolved, the customer is notified immediately.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: MANAGERS */}
      {activeSection === 'manager' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-purple-600" />
              <span>Branch Manager Guide: Oversight & Work Distribution</span>
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              How branch leaders can monitor branch service quality, allocate disputes, and prevent SLA breaches.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="p-5 rounded-xl bg-purple-50/50 border border-purple-200/80">
                <h3 className="font-bold text-sm text-purple-950 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-purple-600" />
                  <span>Unassigned Triage Queue</span>
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  When new complaints come in, they wait in the unassigned pool. Managers can assign each complaint to the most qualified officer with one click, ensuring balanced workloads across the team.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-purple-50/50 border border-purple-200/80">
                <h3 className="font-bold text-sm text-purple-950 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-purple-600" />
                  <span>SLA & Caseload Reports</span>
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Access reports showing total disputes by category (e.g. ATM errors vs E-Banking bugs) and check your branch resolution compliance rate to meet Bank of Ghana standards.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: FAQS */}
      {activeSection === 'faq' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900 mb-1">
              Frequently Asked Questions (FAQ)
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Clear answers to the most common questions about the complaint system.
            </p>

            <div className="space-y-4">
              {filteredFaqs.map((faq, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-800 text-xs font-bold flex items-center justify-center shrink-0">
                      Q
                    </span>
                    {faq.q}
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 pl-7 leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 5: GLOSSARY */}
      {activeSection === 'glossary' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900 mb-1">
              Plain-English Glossary (Jargon Buster)
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              We translated banking and computer acronyms into everyday language.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {glossaryTerms.map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="font-mono text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block mb-1.5">
                    {item.term}
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {item.definition}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Helpdesk Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-800 flex items-center justify-center font-bold shrink-0">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Need Immediate Assistance?</h4>
            <p className="text-[11px] text-slate-500">
              GCB Bank Customer Contact Centre: <span className="font-semibold text-slate-700">0800 422 422 (Toll Free)</span> or email <span className="font-semibold text-slate-700">complaints@gcb.com.gh</span>
            </p>
          </div>
        </div>
        <div className="text-xs text-slate-400 font-medium">
          DSR Academic Prototype • ISO 9241 Ergonomic
        </div>
      </div>
    </div>
  );
};
