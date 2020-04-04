interface JsonArray extends ReadonlyArray<Json> { }

type Json =
  | string
  | number
  | boolean
  | JsonArray
  | { readonly [key: string]: Json }
  | null

export default Json
