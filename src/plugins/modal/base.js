import bootstrap from "bootstrap.native";
import log from "@converse/headless/log";
import tpl_alert_component from "templates/alert.js";
import { ElementView } from '@converse/skeletor/src/element.js';
import { api, converse } from "@converse/headless/core";
import { render } from 'lit';

import './styles/_modal.scss';

const { sizzle } = converse.env;
const u = converse.env.utils;


class BaseModal extends ElementView {
    persistent  = false;
    className = "modal";

    events = {
        'click  .nav-item .nav-link': 'switchTab'
    }

    constructor (options) {
        super();
        this.initialize(options);
    }

    initialize (options) {
        if (!this.id) {
            throw new Error("Each modal class must have a unique id attribute");
        }
        // Allow properties to be set via passed in options
        Object.assign(this, options);

        this.render()

        this.setAttribute('tabindex', '-1');
        this.setAttribute('role', 'dialog');
        this.setAttribute('aria-hidden', 'true');
        const label_id = this.querySelector('.modal-title').getAttribute('id');
        label_id && this.setAttribute('aria-labelledby', label_id);

        this.insertIntoDOM();
        const Modal = bootstrap.Modal;
        this.modal = new Modal(this, {
            backdrop: true,
            keyboard: true
        });
        this.addEventListener('hide.bs.modal', () => this.onHide(), false);
    }

    onHide () {
        u.removeClass('selected', this.trigger_el);
        !this.persistent && api.modal.remove(this);
    }

    insertIntoDOM () {
        const container_el = document.querySelector("#converse-modals");
        container_el.insertAdjacentElement('beforeEnd', this);
    }

    switchTab (ev) {
        ev.stopPropagation();
        ev.preventDefault();
        sizzle('.nav-link.active', this).forEach(el => {
            u.removeClass('active', this.querySelector(el.getAttribute('href')));
            u.removeClass('active', el);
        });
        u.addClass('active', ev.target);
        u.addClass('active', this.querySelector(ev.target.getAttribute('href')))
    }

    alert (message, type='primary') {
        const body = this.querySelector('.modal-alert');
        if (body === null) {
            log.error("Could not find a .modal-alert element in the modal to show an alert message in!");
            return;
        }
        // FIXME: Instead of adding the alert imperatively, we should
        // find a way to let the modal rerender with an alert message
        render(tpl_alert_component({'type': `alert-${type}`, 'message': message}), body);
        const el = body.firstElementChild;
        setTimeout(() => {
            u.addClass('fade-out', el);
            setTimeout(() => u.removeElement(el), 600);
        }, 5000);
    }

    show (ev) {
        if (ev) {
            ev.preventDefault();
            this.trigger_el = ev.target;
            !u.hasClass('chat-image', this.trigger_el) && u.addClass('selected', this.trigger_el);
        }
        this.modal.show();
    }
}

export default BaseModal;
