#!/bin/bash

# Script to fix remaining relative API paths in frontend components
# Converts /api/* paths to buildApiUrl('/api/*')

cd /Applications/XAMPP/xamppfiles/htdocs/Entreprises/emploi-connect-

echo "🔧 Fixing remaining API paths in frontend components..."

# 1. Settings pages
echo "Fixing settings pages..."

# CompanyProfile.tsx - already done, but check for any remaining
sed -i.bak 's|fetch("/api/users/me"|fetch(buildApiUrl("/api/users/me")|g' src/pages/settings/CompanyProfile.tsx
sed -i '' 's|rm.bak||g' src/pages/settings/CompanyProfile.tsx 2>/dev/null || true

# CandidatePersonalInfo.tsx
sed -i.bak 's|fetch("/api/users/me"|fetch(buildApiUrl("/api/users/me")|g' src/pages/settings/CandidatePersonalInfo.tsx
rm -f src/pages/settings/CandidatePersonalInfo.tsx.bak 2>/dev/null || true

# CompanyAdministrative.tsx
sed -i.bak 's|fetch("/api/users/me"|fetch(buildApiUrl("/api/users/me")|g' src/pages/settings/CompanyAdministrative.tsx
rm -f src/pages/settings/CompanyAdministrative.tsx.bak 2>/dev/null || true

# CompanyPrivacy.tsx
sed -i.bak 's|fetch("/api/users/me"|fetch(buildApiUrl("/api/users/me")|g' src/pages/settings/CompanyPrivacy.tsx
rm -f src/pages/settings/CompanyPrivacy.tsx.bak 2>/dev/null || true

# Security.tsx
sed -i.bak 's|fetch("/api/users/me|fetch(buildApiUrl("/api/users/me|g' src/pages/settings/Security.tsx
rm -f src/pages/settings/Security.tsx.bak 2>/dev/null || true

# 2. Service pages
echo "Fixing service pages..."
for file in src/pages/services/*.tsx; do
  sed -i.bak 's|fetch("/api/service-catalogs|fetch(buildApiUrl("/api/service-catalogs|g' "$file"
  rm -f "$file.bak" 2>/dev/null || true
done

# 3. Publication report page
echo "Fixing publication pages..."
sed -i.bak 's|fetch(`/api/publications|fetch(buildApiUrl(`/api/publications|g' src/pages/PublicationReportPage.tsx
rm -f src/pages/PublicationReportPage.tsx.bak 2>/dev/null || true

# 4. Candidate profile
sed -i.bak 's|fetch(`/api/favorites|fetch(buildApiUrl(`/api/favorites|g' src/pages/CandidateProfile.tsx
rm -f src/pages/CandidateProfile.tsx.bak 2>/dev/null || true

# 5. Company validations
echo "Fixing company pages..."
sed -i.bak 's|fetch('\''/api/company|fetch(buildApiUrl(\''/api/company|g' src/pages/company/validations/page.tsx
rm -f src/pages/company/validations/page.tsx.bak 2>/dev/null || true

# 6. Job pages
echo "Fixing job pages..."
sed -i.bak 's|fetch('\''/api/company|fetch(buildApiUrl(\''/api/company|g' src/pages/Recrutement.tsx
sed -i.bak 's|fetch('\''/api/jobs|fetch(buildApiUrl(\''/api/jobs|g' src/pages/Recrutement.tsx
sed -i.bak 's|fetch('\''/api/users/me|fetch(buildApiUrl(\''/api/users/me|g' src/pages/Recrutement.tsx
rm -f src/pages/Recrutement.tsx.bak 2>/dev/null || true

echo "✅ API path fixes complete!"
echo ""
echo "⚠️  Now check these files for missing buildApiUrl imports:"
echo "   - Make sure each file has: import { ..., buildApiUrl } from '@/lib/headers';"

grep -l "fetch(buildApiUrl" src/pages/settings/*.tsx 2>/dev/null | while read file; do
  if ! grep -q "buildApiUrl" "$file" | head -1; then
    echo "   ⚠️  Missing import in: $file"
  fi
done
