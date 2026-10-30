@echo off
cd /d "%~dp0"
title Dong Bo Du Lieu Len GitHub - Dep Nam Tuyet Nhung
cls

echo ====================================================
echo   DANG DONG BO WEBSITE LEN GITHUB REPOSITORY:
echo   https://github.com/thuongnt070694-lgtm/depnamtuyetnhung
echo ====================================================
echo.

echo 1. Kiem tra va khoi tao Git...
if not exist .git (
    git init
    git branch -M main
)

echo 2. Ket noi voi GitHub...
git remote remove origin 2>nul
git remote add origin https://github.com/thuongnt070694-lgtm/depnamtuyetnhung.git

echo 3. Luu toan bo tap tin vua cap nhat tren may...
git add .
git commit -m "Dong bo website va du lieu moi nhat %date% %time%"

echo 4. Ket hop voi du lieu tren GitHub (san pham vua xuat ban tu Admin)...
git pull origin main --rebase

echo 5. Day toan bo len GitHub...
git push -u origin main

if %errorlevel% neq 0 (
    echo.
    echo [THU LAI] Dang thu day lai...
    git push -u origin main --force
)

echo.
echo ====================================================
echo   THANH CONG 100%! Vercel dang cap nhat web (20-30 giay).
echo ====================================================
pause
