"use strict";

(function () {
  "use strict";

  var darkMetaColor = '#0d1117';
  var lightMetaColor = '#747474';
  var metaThemeColor = getId('theme-color');
  var p_inp = document.querySelector('input[name=psw]');
  var cp_inp = document.querySelector('input[name=cnf]');
  var loginPressed = true;
  var user_name = null;
  var user_password = null;
  var hybrid_inst = null;
  var notes = null;
  var currentId = null;

  if (localStorage && localStorage.getItem('mode') && localStorage.getItem('mode') !== '') {
    if (localStorage.getItem('mode') === 'dark') {
      enableDarkMode(darkMetaColor, metaThemeColor);
    } else {
      enableLightMode(lightMetaColor, metaThemeColor);
    }
  }

  getId('mode').addEventListener('click', function () {
    document.body.classList.toggle('dark');
    var bodyClass = document.body.getAttribute('class');

    if (bodyClass === 'dark') {
      enableDarkMode(darkMetaColor, metaThemeColor);
    } else {
      enableLightMode(lightMetaColor, metaThemeColor);
    }

    localStorage.setItem('isUserPreferredTheme', 'true');
  }); // This changes the application's theme when 
  // user toggles device's theme preference

  if (window.matchMedia) {
    var matched = window.matchMedia('(prefers-color-scheme: dark)');
    if (matched) matched.addEventListener('change', function (_ref) {
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
  } // This sets the application's theme based on
  // the device's theme preference when it loads


  if (localStorage && localStorage.getItem('isUserPreferredTheme') === 'false') {
    var matched = window.matchMedia('(prefers-color-scheme: dark)');

    if (matched.matches) {
      enableDarkMode(darkMetaColor, metaThemeColor);
    } else {
      enableLightMode(lightMetaColor, metaThemeColor);
    }
  }

  if (window.matchMedia) {
    var matched = window.matchMedia('(display-mode: standalone)');
    if (matched) matched.addEventListener('change', function (_ref2) {
      var matches = _ref2.matches;

      if (matches) {
        getId('installApp').hide();
      } else {
        getId('installApp').show();
      }
    });
  }

  getId('pswfield').addEventListener('change', function () {
    loginInputChange();
  });
  getId('cnffield').addEventListener('change', function () {
    loginInputChange();
  });
  getId('lg_btn').addEventListener('click', function () {
    loginInputChange('bypass');
    loginPressed = true;
  });
  getId('rg_btn').addEventListener('click', function () {
    loginPressed = false;
  });

  function loginInputChange(bypass) {
    if (cp_inp.value === p_inp.value || bypass) {
      cp_inp.setCustomValidity('');
    } else {
      cp_inp.setCustomValidity('Passwords do not match');
    }
  }

  function setLoginButtons(enabled) {
    getId('lg_btn').disabled = !enabled;
    getId('rg_btn').disabled = !enabled;
  }

  function showIcons(icons) {
    var all = ['clearNotes', 'newNote', 'clearNotes', 'backButton', 'saveButton'];

    for (var i = 0; i < all.length; i++) {
      var icon = all[i];

      if (icons.indexOf(icon) > -1) {
        setHidden(icon, false);
      } else {
        setHidden(icon, true);
      }
    }
  }

  function setScreen(screen) {
    var screens = ['login', 'list', 'note'];

    for (var i = 0; i < screens.length; i++) {
      setHidden(screens[i], true);
    }

    if (screen == 'list') {
      showIcons(['newNote', 'saveButton']);
    } else if (screen == 'note') {
      showIcons(['backButton', 'clearNotes', 'saveButton']);
    }

    setHidden(screen, false);
  }

  function updateNotes() {
    if (notes == {}) return;
    var table = getId('list');
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

  function enterNote(id) {
    getId('note').value = notes[id].note;
    currentId = id;
    setScreen('note');
  }

  function renameDialog(id, callback) {
    promptAlert('Enter new name', function (name) {
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
    var self = this;
    self.style.visibility = 'hidden';
    saveNote(currentId, function () {
      self.style.visibility = 'visible';
    });
  });
  getId('clearNotes').addEventListener('click', function () {
    confirmAlert('!! Caution !!\nIrrevocably delete note?', function () {
      delete notes[currentId];
      updateNotes();
      saveNote();
      setScreen('list');
    });
  });

  function saveNote(id, callback) {
    try {
      if (id) notes[id].note = getId('note').value;
      var json = {
        'username': user_name,
        'password': user_password,
        'notes': notes
      };
      var encrypted = hybrid_inst.encrypt(json, Hybrid.NO_PUBLIC_KEY);
      postRequest('/save', encrypted, function (data) {
        if (callback) callback();

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
  getId('login').addEventListener('submit', function (e) {
    if (e.preventDefault) e.preventDefault();
    if (e.stopPropagation) e.stopPropagation();
    if (e.stopImmediatePropagation) e.stopImmediatePropagation();

    function handle(e) {
      getId('error').textContent = e;
      setLoginButtons(true);
      console.log(e);
    }

    setLoginButtons(false);
    var formData = new FormData(e.target);
    var json = {
      username: formData.get('uname'),
      password: formData.get('psw')
    };
    getRequest('/getkey', function (key) {
      try {
        var local_finish = function local_finish() {
          if (finalResponse.success) {
            notes = {};

            try {
              notes = JSON.parse(finalResponse.notes) || {};
            } catch (e) {}

            updateNotes();
            setScreen('list');
          } else if (finalResponse.error) {
            throw new Error(finalResponse.error);
          } else {
            throw new Error('Unsuccessful request:', JSON.stringify(finalResponse));
          }
        };

        hybrid_inst = new Hybrid(JSON.parse(key)["key"]);
        user_name = json.username;
        user_password = hybrid_inst.encrypt(json.password, Hybrid.NO_PUBLIC_KEY);
        var finalResponse;

        if (loginPressed) {
          var encrypted = hybrid_inst.encrypt(json);
          postRequest('/login', encrypted, function (data) {
            try {
              finalResponse = JSON.parse(data);
              if (finalResponse.key) finalResponse = hybrid_inst.decrypt(finalResponse);
              local_finish();
            } catch (e) {
              handle(e);
              console.log(e);
            }
          });
        } else {
          var encrypted = hybrid_inst.encrypt(json, Hybrid.NO_PUBLIC_KEY);
          postRequest('/register', encrypted, function (data) {
            try {
              finalResponse = JSON.parse(data);
              local_finish();
            } catch (e) {
              handle(e);
              console.log(e);
            }
          });
        }
      } catch (e) {
        handle(e);
        console.log(e);
      }
    });
  });
})();