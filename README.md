secure-notepad
===
This is a self-hosted notepad application that focuses on security. It allows notes to be written by accessing a webpage, and stored encrypted on the server.

It is forked from AmitMerchant's [offline-capable minimalist notepad](https://github.com/amitmerchant1990/notepad).

## Screenshots

![Login](ss2.png?raw=true)

![Home screen](ss1.png?raw=true)

![Editing a note](ss3.png?raw=true)

## Installation

`git clone https://github.com/thooton/secure-notepad`

`cd secure-notepad/sbuild`

`chmod -R +x .`

## Configuration

The configuration files are located in `/sbuild/(platform)/lib/secure_notepad_server-0.1.0/priv/`. (Sorry)

The settings for the Argon2id hashing function, as set in config.json, must be determined based on individual hardware requirements. 

A helper program, `/argon2id_calibration` can be used to recommend the settings for Argon2id. It loosely follows the guidelines in the [argon2 specifications](https://www.password-hashing.net/argon2-specs.pdf) under 'Recommended parameters':
- It asks the user for the number of CPU cores, amount of memory, and time that they wish to dedicate to each Argon2id call.
- It sets the number of threads used by each call to twice the number of CPU cores the user dedicated (According to [some](https://www.twelve21.io/how-to-choose-the-right-parameters-for-argon2/) [websites](https://www.ory.sh/choose-recommended-argon2-parameters-password-hashing/), this seems to be a good general guideline).
- It will begin at two passes and slowly work upwards until it reaches the maximum number of passes so that the hash runtime does not exceed the time the user wished to spend. (If two passes exceeds, it will ask the user to allocate less memory).

!! Currently, once the hashing function settings are set, they cannot be changed without breaking user saving of notes.

## Execution

When running the server, the working directory must be `/sbuild`. Run `./(platform)/bin/secure_notepad_server(.bat) start` to start. Run `./(platform)/bin/secure_notepad_server(.bat) stop` to stop.

The HTTP server listens at port 49430.

Here is a sample systemd configuration:
```
[Unit] 
Description=secure-notepad 
After=network.target 
 
[Service]
Type=simple
ExecStart=bash linux/bin/secure_notepad_server start 
ExecStop=bash linux/bin/secure_notepad_server stop 
Restart=always 
RestartSec=10
User=root
Group=root 
WorkingDirectory=/root/secure-notepad/sbuild 
 
[Install]
WantedBy=multi-user.target
```

## Security

When the user sends their notes to the server for storage, they also send their password. The server hashes the password with Argon2id (via [node-argon2](https://github.com/ranisalt/node-argon2)), and utilizes it as an AES-256 encryption key for the user's notepad data, which is stored in its database.

In addition, if the option 'Enhanced security' is selected on the login page, the client and the server will, when sending sensitive data, communicate using a hybrid RSA and AES encryption system (as described in [this StackOverflow answer](https://stackoverflow.com/a/5868456/6917530)) in order to minimize the risk of sensitive data being stored in plain text e.g. in web server logs, and to provide a rudimentary protection against request logging by malicious extensions.

For RSA and AES, on the client-side, [forge](https://github.com/digitalbazaar/forge) is used, while on the server-side, [apoc](https://github.com/coderdan/apoc) is used. RSA keys are 4096-bit, AES is AES-GCM.

Although the client stores the user password as a Javascript variable, it is stored in its encrypted form, and so if extracted cannot be used to gain access to other applications or websites.

## Development

/client houses the files for the frontend JavaScript, exported to /public/js/bundle.js.

- `cd client`

- `npm install -D`

- Now you can run `npm run build` in order to create the bundle.

/server holds the files for the web server itself.

- `cd server`

- `mix deps.get`

- `iex -S mix` runs the server, and `.\build.bat` or `./build.sh` should create the release files.

## License

amitmerchant's work is licensed under MIT; any modifications made in this repository are licensed under CC BY-NC.
