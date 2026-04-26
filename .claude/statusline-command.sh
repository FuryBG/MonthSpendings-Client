#!/usr/bin/env bash
input=$(cat)
node -e "
const d = JSON.parse(process.argv[1]);
const parts = [];
const used = d?.context_window?.used_percentage;
if (used != null) parts.push('Ctx: ' + Math.round(used) + '%');
const fh = d?.rate_limits?.five_hour?.used_percentage;
if (fh != null) parts.push('5h: ' + Math.round(fh) + '%');
const wd = d?.rate_limits?.seven_day?.used_percentage;
if (wd != null) parts.push('7d: ' + Math.round(wd) + '%');
if (parts.length) console.log(parts.join(' | '));
" "$input"
