const ExtensionUtils = imports.misc.extensionUtils;

export class Settings {
    private static instance: Settings;
    static getInstance(): Settings {
        if (!Settings.instance) {
            Settings.instance = new Settings();
        }
        return Settings.instance;
    }

    readonly extensionSettings = ExtensionUtils.getSettings(
        'org.gnome.shell.extensions.workspaces-bar',
    );
}
