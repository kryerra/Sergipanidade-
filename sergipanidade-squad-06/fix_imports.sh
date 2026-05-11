#!/bin/bash

# Fix all import paths in feature files
for file in src/features/**/*.tsx; do
  [ -f "$file" ] || continue
  
  # Fix local component imports
  sed -i '' "s|from ['\"]../components/|from './components/|g" "$file"
  
  # Fix shared/ui component imports (that are not local)
  sed -i '' "s|from ['\"]../../components/shared/|from '@/components/shared/|g" "$file"
  sed -i '' "s|from ['\"]../../components/ui/|from '@/components/ui/|g" "$file"
  sed -i '' "s|from ['\"]../components/shared/|from '@/components/shared/|g" "$file"
  sed -i '' "s|from ['\"]../components/ui/|from '@/components/ui/|g" "$file"
  
  # Fix HeroSlideshow, Logo, etc that are shared
  sed -i '' "s|from ['\"]../components/HeroSlideshow\"|from '@/components/shared/HeroSlideshow'|g" "$file"
  sed -i '' "s|from ['\"]../components/Logo\"|from '@/components/shared/Logo'|g" "$file"
  sed -i '' "s|from ['\"]../components/SergipanidadeLogo\"|from '@/components/shared/SergipanidadeLogo'|g" "$file"
  sed -i '' "s|from ['\"]../components/UserAvatar\"|from '@/components/shared/UserAvatar'|g" "$file"
  sed -i '' "s|from ['\"]../components/CategoryBadge\"|from '@/components/ui/CategoryBadge'|g" "$file"
  
  # Fix types import  
  sed -i '' "s|from ['\"]../App\"|from '@/types'|g" "$file"
  sed -i '' "s|from ['\"]../../App\"|from '@/types'|g" "$file"
  sed -i '' "s|from ['\"]../../../App\"|from '@/types'|g" "$file"
  
  # Fix imports/* paths
  sed -i '' "s|from ['\"]../../imports/|from '@/imports/|g" "$file"
  sed -i '' "s|from ['\"]../../../imports/|from '@/imports/|g" "$file"
  
  # Fix assets paths
  sed -i '' "s|from ['\"]../../assets/|from '@/assets/|g" "$file"
  sed -i '' "s|from ['\"]../../../assets/|from '@/assets/|g" "$file"
done

echo "✅ Import fixes applied"
