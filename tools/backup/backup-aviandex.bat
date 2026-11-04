@echo off
REM ============================================================
REM  AvianDex 每日備份（Windows）
REM ------------------------------------------------------------
REM  做三件事：
REM    1. 更新 bare mirror（所有分支／歷史／PR）——每日
REM    2. 每週造一個 .bundle 單檔快照（可離線完整還原）——週日
REM    3. 每週 robocopy 素材（cards\、reports\）——週日
REM
REM  用法：
REM    backup-aviandex.bat            正常跑
REM    backup-aviandex.bat restore    顯示還原步驟（不會改任何檔案）
REM
REM  第一次使用前，請先改下面三個路徑。
REM ============================================================
setlocal enabledelayedexpansion

REM ── 設定（改成你自己的路徑）──────────────────────────────
set "MIRROR=D:\GITBACKUP\AvianDex.git"
set "SNAPSHOT=D:\GITBACKUP\snapshots"
set "WORKTREE=D:\AvianDex-work"
set "REMOTE=https://github.com/playerkousas-rgb/AvianDex.git"
set "LOG=D:\GITBACKUP\backup.log"
set "KEEP_DAYS=60"

REM ── 還原說明 ─────────────────────────────────────────────
if /i "%~1"=="restore" goto :restore

REM ── 日期（用 PowerShell 取，避免中文 Windows 的 %DATE% 格式問題）──
for /f %%i in ('powershell -NoProfile -Command "Get-Date -Format yyyy-MM-dd"') do set "TODAY=%%i"
for /f %%i in ('powershell -NoProfile -Command "(Get-Date).DayOfWeek.value__"') do set "DOW=%%i"
if not exist "%SNAPSHOT%" mkdir "%SNAPSHOT%"

echo. >> "%LOG%"
echo ============================================================ >> "%LOG%"
echo [%TODAY%] 開始備份 >> "%LOG%"

REM ── 1. 更新 mirror（每日）────────────────────────────────
if not exist "%MIRROR%" (
  echo [錯誤] 找不到 mirror：%MIRROR% >> "%LOG%"
  echo        第一次請先執行： >> "%LOG%"
  echo        git clone --mirror %REMOTE% "%MIRROR%" >> "%LOG%"
  goto :bundle
)

pushd "%MIRROR%"
echo [1/3] 更新 mirror ... >> "%LOG%"
REM HEAD 必須指向存在的分支，否則 bundle 還原會失敗
git symbolic-ref HEAD refs/heads/main >nul 2>&1 || git symbolic-ref HEAD refs/heads/master >nul 2>&1
REM 先確認係 bare + mirror，否則用錯方法會搞亂工作區
for /f %%b in ('git rev-parse --is-bare-repository 2^>nul') do set "ISBARE=%%b"
if /i not "!ISBARE!"=="true" (
  echo [警告] %MIRROR% 唔係 bare repo，跳過 mirror 更新 >> "%LOG%"
) else (
  REM 明寫 refspec：`git fetch` 冇 refspec 時只拿 HEAD，分支唔會更新
  git fetch --prune origin "+refs/heads/*:refs/heads/*" "+refs/tags/*:refs/tags/*" >> "%LOG%" 2>&1
  if errorlevel 1 (
    echo [警告] fetch 失敗（網絡或認證問題），本機舊資料仍然保留 >> "%LOG%"
  ) else (
    REM 連 PR 的 refs 一齊備（即使 PR 已關閉都留住）
    git fetch origin "+refs/pull/*/head:refs/pull/*/head" >> "%LOG%" 2>&1
    for /f %%c in ('git rev-list --all --count 2^>nul') do echo         commit 總數：%%c >> "%LOG%"
  )
)
popd

:bundle
REM ── 2. 每週單檔快照（週日）──────────────────────────────
if "%DOW%"=="0" (
  echo [2/3] 造 bundle 快照 ... >> "%LOG%"
  if exist "%MIRROR%" (
    git --git-dir="%MIRROR%" bundle create "%SNAPSHOT%\AvianDex-%TODAY%.bundle" --all >> "%LOG%" 2>&1
    if errorlevel 1 (
      echo [警告] bundle 失敗 >> "%LOG%"
    ) else (
      for %%f in ("%SNAPSHOT%\AvianDex-%TODAY%.bundle") do echo         bundle：%%~nxf ^(%%~zf bytes^) >> "%LOG%"
    )
  )
) else (
  echo [2/3] 今日唔係週日，跳過 bundle >> "%LOG%"
)

REM ── 3. 每週素材備份（週日）──────────────────────────────
if "%DOW%"=="0" (
  echo [3/3] 備份素材 cards\ reports\ ... >> "%LOG%"
  if exist "%WORKTREE%\cards" (
    robocopy "%WORKTREE%\cards" "%SNAPSHOT%\assets\cards" /MIR /R:1 /W:1 /NFL /NDL /NJH /NJS >> "%LOG%" 2>&1
  ) else (
    echo [提示] 找不到 %WORKTREE%\cards，跳過素材 >> "%LOG%"
  )
  if exist "%WORKTREE%\reports" (
    robocopy "%WORKTREE%\reports" "%SNAPSHOT%\assets\reports" /MIR /R:1 /W:1 /NFL /NDL /NJH /NJS >> "%LOG%" 2>&1
  )
) else (
  echo [3/3] 今日唔係週日，跳過素材 >> "%LOG%"
)

REM ── 清理太舊的 bundle ────────────────────────────────────
powershell -NoProfile -Command ^
  "Get-ChildItem '%SNAPSHOT%\*.bundle' -ErrorAction SilentlyContinue | Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-%KEEP_DAYS%) } | Remove-Item -Force" >> "%LOG%" 2>&1

echo [%TODAY%] 完成 >> "%LOG%"
echo 完成。詳情：%LOG%
endlocal
exit /b 0

:restore
echo.
echo ============================================================
echo  還原方法（三個情境）
echo ============================================================
echo.
echo 【A】GitHub 帳戶被封，想喺本機繼續工作
echo   1. git clone "%MIRROR%" D:\AvianDex-work
echo   2. cd /d D:\AvianDex-work
echo   3. git checkout arena/3be6342b-aviandex
echo   4. npm install
echo.
echo 【B】連 mirror 都壞了，只有 .bundle
echo   1. git clone "%SNAPSHOT%\AvianDex-YYYY-MM-DD.bundle" D:\AvianDex-restored
echo   2. cd /d D:\AvianDex-restored
echo   3. git remote set-url origin "%REMOTE%"
echo.
echo 【C】只想驗證備份係唔係真（建議每季做一次）
echo   1. git clone "%MIRROR%" %%TEMP%%\aviandex-verify
echo   2. cd /d %%TEMP%%\aviandex-verify ^&^& npm install ^&^& npm test
echo   3. rmdir /s /q %%TEMP%%\aviandex-verify
echo.
echo 【D】素材（插畫／報告）還原
echo   robocopy "%SNAPSHOT%\assets\cards" D:\AvianDex-work\cards /MIR
echo   robocopy "%SNAPSHOT%\assets\reports" D:\AvianDex-work\reports /MIR
echo.
echo 注意：cards\out 內的成品 AVIF 真正來源是 Cloudflare R2，
echo       本機備份只是副本；R2 才是對外服務的那一份。
echo ============================================================
endlocal
exit /b 0
