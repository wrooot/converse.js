import bootstrap from "bootstrap.native";
import log from "@converse/headless/log";
import sizzle from 'sizzle';
import tpl_profile_modal from "templates/profile_modal";
import { BootstrapModal } from "../converse-modal.js";
import { __ } from '@converse/headless/i18n';
import { api, _converse } from "@converse/headless/converse-core";

const u = converse.env.utils;


export default BootstrapModal.extend({
    id: "user-profile-modal",
    events: {
        'change input[type="file"': "updateFilePreview",
        'click .change-avatar': "openFileSelection",
        'submit .profile-form': 'onFormSubmitted'
    },

    initialize () {
        this.listenTo(this.model, 'change', this.render);
        BootstrapModal.prototype.initialize.apply(this, arguments);
        /**
         * Triggered when the ProfileModal has been created and initialized.
         * @event profileModalInitialized
         * @type { _converse.XMPPStatus }
         * @example _converse.api.listen.on('profileModalInitialized', status => { ... });
         */
        api.trigger('profileModalInitialized', this.model);
    },

    toHTML () {
        return tpl_profile_modal(Object.assign(
            this.model.toJSON(),
            this.model.vcard.toJSON(), {
            '_converse': _converse,
            'utils': u,
            'view': this
        }));
    },

    afterRender () {
        this.tabs = sizzle('.nav-item .nav-link', this.el).map(e => new bootstrap.Tab(e));
    },

    openFileSelection (ev) {
        ev.preventDefault();
        this.el.querySelector('input[type="file"]').click();
    },

    updateFilePreview (ev) {
        const file = ev.target.files[0],
                reader = new FileReader();
        reader.onloadend = () => {
            this.el.querySelector('.avatar').setAttribute('src', reader.result);
        };
        reader.readAsDataURL(file);
    },

    setVCard (data) {
        api.vcard.set(_converse.bare_jid, data)
        .then(() => api.vcard.update(this.model.vcard, true))
        .catch((err) => {
            log.fatal(err);
            api.show('error', __('Error'), [
                __("Sorry, an error happened while trying to save your profile data."),
                __("You can check your browser's developer console for any error output.")
            ]);
        });
        this.modal.hide();
    },

    onFormSubmitted (ev) {
        ev.preventDefault();
        const reader = new FileReader(),
                form_data = new FormData(ev.target),
                image_file = form_data.get('image');

        const data = {
            'fn': form_data.get('fn'),
            'nickname': form_data.get('nickname'),
            'role': form_data.get('role'),
            'email': form_data.get('email'),
            'url': form_data.get('url'),
        };
        if (!image_file.size) {
            Object.assign(data, {
                'image': this.model.vcard.get('image'),
                'image_type': this.model.vcard.get('image_type')
            });
            this.setVCard(data);
        } else {
            reader.onloadend = () => {
                Object.assign(data, {
                    'image': btoa(reader.result),
                    'image_type': image_file.type
                });
                this.setVCard(data);
            };
            reader.readAsBinaryString(image_file);
        }
    }
});
