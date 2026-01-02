import { LogLevel} from "./level.js";


let currentLevel = LogLevel.ALL;
const logger = {
    setLevel(level) {
        currentLevel = level;
    },

    error(message) {
        if (currentLevel >= LogLevel.ERROR)
            console.log(`[⛔ ] ${message}`);
    },

    warn(message) {
        if (currentLevel >= LogLevel.WARN)
            console.log(`[⚠️ ] ${message}`);
    },

    log(message) {
        if (currentLevel >= LogLevel.OK)
            console.log(`[🟢 ] ${message}`);
    },

    info(message) {
        if (currentLevel >= LogLevel.INFO)
            console.log(`[ℹ️ ] ${message}`);
    },

    verbose(message) {
        if (currentLevel >= LogLevel.VERBOSE)
            console.log(`[🧾 ] ${message}`);
    },

    trace(message) {
        if (currentLevel >= LogLevel.TRACE)
            console.log(`[🧬 ] ${message}`);
    },
};
globalThis.logger = logger;
globalThis.LogLevel = LogLevel;
export {}
