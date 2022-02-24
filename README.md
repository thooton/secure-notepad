secure-notepad
===
This is a self-hosted notepad application that focuses on security. It allows notes to be written by accessing a webpage, and stored encrypted on the server.

It is forked from AmitMerchant's [offline-capable minimalist notepad](https://github.com/amitmerchant1990/notepad).

## Screenshots

![Login](ss2.png?raw=true)

![Home screen](ss1.png?raw=true)

![Editing a note](ss3.png?raw=true)

## Installation

Has not been tested on any version of Node other than v16.4.2.

`git clone https://github.com/thooton/secure-notepad`

`cd secure-notepad/server`

`npm install`

The settings for the Argon2id hashing function, as set in /config.json, must be determined based on individual hardware requirements. 

A helper program, `argon2id_calibration.js`, can be run with `node` to recommend the settings for Argon2id. It loosely follows the guidelines in the [argon2 specifications](https://www.password-hashing.net/argon2-specs.pdf) under 'Recommended parameters':
- It asks the user for the number of CPU cores, amount of memory, and time that they wish to dedicate to each Argon2id call.
- It sets the number of threads used by each call to twice the number of CPU cores the user dedicated (According to [some](https://www.twelve21.io/how-to-choose-the-right-parameters-for-argon2/) [websites](https://www.ory.sh/choose-recommended-argon2-parameters-password-hashing/), this seems to be a good general guideline).
- It will begin at two passes (the minimum number allowed by the [node-argon2](https://github.com/ranisalt/node-argon2) library) and slowly work upwards until it reaches the maximum number of passes so that the hash runtime does not exceed the time the user wished to spend. (If two passes exceeds, it will ask the user to allocate more memory).

Note that although the Argon2id hashing function settings can be changed in future, the server cannot update passwords with the new settings at will. Instead, the server must wait until a user signs into their account. After verifying the hash with the previous settings (necessitating the same amount of computational work that was used to create it), the server will re-hash the password with the new settings.

After argon2 configuration is finished, you can `cd server` and `node dist/index.js` and start (and add this to your systemd config, etc. as well, although keep in mind that the working directory must be the `server` subfolder.)

Here is a sample systemd configuration:
```
[Unit]
Description=secure-notepad
After=network.target

[Service]
ExecStart=/usr/bin/node dist/index.js
Restart=always
RestartSec=10 #wait 10sec before restart
User=root
Group=root
WorkingDirectory=/root/secure-notepad/server

[Install]
WantedBy=multi-user.target
```

## Security details

When the user sends their notes to the server for storage, they also send their password. The server hashes the password with Argon2id (via [node-argon2](https://github.com/ranisalt/node-argon2)), and utilizes it as an AES-256 encryption key for the user's notepad data, which is stored in its database.

In addition, the client and the server will, when sending sensitive data, communicate using a hybrid RSA and AES encryption system (as described in [this StackOverflow answer](https://stackoverflow.com/a/5868456/6917530)) in order to minimize the risk of sensitive data being stored in plain text e.g. in web server logs, and to provide a rudimentary protection against request logging by malicious extensions.

For RSA, on the client side, [jsencrypt](https://github.com/travist/jsencrypt) is used, although with [a couple compatibility modifications](https://github.com/thooton/jsencrypt/commits/new_changes), while [node-rsa](https://github.com/rzcoder/node-rsa) is used server-side. The security of jsencrypt's RNG is described in [this pull request](https://github.com/travist/jsencrypt/pull/6). The encryption scheme used is PKCS1.

For AES, [aes-js](https://github.com/ricmoo/aes-js) is used on both the client and server side. The mode of operation is CTR. 256-bit keys are used, specific to each request, and on the client side are generated using the jsencrypt RNG.

As an aside, although the client stores the user password as a Javascript variable, it is stored in its encrypted form, and so if extracted cannot be used to gain access to other applications or websites.

## Development

/client houses the files for the frontend JavaScript, exported to /public/js/bundle.js.

- `cd client`

- `npm install -D`

- Now you can run `npm run build` in order to create the bundle.

/server holds the files for the web server itself.

- `cd server`

- `npm install -D`

- To build run `npm run build`; for a rebuild every time a file is updated run `npm run dev`.

## Notes
If you are getting inexplicable errors while logging in or registering, without any messages in the console, you may have assigned more memory to the Argon2 hashing function than it can allocate.

`SyntaxError: Unexpected token T` may indicate a misconfiguration of the rate-limiting parameters.

## License

amitmerchant's work is licensed under MIT; any modifications made in this repository are licensed under CC BY-NC.
