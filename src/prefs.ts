import { BehaviorPage } from 'preferences/BehaviorPage';

function init() {}

function fillPreferencesWindow(window: any) {
    [new BehaviorPage()].forEach((pageObject) => {
        pageObject.init();
        window.add(pageObject.page);
    });
}
