@echo off
cd /d "%~dp0"
title Day Du Lieu Len GitHub - Dep Nam Tuyet Nhung
cls

echo ====================================================
echo   DANG DAY WEBSITE LEN GITHUB REPOSITORY:
echo   https://github.com/thuongnt070694-lgtm/depnamtuyetnhung
echo ====================================================
echo.

echo 1. Khoi tao Git...
git init

echo 2. Them toan bo tap tin...
git add .

echo 3. Tao Commit...
git commit -m "Khoi tao website ban hang Dep Nam Tuyet Nhung"

echo 4. Chuyen nhanh chinh sang main...
git branch -M main

echo 5. Ket noi voi repository tu xa...
git remote remove origin 2>nul
git remote add origin https://github.com/thuongnt070694-lgtm/depnamtuyetnhung.git

echo 6. Day du lieu len GitHub (git push)...
git push -u origin main

if %errorlevel% neq 0 (
    echo.
    echo [THONG BAO] Neu repository tren GitHub da co san file README, hay thu lenh sau:
    echo git pull origin main --rebase
    echo git push -u origin main
)

echo.
echo ====================================================
echo   HOAN TAT!
echo ====================================================
pause
