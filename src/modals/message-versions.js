import BootstrapModal from "plugins/modal/base.js";
import tpl_message_versions_modal from "./templates/message-versions.js";


export default class MessageVersionModal extends BootstrapModal {
    id = "message-versions-modal";

    toHTML () {
        return tpl_message_versions_modal(this.model);
    }
}
