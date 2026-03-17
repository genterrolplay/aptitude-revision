@echo off
set PATH=C:\Program Files\Git\cmd;C:\Program Files\nodejs;%PATH%
cd /d C:\Users\paulg\.gemini\antigravity\scratch\aptitude-revision
git remote add origin https://github.com/genterrolplay/aptitude-revision.git
git branch -M main
git push -u origin main
echo DONE
