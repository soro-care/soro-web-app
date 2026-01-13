-- AddForeignKey
ALTER TABLE "psn_applications" ADD CONSTRAINT "psn_applications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "psn_progress" ADD CONSTRAINT "psn_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "psn_progress" ADD CONSTRAINT "psn_progress_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "psn_modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;
