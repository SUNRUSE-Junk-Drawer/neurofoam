import { Json } from "../json";

export type Channel<TRequest, TRender> = {
  command(request: TRequest): Promise<string>;

  payload(request: TRequest): Promise<Json>;

  send(session: string, render: TRender): Promise<void>;
};
