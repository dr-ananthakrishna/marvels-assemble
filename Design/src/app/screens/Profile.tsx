import { useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';

export default function Profile() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Header */}
      <div className="bg-white border-b border-border px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-[#1A1A2E] hover:bg-[#F5F5F5] rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6" strokeWidth={1.5} />
          </button>
          <h1 className="text-xl font-semibold">Profile</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-border">
          {/* Profile Picture */}
          <div className="flex justify-center mb-8">
            <div className="w-24 h-24 rounded-full bg-[#D8D8D8] flex items-center justify-center overflow-hidden">
              <svg className="w-full h-full" viewBox="0 0 96 96" fill="none">
                <circle cx="48" cy="48" r="48" fill="#D8D8D8"/>
                <circle cx="48" cy="36" r="16" fill="#999"/>
                <path d="M19 84C19 67 30 55 48 55C66 55 77 67 77 84" fill="#999"/>
              </svg>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-6">
            <div>
              <label className="block mb-2 text-sm font-medium text-[#626768]">Full Name</label>
              <input
                type="text"
                value="Dr. Nawaz M"
                readOnly
                className="w-full px-4 py-3 bg-[#F5F5F5] rounded-lg border border-border text-sm"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-[#626768]">Email Address</label>
              <input
                type="email"
                value="nawaz.m@example.com"
                readOnly
                className="w-full px-4 py-3 bg-[#F5F5F5] rounded-lg border border-border text-sm"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-[#626768]">Contact Number</label>
              <input
                type="tel"
                value="+91 98765 43210"
                readOnly
                className="w-full px-4 py-3 bg-[#F5F5F5] rounded-lg border border-border text-sm"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-[#626768]">College Name</label>
              <input
                type="text"
                value="AIIMS Delhi"
                readOnly
                className="w-full px-4 py-3 bg-[#F5F5F5] rounded-lg border border-border text-sm"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-[#626768]">Admission Year</label>
              <input
                type="text"
                value="2024"
                readOnly
                className="w-full px-4 py-3 bg-[#F5F5F5] rounded-lg border border-border text-sm"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-[#626768]">State</label>
              <input
                type="text"
                value="Delhi"
                readOnly
                className="w-full px-4 py-3 bg-[#F5F5F5] rounded-lg border border-border text-sm"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-[#626768]">Brief about yourself</label>
              <textarea
                value="Passionate medical student dedicated to learning and contributing to the medical community. Interested in cardiology and public health initiatives."
                readOnly
                rows={4}
                className="w-full px-4 py-3 bg-[#F5F5F5] rounded-lg border border-border text-sm resize-none"
              />
            </div>
          </div>

          {/* Edit Button */}
          <div className="mt-8">
            <button className="w-full h-12 rounded-[4px] relative">
              <div aria-hidden className="absolute bg-[#62c8df] inset-0 pointer-events-none rounded-[4px]" />
              <span className="relative z-10 font-bold text-sm text-white tracking-[0.5px]">
                EDIT PROFILE
              </span>
              <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_-2px_3px_0px_rgba(0,0,0,0.2)]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
