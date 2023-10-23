
/**
 * Retries a function a given number of times with an exponential backoff.
 * 
 * @param fn 
 * @param retries 
 * @param delay 
 * @returns 
 */
export const postWithRetry = async <T>(
  fn: () => Promise<T>,
  retries: number = 5,
  delay: number = 1000
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      console.error(`Operation failed, retrying in ${delay}ms...`, error);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return postWithRetry(fn, retries - 1, delay * 2);
    } else {
      throw error;
    }
  }
};
