MIX_ENV=prod mix release
rm -rf ../sbuild/linux
mv _build/prod/rel/secure_notepad_server ../sbuild/linux