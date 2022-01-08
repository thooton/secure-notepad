import aesjs from 'aes-js';
import { base64ToBytes, bytesToBase64 } from "byte-base64";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export function encrypt(text: string, key: Uint8Array | Buffer) {
    var textBytes = encoder.encode(text);
    var ctr = new aesjs.ModeOfOperation.ctr(key);
    var encryptedBytes = ctr.encrypt(textBytes);
    var encryptedb64 = bytesToBase64(encryptedBytes);
    return encryptedb64;
}

export function decrypt(base64: string, key: Uint8Array | Buffer) {
    var encryptedBytes = base64ToBytes(base64);
    var ctr = new aesjs.ModeOfOperation.ctr(key);
    var textBytes = ctr.decrypt(encryptedBytes);
    var text = decoder.decode(textBytes);
    return text;
}