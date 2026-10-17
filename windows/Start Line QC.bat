@echo off
rem Opens Line QC Camera in its own Chrome window, set up for an unattended machine PC.
rem The extra settings stop Chrome from slowing the page down when another
rem program (like Encore) is in front of it, and let the alarm sound play
rem without someone clicking first.
rem
rem To start Line QC automatically when the PC turns on:
rem   press Windows+R, type  shell:startup  and press Enter,
rem   then copy this file into the folder that opens.

set URL=https://gwpg-line-qc.netlify.app
set PROFILE=%LOCALAPPDATA%\LineQC-Chrome

set CHROME=%ProgramFiles%\Google\Chrome\Application\chrome.exe
if not exist "%CHROME%" set CHROME=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe
if not exist "%CHROME%" set CHROME=%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe
if not exist "%CHROME%" (
  echo Google Chrome was not found on this PC. Install Chrome, then run this again.
  pause
  exit /b 1
)

start "" "%CHROME%" --app=%URL% --user-data-dir="%PROFILE%" --start-maximized ^
  --disable-background-timer-throttling ^
  --disable-backgrounding-occluded-windows ^
  --disable-renderer-backgrounding ^
  --autoplay-policy=no-user-gesture-required
