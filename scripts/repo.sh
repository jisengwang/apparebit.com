#!/usr/bin/env bash

readonly OBJECT_FORMAT='%(objecttype) %(objectname) %(objectsize) %(rest)'

# ==============================================================================
# Utilities

light_rule() {
  printf '─%.0s' $(seq 1 $(tput cols))
  printf '\n'
}

heavy_rule() {
  printf '━%.0s' $(seq 1 $(tput cols))
  printf '\n'
}

# ==============================================================================
# Git Internals

# ------------------------------------------------------------------------------
# 1. List as <type> <hash> <size> [<path>]

list_all_objects() {
  git rev-list --objects --all \
  | git cat-file --batch-check="$OBJECT_FORMAT"
}

# ------------------------------------------------------------------------------
# 2. Filter and Sort

# Select blobs only, leaving out tree objects.
only_blobs() {
  sed -n 's/^blob /&/p'
}

# Select objects with matching path: `matches <regex>`.
matches() {
  [[ $# -eq 1 ]] || exit 2
  awk "\$4 ~ /$1/" -
}

# Sort by size.
by_size() {
  sort --numeric-sort --key=3
}

# Sort by path.
by_path() {
  sort --key=4
}

# ------------------------------------------------------------------------------
# 3. Project

# Keep only hash and path. For debugging.
hash_and_path() {
  cut -f 2,4 -d ' '
}

# Keep only hash and size. For debugging.
hash_and_size() {
  cut -f 2,3 -d ' '
}

# Keep only hash. To feed into bfg.
hash() {
  cut -f 2 -d ' '
}

# ==============================================================================

# Putting it all together.
heavy_rule
BLOBS="$(list_all_objects | only_blobs | by_path)"
echo "$BLOBS" | matches 'woff2?$'
heavy_rule
