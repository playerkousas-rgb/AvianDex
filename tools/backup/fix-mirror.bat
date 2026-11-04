@echo off
REM ============================================================
REM  修復 D:\GITBACKUP\AvianDex.git（bare mirror）的 fetch 設定
REM ------------------------------------------------------------
REM  背景：
REM    1) `git fetch <網址>` 冇帶 refspec 時，只會拿 HEAD，
REM       分支完全唔會更新（畫面只見 "branch HEAD -> FETCH_HEAD"）。
REM    2) refspec 打漏尾隨的 `*` 會報 fatal: invalid refspec。
REM    3) CMD 唔會展開 `*`，但為安全起見一律加雙引號。
REM
REM  用法：
REM    fix-mirror.bat            修復 + 立即 fetch
REM    fix-mirror.bat check      只檢查現況，不改任何設定
REM ============================================================
setlocal

set "MIRROR=D:\GITBACKUP\AvianDex.git"
set "REMOTE=https://github.com/playerkousas-rgb/AvianDex.git"

if not exist "%MIRROR%" (
  echo [錯誤] 找不到 %MIRROR%
  echo        第一次建立 mirror：
  echo        git clone --mirror %REMOTE% "%MIRROR%"
  exit /b 1
)

pushd "%MIRROR%" || exit /b 1

echo ============================================================
echo  現況
echo ============================================================
for /f %%b in ('git rev-parse --is-bare-repository 2^>nul') do echo bare-repository : %%b
echo remote origin   :
git remote -v
echo.
echo fetch refspec   :
git config --get-all remote.origin.fetch
echo.
echo 本機分支／ref 數 :
git for-each-ref --format="%%(refname)" | find /c /v ""
echo commit 總數      :
git rev-list --all --count

if /i "%~1"=="check" (
  popd
  exit /b 0
)

echo.
echo ============================================================
echo  開始修復
echo ============================================================

REM ── 1. 確保有 origin ──
git remote get-url origin >nul 2>&1
if errorlevel 1 (
  echo [1/4] 新增 origin ...
  git remote add origin "%REMOTE%"
) else (
  echo [1/4] origin 已存在，更新網址 ...
  git remote set-url origin "%REMOTE%"
)

REM ── 2. 設為 mirror：之後 `git fetch origin` 就會拿「全部 refs」 ──
echo [2/4] 設為 mirror 模式 ...
git config remote.origin.mirror true
git config remote.origin.fetch "+refs/*:refs/*"

REM ── 2b. 修正 HEAD（bare mirror 的 HEAD 可能指向唔存在的 master，
REM        令 bundle 還原時檢出失敗：「remote HEAD refers to nonexistent ref」）──
echo [2/4] 修正 HEAD ...
git symbolic-ref HEAD refs/heads/main >nul 2>&1
if errorlevel 1 git symbolic-ref HEAD refs/heads/master >nul 2>&1

REM ── 3. 立即抓（明寫 refspec，避免再撞同一個問題）──
echo [3/4] 抓取分支／標籤 ...
git fetch --prune origin "+refs/heads/*:refs/heads/*" "+refs/tags/*:refs/tags/*"
if errorlevel 1 (
  echo [警告] fetch 失敗：可能係網絡或認證問題。本機舊資料仍然保留。
  goto :report
)

echo [3/4] 抓取 PR refs（可選）...
git fetch --prune origin "+refs/pull/*/head:refs/pull/*/head" >nul 2>&1

:report
echo.
echo ============================================================
echo  結果
echo ============================================================
echo commit 總數 : 
git rev-list --all --count
echo.
echo 最近 5 個 commit：
git log --oneline -5 --all
echo.
echo 分支／ref 清單：
git for-each-ref --format="  %%(refname:short)  %%(objectname:short)" | more +0
echo.
echo 驗證我今次的分支在唔在：
git rev-parse --verify refs/heads/arena/3be6342b-aviandex >nul 2>&1
if errorlevel 1 (
  echo   [缺少] refs/heads/arena/3be6342b-aviandex
  echo   如果 GitHub 上仍然有這個分支，重跑一次本腳本即可。
) else (
  for /f %%h in ('git rev-parse --short refs/heads/arena/3be6342b-aviandex') do echo   [OK] arena/3be6342b-aviandex = %%h
)

popd
echo.
echo 完成。之後每日只需： git -C "%MIRROR%" fetch --prune origin
endlocal
exit /b 0
