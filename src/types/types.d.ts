import type * as Adw1 from '@imports/Adw-1';
import type * as Clutter10 from '@imports/Clutter-10';
import type * as Gio20 from '@imports/Gio-2.0';
import type * as GObject20 from '@imports/GObject-2.0';
import type * as Gtk40 from '@imports/Gtk-4.0';
import type * as Meta from '@imports/Meta-10';
import type * as Meta10 from '@imports/Meta-10';
import type * as Shell01 from '@imports/Shell-0.1';
import type * as St10 from '@imports/St-1.0';

declare global {
    const imports: {
        ui: any;
        misc: {
            extensionUtils: any;
        };
        gi: {
            Adw: typeof Adw1;
            Gio: typeof Gio20;
            GObject: typeof GObject20;
            St: typeof St10;
            Shell: typeof Shell01;
            Meta: typeof Meta10;
            Gtk: typeof Gtk40;
            Clutter: typeof Clutter10;
        };
    };
    const global: Global;
}


interface Global {
    log(msg: string): void;
    display: Meta.Display;
    workspace_manager: any;
    get_current_time: () => number;
}