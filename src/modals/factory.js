import { html, unsafeStatic } from 'lit/static-html.js';

export default class ModalFactory  {

    constructor (id, model) {
        this.model = model;
    }

    render () {
        // FIXME: check if name is a registered component
        const tagname = unsafeStatic(name);
        return html`<${tagname} .modal=${this.model}></${tagname}>`;
    }
}
