#!/bin/bash

# Script to remove Supabase imports from project files
# Only removes the import statements, not the code that uses them

echo "🧹 Suppression des imports @supabase/supabase-js..."

# Find all files with Supabase imports
find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" \) \
  -not -path "./node_modules/*" \
  -not -path "./dist/*" \
  -exec grep -l "@supabase/supabase-js" {} \; | while read file; do
  
  echo "  Traitement: $file"
  
  # Remove the import line
  sed -i.bak "/import.*@supabase\/supabase-js/d" "$file"
  sed -i.bak "/const.*=.*require.*@supabase\/supabase-js/d" "$file"
  sed -i.bak "/import { createClient }.*@supabase\/supabase-js/d" "$file"
  
  # Remove backup file
  rm -f "$file.bak"
done

echo "✅ Suppression terminée!"
