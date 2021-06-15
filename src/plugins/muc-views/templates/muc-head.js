import 'shared/components/dropdown.js';
import 'shared/components/rich-text.js';
import { __ } from 'i18n';
import { _converse } from "@converse/headless/core";
import { html } from "lit";
import { until } from 'lit/directives/until.js';
import {
    getHeadingDropdownItem,
    getHeadingStandaloneButton,
} from 'plugins/chatview/utils.js';


async function shouldShowSubject (o, subject_hidden_promise) {
    const subject = o.subject ? o.subject.text : '';
    const subject_hidden = await subject_hidden_promise;
    return (subject && !o.subject_hidden);
}

async function tpl_subject (o) {
    return shouldShowSubject(o).then((show_subject) => {
        return show_subject ? html`<p class="chat-head__desc" title="${i18n_hide_topic}">
            <converse-rich-text text=${subject} render_styling></converse-rich-text>
        </p>` : '';
    });
}

async function getExtraClasses (o) {
    return shouldShowSubject(o).then(show_subject => show_subject ? '' : 'chatbox-title--no-desc');
}

async function getHeadingButtons (o, subject_hidden_promise) {
    return subject_hidden_promise.then(subject_hidden => o.getHeadingButtons(subject_hidden));
}

async function getStandaloneButtons (heading_buttons_promise) {
    return heading_buttons_promise.then(heading_btns => heading_btns.filter(b => b.standalone).map(b => getHeadingStandaloneButton(b)));
}

async function getDropdownButtons (heading_buttons_promise) {
    return heading_buttons_promise.then(heading_btns => heading_btns.filter(b => !b.standalone).map(b => getHeadingDropdownItem(b)));
}



export default (o) => {
    const i18n_hide_topic = __('Hide the groupchat topic');
    const i18n_bookmarked = __('This groupchat is bookmarked');

    const subject_hidden_promise = o.model.isSubjectHidden();
    const heading_buttons_promise = getHeadingDropdownItem(o, subject_hidden_promise);
    const title = this.model.getDisplayName();

    const tpl_standalone_btns = (o) => o.standalone_btns.reverse().map(b => until(b, ''));


    return html`
        <div class="chatbox-title ${ until(getExtraClasses(), '') }">
            ${ (!_converse.api.settings.get("singleton")) ?  html`<converse-controlbox-navback jid="${o.jid}"></converse-controlbox-navback>` : '' }
            <div class="chatbox-title__text" title="${ (_converse.locked_muc_domain !== 'hidden') ? o.jid : '' }">${ title }
                ${ (o.bookmarked) ? html`<i class="fa fa-bookmark chatbox-title__text--bookmarked" title="${i18n_bookmarked}"></i>` : '' }
            </div>
            <div class="chatbox-title__buttons row no-gutters">
                ${ o.standalone_btns.length ? tpl_standalone_btns(o) : '' }
                ${ o.dropdown_btns.length ? html`<converse-dropdown .items=${o.dropdown_btns}></converse-dropdown>` : '' }
            </div>
        </div>
        ${ until(getSubject(o), '') }
    `;
}
