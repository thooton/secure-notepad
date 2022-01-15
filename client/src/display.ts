import { getId, setHidden } from "./utils";
import * as $ from 'jquery';

var darkMetaColor = '#0d1117';
var lightMetaColor = '#747474';
var metaThemeColor = getId('theme-color');

if (localStorage?.getItem('mode') && localStorage.getItem('mode') !== '') {
    if (localStorage.getItem('mode') === 'dark') {
        enableDarkMode(darkMetaColor, metaThemeColor);
    } else {
        enableLightMode(lightMetaColor, metaThemeColor);
    }
}

$('#mode').on('click', function () {
    document.body.classList.toggle('dark');
    var bodyClass = document.body.getAttribute('class');

    if (bodyClass === 'dark') {
        enableDarkMode(darkMetaColor, metaThemeColor);
    } else {
        enableLightMode(lightMetaColor, metaThemeColor);
    }

    localStorage?.setItem('isUserPreferredTheme', 'true');
});

// This changes the application's theme when 
// user toggles device's theme preference
window.matchMedia?.('(prefers-color-scheme: dark)').addEventListener?.('change', function (_ref) {
    var matches = _ref.matches;

    // To override device's theme preference
    // if user sets theme manually in the app
    if (localStorage.getItem('isUserPreferredTheme') === 'true') {
        return;
    }

    if (matches) {
        enableDarkMode(darkMetaColor, metaThemeColor);
    } else {
        enableLightMode(lightMetaColor, metaThemeColor);
    }
});

// This sets the application's theme based on
// the device's theme preference when it loads
if (localStorage?.getItem('isUserPreferredTheme') === 'false') {
    if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
        enableDarkMode(darkMetaColor, metaThemeColor);
    } else {
        enableLightMode(lightMetaColor, metaThemeColor);
    }
}

window.matchMedia?.('(display-mode: standalone)').addEventListener?.('change', function (_ref2) {
    var matches = _ref2.matches;

    if (matches) {
        setHidden('installApp', true);
    } else {
        setHidden('installApp', false);
    }
});

function enableDarkMode(darkMetaColor, metaThemeColor) {
    $(document.body).addClass('dark');
    $('.navbar').removeClass('navbar-default');
    $('#light').show();
    $('#dark').hide();
    metaThemeColor.setAttribute('content', darkMetaColor);
    localStorage?.setItem('mode', 'dark');
}

function enableLightMode(lightMetaColor, metaThemeColor) {
    $(document.body).removeClass('dark');
    $('.navbar').addClass('navbar-default');
    $('#light').hide();
    $('#dark').show();
    metaThemeColor.setAttribute('content', lightMetaColor);
    localStorage?.setItem('mode', 'light');
}