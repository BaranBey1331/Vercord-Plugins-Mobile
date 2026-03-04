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

            // Mesaj silinme olayını (kendin veya başkası fark etmez) havada yakala
            if (event.type === "MESSAGE_DELETE") {
                const { channelId, id } = event;
                const message = MessageStore?.getMessage(channelId, id);
                
                if (message) {
                    // 1. Mesajın içeriğini değiştir
                    message.content += " `[🛑 Silindi]`";
                    
                    // 2. SİHİRLİ DOKUNUŞ: Olayı "Silinme"den "Güncellenme"ye çevir!
                    // Bu, React'ı mesajı yeni haliyle ekrana çizmeye (Re-render) zorlar.
                    args[0] = {
                        type: "MESSAGE_UPDATE",
                        message: message
                    };
                }
            }
        });
    },
    
    onUnload: () => {
        if (unpatch) unpatch();
        logger.info("Vercord Eklentisi: Message Logger durduruldu.");
    }
}
