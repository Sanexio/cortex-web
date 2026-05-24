#!/bin/bash
url="$1"
result=$(curl -sS -u praxis:Sanexio --compressed -o /dev/null \
  -w "%{http_code}|%{time_total}|%{time_starttransfer}|%{size_download}|%{size_header}|%{num_redirects}" \
  --max-time 20 "$url" 2>/dev/null)
echo "${result}|${url}"
