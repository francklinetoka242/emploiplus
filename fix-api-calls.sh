#!/bin/bash

# Script to fix all API calls in settings pages to use buildApiUrl

PROJECT_ROOT="/Applications/XAMPP/xamppfiles/htdocs/Entreprises/emploi-connect-"
cd "$PROJECT_ROOT"

# List of files to fix
FILES=(
  "src/pages/settings/CompanyLocation.tsx"
  "src/pages/settings/CompanyIdentity.tsx"
  "src/pages/settings/CandidatePreferences.tsx"
  "src/pages/settings/CandidateExperienceEducation.tsx"
  "src/pages/settings/CandidateSocialNetworks.tsx"
  "src/pages/settings/CandidatePrivacy.tsx"
  "src/pages/settings/DeleteAccount.tsx"
  "src/pages/settings/Informations.tsx"
  "src/pages/settings/Services.tsx"
  "src/pages/settings/CandidateProfile.tsx"
  "src/pages/settings/CompanyCulture.tsx"
  "src/pages/settings/CandidateInformation.tsx"
  "src/pages/settings/Profile.tsx"
  "src/pages/settings/CandidateProfessionalProfile.tsx"
  "src/pages/settings/CandidatePersonalInfo.tsx"
  "src/pages/settings/CompanyAdministrative.tsx"
  "src/pages/settings/Security.tsx"
  "src/pages/settings/CompanyPrivacy.tsx"
  "src/pages/settings/Recommendations.tsx"
)

for FILE in "${FILES[@]}"; do
  echo "Processing: $FILE"
  
  # Add buildApiUrl to import if not already there
  if ! grep -q 'buildApiUrl' "$FILE"; then
    # Find the line with authHeaders import and add buildApiUrl
    sed -i '' 's/import { authHeaders }/import { authHeaders, buildApiUrl }/g' "$FILE"
    # If authHeaders wasn't imported, try another pattern
    if ! grep -q 'buildApiUrl' "$FILE"; then
      # Try to add it to an existing import from @\/lib\/headers
      sed -i '' 's/from .@\/lib\/headers./from "@\/lib\/headers"; import { buildApiUrl } from "@\/lib\/headers'\''/g' "$FILE"
    fi
  fi
  
  # Replace fetch("/api/ with fetch(buildApiUrl("/api/
  sed -i '' 's/fetch("\/api\//fetch(buildApiUrl("\/api\//g' "$FILE"
  
  echo "✓ Done: $FILE"
done

echo "All files processed!"
