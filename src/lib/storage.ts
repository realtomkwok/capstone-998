export interface IStorage {
    getItem: (key: string) => Promise<any>
    setItem: (key: string, value: any) => Promise<void>
    removeItem: (key: string) => Promise<void>
}

// Wrapper for LocalStorage API
class LocalStorageWrapper implements IStorage {
    async getItem(key: string): Promise<string> {
        const item = localStorage.getItem(key)
        return item ? JSON.parse(item) : null
    }
    async setItem(key: string, value: any): Promise<void> {
        localStorage.setItem(key, JSON.stringify(value))
    }
    async removeItem(key: string): Promise<void> {
        localStorage.removeItem(key)
    }
}

// Wrapper for Chrome's SessionStorage API
class ChromeSessionStorageWrapper implements IStorage {
    async getItem(key: string): Promise<string> {
        return new Promise((resolve) => {
            chrome.storage.local.get(key, (items) => {
                resolve(items[key] || null)
            })
        })
    }
    async setItem(key: string, value: any): Promise<void> {
        return new Promise((resolve) => {
            chrome.storage.local.set({ [key]: value }, () => {
                resolve()
            })
        })
    }
    async removeItem(key: string): Promise<void> {
       return new Promise((resolve) => {
           chrome.storage.local.remove(key, () => {
               resolve()
           })
       })
    }
}

// Wrapper for memory storage
class MemoryStorageWrapper implements IStorage {
    private storage: Map<string, any> = new Map()

    async getItem(key: string): Promise<string> {
        return this.storage.has(key) ? this.storage.get(key) : null
    }
    async setItem(key: string, value: string): Promise<void> {
        this.storage.set(key, value)
    }
    async removeItem(key: string): Promise<void> {
        this.storage.delete(key)
    }
}

export function getStorage(): IStorage {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        return new ChromeSessionStorageWrapper()
    } else if (typeof localStorage !== 'undefined') {
        return new LocalStorageWrapper()
    } else {
        return new MemoryStorageWrapper()
    }
}
