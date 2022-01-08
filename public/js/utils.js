var voidurl = 'javascript:void(0);';

function postRequest(url, json, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(json));
    xhr.onload = function () {
        callback(this.responseText);
    }
}

function getRequest(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4)
            callback(xhr.responseText);
    }
    xhr.open("GET", url, true);
    xhr.send(null);
}

function getId(id) {
    return document.getElementById(id);
}

function setHidden(id, value) {
    var elem = getId(id);
    if (value) {
        elem.classList.add('hidden');
    } else {
        elem.classList.remove('hidden');
    }
}

function confirmAlert(text, onConfirm) {
    alerty.confirm(text.toString(), onConfirm);
}

function promptAlert(prompt, onSubmit) {
    alerty.prompt(prompt.toString(), onSubmit);
}

function infoAlert(text) {
    alerty.alert(text.toString());
}

function getFileName() {
    return 'Notes-' + currentDateString() + '.txt';
}

function currentDateString() {
    const currentDate = new Date();
    return currentDate.toISOString();
}

function currentDateFormat() {
    return formatDate(new Date());
}

function pad2(n) {
    if (n < 10) {
        return '0' + n;
    } else {
        return '' + n;
    }
}

function parseFormatDate(iso) {
    const parsed = new Date(iso);
    return formatDate(parsed);
}

function formatDate(date) {
    return pad2(date.getHours()) + ':' + pad2(date.getMinutes()) + ' ' + pad2(date.getDate()) + '.' + pad2(date.getMonth() + 1) + '.' + date.getFullYear().toString().slice(-2);
}

function randomString(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
}

function getPWADisplayMode() {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

    if (document.referrer.startsWith('android-app://')) {
        return 'twa';
    } else if (navigator.standalone || isStandalone) {
        return 'standalone';
    }

    return 'browser';
}

function enableDarkMode(darkMetaColor, metaThemeColor) {
    document.body.classList.add('dark');
    document.querySelector('.navbar').classList.remove('navbar-default');
    document.getElementById('light').classList.remove('hidden');
    document.getElementById('dark').classList.add('hidden');
    metaThemeColor.setAttribute('content', darkMetaColor);
    localStorage.setItem('mode', 'dark');
}

function enableLightMode(lightMetaColor, metaThemeColor) {
    document.body.classList.remove('dark');
    document.querySelector('.navbar').classList.add('navbar-default');
    document.getElementById('light').classList.add('hidden');
    document.getElementById('dark').classList.remove('hidden');
    metaThemeColor.setAttribute('content', lightMetaColor);
    localStorage.setItem('mode', 'light');
}

// From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
if (!Object.keys) {
    Object.keys = (function () {
        'use strict';
        var hasOwnProperty = Object.prototype.hasOwnProperty,
            hasDontEnumBug = !({ toString: null }).propertyIsEnumerable('toString'),
            dontEnums = [
                'toString',
                'toLocaleString',
                'valueOf',
                'hasOwnProperty',
                'isPrototypeOf',
                'propertyIsEnumerable',
                'constructor'
            ],
            dontEnumsLength = dontEnums.length;

        return function (obj) {
            if (typeof obj !== 'function' && (typeof obj !== 'object' || obj === null)) {
                throw new TypeError('Object.keys called on non-object');
            }

            var result = [], prop, i;

            for (prop in obj) {
                if (hasOwnProperty.call(obj, prop)) {
                    result.push(prop);
                }
            }

            if (hasDontEnumBug) {
                for (i = 0; i < dontEnumsLength; i++) {
                    if (hasOwnProperty.call(obj, dontEnums[i])) {
                        result.push(dontEnums[i]);
                    }
                }
            }
            return result;
        };
    }());
}

// From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf
if (!Array.prototype.indexOf)
  Array.prototype.indexOf = (function(Object, max, min) {
    "use strict"
    return function indexOf(member, fromIndex) {
      if (this === null || this === undefined)
        throw TypeError("Array.prototype.indexOf called on null or undefined")

      var that = Object(this), Len = that.length >>> 0, i = min(fromIndex | 0, Len)
      if (i < 0) i = max(0, Len + i)
      else if (i >= Len) return -1

      if (member === void 0) {        // undefined
        for (; i !== Len; ++i) if (that[i] === void 0 && i in that) return i
      } else if (member !== member) { // NaN
        return -1 // Since NaN !== NaN, it will never be found. Fast-path it.
      } else                          // all else
        for (; i !== Len; ++i) if (that[i] === member) return i

      return -1 // if the value was not found, then return -1
    }
  })(Object, Math.max, Math.min);