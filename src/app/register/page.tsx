"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Upload, X, Sparkles } from "lucide-react";
import SearchableSelect from "@/components/SearchableSelect";
import { STATES, COLLEGES_BY_STATE } from "@/lib/colleges";

const RESPONSIBILITIES = [
  "Conduct a Classroom Demo or Live Session in your college",
  "Coordinate and conduct Online & Offline Quiz in your college",
  "Represent Marrow at academic/cultural events across colleges",
  "Brainstorm and execute out-of-the-box ideas to spread Marrow on campus",
  "Help Marrow Representatives engage with students",
  "Activities on digital platforms like WhatsApp, Telegram, YouTube, Quora, Facebook",
];

/** Red asterisk for mandatory labels */
function Req() {
  return <span className="text-red-500 ml-0.5">*</span>;
}

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submissionPhase, setSubmissionPhase] = useState<'idle' | 'submitting' | 'analyzing'>('idle');
  const [error, setError] = useState("");
  const [showErrors, setShowErrors] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    dob: "",
    contact: "",
    email: "",
    password: "",
    referredBy: "",
    referredByOther: "",
    college: "",
    admissionYear: "",
    state: "",
    collegeIdFile: null as File | null,
    about: "",
    interests: {} as Record<string, number>,
    videoFile: null as File | null,
  });
  const [wordCount, setWordCount] = useState(0);

  // --- Validation helpers ---
  const isStep1Valid = (() => {
    const base =
      formData.fullName.trim() !== "" &&
      formData.dob !== "" &&
      formData.contact.trim() !== "" &&
      formData.email.trim() !== "" &&
      formData.password.length >= 8 &&
      formData.college.trim() !== "" &&
      formData.admissionYear !== "" &&
      formData.state !== "" &&
      formData.collegeIdFile !== null &&
      wordCount >= 200 &&
      wordCount <= 500;
    if (formData.referredBy === "Other") {
      return base && formData.referredByOther.trim() !== "";
    }
    return base;
  })();

  const isStep2Valid = RESPONSIBILITIES.every(
    (activity) => formData.interests[activity] != null && formData.interests[activity] >= 1
  );

  const isStep3Valid = formData.videoFile !== null;

  const canProceed =
    (step === 1 && isStep1Valid) ||
    (step === 2 && isStep2Valid) ||
    (step === 3 && isStep3Valid);

  // --- Field-level error checks (only shown when showErrors is true) ---
  const fieldErr = (field: string): boolean => {
    if (!showErrors) return false;
    switch (field) {
      case "fullName": return formData.fullName.trim() === "";
      case "dob": return formData.dob === "";
      case "contact": return formData.contact.trim() === "";
      case "email": return formData.email.trim() === "";
      case "password": return formData.password.length < 8;
      case "referredByOther": return formData.referredBy === "Other" && formData.referredByOther.trim() === "";
      case "college": return formData.college.trim() === "";
      case "admissionYear": return formData.admissionYear === "";
      case "state": return formData.state === "";
      case "collegeIdFile": return formData.collegeIdFile === null;
      case "about": return wordCount < 200 || wordCount > 500;
      default: return false;
    }
  };

  const errBorder = (field: string) =>
    fieldErr(field)
      ? "border-red-400 bg-red-50"
      : "border-transparent";

  const handleAboutChange = (text: string) => {
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    setWordCount(words);
    setFormData({ ...formData, about: text });
  };

  const handleFileUpload = (type: "collegeIdFile" | "videoFile", file: File) => {
    setFormData({ ...formData, [type]: file });
  };

  const handleInterestRating = (activity: string, rating: number) => {
    setFormData({
      ...formData,
      interests: { ...formData.interests, [activity]: rating },
    });
  };

  const handleContinue = () => {
    if (!canProceed) {
      setShowErrors(true);
      return;
    }
    setShowErrors(false);
    setStep(step + 1);
  };

  const handleBack = () => {
    setShowErrors(false);
    if (step === 1) {
      router.push("/welcome");
    } else {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    if (!canProceed) {
      setShowErrors(true);
      return;
    }
    setSubmitting(true);
    setSubmissionPhase('submitting');
    setError("");
    let aiScore: number | null = null;
    let aiStatus: string | null = null;
    
    try {
      // First create the user account
      const signupRes = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.fullName,
          email: formData.email,
          password: formData.password,
          college: formData.college,
          phone: formData.contact,
          state: formData.state,
          admissionYear: formData.admissionYear,
          dob: formData.dob,
          referredBy: formData.referredBy === "Other" ? `Other: ${formData.referredByOther}` : formData.referredBy,
          about: formData.about,
          interests: formData.interests,
        }),
      });
      const signupData = await signupRes.json();
      if (!signupRes.ok) {
        setError(signupData.error || "Registration failed");
        setSubmitting(false);
        setSubmissionPhase('idle');
        return;
      }

      const userId = signupData.user?.id;
      if (!userId) {
        setError("Failed to get user ID from signup");
        setSubmitting(false);
        setSubmissionPhase('idle');
        return;
      }

      // Upload ID card if provided
      if (formData.collegeIdFile) {
        try {
          const ext = formData.collegeIdFile.name.split(".").pop() || "pdf";
          const urlRes = await fetch("/api/onboarding/id-card-upload-url", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ext, userId }),
          });
          if (urlRes.ok) {
            const { uploadUrl, publicUrl } = await urlRes.json();
            const uploadRes = await fetch(uploadUrl, {
              method: "PUT",
              body: formData.collegeIdFile,
              headers: { "Content-Type": formData.collegeIdFile.type },
            });
            if (uploadRes.ok) {
              const saveRes = await fetch("/api/onboarding/id-card-upload", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ idCardUrl: publicUrl, userId }),
              });
              if (!saveRes.ok) {
                console.error("Failed to save ID card URL:", await saveRes.json());
              }
            } else {
              console.error("Failed to upload ID card file:", uploadRes.statusText);
            }
          } else {
            console.error("Failed to get ID card upload URL:", await urlRes.json());
          }
        } catch (err) {
          console.error("ID card upload error:", err);
          // ID card upload failed, continue anyway
        }
      }

      // Upload video if provided
      if (formData.videoFile) {
        setSubmissionPhase('analyzing');
        try {
          const ext = formData.videoFile.name.split(".").pop() || "mp4";
          const urlRes = await fetch("/api/onboarding/upload-url", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ext }),
          });
          if (urlRes.ok) {
            const { uploadUrl, publicUrl } = await urlRes.json();
            const uploadRes = await fetch(uploadUrl, {
              method: "PUT",
              body: formData.videoFile,
              headers: { "Content-Type": formData.videoFile.type },
            });
            if (uploadRes.ok) {
              const saveRes = await fetch("/api/onboarding/upload", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ videoUrl: publicUrl, userId }),
              });
              if (saveRes.ok) {
                const saveData = await saveRes.json();
                // Capture AI score and status from response
                if (saveData.scoring) {
                  aiScore = saveData.scoring.score;
                  aiStatus = saveData.onboarding?.status || (saveData.scoring.approved ? 'APPROVED' : 'PENDING');
                }
              } else {
                console.error("Failed to save video URL:", await saveRes.json());
              }
            } else {
              console.error("Failed to upload video file:", uploadRes.statusText);
            }
          } else {
            console.error("Failed to get video upload URL:", await urlRes.json());
          }
        } catch (err) {
          console.error("Video upload error:", err);
          // Video upload failed, continue anyway
        }
      }

      // Build redirect URL with AI score if available
      const redirectUrl = aiScore !== null
        ? `/application-success?score=${aiScore}&status=${aiStatus}`
        : '/application-success';
      router.push(redirectUrl);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Network error. Please try again.";
      setError(msg);
      console.error("Submission error:", err);
    } finally {
      setSubmitting(false);
      setSubmissionPhase('idle');
    }
  };

  const inputBase = "w-full px-4 py-3 bg-[#F5F5F7] rounded-xl border focus:border-[#62C8DF] focus:outline-none transition-colors";

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col">
      {/* Header with stepper */}
      <div className="p-6 border-b border-[rgba(0,0,0,0.08)] bg-white">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-[#959A9B] hover:text-[#1A1A2E] transition-colors mb-6 font-medium"
        >
          <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
          Back
        </button>

        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      s <= step ? "bg-[#62C8DF] text-white" : "bg-[#E8E8ED] text-[#666666]"
                    }`}
                  >
                    {s}
                  </div>
                  <span className="text-sm font-medium text-[#1A1A2E]">
                    {s === 1 ? "Profile" : s === 2 ? "Interest" : "Video"}
                  </span>
                </div>
                <div className="h-1 bg-[#E8E8ED] rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-[#62C8DF] transition-all duration-300 ${
                      s <= step ? "w-full" : "w-0"
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-auto px-6 py-8">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl p-8 shadow-sm">
          {/* Step 1: Profile */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold mb-2">Your Profile</h2>
                <p className="text-[#666666]">Let's start with the basics</p>
              </div>

              {showErrors && !isStep1Valid && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                  Please fill in all mandatory fields to continue.
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block mb-2 text-sm font-medium">Full Name<Req /></label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className={`${inputBase} ${errBorder("fullName")}`}
                    placeholder="Dr. John Doe"
                  />
                  {fieldErr("fullName") && <p className="text-xs text-red-500 mt-1">Full name is required</p>}
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium">Date of Birth<Req /></label>
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className={`${inputBase} ${errBorder("dob")}`}
                  />
                  {fieldErr("dob") && <p className="text-xs text-red-500 mt-1">Date of birth is required</p>}
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium">Contact Number<Req /></label>
                  <input
                    type="tel"
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    className={`${inputBase} ${errBorder("contact")}`}
                    placeholder="+91 98765 43210"
                  />
                  {fieldErr("contact") && <p className="text-xs text-red-500 mt-1">Contact number is required</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block mb-2 text-sm font-medium">Email Address<Req /></label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`${inputBase} ${errBorder("email")}`}
                    placeholder="you@college.edu"
                  />
                  {fieldErr("email") && <p className="text-xs text-red-500 mt-1">Email address is required</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block mb-2 text-sm font-medium">Password<Req /></label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className={`${inputBase} ${errBorder("password")}`}
                    placeholder="Create a strong password"
                    minLength={8}
                  />
                  {fieldErr("password") && <p className="text-xs text-red-500 mt-1">Password must be at least 8 characters</p>}
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium">Referred By</label>
                  <select
                    value={formData.referredBy}
                    onChange={(e) => setFormData({ ...formData, referredBy: e.target.value, referredByOther: e.target.value === "Other" ? formData.referredByOther : "" })}
                    className={`${inputBase} border-transparent`}
                  >
                    <option value="">Select option</option>
                    <option>Friend</option>
                    <option>Social Media</option>
                    <option>College Event</option>
                    <option>Marrow Representative</option>
                    <option>Other</option>
                  </select>
                </div>

                {formData.referredBy === "Other" && (
                  <div>
                    <label className="block mb-2 text-sm font-medium">Please Specify<Req /></label>
                    <input
                      type="text"
                      value={formData.referredByOther}
                      onChange={(e) => setFormData({ ...formData, referredByOther: e.target.value })}
                      className={`${inputBase} ${errBorder("referredByOther")}`}
                      placeholder="How did you hear about us?"
                    />
                    {fieldErr("referredByOther") && <p className="text-xs text-red-500 mt-1">Please specify how you heard about us</p>}
                  </div>
                )}

                <div>
                  <label className="block mb-2 text-sm font-medium">State<Req /></label>
                  <SearchableSelect
                    options={STATES}
                    value={formData.state}
                    onChange={(val) => setFormData({ ...formData, state: val, college: "" })}
                    placeholder="Select state"
                    searchPlaceholder="Search states..."
                    error={fieldErr("state")}
                  />
                  {fieldErr("state") && <p className="text-xs text-red-500 mt-1">State is required</p>}
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium">College Name<Req /></label>
                  <SearchableSelect
                    options={formData.state ? (COLLEGES_BY_STATE[formData.state] || []) : []}
                    value={formData.college}
                    onChange={(val) => setFormData({ ...formData, college: val })}
                    placeholder={formData.state ? "Select college" : "Select a state first"}
                    searchPlaceholder="Search colleges..."
                    error={fieldErr("college")}
                    disabled={!formData.state}
                  />
                  {fieldErr("college") && <p className="text-xs text-red-500 mt-1">College name is required</p>}
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium">Admission Year<Req /></label>
                  <select
                    value={formData.admissionYear}
                    onChange={(e) => setFormData({ ...formData, admissionYear: e.target.value })}
                    className={`${inputBase} ${errBorder("admissionYear")}`}
                  >
                    <option value="">Select year</option>
                    {[2026, 2025, 2024, 2023, 2022, 2021, 2020].map((y) => (
                      <option key={y}>{y}</option>
                    ))}
                  </select>
                  {fieldErr("admissionYear") && <p className="text-xs text-red-500 mt-1">Admission year is required</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block mb-2 text-sm font-medium">
                    College ID / Fee Slip / Marksheet<Req />
                  </label>
                  <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
                    fieldErr("collegeIdFile")
                      ? "border-red-400 bg-red-50"
                      : "border-[#E8E8ED] hover:border-[#62C8DF]"
                  }`}>
                    {formData.collegeIdFile ? (
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{formData.collegeIdFile.name}</span>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, collegeIdFile: null })}
                          className="text-[#666666] hover:text-[#1A1A2E]"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer">
                        <Upload
                          className="w-8 h-8 text-[#666666] mx-auto mb-3"
                          strokeWidth={1.5}
                        />
                        <div className="text-sm text-[#666666] mb-1">
                          Click to upload or drag and drop
                        </div>
                        <div className="text-xs text-[#666666]">PDF or Image (max 10MB)</div>
                        <input
                          type="file"
                          accept=".pdf,image/*"
                          onChange={(e) =>
                            e.target.files?.[0] &&
                            handleFileUpload("collegeIdFile", e.target.files[0])
                          }
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                  {fieldErr("collegeIdFile") && <p className="text-xs text-red-500 mt-1">College ID / Fee Slip / Marksheet is required</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block mb-2 text-sm font-medium">
                    Brief about yourself (200–500 words)<Req />
                  </label>
                  <textarea
                    value={formData.about}
                    onChange={(e) => handleAboutChange(e.target.value)}
                    rows={6}
                    className={`${inputBase} resize-none ${errBorder("about")}`}
                    placeholder="Tell us about yourself, your interests, and what drives you..."
                  />
                  <div className={`text-xs mt-2 ${fieldErr("about") ? "text-red-500" : "text-[#666666]"}`}>
                    {wordCount} / 500 words {fieldErr("about") && wordCount < 200 ? `(minimum 200 words)` : ""}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Interests */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold mb-2">Tell us what excites you</h2>
                <p className="text-[#666666]">
                  Rate your interest in each responsibility from 1 to 5
                </p>
              </div>

              {showErrors && !isStep2Valid && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                  Please rate all responsibilities to continue.
                </div>
              )}

              <div className="space-y-4">
                {RESPONSIBILITIES.map((activity) => {
                  const unrated = showErrors && (formData.interests[activity] == null || formData.interests[activity] < 1);
                  return (
                    <div
                      key={activity}
                      className={`p-6 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm border transition-colors ${
                        unrated
                          ? "border-red-400 bg-red-50"
                          : "bg-white border-[rgba(0,0,0,0.08)]"
                      }`}
                    >
                      <div className="flex-1 text-sm">
                        {activity}
                        <span className="text-red-500 ml-0.5">*</span>
                      </div>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <button
                            key={rating}
                            type="button"
                            onClick={() => handleInterestRating(activity, rating)}
                            className={`w-10 h-10 rounded-full border-2 transition-all text-sm font-semibold ${
                              formData.interests[activity] === rating
                                ? "bg-[#62C8DF] border-[#62C8DF] text-white"
                                : unrated
                                  ? "border-red-300 hover:border-[#62C8DF] text-[#666666]"
                                  : "border-[#E8E8ED] hover:border-[#62C8DF] text-[#666666]"
                            }`}
                          >
                            {rating}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Video */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold mb-2">Your Marvel Video<Req /></h2>
                <p className="text-[#666666]">Tell us why you'd make a great Marvel</p>
              </div>

              {showErrors && !isStep3Valid && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                  Please upload your MARVEL video to continue. This is mandatory.
                </div>
              )}

              <div className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
                fieldErr("videoFile") || (showErrors && !isStep3Valid)
                  ? "border-red-400 bg-red-50"
                  : "border-[#E8E8ED] hover:border-[#62C8DF]"
              }`}>
                {formData.videoFile ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-[#62C8DF]/10 rounded-full flex items-center justify-center">
                      <Upload className="w-8 h-8 text-[#62C8DF]" strokeWidth={1.5} />
                    </div>
                    <div>
                      <div className="font-medium mb-1">{formData.videoFile.name}</div>
                      <div className="text-sm text-[#666666]">
                        {(formData.videoFile.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, videoFile: null })}
                      className="text-sm text-[#666666] hover:text-[#1A1A2E]"
                    >
                      Remove and upload again
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <Upload
                      className="w-12 h-12 text-[#666666] mx-auto mb-4"
                      strokeWidth={1.5}
                    />
                    <div className="text-lg font-medium mb-2">Upload a 1–2 min selfie video</div>
                    <div className="text-sm text-[#666666] mb-6">Video files (max 1GB)</div>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) =>
                        e.target.files?.[0] && handleFileUpload("videoFile", e.target.files[0])
                      }
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div className="bg-[#F5F5F7] p-6 rounded-xl border border-[rgba(0,0,0,0.08)]">
                <div className="text-sm text-[#666666] mb-3">
                  Our AI will review your video as part of the screening process. Be yourself!
                </div>
                <div className="text-sm font-medium">
                  💡 Tip: Record in good lighting. No fancy setup needed — your phone works
                  perfectly.
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                  {error}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-6 border-t border-[rgba(0,0,0,0.08)] bg-white shadow-[0px_-2px_8px_0px_rgba(0,0,0,0.08)]">
        <div className="max-w-2xl mx-auto flex justify-end gap-4">
          {step < 3 ? (
            <button
              type="button"
              onClick={handleContinue}
              className="h-12 px-8 rounded-[4px] relative flex items-center gap-2"
            >
              <div
                aria-hidden
                className="absolute bg-[#62c8df] inset-0 pointer-events-none rounded-[4px]"
              />
              <span className="relative z-10 font-bold text-sm text-white tracking-[0.5px]">
                CONTINUE
              </span>
              <ArrowRight className="w-5 h-5 relative z-10 text-white" strokeWidth={2} />
              <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_-2px_3px_0px_rgba(0,0,0,0.2)]" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="h-12 px-8 rounded-[4px] relative disabled:opacity-60"
            >
              <div
                aria-hidden
                className="absolute bg-[#62c8df] inset-0 pointer-events-none rounded-[4px]"
              />
              <span className="relative z-10 font-bold text-sm text-white tracking-[0.5px]">
                {submitting ? "SUBMITTING..." : "SUBMIT APPLICATION"}
              </span>
              <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_-2px_3px_0px_rgba(0,0,0,0.2)]" />
            </button>
          )}
        </div>
      </div>

      {/* Submission Overlay */}
      {submissionPhase !== 'idle' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-10 max-w-sm w-full mx-6 text-center shadow-2xl">
            {submissionPhase === 'submitting' && (
              <>
                <div className="w-20 h-20 bg-[#62C8DF]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <div className="w-10 h-10 border-4 border-[#62C8DF] border-t-transparent rounded-full animate-spin" />
                </div>
                <h2 className="text-2xl font-semibold mb-2 text-[#1A1A2E]">Submitting your application</h2>
                <p className="text-[#666666] text-sm">
                  Uploading your profile and documents…
                </p>
              </>
            )}
            {submissionPhase === 'analyzing' && (
              <>
                <div className="relative w-24 h-24 mx-auto mb-6">
                  {/* Pulsing outer ring */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#62C8DF]/30 to-[#A78BFA]/30 animate-pulse" />
                  {/* Inner glowing circle */}
                  <div className="absolute inset-2 rounded-full bg-gradient-to-br from-[#62C8DF] to-[#A78BFA] flex items-center justify-center shadow-lg shadow-[#62C8DF]/30">
                    <Sparkles className="w-10 h-10 text-white" strokeWidth={1.5} />
                  </div>
                </div>
                <h2 className="text-2xl font-semibold mb-2 text-[#1A1A2E]">
                  Analysing your application
                </h2>
                <p className="text-[#666666] text-sm leading-relaxed">
                  Our AI is reviewing your video and profile.
                  <br />
                  <span className="font-medium text-[#1A1A2E]">This will take less than a minute.</span>
                </p>
                <div className="mt-5 flex justify-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#62C8DF] animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-[#62C8DF] animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-[#62C8DF] animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
