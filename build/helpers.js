"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postWithRetry = void 0;
/**
 * Retries a function a given number of times with an exponential backoff.
 *
 * @param fn
 * @param retries
 * @param delay
 * @returns
 */
const postWithRetry = async (fn, retries = 5, delay = 1000) => {
    try {
        return await fn();
    }
    catch (error) {
        if (retries > 0) {
            console.error(`Operation failed, retrying in ${delay}ms...`, error);
            await new Promise((resolve) => setTimeout(resolve, delay));
            return (0, exports.postWithRetry)(fn, retries - 1, delay * 2);
        }
        else {
            throw error;
        }
    }
};
exports.postWithRetry = postWithRetry;
