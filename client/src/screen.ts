import { showIcons } from './icons';
import { setHidden } from './utils';

export function setScreen(screen) {
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