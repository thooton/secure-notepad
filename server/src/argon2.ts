import argon2 from 'argon2';
import crypto from 'crypto';

export interface Options {
    memory_use_mb: number,
    threads: number,
    passes: number
}
var options: argon2.Options & {raw: false, saltLength: number};

export function init(config: Options) {
    options = {
        type: argon2.argon2id,
        memoryCost: config.memory_use_mb * 1024,
        hashLength: 128,
        saltLength: 128,
        timeCost: config.passes,
        parallelism: config.threads,
        raw: false
    }
}

export async function hash(str: string, salt?: string, raw?: boolean, size?: number) {
    var tempOptions = options;
    if (salt) tempOptions.salt = Buffer.from(salt, 'base64');
    if (size) {
        tempOptions.hashLength = size;
        tempOptions.saltLength = size;
    }
    if (!raw) {
        return await argon2.hash(str, tempOptions);
    } else {
        return await argon2.hash(str, {...tempOptions, raw: true})
    }
}

export function salt(length: number = options.saltLength) {
    return crypto.randomBytes(length).toString('base64');
}

export async function verify(hashed_password: string, password: string) {
    return await argon2.verify(hashed_password, password);
}

export async function rehash(hashed_password: string, password: string) {
    if (argon2.needsRehash(hashed_password, options)) {
        return await hash(password);
    } else {
        return false;
    }
}