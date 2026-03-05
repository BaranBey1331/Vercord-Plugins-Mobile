import { logger } from "@vendetta";

const RELEASE_BASE_URL = "https://github.com/BaranBey1331/Vercord-Plugins-Mobile/releases/download/latest";
const PLUGINS = ["Message-Logger"];
const loadedPlugins = new Map();

async function loadPlugin(pluginName: string) {
    try {
        const res = await fetch(`${RELEASE_BASE_URL}/${pluginName}.js?v=${Date.now()}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        
        const code = await res.text();
        
        // CommonJS Modül İzolasyonu
        const module = { exports: {} as any };
        
        // React Native / Vendetta global require fonksiyonunu tespit et
        const globalRequire = (typeof window !== "undefined" && (window as any).require) || 
                              (typeof global !== "undefined" && (global as any).require) || 
                              require;

        // Kodu çalıştır ve module.exports içine aktar
        const executor = new Function("module", "exports", "require", code);
        executor(module, module.exports, globalRequire);

        const plugin = module.exports.default || module.exports;

        if (typeof plugin?.onLoad === "function") {
            plugin.onLoad();
            loadedPlugins.set(pluginName, plugin);
            logger.info(`[Vercord] ${pluginName} yüklendi.`);
        } else {
            throw new Error("Geçerli bir onLoad fonksiyonu bulunamadı.");
        }
    } catch (err) {
        logger.error(`[Vercord] ${pluginName} hatası:`, err);
    }
}

export default {
    onLoad: async () => {
        logger.info("[Vercord] Core Motoru Başlatıldı.");
        for (const plugin of PLUGINS) {
            await loadPlugin(plugin);
        }
    },
    onUnload: () => {
        loadedPlugins.forEach((p) => {
            if (typeof p?.onUnload === "function") p.onUnload();
        });
        loadedPlugins.clear();
    }
}
