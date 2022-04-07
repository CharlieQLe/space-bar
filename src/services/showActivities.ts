'use strict';

const Main = imports.ui.main;

var showActivities = (show) => {
    const activities_button = Main.panel.statusArea['activities'];
    if (activities_button) {
      if (show && !Main.sessionMode.isLocked) {
        activities_button.container.show();
      } else {
        activities_button.container.hide();
      }
    }
}