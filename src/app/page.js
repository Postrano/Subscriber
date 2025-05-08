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
      <div className="flex px-10 py-6 ">
  <div className="flex items-center space-x-4">
    <div className="w-16 border-t border-black"></div> {/* shorter left line */}
    <img
      src="/images/ineo2.png"
      alt="i-NEO Logo"
      className="h-20 border border-black mx-4 rounded-full"
    />
    <div className="w-320 border-t border-black"></div> {/* longer right line */}
  </div>
</div>

      </div>

      {/* Plans */}
      <div className="flex justify-center items-start gap-10 py-30">
        {/* Basic Plan */}
        <div className="bg-blue-100 rounded-2xl p-6 w-70 shadow text-black">
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
        <div className="bg-blue-100 rounded-2xl p-6 w-70 shadow text-black">
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
      <div className="w-full bg-black text-white py-4 flex justify-center gap-10 items-center border-t">
        <span>adminINEO@gmail.com</span>
        <span>🌐 https://inspirenextglobal.com</span>
      </div>
    </div>
  );
}