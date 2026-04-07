export async function register() {
  // Next.js 15 passes --localstorage-file to Node.js workers, but when the
  // path is invalid it creates a broken global localStorage where getItem is
  // not a function. This patch runs before any rendering and fixes it.
  if (
    typeof globalThis.localStorage !== 'undefined' &&
    typeof globalThis.localStorage.getItem !== 'function'
  ) {
    Object.defineProperty(globalThis, 'localStorage', {
      value: {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
        clear: () => {},
        key: () => null,
        length: 0,
      },
      writable: true,
      configurable: true,
    })
  }
}
