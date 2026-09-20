// Tiny module-level bridge so the global chatbot can read live simulator state
// from whichever algorithm page is currently mounted.
let provider = null;

export function setChatContextProvider(fn) {
  provider = fn;
}

export function getChatContext() {
  try {
    return provider ? provider() : null;
  } catch {
    return null;
  }
}
