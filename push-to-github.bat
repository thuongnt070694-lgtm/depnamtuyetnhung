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

echo 2. Them toan bo tap tin vua cap nhat...
git add .

echo 3. Tao Commit cap nhat...
git commit -m "Cap nhat san pham, anh dep da that va giao dien ngay %date% %time%"

echo 4. Ket noi voi GitHub...
git remote remove origin 2>nul
git remote add origin https://github.com/thuongnt070694-lgtm/depnamtuyetnhung.git

echo 5. Day du lieu len GitHub (git push)...
git push -u origin main

if %errorlevel% neq 0 (
    echo.
    echo [CANH BAO] Neu GitHub co commit moi tren mang, dang thu pull rebase...
    git pull origin main --rebase
    git push -u origin main
)

echo.
echo ====================================================
echo   HOAN TAT! Vercel se tu dong cap nhat sau 20 giay.
echo   Moi nguoi vao bang dien thoai se thay ngay anh moi!
echo ====================================================
pause
