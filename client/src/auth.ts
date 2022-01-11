import { setHybrid, setNotes, hybrid_inst } from "./index";
import Hybrid from "./hybrid";
import { setScreen } from "./screen";
import { updateNotes } from "./notes";
import { getId, getRequest, postRequest } from "./utils";

var p_inp: HTMLFormElement = document.querySelector('input[name=psw]');
var cp_inp: HTMLFormElement = document.querySelector('input[name=cnf]');
var lg_btn = <HTMLFormElement> getId('lg_btn');
var rg_btn = <HTMLFormElement> getId('rg_btn');

var loginPressed = true;
export var user_name: string;
export var user_password: { key: string, data: string };

getId('pswfield').addEventListener('change', function () {
    loginInputChange();
});

getId('cnffield').addEventListener('change', function () {
    loginInputChange();
});

lg_btn.addEventListener('click', function () {
    loginInputChange('bypass');
    loginPressed = true;
});

rg_btn.addEventListener('click', function () {
    loginPressed = false;
});

function loginInputChange(bypass?) {
    if (cp_inp.value === p_inp.value || bypass) {
        cp_inp.setCustomValidity('');
    } else {
        cp_inp.setCustomValidity('Passwords do not match');
    }
}

function setLoginButtons(enabled) {
    lg_btn.disabled = !enabled;
    rg_btn.disabled = !enabled;
}

getId('login').addEventListener('submit', function (e) {
    if (e.preventDefault) e.preventDefault();
    if (e.stopPropagation) e.stopPropagation();
    if (e.stopImmediatePropagation) e.stopImmediatePropagation();

    function handle(err: Error) {
        getId('error').textContent = err.toString();
        setLoginButtons(true);
        console.log(err);
    }

    setLoginButtons(false);
    var formData = new FormData(<HTMLFormElement> e.target);
    var json = {
        username: formData.get('uname'),
        password: formData.get('psw')
    };
    getRequest('/getkey', function (key) {
        try {
            var local_finish = function local_finish() {
                if (finalResponse.success) {
                    try {
                        setNotes(JSON.parse(finalResponse.notes) || {});
                    } catch (err) {}

                    updateNotes();
                    setScreen('list');
                } else if (finalResponse.error) {
                    throw new Error(finalResponse.error);
                } else {
                    throw new Error('Unsuccessful request: ' + JSON.stringify(finalResponse));
                }
            };

            setHybrid(new Hybrid(JSON.parse(key)["key"]));
            user_name = json.username.toString();
            user_password = hybrid_inst.encrypt(json.password, Hybrid.NO_PUBLIC_KEY);
            var finalResponse;

            if (loginPressed) {
                var encrypted = hybrid_inst.encrypt(json);
                postRequest('/login', encrypted, function (data) {
                    try {
                        finalResponse = JSON.parse(data);
                        if (finalResponse.key) finalResponse = hybrid_inst.decrypt(finalResponse);
                        local_finish();
                    } catch (err) {
                        handle(err);
                        console.log(err);
                    }
                });
            } else {
                var encrypted = hybrid_inst.encrypt(json, Hybrid.NO_PUBLIC_KEY);
                postRequest('/register', encrypted, function (data) {
                    try {
                        finalResponse = JSON.parse(data);
                        local_finish();
                    } catch (err) {
                        handle(err);
                        console.log(err);
                    }
                });
            }
        } catch (err) {
            handle(err);
            console.log(err);
        }
    });
});