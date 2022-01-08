import node_rsa from 'node-rsa';
const rsa_inst = new node_rsa({ b: 512 });
rsa_inst.setOptions({ encryptionScheme: 'pkcs1' });
export const public_key = rsa_inst.exportKey('public');
export function decrypt(data) {
    return JSON.parse(rsa_inst.decrypt(data).toString('utf-8'));
}
export function encrypt(data, key) {
    var inst = new node_rsa();
    inst.importKey(key);
    return inst.encrypt(data);
}
