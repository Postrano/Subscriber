'use client';
import Image from "next/image";
import { Check } from "lucide-react";
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  return (
    <div className="min-h-screen flex flex-col items-center justify-between bg-gradient-to-br from-blue-100 to-white bg-cover bg-center" style={{ backgroundImage: "url('/images/building3.jpg')" }}>
      {/* Header */}
      <div className="w-full bg-gradient-to-br from-blue-100 to-white">
        <div className="flex flex-col md:flex-row px-6 md:px-10 py-6 items-center justify-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex items-center justify-center w-full md:w-auto space-x-4">
            <div className="w-24 md:w-64 border-t border-black"></div>
            <img
              src="/images/ineo2.png"
              alt="i-NEO Logo"
              className="h-20 border border-black mx-4 rounded-full"
            />
            <div className="w-24 md:w-64 border-t border-black"></div>
          </div>
        </div>
      </div>

      {/* Plans */}
      <div className="flex flex-col md:flex-row justify-center items-center gap-6 md:gap-10 py-10 px-4 w-full">
        {/* Basic Plan */}
        <div className="bg-blue-100 rounded-2xl p-6 w-full max-w-sm shadow text-black">
          <h2 className="text-center font-bold text-lg">BASIC PLAN</h2>
          <p className="text-center font-semibold text-xl mt-1 mb-4">₱200</p>
          <ul className="space-y-2 mb-6">
            {[...Array(4)].map((_, i) => (
              <li key={i} className="flex items-center text-sm">
                <Check className="text-green-500 w-4 h-4 mr-2" /> Your paragraph text
              </li>
            ))}
          </ul>
          <button
            onClick={() => router.push('/basic')}
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
            SUBSCRIBE
          </button>
        </div>

        {/* Premium Plan */}
        <div className="bg-blue-100 rounded-2xl p-6 w-full max-w-sm shadow text-black">
          <h2 className="text-center font-bold text-lg">PREMIUM PLAN</h2>
          <p className="text-center font-semibold text-xl mt-1 mb-4">₱360</p>
          <ul className="space-y-2 mb-6">
            {[...Array(4)].map((_, i) => (
              <li key={i} className="flex items-center text-sm">
                <Check className="text-green-500 w-4 h-4 mr-2" /> Your paragraph text
              </li>
            ))}
          </ul>
          <button
            onClick={() => router.push('/premium')}
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
            SUBSCRIBE
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="w-full bg-black text-white py-4 flex flex-col md:flex-row justify-center gap-2 md:gap-10 items-center border-t text-sm px-4 text-center">
        <span>adminINEO@gmail.com</span>
        <span>🌐 https://inspirenextglobal.com</span>
      </div>
    </div>
  );
}
