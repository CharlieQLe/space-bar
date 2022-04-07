declare const global: Global, imports: any, _: (args: string) => string;

interface Global {
    log(msg: string): void;
    // display: Meta.Display;
    display: any;
    workspace_manager: any;
    get_current_time: () => number;
}

// declare namespace Meta {
//     interface Display extends GObject.Object {
//         get_focus_window(): Meta.Window | null;
//     }

//     interface Window extends Clutter.Actor {
//         minimized: Readonly<boolean>;
//         activate(time: number): void;
//     }
// }
