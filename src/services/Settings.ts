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

    readonly extensionSettings = ExtensionUtils.getSettings(
        'org.gnome.shell.extensions.workspaces-bar',
    );
    readonly mutterSettings = new Gio.Settings({ schema: 'org.gnome.mutter' });

    dynamicWorkspaces = SettingsSubject.createBooleanSubject(
        this.mutterSettings,
        'dynamic-workspaces',
    );

    showNewWorkspaceButton = SettingsSubject.createBooleanSubject(
        this.extensionSettings,
        'show-new-workspace-button',
    );
    showEmptyWorkspaces = SettingsSubject.createBooleanSubject(
        this.extensionSettings,
        'show-empty-workspaces',
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
    static createBooleanSubject(
        settings: Gio.Settings,
        name: string,
    ): SettingsSubject<boolean> {
        return new SettingsSubject<boolean>(settings, name, 'boolean');
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

    private _value!: T;
    private _subscribers: ((value: T) => void)[] = [];
    private _getValue!: () => T;
    private _disconnect!: () => void;

    private constructor(
        private readonly _settings: Gio.Settings,
        private readonly _name: string,
        private readonly _type: 'boolean' | 'string',
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
                default:
                    throw new Error('unknown type ' + this._type);
            }
        };
        this._value = this._getValue();
        const changed = this._settings.connect(`changed::${this._name}`, () =>
            this._setValue(this._getValue()),
        );
        this._disconnect = () => this._settings.disconnect(changed);
    }

    private _destroy(): void {
        this._disconnect();
        this._subscribers = [];
    }

    private _setValue(value: T) {
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
