"use strict";

function Hybrid(rsa_public) {
    if (!rsa_public) {
        throw new Error('Missing RSA public key');
    }
    var options = { default_key_size: 512 };
    this.enc_inst = new JSEncrypt(options);
    this.enc_inst.setPublicKey(rsa_public);

    this.encoder = new TextEncoder();
    this.decoder = new TextDecoder();

    this.dec_inst = new JSEncrypt(options);
    this.public_key = this.dec_inst.getPublicKey();
}
Hybrid.prototype.encrypt = function(data, no_public) {
    var text = null;
    if (_typeof(data) === 'object') {
        text = JSON.stringify(data);
    } else {
        text = data;
    }
    var aes_key = new Uint8Array(32);
    JSEncrypt.random.prototype.nextBytes(aes_key);

    var textBytes = this.encoder.encode(text);
    var aesCtr = new aesjs.ModeOfOperation.ctr(aes_key);
    var encryptedBytes = aesCtr.encrypt(textBytes);
    var encryptedb64 = bytesToBase64(encryptedBytes);
    
    var aes_b64 = bytesToBase64(aes_key);
    var aes_fin = this.enc_inst.encrypt(aes_b64);

    var json = {
        'key': aes_fin,
        'data': encryptedb64

    }
    if (!no_public) {
        json.public_key = this.public_key;
    }
    return json;
};
Hybrid.prototype.decrypt = function(response) {
    var aes_b64 = this.dec_inst.decrypt(response.key);
    var aes_key = base64ToBytes(aes_b64);

    var encryptedBytes = base64ToBytes(response.data);
    var aesCtr = new aesjs.ModeOfOperation.ctr(aes_key);
    var textBytes = aesCtr.decrypt(encryptedBytes);

    var text = this.decoder.decode(textBytes);
    var json = JSON.parse(text);
    return json;
};
Hybrid.NO_PUBLIC_KEY = true;