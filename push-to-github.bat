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

echo 3. Lay du lieu moi nhat tu GitHub ve may (san pham vua xuat ban tu Admin)...
git pull origin main --rebase

echo 4. Them toan bo tap tin vua sua...
git add .

echo 5. Tao Commit cap nhat...
git commit -m "Cap nhat he thong tu dong tai san pham va dong bo website %date% %time%"

echo 6. Day toan bo du lieu len GitHub...
git push -u origin main

if %errorlevel% neq 0 (
    echo.
    echo [THU LAI] Dang thu dong bo lai voi GitHub...
    git pull origin main --rebase
    git push -u origin main --force
)

echo.
echo ====================================================
echo   HOAN TAT! Vercel dang trien khai (khoang 20-30 giay).
echo   Trang web khach gio day se TU DONG HIEN THI san pham moi!
echo ====================================================
pause
