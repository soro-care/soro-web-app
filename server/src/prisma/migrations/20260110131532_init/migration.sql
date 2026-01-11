-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'PROFESSIONAL', 'ADMIN', 'SUPERADMIN');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('Active', 'Inactive', 'Suspended');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('Pending', 'Confirmed', 'Completed', 'Cancelled', 'Rescheduled');

-- CreateEnum
CREATE TYPE "BookingModality" AS ENUM ('Video', 'Audio');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('BookingRequest', 'BookingConfirmed', 'BookingCancelled', 'BookingRescheduled', 'BookingCompleted', 'NewMessage');

-- CreateEnum
CREATE TYPE "DiagnosisStatus" AS ENUM ('Yes', 'No', 'Unsure');

-- CreateEnum
CREATE TYPE "EchoRoom" AS ENUM ('pressure', 'burnout', 'not_enough', 'silence', 'rage', 'exhaustion', 'gratitude', 'victory', 'hope', 'resilience');

-- CreateEnum
CREATE TYPE "EchoSentiment" AS ENUM ('struggle', 'positive', 'neutral');

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "resourceType" TEXT,
    "resourceId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consent_records" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "consentType" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "givenAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consent_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "pseudonymousId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "consentGivenAt" TIMESTAMP(3) NOT NULL,
    "consentVersion" TEXT NOT NULL DEFAULT '2.0',
    "privacyPolicyVersion" TEXT NOT NULL DEFAULT '2.0',
    "name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "avatar" TEXT,
    "mobile" TEXT,
    "verifyEmail" BOOLEAN NOT NULL DEFAULT false,
    "refreshToken" TEXT,
    "lastLoginDate" TIMESTAMP(3),
    "forgotPasswordOtp" TEXT,
    "forgotPasswordExpiry" TIMESTAMP(3),
    "status" "UserStatus" NOT NULL DEFAULT 'Active',
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "isPeerCounselor" BOOLEAN NOT NULL DEFAULT false,
    "counselorId" TEXT,
    "specialization" TEXT,
    "qualifications" TEXT[],
    "bio" TEXT,
    "yearsOfExperience" INTEGER,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "otps" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "otp" TEXT NOT NULL,
    "expiry" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "userData" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pre_authorizations" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "authorizedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pre_authorizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "availabilities" (
    "id" TEXT NOT NULL,
    "professional" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "slots" JSONB NOT NULL,
    "available" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "availabilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL,
    "userPseudonymousId" TEXT NOT NULL,
    "counselorPseudonymousId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "modality" "BookingModality" NOT NULL,
    "concern" TEXT NOT NULL,
    "notes" TEXT,
    "meetingLink" TEXT,
    "meetingPassword" TEXT,
    "status" "BookingStatus" NOT NULL DEFAULT 'Pending',
    "cancellationReason" TEXT,
    "rescheduledFrom" TEXT,
    "reminderSent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_sessions" (
    "id" TEXT NOT NULL,
    "patientPseudonymousId" TEXT NOT NULL,
    "counselorPseudonymousId" TEXT NOT NULL,
    "sessionType" TEXT NOT NULL DEFAULT 'peer',
    "encryptionKeyId" TEXT NOT NULL,
    "crisisDetected" BOOLEAN NOT NULL DEFAULT false,
    "crisisLevel" TEXT,
    "crisisIntervention" JSONB,
    "status" TEXT NOT NULL DEFAULT 'active',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chat_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_messages" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "senderType" TEXT NOT NULL,
    "senderPseudonymousId" TEXT NOT NULL,
    "encryptedContent" TEXT NOT NULL,
    "encryptionKeyId" TEXT NOT NULL,
    "sentimentAnalysis" JSONB,
    "riskScore" DECIMAL(3,2),
    "flaggedKeywords" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "indexedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "surveys" (
    "id" TEXT NOT NULL,
    "user" TEXT NOT NULL,
    "ageRange" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "concerns" TEXT[],
    "otherConcern" TEXT,
    "diagnosed" "DiagnosisStatus" NOT NULL,
    "diagnosisDetails" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "surveys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_posts" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "featuredImage" TEXT,
    "author" TEXT NOT NULL,
    "tags" TEXT[],
    "readTime" INTEGER NOT NULL DEFAULT 5,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "views" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blog_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blog_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_comments" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "post" TEXT NOT NULL,
    "approved" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blog_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "echoes" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "room" "EchoRoom" NOT NULL,
    "sentiment" "EchoSentiment" NOT NULL DEFAULT 'neutral',
    "wordCount" INTEGER NOT NULL DEFAULT 0,
    "moderated" BOOLEAN NOT NULL DEFAULT true,
    "crisisFlag" BOOLEAN NOT NULL DEFAULT false,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "reportCount" INTEGER NOT NULL DEFAULT 0,
    "emotionTags" TEXT[],
    "likes" JSONB NOT NULL DEFAULT '[]',
    "comments" JSONB NOT NULL DEFAULT '[]',
    "shareCount" INTEGER NOT NULL DEFAULT 0,
    "shareLogs" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "echoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "room_stats" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "totalStories" INTEGER NOT NULL DEFAULT 0,
    "todaysStories" INTEGER NOT NULL DEFAULT 0,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "trending" BOOLEAN NOT NULL DEFAULT false,
    "averageWordCount" INTEGER NOT NULL DEFAULT 0,
    "crisisCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "room_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "sender" TEXT,
    "booking" TEXT,
    "type" "NotificationType" NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emergency_contacts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "relationship" TEXT,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "canBeContacted" BOOLEAN NOT NULL DEFAULT true,
    "consentGivenAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "emergency_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "psn_applications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "motivation" TEXT NOT NULL,
    "availability" TEXT NOT NULL,
    "experience" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "applicationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "psn_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "psn_modules" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "videoUrl" TEXT,
    "content" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    "unlockDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "psn_modules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "psn_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "preAssessment" JSONB,
    "postAssessment" JSONB,
    "videoWatched" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "psn_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_BlogCategoryToBlogPost" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_BlogCategoryToBlogPost_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE INDEX "consent_records_userId_idx" ON "consent_records"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "users_pseudonymousId_key" ON "users"("pseudonymousId");

-- CreateIndex
CREATE UNIQUE INDEX "users_userId_key" ON "users"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_counselorId_key" ON "users"("counselorId");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");

-- CreateIndex
CREATE INDEX "users_pseudonymousId_idx" ON "users"("pseudonymousId");

-- CreateIndex
CREATE UNIQUE INDEX "otps_email_key" ON "otps"("email");

-- CreateIndex
CREATE INDEX "otps_email_idx" ON "otps"("email");

-- CreateIndex
CREATE UNIQUE INDEX "pre_authorizations_email_key" ON "pre_authorizations"("email");

-- CreateIndex
CREATE INDEX "pre_authorizations_authorizedBy_idx" ON "pre_authorizations"("authorizedBy");

-- CreateIndex
CREATE INDEX "availabilities_professional_idx" ON "availabilities"("professional");

-- CreateIndex
CREATE UNIQUE INDEX "availabilities_professional_day_key" ON "availabilities"("professional", "day");

-- CreateIndex
CREATE INDEX "bookings_userPseudonymousId_idx" ON "bookings"("userPseudonymousId");

-- CreateIndex
CREATE INDEX "bookings_counselorPseudonymousId_idx" ON "bookings"("counselorPseudonymousId");

-- CreateIndex
CREATE INDEX "bookings_date_idx" ON "bookings"("date");

-- CreateIndex
CREATE INDEX "bookings_status_idx" ON "bookings"("status");

-- CreateIndex
CREATE INDEX "chat_sessions_patientPseudonymousId_idx" ON "chat_sessions"("patientPseudonymousId");

-- CreateIndex
CREATE INDEX "chat_sessions_counselorPseudonymousId_idx" ON "chat_sessions"("counselorPseudonymousId");

-- CreateIndex
CREATE INDEX "chat_sessions_crisisDetected_idx" ON "chat_sessions"("crisisDetected");

-- CreateIndex
CREATE INDEX "chat_messages_sessionId_idx" ON "chat_messages"("sessionId");

-- CreateIndex
CREATE INDEX "chat_messages_senderPseudonymousId_idx" ON "chat_messages"("senderPseudonymousId");

-- CreateIndex
CREATE INDEX "chat_messages_createdAt_idx" ON "chat_messages"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "surveys_user_key" ON "surveys"("user");

-- CreateIndex
CREATE UNIQUE INDEX "blog_posts_slug_key" ON "blog_posts"("slug");

-- CreateIndex
CREATE INDEX "blog_posts_author_idx" ON "blog_posts"("author");

-- CreateIndex
CREATE INDEX "blog_posts_slug_idx" ON "blog_posts"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "blog_categories_name_key" ON "blog_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "blog_categories_slug_key" ON "blog_categories"("slug");

-- CreateIndex
CREATE INDEX "blog_comments_post_idx" ON "blog_comments"("post");

-- CreateIndex
CREATE INDEX "blog_comments_author_idx" ON "blog_comments"("author");

-- CreateIndex
CREATE INDEX "echoes_room_idx" ON "echoes"("room");

-- CreateIndex
CREATE INDEX "echoes_createdAt_idx" ON "echoes"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "room_stats_roomId_key" ON "room_stats"("roomId");

-- CreateIndex
CREATE INDEX "notifications_recipient_idx" ON "notifications"("recipient");

-- CreateIndex
CREATE INDEX "notifications_isRead_idx" ON "notifications"("isRead");

-- CreateIndex
CREATE INDEX "emergency_contacts_userId_idx" ON "emergency_contacts"("userId");

-- CreateIndex
CREATE INDEX "psn_applications_userId_idx" ON "psn_applications"("userId");

-- CreateIndex
CREATE INDEX "psn_applications_status_idx" ON "psn_applications"("status");

-- CreateIndex
CREATE INDEX "psn_modules_order_idx" ON "psn_modules"("order");

-- CreateIndex
CREATE INDEX "psn_progress_userId_idx" ON "psn_progress"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "psn_progress_userId_moduleId_key" ON "psn_progress"("userId", "moduleId");

-- CreateIndex
CREATE INDEX "_BlogCategoryToBlogPost_B_index" ON "_BlogCategoryToBlogPost"("B");

-- AddForeignKey
ALTER TABLE "consent_records" ADD CONSTRAINT "consent_records_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pre_authorizations" ADD CONSTRAINT "pre_authorizations_authorizedBy_fkey" FOREIGN KEY ("authorizedBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "availabilities" ADD CONSTRAINT "availabilities_professional_fkey" FOREIGN KEY ("professional") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_userPseudonymousId_fkey" FOREIGN KEY ("userPseudonymousId") REFERENCES "users"("pseudonymousId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_counselorPseudonymousId_fkey" FOREIGN KEY ("counselorPseudonymousId") REFERENCES "users"("pseudonymousId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "chat_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "surveys" ADD CONSTRAINT "surveys_user_fkey" FOREIGN KEY ("user") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_author_fkey" FOREIGN KEY ("author") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_comments" ADD CONSTRAINT "blog_comments_author_fkey" FOREIGN KEY ("author") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_comments" ADD CONSTRAINT "blog_comments_post_fkey" FOREIGN KEY ("post") REFERENCES "blog_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_recipient_fkey" FOREIGN KEY ("recipient") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_sender_fkey" FOREIGN KEY ("sender") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_booking_fkey" FOREIGN KEY ("booking") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergency_contacts" ADD CONSTRAINT "emergency_contacts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BlogCategoryToBlogPost" ADD CONSTRAINT "_BlogCategoryToBlogPost_A_fkey" FOREIGN KEY ("A") REFERENCES "blog_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BlogCategoryToBlogPost" ADD CONSTRAINT "_BlogCategoryToBlogPost_B_fkey" FOREIGN KEY ("B") REFERENCES "blog_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
