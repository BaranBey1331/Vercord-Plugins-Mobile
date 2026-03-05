import { before } from "@vendetta/patcher";
import { findByStoreName, findByProps } from "@vendetta/metro";

const MessageStore = findByStoreName("MessageStore");
const Dispatcher = findByProps("dispatch", "subscribe");
let unpatch: Function;

export default {
    onLoad: () => {
        if (!MessageStore || !Dispatcher) return;

        unpatch = before("dispatch", Dispatcher, (args) => {
            const [event] = args;
            if (event?.type === "MESSAGE_DELETE") {
                const msg = MessageStore.getMessage(event.channelId, event.id);
                if (msg) {
                    msg.content = (msg.content || "") + " [Silindi]";
                    args[0] = {
                        type: "MESSAGE_UPDATE",
                        message: msg
                    };
                }
            }
        });
    },
    onUnload: () => {
        if (unpatch) unpatch();
    }
}
