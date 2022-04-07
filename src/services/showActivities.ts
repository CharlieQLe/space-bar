'use strict';

const Main = imports.ui.main;

export function showActivities(show) {
    const activities_button = Main.panel.statusArea['activities'];
    if (activities_button) {
        if (show && !Main.sessionMode.isLocked) {
            activities_button.container.show();
        } else {
            activities_button.container.hide();
        }
    }
}
