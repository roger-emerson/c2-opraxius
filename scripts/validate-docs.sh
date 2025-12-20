#!/bin/bash
# scripts/validate-docs.sh
# Validates all markdown cross-references
# Exit code 0 = all links valid, 1 = broken links found

echo "🔍 Validating documentation links..."
echo ""

# Find all markdown files, excluding node_modules and .git
DOCS=$(find . -name "*.md" \
  -not -path "*/node_modules/*" \
  -not -path "*/.git/*" \
  -not -path "*/.turbo/*" \
  -not -path "*/dist/*" \
  | sort)

BROKEN_LINKS=0
CHECKED_LINKS=0

for doc in $DOCS; do
  # Extract markdown links: [text](path)
  # This regex captures both []() and [][]
  links=$(grep -oE '\[([^]]+)\]\(([^)]+)\)' "$doc" | sed -E 's/.*\(([^)]+)\).*/\1/' || true)

  for link in $links; do
    # Skip external URLs
    if [[ $link == http* ]] || [[ $link == https* ]] || [[ $link == mailto:* ]]; then
      continue
    fi

    # Skip anchors (links starting with #)
    if [[ $link == \#* ]]; then
      continue
    fi

    # Remove anchor from link (e.g., file.md#section -> file.md)
    clean_link="${link%%#*}"

    # Resolve relative path
    dir=$(dirname "$doc")

    # Handle absolute paths from repo root (starting with /)
    if [[ $clean_link == /* ]]; then
      target=".$clean_link"
    else
      target="$dir/$clean_link"
    fi

    # Normalize path (resolve ..)
    if [ -d "$(dirname "$target")" ]; then
      target=$(cd "$(dirname "$target")" 2>/dev/null && pwd)/$(basename "$target")
    fi

    CHECKED_LINKS=$((CHECKED_LINKS + 1))

    # Check if file exists
    if [ ! -f "$target" ] && [ ! -d "$target" ]; then
      echo "❌ BROKEN LINK"
      echo "   File: $doc"
      echo "   Link: $link"
      echo "   Expected: $target"
      echo ""
      BROKEN_LINKS=$((BROKEN_LINKS + 1))
    fi
  done
done

echo "---"
echo "Checked: $CHECKED_LINKS links across $(echo "$DOCS" | wc -l | xargs) markdown files"

if [ $BROKEN_LINKS -eq 0 ]; then
  echo "✅ All documentation links are valid!"
  exit 0
else
  echo "❌ Found $BROKEN_LINKS broken link(s)"
  echo ""
  echo "Please fix the broken links and run this script again."
  exit 1
fi
