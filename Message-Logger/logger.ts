import { before } from "@vendetta/patcher";
import { findByStoreName, findByProps } from "@vendetta/metro";

let unpatch: any;

export default {
    onLoad: () => {
        try {
            const MessageStore = findByStoreName("MessageStore");
            const Dispatcher = findByProps("dispatch", "subscribe");

            // Eğer Discord'un modülleri bulamazsa sistemi çökertmek yerine güvenli çıkış yap
            if (!MessageStore || !Dispatcher) {
                console.error("[Message-Logger] Kritik Hata: Store veya Dispatcher bulunamadı!");
                return;
            }

            unpatch = before("dispatch", Dispatcher, (args) => {
                try {
                    const [event] = args;
                    if (!event || event.type !== "MESSAGE_DELETE") return;

                    const msg = MessageStore.getMessage(event.channelId, event.id);
                    if (!msg) return;

                    // Mesajı güncelle ve olayı değiştir (Discord'u silmek yerine güncellemeye zorluyoruz)
                    msg.content = (msg.content || "") + " `[🛑 Silindi]`";
                    
                    args[0] = {
                        type: "MESSAGE_UPDATE",
                        message: msg
                    };
                } catch (patchErr) {
                    console.error("[Message-Logger] Hook içi hata:", patchErr);
                }
            });
            console.log("[Message-Logger] Başarıyla kancalandı!");
        } catch (e) {
            console.error("[Message-Logger] Başlatılma hatası:", e);
        }
    },
    
    onUnload: () => {
        try { if (unpatch) unpatch(); } catch (e) { console.error("Kapatma hatası", e); }
    }
}
