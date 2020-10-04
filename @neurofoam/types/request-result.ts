import { Json } from "./json";

export type RequestResult<TEvent extends Json> = {
  readonly response: Json;
  readonly event: null | TEvent;
};
