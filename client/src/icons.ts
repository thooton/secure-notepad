import { setHidden } from "./utils";

export function showIcons(icons) {
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

