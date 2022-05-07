import { Settings } from 'services/Settings';
import type { Workspaces } from 'services/Workspaces';
import type { Meta } from 'imports/gi';
type Window = Meta.Window;

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
        if (newIndex < workspaceNames.length) {
            workspaceNames.splice(newIndex, 0, element ?? '');
        } else {
            while (workspaceNames.length < newIndex) {
                workspaceNames.push('');
            }
            workspaceNames[newIndex] = element ?? '';
        }
        this._setNames(workspaceNames);
    }

    insert(index: number, name: string): void {
        const workspaceNames = this._getNames();
        this._insert(workspaceNames, index, name);
        this._setNames(workspaceNames);
    }

    remove(index: number): void {
        const workspaceNames = this._getNames();
        workspaceNames.splice(index, 1);
        this._setNames(workspaceNames);
    }

    rename(index: number, newName: string): void {
        let workspaceNames = this._getNames();
        const oldName = workspaceNames[index];
        workspaceNames[index] = newName;
        this._setNames(workspaceNames);
        if (this._settings.smartWorkspaceNames.value && newName) {
            this._saveSmartWorkspaceName(index, oldName, newName);
        }
    }

    restoreSmartWorkspaceName(index: number) {
        const windowNames = this._getWindowNames(index);
        const workspacesNamesMap = this._settings.workspaceNamesMap.value;
        for (const windowName of windowNames) {
            if (workspacesNamesMap[windowName]?.length > 0) {
                const newName = workspacesNamesMap[windowName].find(
                    (name) => !this._getEnabledWorkspaceNames().includes(name),
                );
                if (newName) {
                    let workspaceNames = this._getNames();
                    workspaceNames[index] = newName;
                    this._setNames(workspaceNames);
                    return;
                }
            }
        }
    }

    private _saveSmartWorkspaceName(index: number, oldName: string, newName: string) {
        const windowNames = this._getWindowNames(index);
        const workspacesNamesMap = this._settings.workspaceNamesMap.value;
        for (const windowName of windowNames) {
            workspacesNamesMap[windowName] = [
                ...(workspacesNamesMap[windowName] ?? [])
                    // Clear our unused names.
                    .filter(
                        (name) =>
                            name !== newName && this._getEnabledWorkspaceNames().includes(name),
                    ),
                newName,
            ];
        }
        this._settings.workspaceNamesMap.value = workspacesNamesMap;
    }

    private _getWindowNames(workspaceIndex: number): string[] {
        const workspace = global.workspace_manager.get_workspace_by_index(workspaceIndex);
        let windows: Window[] = workspace!.list_windows();
        windows = windows.filter((window) => !window.is_on_all_workspaces());
        return windows.map((window) => window.get_wm_class());
    }

    private _insert(workspaceNames: string[], index: number, name: string): void {
        if (workspaceNames.length > index) {
            workspaceNames.splice(index, 0, name);
        } else {
            workspaceNames[index] = name;
        }
    }

    private _getNames(): string[] {
        return [...this._settings.workspaceNames.value];
    }

    private _setNames(names: string[]): void {
        // names = this._cleanUp(names);
        this._settings.workspaceNames.value = names;
    }

    private _cleanUp(workspaceNames: string[]): string[] {
        return (
            workspaceNames
                // Filter empty and unused workspace names.
                .filter((name, index) => index < this._ws.numberOfEnabledWorkspaces || !!name)
        );
    }

    private _getEnabledWorkspaceNames(): string[] {
        return this._getNames().filter((_, index) => index < this._ws.numberOfEnabledWorkspaces);
    }
}
