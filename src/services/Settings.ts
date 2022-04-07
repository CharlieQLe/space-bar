'use strict';

const ExtensionUtils = imports.misc.extensionUtils;

var getSettings = function getSettings() {
  return ExtensionUtils.getSettings('org.gnome.shell.extensions.workspaces-bar');
};
