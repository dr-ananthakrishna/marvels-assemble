import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, ArrowRight, Upload, X } from 'lucide-react';

const RESPONSIBILITIES = [
  'Conduct a Classroom Demo or Live Session in your college',
  'Coordinate and conduct Online & Offline Quiz in your college',
  'Represent Marrow at academic/cultural events across colleges',
  'Brainstorm and execute out-of-the-box ideas to spread Marrow on campus',
  'Help Marrow Representatives engage with students',
  'Activities on digital platforms like WhatsApp, Telegram, YouTube, Quora, Facebook',
];

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    dob: '',
    contact: '',
    email: '',
    referredBy: '',
    college: '',
    admissionYear: '',
    state: '',
    collegeId: null as File | null,
    about: '',
    interests: {} as Record<string, number>,
    video: null as File | null,
  });
  const [wordCount, setWordCount] = useState(0);

  const handleAboutChange = (text: string) => {
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    setWordCount(words);
    setFormData({ ...formData, about: text });
  };

  const handleFileUpload = (type: 'collegeId' | 'video', file: File) => {
    setFormData({ ...formData, [type]: file });
  };

  const handleInterestRating = (activity: string, rating: number) => {
    setFormData({
      ...formData,
      interests: { ...formData.interests, [activity]: rating },
    });
  };

  const handleSubmit = () => {
    navigate('/application-success');
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col">
      <div className="p-6 border-b border-border bg-white">
        <button
          onClick={() => (step === 1 ? navigate('/welcome') : setStep(step - 1))}
          className="flex items-center gap-2 text-[#959A9B] hover:text-foreground transition-colors mb-6 font-medium"
        >
          <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
          Back
        </button>

        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                      s <= step
                        ? 'bg-[#62C8DF] text-white'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {s}
                  </div>
                  <span className="text-sm font-medium">
                    {s === 1 ? 'Profile' : s === 2 ? 'Interest' : 'Video'}
                  </span>
                </div>
                <div className="h-1 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-[#62C8DF] transition-all duration-300 ${
                      s <= step ? 'w-full' : 'w-0'
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-6 py-8">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl p-8 shadow-sm">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold mb-2">Your Profile</h2>
                <p className="text-muted-foreground">Let's start with the basics</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block mb-2 text-sm">Full Name</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-4 py-3 bg-input-background rounded-xl border border-transparent focus:border-[#62C8DF] focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full px-4 py-3 bg-input-background rounded-xl border border-transparent focus:border-[#62C8DF] focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm">Contact Number</label>
                  <input
                    type="tel"
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    className="w-full px-4 py-3 bg-input-background rounded-xl border border-transparent focus:border-[#62C8DF] focus:outline-none"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block mb-2 text-sm">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-input-background rounded-xl border border-transparent focus:border-[#62C8DF] focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm">Referred By</label>
                  <select
                    value={formData.referredBy}
                    onChange={(e) => setFormData({ ...formData, referredBy: e.target.value })}
                    className="w-full px-4 py-3 bg-input-background rounded-xl border border-transparent focus:border-[#62C8DF] focus:outline-none"
                  >
                    <option value="">Select option</option>
                    <option>Friend</option>
                    <option>Social Media</option>
                    <option>College Event</option>
                    <option>Other</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-2 text-sm">College Name</label>
                  <select
                    value={formData.college}
                    onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                    className="w-full px-4 py-3 bg-input-background rounded-xl border border-transparent focus:border-[#62C8DF] focus:outline-none"
                    required
                  >
                    <option value="">Select college</option>
                    <option>AIIMS Delhi</option>
                    <option>JIPMER Puducherry</option>
                    <option>MAMC Delhi</option>
                    <option>Other</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-2 text-sm">Admission Year</label>
                  <select
                    value={formData.admissionYear}
                    onChange={(e) => setFormData({ ...formData, admissionYear: e.target.value })}
                    className="w-full px-4 py-3 bg-input-background rounded-xl border border-transparent focus:border-[#62C8DF] focus:outline-none"
                    required
                  >
                    <option value="">Select year</option>
                    <option>2026</option>
                    <option>2025</option>
                    <option>2024</option>
                    <option>2023</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-2 text-sm">State</label>
                  <select
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-4 py-3 bg-input-background rounded-xl border border-transparent focus:border-[#62C8DF] focus:outline-none"
                    required
                  >
                    <option value="">Select state</option>
                    <option>Delhi</option>
                    <option>Karnataka</option>
                    <option>Maharashtra</option>
                    <option>Tamil Nadu</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block mb-2 text-sm">College ID / Fee Slip / Marksheet</label>
                  <div className="border-2 border-dashed border-muted rounded-xl p-8 text-center hover:border-[#62C8DF] transition-colors cursor-pointer">
                    {formData.collegeId ? (
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{formData.collegeId.name}</span>
                        <button
                          onClick={() => setFormData({ ...formData, collegeId: null })}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer">
                        <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-3" strokeWidth={1.5} />
                        <div className="text-sm text-muted-foreground mb-1">
                          Click to upload or drag and drop
                        </div>
                        <div className="text-xs text-muted-foreground">PDF or Image (max 10MB)</div>
                        <input
                          type="file"
                          accept=".pdf,image/*"
                          onChange={(e) => e.target.files?.[0] && handleFileUpload('collegeId', e.target.files[0])}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block mb-2 text-sm">Brief about yourself (200-500 words)</label>
                  <textarea
                    value={formData.about}
                    onChange={(e) => handleAboutChange(e.target.value)}
                    rows={6}
                    className="w-full px-4 py-3 bg-input-background rounded-xl border border-transparent focus:border-[#62C8DF] focus:outline-none resize-none"
                    placeholder="Tell us about yourself, your interests, and what drives you..."
                    required
                  />
                  <div className="text-xs text-muted-foreground mt-2">
                    {wordCount} / 500 words
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold mb-2">Tell us what excites you</h2>
                <p className="text-muted-foreground">
                  Rate your interest in each responsibility from 1 to 5
                </p>
              </div>

              <div className="space-y-4">
                {RESPONSIBILITIES.map((activity) => (
                  <div
                    key={activity}
                    className="bg-white p-6 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm border border-border"
                  >
                    <div className="flex-1 text-sm">{activity}</div>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          onClick={() => handleInterestRating(activity, rating)}
                          className={`w-10 h-10 rounded-full border-2 transition-all ${
                            formData.interests[activity] === rating
                              ? 'bg-[#62C8DF] border-[#62C8DF] text-white'
                              : 'border-muted hover:border-[#62C8DF]'
                          }`}
                        >
                          {rating}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold mb-2">Your Marvel Video</h2>
                <p className="text-muted-foreground">
                  Tell us why you'd make a great Marvel
                </p>
              </div>

              <div className="border-2 border-dashed border-muted rounded-xl p-12 text-center hover:border-[#62C8DF] transition-colors">
                {formData.video ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-[#62C8DF]/10 rounded-full flex items-center justify-center">
                      <Upload className="w-8 h-8 text-[#62C8DF]" strokeWidth={1.5} />
                    </div>
                    <div>
                      <div className="font-medium mb-1">{formData.video.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {(formData.video.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </div>
                    <button
                      onClick={() => setFormData({ ...formData, video: null })}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      Remove and upload again
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" strokeWidth={1.5} />
                    <div className="text-lg font-medium mb-2">
                      Upload a 1-2 min selfie video
                    </div>
                    <div className="text-sm text-muted-foreground mb-6">
                      Video files (max 1GB)
                    </div>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload('video', e.target.files[0])}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-border">
                <div className="text-sm text-muted-foreground mb-3">
                  Our AI will review your video as part of the screening process. Be yourself!
                </div>
                <div className="text-sm font-medium">
                  💡 Tip: Record in good lighting. No fancy setup needed — your phone works perfectly.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-6 border-t border-border bg-white shadow-[0px_-2px_8px_0px_rgba(0,0,0,0.08)]">
        <div className="max-w-2xl mx-auto flex justify-end gap-4">
          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="h-12 px-8 rounded-[4px] relative flex items-center gap-2"
            >
              <div aria-hidden className="absolute bg-[#62c8df] inset-0 pointer-events-none rounded-[4px]" />
              <span className="relative z-10 font-bold text-sm text-white tracking-[0.5px]">
                CONTINUE
              </span>
              <ArrowRight className="w-5 h-5 relative z-10 text-white" strokeWidth={2} />
              <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_-2px_3px_0px_rgba(0,0,0,0.2)]" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="h-12 px-8 rounded-[4px] relative"
            >
              <div aria-hidden className="absolute bg-[#62c8df] inset-0 pointer-events-none rounded-[4px]" />
              <span className="relative z-10 font-bold text-sm text-white tracking-[0.5px]">
                SUBMIT APPLICATION
              </span>
              <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_-2px_3px_0px_rgba(0,0,0,0.2)]" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
