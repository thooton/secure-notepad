import argon2 from 'argon2';
import crypto from 'crypto';
var options;
export function init(config) {
    options = {
        type: argon2.argon2id,
        memoryCost: config.memory_use_mb * 1024,
        hashLength: 128,
        saltLength: 128,
        timeCost: config.passes,
        parallelism: config.threads,
        raw: false
    };
}
export async function hash(str, salt, raw, size) {
    var tempOptions = options;
    if (salt)
        tempOptions.salt = Buffer.from(salt, 'base64');
    if (size) {
        tempOptions.hashLength = size;
        tempOptions.saltLength = size;
    }
    if (!raw) {
        return await argon2.hash(str, tempOptions);
    }
    else {
        return await argon2.hash(str, { ...tempOptions, raw: true });
    }
}
export function salt(length = options.saltLength) {
    return crypto.randomBytes(length).toString('base64');
}
export async function verify(hashed_password, password) {
    return await argon2.verify(hashed_password, password);
}
export async function rehash(hashed_password, password) {
    if (argon2.needsRehash(hashed_password, options)) {
        return await hash(password);
    }
    else {
        return false;
    }
}
