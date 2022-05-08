import { setHybrid, setNotes, hybrid_inst } from "./index";
import Hybrid from "./hybrid";
import { setScreen } from "./screen";
import { updateNotes } from "./notes";
import { getId, getRequest, postRequest } from "./utils";
import * as $ from 'jquery';

var p_inp = <HTMLFormElement> $('input[name=psw]').get(0);
var cp_inp = <HTMLFormElement> $('input[name=cnf]').get(0);
var lg_btn = <JQuery<HTMLFormElement>> $('#lg_btn');
var rg_btn = <JQuery<HTMLFormElement>> $('#rg_btn');


var loginPressed = true;
export var user_name: string;
export var user_password: { key: string, data: string };

$('#pswfield, #cnffield').on('change', function() {
    loginInputChange();
});

lg_btn.on('click', () => {
    loginInputChange('bypass');
    loginPressed = true;
});

rg_btn.on('click', function () {
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
    lg_btn.get(0).disabled = !enabled;
    rg_btn.get(0).disabled = !enabled;
}

$('#login').on('submit', function (e) {
    e.preventDefault?.(); e.stopPropagation?.(); e.stopImmediatePropagation?.();

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
    getRequest('/getkey', function (key: string) {
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

            var theHybrid = new Hybrid(JSON.parse(key)["key"]);
            setHybrid(theHybrid);
            var finalResponse;
            theHybrid.init((<HTMLInputElement> document.getElementById("enhanced_security")).checked, () => {
                try {
                    user_name = json.username.toString();
                    user_password = hybrid_inst.encrypt(json.password, Hybrid.NO_PUBLIC_KEY);

                    if (loginPressed) {
                        var encrypted = hybrid_inst.encrypt(json);
                        postRequest('/login', encrypted, function (data) {
                            try {
                                finalResponse = JSON.parse(data);
                                if (finalResponse.key) finalResponse = hybrid_inst.decrypt(finalResponse);
                                local_finish();
                            } catch (err) {
                                handle(err);
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
                            }
                        });
                    }
                } catch (err) {
                    handle(err);
                }
            }); 
        } catch (err) {
            handle(err);
        }
    });
});