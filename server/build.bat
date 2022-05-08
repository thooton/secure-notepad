@ECHO OFF

cmd /c .\_build.bat
mkdir ..\sbuild 2>nul
rmdir /S /Q ..\sbuild\win 
move _build\prod\rel\secure_notepad_server ..\sbuild\win