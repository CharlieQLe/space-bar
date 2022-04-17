import { Settings } from 'services/Settings';
import type { Workspaces } from 'services/Workspaces';

export class WorkspaceNames {
    private static _instance: WorkspaceNames | null;
    static init(workspaces: Workspaces): WorkspaceNames {
        this._instance = new WorkspaceNames(workspaces);
        return this._instance;
    }
    static getInstance(): WorkspaceNames {
        return this._instance as WorkspaceNames;
    }

    private readonly _settings = Settings.getInstance();

    private constructor(private readonly _ws: Workspaces) {}

    moveByIndex(oldIndex: number, newIndex: number): void {
        const workspaceNames = this._getNames();
        const [element] = workspaceNames.splice(oldIndex, 1);
        workspaceNames.splice(newIndex, 0, element);
        this._setNames(workspaceNames);
    }

    insert(name: string, index: number): void {
        const workspaceNames = this._getNames();
        if (workspaceNames.length > index) {
            workspaceNames.splice(index, 0, name);
        } else {
            workspaceNames[index] = name;
        }
        this._setNames(workspaceNames);
    }

    remove(index: number): void {
        const workspaceNames = this._getNames();
        const insertIndex = this._ws.lastVisibleWorkspace + 1;
        const [removedName] = workspaceNames.splice(index, 1);
        if (removedName) {
            if (!workspaceNames[insertIndex]) {
                workspaceNames[insertIndex] = workspaceNames[index];
            } else {
                workspaceNames.splice(insertIndex, 0, removedName);
            }
        }
        this._setNames(workspaceNames);
    }

    private _getNames(): string[] {
        return [...this._settings.workspaceNames.value];
    }

    private _setNames(names: string[]): void {
        names = this._cleanUp(names);
        this._settings.workspaceNames.value = names;
    }

    private _cleanUp(workspaceNames: string[]): string[] {
        return workspaceNames.filter(
            // Filter empty and unused workspace names.
            (name, index) => index <= this._ws.numberOfEnabledWorkspaces || !!name,
        );
    }
}
