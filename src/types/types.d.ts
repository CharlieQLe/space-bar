import type * as Adw1 from '@imports/Adw-1';
import type * as Gjs from '@imports/Gjs';
import type * as Gio20 from '@imports/Gio-2.0';
import type * as GObject20 from '@imports/GObject-2.0';
import type * as St10 from '@imports/St-1.0';
import type * as Shell01 from '@imports/Shell-0.1';
import type * as Meta10 from '@imports/Meta-10';
import type * as GLib20 from '@imports/GLib-2.0';
import type * as Xlib20 from '@imports/xlib-2.0';
import type * as Xfixes40 from '@imports/xfixes-4.0';
import type * as Gtk30 from '@imports/Gtk-3.0';
import type * as Gtk40 from '@imports/Gtk-4.0';
import type * as Gdk30 from '@imports/Gdk-3.0';
import type * as GDesktopEnums30 from '@imports/GDesktopEnums-3.0';
import type * as CoglPango10 from '@imports/CoglPango-10';
import type * as Cogl10 from '@imports/Cogl-10';
import type * as Clutter10 from '@imports/Clutter-10';
import type * as Cally10 from '@imports/Cally-10';
import type * as Cairo10 from '@imports/cairo-1.0';
import type * as Pango10 from '@imports/Pango-1.0';
import type * as GdkPixbuf20 from '@imports/GdkPixbuf-2.0';
import type * as Atk10 from '@imports/Atk-1.0';
import type * as PangoCairo10 from '@imports/PangoCairo-1.0';
import type * as Graphene10 from '@imports/Graphene-1.0';
import type * as GL10 from '@imports/GL-1.0';
import type * as Json10 from '@imports/Json-1.0';
import type * as HarfBuzz00 from '@imports/HarfBuzz-0.0';
import type * as GModule20 from '@imports/GModule-2.0';
import type * as PolkitAgent10 from '@imports/PolkitAgent-1.0';
import type * as NM10 from '@imports/NM-1.0';
import type * as Gvc10 from '@imports/Gvc-1.0';
import type * as Gcr3 from '@imports/Gcr-3';
import type * as Polkit10 from '@imports/Polkit-1.0';
import type * as Gck1 from '@imports/Gck-1';
import type * as Meta from '@imports/Meta-10';

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
            // GLib:              typeof GLib20
            // xlib:              typeof Xlib20
            // xfixes:              typeof Xfixes40
            Gtk:              typeof Gtk40
            // Gdk:              typeof Gdk30
            // GDesktopEnums:              typeof GDesktopEnums30
            // CoglPango:              typeof CoglPango10
            // Cogl:              typeof Cogl10
            Clutter: typeof Clutter10;
            // Cally:              typeof Cally10
            // cairo:              typeof Cairo10
            // Pango:              typeof Pango10
            // GdkPixbuf:              typeof GdkPixbuf20
            // Atk:              typeof Atk10
            // PangoCairo:              typeof PangoCairo10
            // Graphene:              typeof Graphene10
            // GL:              typeof GL10
            // Json:              typeof Json10
            // HarfBuzz:              typeof HarfBuzz00
            // GModule:              typeof GModule20
            // PolkitAgent:              typeof PolkitAgent10
            // NM:              typeof NM10
            // Gvc:              typeof Gvc10
            // Gcr:              typeof Gcr3
            // Polkit:              typeof Polkit10
            // Gck:              typeof Gck1
        };
    };
    const global: Global;
}

// declare const global: Global, imports: any, _: (args: string) => string;
// declare const global: Global;

interface Global {
    log(msg: string): void;
    display: Meta.Display;
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
export {};
