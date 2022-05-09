import * as forge from 'node-forge';

export default function Hybrid(rsa_public) {
    if (!rsa_public) {
        throw new Error('Missing RSA public key');
    }
    this.enc_inst = forge.pki.publicKeyFromPem(rsa_public);
}
Hybrid.prototype.init = function(enhanced_security, callback) {
    var self = this;
    if (enhanced_security) {
        forge.pki.rsa.generateKeyPair({
            bits: 4096,
            workers: 2
        }, function (err, keyPair) {
            if (err) throw new Error("Error generating key pair " + err);
            self.dec_inst = keyPair.privateKey;
            self.public_key = forge.pki.publicKeyToPem(keyPair.publicKey);
            callback();
        });
    }
    self.enhanced_security = enhanced_security ? true : false;
}
interface EncryptedResponse {
    key: string,
    data: string,
    enhanced_security: boolean,
    public_key?: string
}
Hybrid.prototype.encrypt = function(data, no_public) {
    var json: EncryptedResponse;
    if (this.enhanced_security) {
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
    
        json = {
            'key': aes_fin,
            'data': encryptedb64,
            'enhanced_security': true
        }
    } else {
        json = {
            key: null,
            data,
            enhanced_security: false
        }
    }
    if (!no_public) {
        json.public_key = this.public_key;
    }
    return json;
}
Hybrid.prototype.decrypt = function(response) {
    if (this.enhanced_security) {
        var aes_enc = forge.util.decode64(response.key);
        var aes_b64 = this.dec_inst.decrypt(aes_enc, "RSA-OAEP");
        var aes_key = forge.util.decode64(aes_b64);
    
        var encrypted = forge.util.decode64(response.data);
        var text = decryptAesGcm(aes_key, encrypted);
        var json = JSON.parse(text);
        return json;
    } else {
        return response;
    }
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