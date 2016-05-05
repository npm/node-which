#!/bin/bash
(
  echo '# Changes'
  echo ''
  git log --first-parent --pretty=format:'%s' \
    | perl -p -e 's/^((v?[0-9]+\.?)+)$/\n## \1\n/g' \
    | perl -p -e 's/^(.[^#]*)$/* \1/g'
)> CHANGELOG.md
