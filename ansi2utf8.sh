#!/bin/bash

# Usage:
#   ./ansi_to_utf8.sh <dossier>
#
# Exemple:
#   ./ansi_to_utf8.sh LogicCompiler2

ROOT="$1"

if [ -z "$ROOT" ]; then
  echo "Usage: $0 <dossier>"
  exit 1
fi

if [ ! -d "$ROOT" ]; then
  echo "Erreur: '$ROOT' n'est pas un dossier"
  exit 1
fi

echo "Scan du dossier: $ROOT"
echo

# Parcours récursif de tous les fichiers
find "$ROOT" -type f | while read -r file; do

  # Détection encodage (file -i est fiable)
  charset=$(file -i "$file" 2>/dev/null | sed -n 's/.*charset=\(.*\)$/\1/p')

  case "$charset" in
    iso-8859-1|windows-1252)
      echo "Conversion: $file  ($charset → utf-8)"

      tmp="${file}.tmp"

      iconv -f "$charset" -t UTF-8 "$file" > "$tmp" 2>/dev/null

      if [ $? -eq 0 ]; then
        mv "$tmp" "$file"
      else
        echo "  ⚠️  Erreur conversion: $file"
        rm -f "$tmp"
      fi
      ;;
    utf-8)
      # OK, rien à faire
      ;;
    *)
      # Autres cas (binaire, ascii, inconnu)
      ;;
  esac

done

echo
echo "Conversion terminée."
