export type JsonArray = ReadonlyArray<Json>;

export type Json =
  | string
  | number
  | boolean
  | JsonArray
  | { readonly [key: string]: Json }
  | null;
