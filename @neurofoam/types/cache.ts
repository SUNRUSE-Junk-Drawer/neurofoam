import Json from "./json"

type Cache<TValue extends Json> = {
  get(key: string): Promise<undefined | TValue>
  set(key: string, value: TValue): Promise<void>
}

export default Cache
