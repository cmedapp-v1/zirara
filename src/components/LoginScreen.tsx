import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowLeft,
  Users
} from 'lucide-react';
import { ParametresCentre, CompteAdministratif } from '../types';
import { CMEDLogo } from './CMEDLogo';

interface LoginScreenProps {
  parametres: ParametresCentre;
  comptesAdmin: CompteAdministratif[];
  onLogin: (identifiant: string, password: string) => boolean;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  parametres,
  comptesAdmin,
  onLogin
}) => {
  const activeComptes = comptesAdmin.filter((c) => c.statut === 'Actif');
  const [identifiant, setIdentifiant] = useState(activeComptes[0]?.identifiant || 'admin');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifiant.trim()) {
      setError('يرجى إدخال اسم المستخدم أو البريد الإلكتروني.');
      return;
    }
    if (!password) {
      setError('يرجى إدخال كلمة المرور.');
      return;
    }

    const success = onLogin(identifiant.trim(), password);
    if (!success) {
      setError('اسم المستخدم أو كلمة المرور غير صحيحة، أو الحساب غير مفعل.');
    } else {
      setError('');
    }
  };

  const handleSelectAccount = (acc: CompteAdministratif) => {
    setIdentifiant(acc.identifiant);
    setPassword(acc.motDePasse);
    setError('');
    onLogin(acc.identifiant, acc.motDePasse);
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen flex items-center justify-center bg-[#071324] px-4 py-8 relative overflow-hidden select-none font-arabic"
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:28px_28px] pointer-events-none" />

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Institutional header with CMED Logo */}
        <div className="bg-[#0B2545] px-6 py-6 text-center text-white relative">
          <div className="bg-white rounded-2xl p-3 shadow-md mb-3 max-w-xs mx-auto border border-blue-900/40">
            <CMEDLogo className="w-full h-auto max-h-13 mx-auto" />
          </div>

          <p className="text-[10px] font-bold uppercase tracking-wider text-blue-300">
            المملكة المغربية · الهيئة المغربية للتربية والتنمية
          </p>
          <h1 className="text-base font-black text-white mt-0.5 leading-snug">
            {parametres.nomCentre || 'مركز الفرصة الثانية الجيل الجديد'}
          </h1>
          <p className="text-xs font-semibold text-blue-200 mt-0.5">
            {parametres.nomSousTitre || 'زرارة'}
          </p>

          <div className="mt-3 inline-flex items-center gap-2 px-3.5 py-1 bg-white/10 rounded-full border border-white/15 backdrop-blur-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] text-blue-100 font-bold">
              فضاء الدخول · إدارة، مؤطرون، ومستفيدون
            </span>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 md:p-8 text-right">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
              تسجيل الدخول
            </span>
            <span className="text-[10px] font-bold text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              👥 {activeComptes.length} حسابات مفعلة
            </span>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="admin-identifiant"
                className="block text-xs font-bold text-slate-700 mb-1"
              >
                اسم المستخدم *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="admin-identifiant"
                  type="text"
                  value={identifiant}
                  onChange={(e) => {
                    setIdentifiant(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="أدخل اسم المستخدم..."
                  className="w-full py-2.5 pr-9 pl-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:border-blue-600 font-bold text-right"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="block text-xs font-bold text-slate-700 mb-1"
              >
                كلمة المرور *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="••••••••"
                  className="w-full py-2.5 pr-9 pl-10 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:border-blue-600 font-mono text-right"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 hover:text-slate-600"
                  title={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl shadow-md hover:shadow-lg transition-all active:scale-98"
            >
              <span>دخول</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </form>

          {/* Quick select list */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider block mb-2">
              الحسابات الإدارية المعتمدة (دخول مباشر) :
            </span>

            <div className="space-y-1.5 max-h-40 overflow-y-auto pl-1">
              {activeComptes.map((acc) => (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => handleSelectAccount(acc)}
                  className="w-full text-right p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-blue-50 hover:border-blue-300 transition-colors flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-900 text-xs font-bold flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      {acc.role === 'BENEFICIAIRE' ? '🎓' : acc.role === 'ANIMATEUR' ? '👨‍🏫' : '👑'}
                    </div>
                    <div className="min-w-0 text-right">
                      <div className="text-xs font-bold text-slate-900 group-hover:text-blue-900 truncate">
                        {acc.prenom} {acc.nom}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">
                        {acc.role === 'BENEFICIAIRE' ? 'مستفيد' : acc.roleTitre} · <span className="font-mono text-slate-600">@{acc.identifiant}</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-blue-700 bg-white px-2 py-1 rounded-lg border border-slate-200 shadow-2xs group-hover:border-blue-300 shrink-0">
                    دخول
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 text-center text-[11px] text-slate-500 font-semibold">
          {parametres.nomCentre || 'مركز الفرصة الثانية الجيل الجديد'} {parametres.nomSousTitre || 'زرارة'}
        </div>
      </div>
    </div>
  );
};
