#!/bin/bash
cd /home/clawdbot267/.openclaw/workspace/sites/gamehub

echo "=== GameHub Assets ==="
ls -la games/*.js 2>/dev/null | wc -l
echo "game JS files"

echo ""
echo "=== Game Cards ==="
grep -c 'game-card' index.html
echo "total cards"

echo ""
echo "=== PayPal ==="
grep -c 'paypal' index.html
echo "PayPal references"

echo ""
echo "=== AdSense ==="
grep -c 'adsbygoogle' index.html
echo "AdSense references"

echo ""
echo "=== Size ==="
du -sh .
