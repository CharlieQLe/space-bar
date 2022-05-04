const ExtensionUtils = imports.misc.extensionUtils;
import { Gio } from 'imports/gi';

export class Settings {
    private static _instance: Settings | null;
    static init() {
        Settings._instance = new Settings();
        Settings._instance.init();
    }
    static destroy() {
        Settings._instance?.destroy();
        Settings._instance = null;
    }
    static getInstance(): Settings {
        return Settings._instance as Settings;
    }

    readonly state = ExtensionUtils.getSettings('org.gnome.shell.extensions.workspaces-bar.state');
    readonly behaviorSettings = ExtensionUtils.getSettings(
        'org.gnome.shell.extensions.workspaces-bar.behavior',
    );
    readonly shortcutsSettings = ExtensionUtils.getSettings(
        'org.gnome.shell.extensions.workspaces-bar.shortcuts',
    );
    readonly mutterSettings = new Gio.Settings({ schema: 'org.gnome.mutter' });
    readonly wmPreferencesSettings = new Gio.Settings({
        schema: 'org.gnome.desktop.wm.preferences',
    });

    readonly workspaceNamesMap = SettingsSubject.createJsonObjectSubject<{
        [windowName: string]: string[];
    }>(this.state, 'workspace-names-map');
    readonly dynamicWorkspaces = SettingsSubject.createBooleanSubject(
        this.mutterSettings,
        'dynamic-workspaces',
    );
    readonly showEmptyWorkspaces = SettingsSubject.createBooleanSubject(
        this.behaviorSettings,
        'show-empty-workspaces',
    );
    readonly smartWorkspaceNames = SettingsSubject.createBooleanSubject(
        this.behaviorSettings,
        'smart-workspace-names',
    );
    readonly workspaceNames = SettingsSubject.createStringArraySubject(
        this.wmPreferencesSettings,
        'workspace-names',
    );

    private init() {
        SettingsSubject.initAll();
    }

    private destroy() {
        SettingsSubject.destroyAll();
    }
}

class SettingsSubject<T> {
    private static _subjects: SettingsSubject<any>[] = [];
    static createBooleanSubject(settings: Gio.Settings, name: string): SettingsSubject<boolean> {
        return new SettingsSubject<boolean>(settings, name, 'boolean');
    }
    static createStringArraySubject(
        settings: Gio.Settings,
        name: string,
    ): SettingsSubject<string[]> {
        return new SettingsSubject<string[]>(settings, name, 'string-array');
    }
    static createJsonObjectSubject<T>(settings: Gio.Settings, name: string): SettingsSubject<T> {
        return new SettingsSubject<T>(settings, name, 'json-object');
    }
    static initAll() {
        for (const subject of SettingsSubject._subjects) {
            subject._init();
        }
    }
    static destroyAll() {
        for (const subject of SettingsSubject._subjects) {
            subject._destroy();
        }
        SettingsSubject._subjects = [];
    }

    get value() {
        return this._value;
    }
    set value(value: T) {
        this._setValue(value);
    }

    private _value!: T;
    private _subscribers: ((value: T) => void)[] = [];
    private _getValue!: () => T;
    private _setValue!: (value: T) => void;
    private _disconnect!: () => void;

    private constructor(
        private readonly _settings: Gio.Settings,
        private readonly _name: string,
        private readonly _type: 'boolean' | 'string-array' | 'json-object',
    ) {
        SettingsSubject._subjects.push(this);
    }

    subscribe(subscriber: (value: T) => void, { emitCurrentValue = false } = {}) {
        this._subscribers.push(subscriber);
        if (emitCurrentValue) {
            subscriber(this._value);
        }
    }

    private _init(): void {
        this._getValue = () => {
            switch (this._type) {
                case 'boolean':
                    return this._settings.get_boolean(this._name) as unknown as T;
                case 'string-array':
                    return this._settings.get_strv(this._name) as unknown as T;
                case 'json-object':
                    return JSON.parse(this._settings.get_string(this._name)) as unknown as T;
                default:
                    throw new Error('unknown type ' + this._type);
            }
        };
        this._setValue = (value: T) => {
            switch (this._type) {
                case 'boolean':
                    return this._settings.set_boolean(this._name, value as unknown as boolean);
                case 'string-array':
                    return this._settings.set_strv(this._name, value as unknown as string[]);
                case 'json-object':
                    return this._settings.set_string(this._name, JSON.stringify(value));
                default:
                    throw new Error('unknown type ' + this._type);
            }
        };
        this._value = this._getValue();
        const changed = this._settings.connect(`changed::${this._name}`, () =>
            this._updateValue(this._getValue()),
        );
        this._disconnect = () => this._settings.disconnect(changed);
    }

    private _destroy(): void {
        this._disconnect();
        this._subscribers = [];
    }

    private _updateValue(value: T) {
        this._value = value;
        this._notifySubscriber();
    }

    private _notifySubscriber(): void {
        for (const subscriber of this._subscribers) {
            subscriber(this._value);
        }
    }
}

// interface SettingsDefinition {
//     schema: string;
//     name: string;
//     type: 'boolean' | 'string';
// }
// interface BooleanSettingsDefinition extends SettingsDefinition {
//     type: 'boolean';
// }
// interface StringSettingsDefinition extends SettingsDefinition {
//     type: 'string';
// }
//
// export class NewSettings {
//     private readonly _availableSettings = {
//         dynamicWorkspaces: {
//             schema: 'org.gnome.mutter',
//             name: 'dynamic-workspaces',
//             type: 'boolean',
//         } as BooleanSettingsDefinition,
//     };
//     private _gioSettings: { [key: string]: any } = {};

//     readonly extensionSettings = ExtensionUtils.getSettings(
//         'org.gnome.shell.extensions.workspaces-bar',
//     );

//     init(): void {
//         const foo = this.get('dynamicWorkspaces');
//     }
//     destroy(): void {}
//     get<T extends keyof NewSettings['_availableSettings']>(key: T) {
//         const setting = this._availableSettings[key];
//         return this._getValue<NewSettings['_availableSettings'][T]>(setting);
//     }

//     private _getValue<T extends BooleanSettingsDefinition>(definition: T): boolean;
//     private _getValue<T extends StringSettingsDefinition>(definition: T): string;
//     private _getValue(definition: SettingsDefinition): boolean | string {
//         switch (definition.type) {
//             case 'boolean':
//                 return this._getGioSettings(definition.schema).get_boolean(definition.name);
//             case 'string':
//                 return 'foo';
//             default:
//                 throw new Error('unknown type ' + definition.type);
//         }
//     }

//     private _getBoolean({ schema, name }: SettingsDefinition): boolean {
//         const settings = new Gio.Settings({ schema });
//         return settings.get_boolean(name);
//     }

//     private _getGioSettings(schema: string): GioType.Settings {
//         if (!(schema in this._gioSettings)) {
//             this._gioSettings[schema] = new Gio.Settings({ schema });
//         }
//         return this._gioSettings[schema];
//     }
// }
