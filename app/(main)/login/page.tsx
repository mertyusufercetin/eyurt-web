'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FaIdCard, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { supabase } from '@/lib/supabase';

export default function Login() {
  const [tc, setTc] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tcError, setTcError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTcError('');
    setPasswordError('');
    setGeneralError('');

    let hasError = false;

    if (!tc.trim()) {
      setTcError('TC Kimlik No giriniz.');
      hasError = true;
    } else if (!/^\d{11}$/.test(tc)) {
      setTcError('TC Kimlik No 11 haneli olmalıdır.');
      hasError = true;
    }

    if (!password) {
      setPasswordError('Şifre giriniz.');
      hasError = true;
    } else if (password.length < 6) {
      setPasswordError('Şifre en az 6 karakter olmalıdır.');
      hasError = true;
    }

    if (hasError) return;

    setIsLoading(true);

    const email = `${tc}@eyurt.com`;

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      if (authError.message === 'Invalid login credentials') {
        setGeneralError('TC Kimlik No veya şifre hatalı.');
      } else if (authError.message === 'Email not confirmed') {
        setGeneralError('Hesabınız henüz onaylanmamış.');
      } else {
        setGeneralError(authError.message);
      }
    } else {
      router.push('/dashboard');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-red-50 to-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex flex-col items-center gap-3 bg-white rounded-xl p-6 shadow-md">
            <Image src="/logomuzoriginal.jpg" alt="Eyurt Logo" width={96} height={96} className="rounded-xl object-cover" />
            <span className="font-extrabold text-2xl text-gray-800 tracking-tight" style={{ fontFamily: 'var(--font-montserrat)' }}>E-YURT</span>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
            Giriş Yap
          </h1>
          <p className="text-gray-600 text-center mb-8">
            Hesabınıza erişmek için giriş yapın
          </p>

          {generalError && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 rounded-r-lg p-4">
              <p className="text-sm text-red-700">{generalError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* TC Kimlik No Input */}
            <div>
              <label htmlFor="tc" className="block text-sm font-semibold text-gray-700 mb-2">
                TC Kimlik No
              </label>
              <div className="relative">
                <FaIdCard className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  id="tc"
                  inputMode="numeric"
                  value={tc}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    if (val.length <= 11) setTc(val);
                  }}
                  placeholder="12345678901"
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-red-500 transition-colors duration-200 bg-gray-50"
                  required
                  maxLength={11}
                />
              </div>
              {tcError && <p className="mt-1 text-sm text-red-600">{tcError}</p>}
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Şifre
              </label>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-red-500 transition-colors duration-200 bg-gray-50"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {passwordError && <p className="mt-1 text-sm text-red-600">{passwordError}</p>}
            </div>

            {/* Remember Me */}
            <div className="flex items-center text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-red-500 rounded cursor-pointer"
                />
                <span className="text-gray-700">Beni hatırla</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-linear-to-r from-red-500 to-red-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 disabled:hover:scale-100"
            >
              {isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </button>
          </form>
        </div>

        {/* Security Info */}
        <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg p-4">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">🔒 Güvenli Giriş:</span> Hesabınız en yüksek düzeyde şifreleme ile korunmaktadır.
          </p>
        </div>
      </div>
    </div>
  );
}
