import Json from "./json"

type Cache<TValue extends Json> = {
  get(key: string): Promise<TValue>
  set(key: string, value: TValue): Promise<void>
}

export default Cache
