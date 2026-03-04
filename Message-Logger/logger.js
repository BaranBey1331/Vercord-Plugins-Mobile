import { before } from "@vendetta/patcher";
import { findByStoreName, findByProps } from "@vendetta/metro";
import { logger } from "@vendetta";

const MessageStore = findByStoreName("MessageStore");
const Dispatcher = findByProps("dispatch", "subscribe");

let unpatch: Function;

export default {
    onLoad: () => {
        logger.info("Vercord Eklentisi: Message Logger baslatildi!");

        unpatch = before("dispatch", Dispatcher, (args) => {
            const [event] = args;

            if (event.type === "MESSAGE_DELETE") {
                const { channelId, id } = event;
                const message = MessageStore?.getMessage(channelId, id);
                
                if (message) {
                    // Mesajın içeriğini değiştir (Code block stili ile belirginleştir)
                    message.content += " `[🛑 Silindi]`";
                    
                    // Discord'un içsel state mekanizmasını kullanarak mesajı gri/uyarı rengine sokuyoruz
                    message.state = "SEND_FAILED"; 
                    
                    // Orijinal silme işlemini iptal et
                    args[0] = { type: "VERCORD_DUMMY_EVENT" }; 
                }
            }
        });
    },
    
    onUnload: () => {
        if (unpatch) unpatch();
        logger.info("Vercord Eklentisi: Message Logger durduruldu.");
    }
}
