import * as alerty from './lib/alerty.min.js'

export function getId(id: string) {
    return document.getElementById(id);
}

export function setHidden(id: string, value: boolean) {
    var elem = getId(id);

    if (value) {
        elem.classList.add('hidden');
    } else {
        elem.classList.remove('hidden');
    }
}

export function postRequest(url, json, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(json));

    xhr.onload = function () {
        callback(this.responseText);
    };
}

export function getRequest(url, callback) {
    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) callback(xhr.responseText);
    };

    xhr.open("GET", url, true);
    xhr.send(null);
}

export function confirmAlert(text, onConfirm) {
    alerty.confirm(text.toString(), onConfirm);
}

export function promptAlert(prompt, onSubmit) {
    alerty.prompt(prompt.toString(), onSubmit);
}

export function infoAlert(text) {
    alerty.alert(text.toString());
}

export function currentDateString() {
    var currentDate = new Date();
    return currentDate.toISOString();
}

export function currentDateFormat() {
    return formatDate(new Date());
}

function pad2(n) {
    if (n < 10) {
        return '0' + n;
    } else {
        return '' + n;
    }
}

export function parseFormatDate(iso) {
    var parsed = new Date(iso);
    return formatDate(parsed);
}

export function formatDate(date) {
    return pad2(date.getHours()) + ':' + pad2(date.getMinutes()) + ' ' + pad2(date.getDate()) + '.' + pad2(date.getMonth() + 1) + '.' + date.getFullYear().toString().slice(-2);
}

export function randomString(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;

    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
}

export function getPWADisplayMode() {
    var isStandalone = window.matchMedia('(display-mode: standalone)').matches;

    if (document.referrer.startsWith('android-app://')) {
        return 'twa';
    // @ts-ignore
    } else if (navigator.standalone || isStandalone) {
        return 'standalone';
    }

    return 'browser';
}