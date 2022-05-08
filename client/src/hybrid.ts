import * as forge from 'node-forge';

export default function Hybrid(rsa_public) {
    if (!rsa_public) {
        throw new Error('Missing RSA public key');
    }
    this.enc_inst = forge.pki.publicKeyFromPem(rsa_public);
}
Hybrid.prototype.init = function(enhanced_security, callback) {
    var self = this;
    /*JSEncrypt.random.prototype.nextBytes = function(arr) {
        var len = arr.length;
        var rnd = forge.random.getBytesSync(len);
        for (var i = 0; i < len; i++) {
            arr[i] = rnd.charCodeAt(i);
        }
    }
    var jsenc_inst = new JSEncrypt({ default_key_size: 1024 });
    jsenc_inst.getKey(function() {
        self.dec_inst = forge.pki.privateKeyFromPem(jsenc_inst.getPrivateKey());
        self.public_key = forge.pki.publicKeyToPem(
            forge.pki.publicKeyFromPem(jsenc_inst.getPublicKey())
        );
        callback();
    });*/
    //console.log("starting generation");
    /*setTimeout(function() {
        var keyPair = forge.pki.rsa.generateKeyPair(512);
        setTimeout(function() {
            self.dec_inst = keyPair.privateKey;
            self.public_key = forge.pki.publicKeyToPem(keyPair.publicKey);
            callback();
            console.log("ended generation");
        }, 1);
    }, 1);*/

    // generate own RSA key
    if (enhanced_security) {
        forge.pki.rsa.generateKeyPair({
            bits: 4096,
            workers: 2
        }, finishKeyPair);
    // use dummy key (for compatibility with low powered computers)
    } else {
        finishKeyPair(null, {
            publicKey: forge.pki.publicKeyFromPem({"key":"-----BEGIN PUBLIC KEY-----\r\nMIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEA0UPg2t2JrEsHWRBFwkk1\r\nRH7yYQa5snroyFmm3vOvyRohSCr38SsHUMrgUBZw7nJQA661SnrdUxVpTVIMEAGp\r\naVH8z/5GTCjpphLGx/yeDGCTzhdiq5SobhxM5d2GCS1oFkxEFd7qD5ybTNYMvFrc\r\noPchZmC0m9Ekmp+pNYFgCWY7KxnBomvURjL/KgZ2pEzkHKss3TkcVBPOcKOVZx7f\r\n3EtsC2ELKB30SMlPrg0rHw75J7oWuV2373t3Dj18uhemMdVjQsx9ABDEAhhLTy//\r\ntZjZT2uKwKIiQvphFJuHV9XR7y9bvHEWURiAEztOydclm2s4LUOgE4boT0XyPZE2\r\nOczF5Lw9iJ7U5WsIy+QnrgmddJ7bU75/1JxDaSqNgGboKUicHj+Paj9cYNdV9ZZa\r\ntrIzHBJJb0m/piTQ0FuNYxHbOuMxrgUOUzrAGJpCkjF8cVo+wmtjciugRfsamJK+\r\nRILNNhStvEZXxxHdftjNHX9a0lX4QiZ67njS7FFkVimrzfeh0TDBy6WtUbtQu7y2\r\n2BMKsfV8nZgtF6Kli5DTmmE6PI3OOsFzKDP7LdsDQy2rS21Vq/Dt2/tCmOvKr/5A\r\njy965HNKBDWtEfEhrMNpsh1TxcNs9GKRkyo1tygxjXpiHnN8Q/lM0KVlmvpjd5q7\r\no5jcO+7hhS46207sx811yQMCAwEAAQ==\r\n-----END PUBLIC KEY-----\r\n"}.key),
            privateKey: forge.pki.privateKeyFromPem({"key":"-----BEGIN RSA PRIVATE KEY-----\r\n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\r\n-----END RSA PRIVATE KEY-----\r\n"}.key)
        });
    }

    function finishKeyPair(err, keyPair) {
        if (err) throw new Error("Error generating key pair " + err);
        self.dec_inst = keyPair.privateKey;
        self.public_key = forge.pki.publicKeyToPem(keyPair.publicKey);
        callback();
    }
}
Hybrid.prototype.encrypt = function(data, no_public) {
    var text = null;
    if (typeof data === 'object') {
        text = JSON.stringify(data);
    } else {
        text = data;
    }
    
    var aes_key = forge.random.getBytesSync(32);

    var encryptedb64 = encryptAesGcm(aes_key, text);

    var aes_b64 = forge.util.encode64(aes_key);
    var aes_enc = this.enc_inst.encrypt(aes_b64, "RSA-OAEP");
    var aes_fin = forge.util.encode64(aes_enc);

    var json: {
        key: string,
        data: string,
        public_key?: string
    } = {
        'key': aes_fin,
        'data': encryptedb64
    }
    if (!no_public) {
        json.public_key = this.public_key;
    }
    return json;
}
Hybrid.prototype.decrypt = function(response) {
    var aes_enc = forge.util.decode64(response.key);
    var aes_b64 = this.dec_inst.decrypt(aes_enc, "RSA-OAEP");
    var aes_key = forge.util.decode64(aes_b64);

    var encrypted = forge.util.decode64(response.data);
    var text = decryptAesGcm(aes_key, encrypted);
    var json = JSON.parse(text);
    return json;
}
Hybrid.NO_PUBLIC_KEY = true;

function encryptAesGcm(key: string, str: string) {
    var iv = forge.random.getBytesSync(16);
    var aad = "AES256GCM";

    var cipher = forge.cipher.createCipher('AES-GCM', key);
    cipher.start({
        iv: iv,
        additionalData: aad,
        tagLength: 16 * 8
    });
    cipher.update(forge.util.createBuffer(str));
    cipher.finish();
    var ct = cipher.output.getBytes();
    var tag = cipher.mode.tag.getBytes();

    return forge.util.encode64(
        aad.concat(
            iv, tag, ct
        )
    );
}

function decryptAesGcm(key: string, str: string) {
    var aad = str.slice(0, 9);
    var iv = str.slice(9, 25);
    var tag = str.slice(25, 41);
    var ct = str.slice(41);

    var decipher = forge.cipher.createDecipher('AES-GCM', key);
    decipher.start({
        iv: iv,
        additionalData: aad,
        tag: forge.util.createBuffer(tag)
    });
    decipher.update(forge.util.createBuffer(ct));
    decipher.finish();

    return decipher.output.getBytes();
}