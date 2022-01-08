import fs from 'fs';
import express from 'express';
import Hybrid, { IncomingRequest } from './hybrid.js';
import Database from './db-wrap.js';
import * as argon2 from './argon2.js';
import cookieParser from 'cookie-parser';
import path from 'path';
import url from 'url';
import rateLimit from 'express-rate-limit';
import * as AES from './aes.js';
import expressStaticGzip from 'express-static-gzip';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

export const config: {
    ip: string,
    port: number,
    argon2_options: argon2.Options
    require_secret_word: boolean,
    secret_word: string,
    ratelimiting: boolean,
    ratelimit_options: {
        windowMs: number,
        maxRequests: number
    }
} = JSON.parse(fs.readFileSync('./config.json').toString());
if (JSON.stringify(config).includes('unset')) {
    console.error('Settings must be configured in config.json.');
    process.exit();
}
argon2.init(config.argon2_options);

const hybrid_inst = new Hybrid();

const db = await Database({
    file: './data/main.db',
    name: 'main',
    schema: [
        'username TEXT NOT NULL PRIMARY KEY',
        'password TEXT NOT NULL',
        'notes TEXT',
        'note_salt TEXT'
    ]
});

const app = express();

if (config.ratelimiting) {
    const limiter = rateLimit({
        windowMs: config.ratelimit_options.windowMs,
        max: config.ratelimit_options.maxRequests,
        standardHeaders: false,
        legacyHeaders: false
    });
    app.use(limiter);
}

app.use(express.json());
app.use(cookieParser());

app.use(function (req, res, next) {
    if (req.cookies.secret_word == config.secret_word || req.path.trim() == '/manifest.json') {
        next();
    } else {
        res.sendFile(path.join(__dirname, '..', 'public', 'password.html'));
    }
});

app.use(express.static('public'));

app.get('/getkey', function (req, res) {
    res.json({
        'key': hybrid_inst.public_key
    });
});

app.post('/register', async function (req, res) {
    const data: {
        username: string,
        password: string
    } = hybrid_inst.decrypt(req.body);

    const [username, password] = [data.username.trim(), data.password.trim()];

    const existing_row = await db.get('SELECT username FROM main WHERE username = ?', username);
    if (existing_row) {
        res.json({ 'error': 'Username already exists' });
        return;
    } else {
        await db.run(
            'INSERT INTO main(username, password, notes, note_salt) VALUES (?, ?, ?, ?)',
            [username, await argon2.hash(password), null, argon2.salt()]
        );
        res.json({ 'success': true });
    }
});

async function authenticate(username: string, password: string, hash: string) {
    if (await argon2.verify(hash, password)) {
        var rehash = await argon2.rehash(hash, password);
        if (rehash) await db.run(
            'UPDATE main SET password = ? WHERE username = ?',
            [rehash, username]
        );
        return true;
    } else {
        return false;
    }
}

async function pwdToAes(password: string, salt: string) {
    return <Buffer> await argon2.hash(password, salt, true, 32);
}

app.post('/login', async function (req, res) {
    const data: {
        username: string,
        password: string,
        public_key: string
    } = hybrid_inst.decrypt(req.body);

    const [username, password, pubkey] = [data.username.trim(), data.password.trim(), data.public_key.trim()];

    const row: {
        password: string,
        notes: string | null,
        note_salt: string
    } | undefined = await db.get('SELECT password, notes, note_salt FROM main WHERE username = ?', username);
    if (row) {
        if (await authenticate(username, password, row.password)) {
            if (row.notes) {
                var aes_key = await pwdToAes(password, row.note_salt);
                var notes = AES.decrypt(row.notes, aes_key);
                res.json(hybrid_inst.encrypt({ 'success': true, 'notes': notes }, pubkey));
            } else {
                res.json({ 'success': true });
            }
        } else {
            res.json({ 'error': 'Incorrect password' });
        }
    } else {
        res.json({ 'error': 'Account not found' });
    }
});

app.post('/save', async function (req, res) {
    const data: {
        username: string,
        password: IncomingRequest,
        notes: object
    } = hybrid_inst.decrypt(req.body);

    const [username, password, notes] = [data.username, hybrid_inst.decrypt(data.password, true), data.notes];
    
    const row: {
        password: string,
        note_salt: string
    } | undefined = await db.get('SELECT password, note_salt FROM main WHERE username = ?', username);
    if (row) {
        if (await authenticate(username, password, row.password)) {
            var aes_key = await pwdToAes(password, row.note_salt);
            var notes_encrypted = AES.encrypt(JSON.stringify(notes), aes_key);
            await db.run(
                'UPDATE main SET notes = ? WHERE username = ?',
                [notes_encrypted, username]
            );
            res.json({ 'success': true });
        } else {
            res.json({ 'error': 'Could not save notes; incorrect authentication'});
        }
    } else {
        res.json({ 'error': 'Could not save notes: Account not found'});
    }
});

app.listen(config.port, config.ip, () => {
    console.log(`Listening at http://${config.ip}:${config.port}`);
});