class Store {
  get<T = unknown>(key: string, defaultValue?: T) {
    let value = null
    const storageData = localStorage.getItem(key) ?? null

    // validate if string is valid JSON - else return string
    try {
      const parsedData = JSON.parse(storageData ?? '')
      value = parsedData
    } catch {
      value = storageData
    }

    return defaultValue ? value || defaultValue : value
  }

  set(key: string, value: unknown) {
    localStorage.setItem(key, JSON.stringify(value))
  }

  remove(key: string) {
    localStorage.removeItem(key)
  }

  clear(exclude?: (key: string) => boolean) {
    if (!exclude) {
      localStorage.clear()

      return
    }

    this.keys().forEach((key) => {
      if (!exclude(key)) this.remove(key)
    })
  }

  keys() {
    const keys: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      keys.push(localStorage.key(i) ?? '')
    }

    return keys
  }
}

const store = new Store()
export default store
