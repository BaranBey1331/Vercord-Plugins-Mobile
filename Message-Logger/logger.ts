import { before } from "@vendetta/patcher";
import { findByStoreName, findByProps } from "@vendetta/metro";

const MessageStore = findByStoreName("MessageStore");
const Dispatcher = findByProps("dispatch", "subscribe");

let unpatch: Function;

export default {
    onLoad: () => {
        // Dispatcher üzerinden tüm olayları dinliyoruz
        unpatch = before("dispatch", Dispatcher, (args) => {
            const [event] = args;

            // Kendi mesajın veya başkasının mesajı silindiğinde tetiklenir
            if (event.type === "MESSAGE_DELETE") {
                const message = MessageStore?.getMessage(event.channelId, event.id);
                
                if (message) {
                    // 1. Mesajın sonuna belirgin bir etiket ekle
                    message.content += " `[🛑 Silindi]`";
                    
                    // 2. KESİN ÇÖZÜM: Olayı "Silinme"den "Güncelleme"ye çevir!
                    // Böylece Discord arayüzü silmek yerine güncelleyerek ekrana geri çizer.
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
    }
}
