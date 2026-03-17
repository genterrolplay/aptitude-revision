@echo off
set PATH=C:\Program Files\Git\cmd;C:\Program Files\nodejs;%PATH%
cd /d C:\Users\paulg\.gemini\antigravity\scratch\aptitude-revision
echo.
echo === Envoi des modifications sur Render ===
echo.
git add .
git commit -m "mise-a-jour"
git push
echo.
echo ✅ Modifications envoyees ! Render va se mettre a jour automatiquement (~1-2 min)
echo.
pause
