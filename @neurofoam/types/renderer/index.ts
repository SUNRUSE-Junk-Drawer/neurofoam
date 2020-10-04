import { Json } from "../json";

export type Renderer<TState extends Json, TRender> = {
  render(state: TState, sessionUuid: string): TRender;

  equivalent(a: TRender, b: TRender): boolean;
};
