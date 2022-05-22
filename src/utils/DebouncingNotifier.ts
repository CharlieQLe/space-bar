import { GLib } from 'imports/gi';

export class DebouncingNotifier {
    private readonly _subscribers: (() => void)[] = [];
    private _timeout: number | null = null;

    constructor(private _delaySeconds: number = 0.001) {}

    notify(): void {
        // console.log('notify');
        if (this._timeout) {
            GLib.Source.remove(this._timeout);
            this._timeout = null;
        }
        this._timeout = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, this._delaySeconds, () => {
            this._notify();
            this._timeout = null;
            return GLib.SOURCE_REMOVE;
        });
    }

    subscribe(callback: () => void): void {
        this._subscribers.push(callback);
    }

    private _notify(): void {
        // console.log('_notify');
        for (const subscriber of this._subscribers) {
            subscriber();
        }
    }
}
