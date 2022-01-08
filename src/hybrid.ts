import node_rsa from 'node-rsa';
import { base64ToBytes, bytesToBase64 } from "byte-base64";
import crypto from 'crypto';
import * as AES from './aes.js';

export interface IncomingRequest {
    key: string,
    data: string,
    public_key?: string
}

export default class Hybrid {
    options: node_rsa.Options;
    rsa_inst: node_rsa;
    public_key: string;
    encoder: TextEncoder;
    decoder: TextDecoder;
    constructor() {
        this.options = { encryptionScheme: 'pkcs1' };
        this.rsa_inst = new node_rsa({ b: 512 });
        this.rsa_inst.setOptions(this.options);
        this.public_key = this.rsa_inst.exportKey('public');
        this.encoder = new TextEncoder();
        this.decoder = new TextDecoder();
    }
    decrypt(request: IncomingRequest, not_json?: boolean) {
        var aes_b64 = this.rsa_inst.decrypt(request.key).toString('utf-8');
        var aes_key = base64ToBytes(aes_b64);

        var text = AES.decrypt(request.data, aes_key);

        if (!not_json) {
            var json = JSON.parse(text);
            if (request.public_key) json.public_key = request.public_key;
            return json;
        } else {
            return text;
        }
    }
    encrypt(data: object, key: string) {
        var text = JSON.stringify(data);
        var aes_key = crypto.randomBytes(32);

        var encryptedb64 = AES.encrypt(text, aes_key);

        var aes_b64 = bytesToBase64(aes_key);

        var str = key;

        var temp_encrypt = new node_rsa(key, 'public');
        temp_encrypt.setOptions(this.options);
        var aes_fin = temp_encrypt.encrypt(aes_b64).toString('base64');

        return {
            key: aes_fin,
            data: encryptedb64
        }
    }
}