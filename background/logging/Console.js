/**
 * @file A simple console logger that outputs to stdout
 */

var Logger = require('./Logger');

/**
 * Provides a logging class that outputs to the console
 * @extends Logger
 */
class ConsoleLogger extends Logger {
    /**
     * Constructs a ConsoleLogger class
     * @param {string} threadType - The name of the thing being logged e.g "webui"
     */
    constructor(threadType) {
        super(threadType);
    }

    /**
     * Logs a message
     * @param {string} msg - The message to log
     */
    log(msg) {
        console.log(msg);
    }
    /**
     * Logs an informative message
     * @param {string} msg - The message to log
     */
    info(msg) {
        console.info(msg);
    }
    /**
     * Logs a warning
     * @param {string} msg - The message to log
     */
    warn(msg) {
        console.warn(msg);
    }
    /**
     * Logs an error
     * @param {string} msg - The message to log
     */
    error(msg) {
        console.error(msg);
    }
    /**
     * Logs a fatal error
     * @param {string} msg - The message to log
     */
    fatal(msg) {
        this.error(msg);
    }
    /**
     * Logs a trace
     * @param {string} msg - The message to log
     */
    trace(msg) {
        console.trace(msg);
    }
    /**
     * Logs a debug message
     * @param {string} msg - The message to log
     */
    debug(msg) {
        this.trace(msg);
    }
}

module.exports = ConsoleLogger;