import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { GCBLogo } from '../common/GCBLogo';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  KeyRound, 
  ArrowRight, 
  AlertCircle, 
  User, 
  Eye, 
  EyeOff,
  UserPlus,
  Phone,
  Building,
  CreditCard,
  Sparkles
} from 'lucide-react';

export const SignInPage: React.FC = () => {
  const { signIn, registerCustomer } = useAuth();
  
  const [authMode, setAuthMode] = useState<'signin' | 'register'>('signin');

  // Sign In State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Registration State
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('+233 ');
  const [regBranch, setRegBranch] = useState('ACC-01');
  const [regAccount, setRegAccount] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regShowPassword, setRegShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(true);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAutoGenerateAccount = () => {
    const randomSuffix = Math.floor(10000000 + Math.random() * 90000000);
    setRegAccount(`10410${randomSuffix}`);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMessage('Please enter your registered email address.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your account password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await signIn({ email: email.trim(), password });
      if (!res.success) {
        setErrorMessage(res.error || 'Authentication failed. Please verify your email and password.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Authentication error.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regFullName.trim() || regFullName.trim().length < 3) {
      setErrorMessage('Please enter your full official name (at least 3 characters).');
      return;
    }
    if (!regEmail.trim() || !regEmail.includes('@')) {
      setErrorMessage('Please provide a valid personal or corporate email address.');
      return;
    }
    if (!regPhone.trim() || regPhone.trim().length < 9) {
      setErrorMessage('Please provide an active Ghana telephone contact number.');
      return;
    }
    if (!regPassword || regPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter your password.');
      return;
    }
    if (!termsAccepted) {
      setErrorMessage('Please accept the Bank of Ghana Customer Protection Directive.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await registerCustomer({
        fullName: regFullName.trim(),
        email: regEmail.trim(),
        phoneNumber: regPhone.trim(),
        branchCode: regBranch,
        accountNumber: regAccount.trim() || undefined,
        password: regPassword,
      });

      if (!result.success) {
        setErrorMessage(result.error || 'Account registration could not be completed.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Registration error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Institutional Top Brand Header */}
      <header className="max-w-xl w-full mx-auto flex items-center justify-between py-2">
        <div className="flex items-center space-x-3">
          <GCBLogo size="md" />
          <div>
            <div className="text-slate-900 font-extrabold text-base tracking-tight leading-tight">
              GCB BANK PLC
            </div>
            <div className="text-amber-700 text-xs font-semibold tracking-wide">
              Customer Complaint Tracking System (CCTS)
            </div>
          </div>
        </div>

        <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1 bg-white rounded-full border border-slate-200 text-[11px] text-slate-700 font-medium shadow-2xs">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>BoG & ISO 9241 Compliant</span>
        </div>
      </header>

      {/* Main Form Container */}
      <main className="max-w-xl w-full mx-auto my-auto py-6">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
          {/* Top Mode Selector Tabs */}
          <div className="grid grid-cols-2 bg-slate-100/80 p-1.5 border-b border-slate-200">
            <button
              type="button"
              onClick={() => { setAuthMode('signin'); setErrorMessage(null); }}
              className={`py-2.5 px-4 rounded-2xl text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                authMode === 'signin'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              <span>Portal Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('register'); setErrorMessage(null); }}
              className={`py-2.5 px-4 rounded-2xl text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                authMode === 'register'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5 text-emerald-600" />
              <span>Customer Registration</span>
            </button>
          </div>

          <div className="p-6 sm:p-8">
            <div className="mb-6 text-center sm:text-left">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 mb-2">
                {authMode === 'signin' ? (
                  <>
                    <Lock className="w-3 h-3 text-amber-700" /> Secure Institutional Access
                  </>
                ) : (
                  <>
                    <UserPlus className="w-3 h-3 text-emerald-700" /> Customer Account Creation
                  </>
                )}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {authMode === 'signin' ? 'Sign In to Your Account' : 'Open Dispute Tracking Profile'}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {authMode === 'signin'
                  ? 'Enter your registered institutional email and account password to access your dispute portal.'
                  : 'Register as a customer to lodge disputes, track transaction resolutions, and receive real-time updates.'}
              </p>
            </div>

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start space-x-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
            )}

            {/* SIGN IN FORM */}
            {authMode === 'signin' ? (
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Registered Email Address or Account Number
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="e.g. ama.mensah@customer.bank.gh or 1041029482101"
                      className="w-full text-xs pl-10 pr-3 py-3 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-slate-900 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Account Password
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Enter account password"
                      className="w-full text-xs pl-10 pr-10 py-3 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-slate-900 bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center space-x-2 text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span>Remember on this device</span>
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Encrypted Session
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 min-h-[46px] cursor-pointer disabled:opacity-60 mt-2"
                >
                  {isLoading ? (
                    <span>Verifying Credentials...</span>
                  ) : (
                    <>
                      <span>Sign In to Dispute Portal</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => { setAuthMode('register'); setErrorMessage(null); }}
                    className="text-xs text-amber-700 hover:text-amber-800 font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>New customer? Create your dispute tracking profile</span>
                  </button>
                </div>
              </form>
            ) : (
              /* CUSTOMER REGISTRATION FORM */
              <form onSubmit={handleRegister} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Legal Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={regFullName}
                      onChange={e => setRegFullName(e.target.value)}
                      placeholder="e.g. Kwame Osei Boateng"
                      className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={e => setRegEmail(e.target.value)}
                        placeholder="e.g. kwame@gmail.com"
                        className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Phone Number <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="tel"
                        required
                        value={regPhone}
                        onChange={e => setRegPhone(e.target.value)}
                        placeholder="+233 24 000 0000"
                        className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-900"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Primary GCB Branch
                    </label>
                    <div className="relative">
                      <Building className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                      <select
                        value={regBranch}
                        onChange={e => setRegBranch(e.target.value)}
                        className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-900 bg-white cursor-pointer"
                      >
                        <option value="ACC-01">Accra High Street (ACC-01)</option>
                        <option value="KMS-02">Kumasi Harper Road (KMS-02)</option>
                        <option value="TKD-03">Takoradi Harbour (TKD-03)</option>
                        <option value="TML-04">Tamale Central (TML-04)</option>
                        <option value="TMA-05">Tema Community 1 (TMA-05)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-700">
                        GCB Account Number
                      </label>
                      <button
                        type="button"
                        onClick={handleAutoGenerateAccount}
                        className="text-[10px] text-emerald-600 hover:text-emerald-700 font-bold inline-flex items-center gap-0.5 cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Generate</span>
                      </button>
                    </div>
                    <div className="relative">
                      <CreditCard className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="text"
                        value={regAccount}
                        onChange={e => setRegAccount(e.target.value)}
                        placeholder="13-digit number"
                        className="w-full text-xs font-mono pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-900"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Create Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                      <input
                        type={regShowPassword ? 'text' : 'password'}
                        required
                        value={regPassword}
                        onChange={e => setRegPassword(e.target.value)}
                        placeholder="Min. 6 characters"
                        className="w-full text-xs pl-9 pr-8 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-900"
                      />
                      <button
                        type="button"
                        onClick={() => setRegShowPassword(!regShowPassword)}
                        className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                      >
                        {regShowPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Confirm Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                      <input
                        type={regShowPassword ? 'text' : 'password'}
                        required
                        value={regConfirmPassword}
                        onChange={e => setRegConfirmPassword(e.target.value)}
                        placeholder="Repeat password"
                        className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-900"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-1">
                  <label className="flex items-start space-x-2 text-xs text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={e => setTermsAccepted(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500 mt-0.5"
                    />
                    <span className="text-[11px] leading-tight">
                      I agree to Bank of Ghana Consumer Protection Directive and dispute audit terms.
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 min-h-[44px] cursor-pointer disabled:opacity-60"
                >
                  {isLoading ? (
                    <span>Creating Dispute Profile...</span>
                  ) : (
                    <>
                      <span>Register & Sign In to Customer Portal</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => { setAuthMode('signin'); setErrorMessage(null); }}
                    className="text-xs text-slate-600 hover:text-slate-900 font-semibold hover:underline cursor-pointer"
                  >
                    Already registered? Sign In to your account
                  </button>
                </div>
              </form>
            )}

            <div className="pt-6 mt-6 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Security Assistance: Toll-Free 0800 422 422</span>
              <span>ISO 9241 & OWASP Guarded</span>
            </div>
          </div>
        </div>
      </main>

      {/* Page Footer */}
      <footer className="max-w-xl w-full mx-auto text-center text-xs text-slate-500 py-2">
        © {new Date().getFullYear()} GCB Bank PLC. Customer Complaint Tracking System (CCTS).
      </footer>
    </div>
  );
};
