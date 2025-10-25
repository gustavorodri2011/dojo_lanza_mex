@echo off
set fecha=%date:~6,4%-%date:~3,2%-%date:~0,2%
set /p tema="Ingresa el tema de la sesion: "
copy chat-history-*.json docs\chats\sessions\%fecha%-%tema%.json
echo Chat respaldado en: docs\chats\sessions\%fecha%-%tema%.json
pause