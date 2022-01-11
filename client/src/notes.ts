import { notes } from "./index";
import { setScreen } from "./screen";
import { hybrid_inst } from "./index";
import { user_name, user_password } from "./auth";
import Hybrid from "./hybrid";
var voidurl = 'javascript:void(0);';
import { confirmAlert, currentDateString, getId, infoAlert, parseFormatDate, postRequest, promptAlert, randomString } from "./utils";

var currentId: string;
var textArea = <HTMLTextAreaElement> getId('note');
var table = <HTMLTableElement> getId('list');
var saving = false;

export function updateNotes() {
    if (notes == {}) return;
    table.textContent = '';
    var ids = Object.keys(notes).sort(function (a, b) {
        return -1 * new Date(notes[a].date).getTime() + new Date(notes[b].date).getTime();
    });

    for (var i = 0; i < ids.length; i++) {
        var id = ids[i];
        var note = notes[id];
        var tr = table.insertRow(-1);
        var name = document.createElement('a');
        name.href = voidurl;
        name.textContent = note.name;
        name.addEventListener('click', function (noteId) {
            return function () {
                enterNote(noteId);
            };
        }(id));
        tr.insertCell(-1).appendChild(name);
        var date = tr.insertCell(-1);
        date.textContent = parseFormatDate(note.date);
        var rename = document.createElement('a');
        rename.href = voidurl;
        rename.textContent = 'Ren';
        rename.addEventListener('click', function (noteId, nameElement) {
            return function () {
                renameDialog(noteId, function (newName) {
                    nameElement.textContent = newName;
                });
            };
        }(id, name));
        tr.insertCell(-1).appendChild(rename);
    }
}

function enterNote(id: string) {
    textArea.value = notes[id].note;
    currentId = id;
    setScreen('note');
}

function renameDialog(id: string, callback: Function) {
    promptAlert('Enter new name', function (name: string) {
        callback(name.trim());
        notes[id].name = name;
    });
}

getId('backButton').addEventListener('click', function () {
    setScreen('list');
    saveNote(currentId);
    currentId = null;
});
getId('saveButton').addEventListener('click', function () {
    this.style.visibility = 'hidden';
    saveNote(currentId);
});
getId('clearNotes').addEventListener('click', function () {
    confirmAlert('!! Caution !!\nIrrevocably delete note?', function () {
        delete notes[currentId];
        updateNotes();
        saveNote();
        setScreen('list');
    });
});

function saveNote(id?: string, callback?: Function) {
    if (saving) return;
    saving = true;
    try {
        if (id) notes[id].note = textArea.value;
        var json = {
            'username': user_name,
            'password': user_password,
            'notes': notes
        };
        var encrypted = hybrid_inst.encrypt(json, Hybrid.NO_PUBLIC_KEY);
        postRequest('/save', encrypted, function (data) {
            if (callback) callback();
            saving = false;
            getId('saveButton').style.visibility = 'visible';
            try {
                var res = JSON.parse(data);

                if (res.error) {
                    throw new Error(res.error);
                }
            } catch (e) {
                infoAlert(e);
                console.log(e);
            }
        });
    } catch (e) {
        infoAlert(e);
        console.log(e);
    }
}

getId('newNote').addEventListener('click', function () {
    promptAlert('Enter note name', function (name) {
        name = name.trim();
        if (!name) return;
        var id = null;

        while (notes[id] || !id) {
            id = randomString(16);
        }

        notes[id] = {
            "name": name,
            "date": currentDateString(),
            "note": ""
        };
        updateNotes();
    });
});