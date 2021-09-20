import { CustomElement } from 'shared/components/element.js';
import { api } from "@converse/headless/core";


export default class ModalsContainer extends CustomElement {

    render () { // eslint-disable-line class-methods-use-this
        return '';
        // return api.modals.get().render();
    }
}

api.elements.define('converse-modals', ModalsContainer);
