import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
}

export function activityLabel(type: string) {
  const map: Record<string, string> = {
    REEL: "Instagram Reel",
    COMMUNITY: "Quora / Reddit Post",
    QUIZ: "Quiz (Google Form)",
    REFERRAL: "Refer a Captain Marvel",
    DOUBT_SESSION: "Doubt Solving Session",
    CLASSROOM_SESSION: "Classroom Session",
    COLLEGE_EVENT: "College Event",
    REPORT_PIRACY: "Report Piracy",
    CASE_CLUB: "Case Club",
    NEW_INITIATIVE: "New Initiative",
  };
  return map[type] || type;
}

export function isAutoApproved(type: string) {
  return type === "REEL";
}
