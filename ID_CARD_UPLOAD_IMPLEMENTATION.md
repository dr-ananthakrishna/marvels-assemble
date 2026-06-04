# ID Card Upload Implementation

## Overview
ID card uploads are now fully integrated into the registration flow. The ID card (college ID, fee slip, or marksheet) is uploaded to Supabase Storage and the URL is saved to the database.

## Changes Made

### 1. Database Schema Update
**File:** `prisma/schema.prisma`

Added `idCardUrl` field to the `Onboarding` model:
```prisma
model Onboarding {
  id        String            @id @default(cuid())
  userId    String            @unique
  user      User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  idCardUrl  String?           // NEW: URL to uploaded ID card
  videoUrl   String?
  status     OnboardingStatus  @default(PENDING)
  score      Float?
  breakdown  Json?
  reason     String?
  transcript String?
  createdAt DateTime          @default(now())
  updatedAt DateTime          @updatedAt
}
```

### 2. API Endpoints Created

#### A. ID Card Upload URL Endpoint
**File:** `src/app/api/onboarding/id-card-upload-url/route.ts`

Generates a signed upload URL for Supabase Storage:
- **Method:** POST
- **Auth:** Required (session-based)
- **Request Body:** `{ ext: string }` (file extension)
- **Response:** `{ uploadUrl: string, publicUrl: string }`
- **Purpose:** Creates a signed URL for client-side upload to Supabase

#### B. ID Card Save Endpoint
**File:** `src/app/api/onboarding/id-card-upload/route.ts`

Saves the ID card URL to the database:
- **Method:** POST
- **Auth:** Required (session-based)
- **Request Body:** `{ idCardUrl: string }`
- **Response:** `{ onboarding: Onboarding }`
- **Purpose:** Stores the public URL in the database after successful upload

### 3. Frontend Integration
**File:** `src/app/register/page.tsx`

Updated the `handleSubmit` function to:
1. Create user account (existing)
2. **Upload ID card to Supabase Storage** (NEW)
   - Get signed upload URL from `/api/onboarding/id-card-upload-url`
   - Upload file directly to Supabase using signed URL
   - Save the public URL to database via `/api/onboarding/id-card-upload`
3. Upload video (existing)
4. Redirect to success page

**Upload Flow:**
```typescript
// Extract file extension
const ext = formData.collegeIdFile.name.split(".").pop() || "pdf";

// Get signed upload URL
const urlRes = await fetch("/api/onboarding/id-card-upload-url", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ ext }),
});

// Upload file to Supabase
const { uploadUrl, publicUrl } = await urlRes.json();
await fetch(uploadUrl, {
  method: "PUT",
  body: formData.collegeIdFile,
  headers: { "Content-Type": formData.collegeIdFile.type },
});

// Save URL to database
await fetch("/api/onboarding/id-card-upload", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ idCardUrl: publicUrl }),
});
```

## SQL Migration for Supabase

**File:** `src/app/migrations/add_id_card_url.sql`

Run this SQL script in your Supabase dashboard to add the column:

```sql
-- Migration: Add idCardUrl column to Onboarding table
-- Description: Store the URL of the uploaded ID card/fee slip/marksheet in Supabase Storage

ALTER TABLE "Onboarding" ADD COLUMN "idCardUrl" text;

-- Add comment for documentation
COMMENT ON COLUMN "Onboarding"."idCardUrl" IS 'URL to the uploaded college ID card, fee slip, or marksheet stored in Supabase Storage';
```

### Steps to Apply Migration:
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Create a new query
4. Copy and paste the SQL script above
5. Click "Run"
6. Verify the column was added successfully

## Storage Configuration

The ID cards are stored in the same Supabase bucket as videos: `onboarding-videos`

**Storage Path Structure:**
```
onboarding-videos/
├── onboarding/
│   └── {userId}/
│       ├── {timestamp}.pdf
│       ├── {timestamp}.jpg
│       └── {timestamp}.png
```

## Data Flow

```
User Registration Form
    ↓
[Step 1: Profile - Upload ID Card]
    ↓
User Submits Form
    ↓
Create User Account (signup API)
    ↓
Get Signed Upload URL (id-card-upload-url API)
    ↓
Upload File to Supabase Storage (direct PUT request)
    ↓
Save Public URL to Database (id-card-upload API)
    ↓
Upload Video (existing flow)
    ↓
Redirect to Success Page
```

## Error Handling

- If ID card upload fails, the registration continues (graceful degradation)
- Errors are logged to console for debugging
- User is not blocked from completing registration if ID card upload fails
- Video upload also has the same error handling

## Testing Checklist

- [ ] Prisma schema generated successfully (`npx prisma generate`)
- [ ] SQL migration applied to Supabase database
- [ ] ID card file upload works in registration form
- [ ] File appears in Supabase Storage under `onboarding-videos/onboarding/{userId}/`
- [ ] URL is saved to `Onboarding.idCardUrl` in database
- [ ] Multiple file formats work (PDF, JPG, PNG, etc.)
- [ ] File size validation works (max 10MB as per UI)
- [ ] Registration completes successfully after ID card upload

## Files Modified/Created

1. ✅ `prisma/schema.prisma` - Added `idCardUrl` field
2. ✅ `src/app/api/onboarding/id-card-upload-url/route.ts` - NEW endpoint
3. ✅ `src/app/api/onboarding/id-card-upload/route.ts` - NEW endpoint
4. ✅ `src/app/register/page.tsx` - Updated submission flow
5. ✅ `src/app/migrations/add_id_card_url.sql` - SQL migration script

## Next Steps

1. Apply the SQL migration to your Supabase database
2. Run `npx prisma generate` to regenerate Prisma client (already done)
3. Test the registration flow with ID card upload
4. Verify files appear in Supabase Storage
5. Verify URLs are saved in the database
