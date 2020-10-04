import { Json } from "../json";

export type Channel<TRequest, TRender> = {
  command(request: TRequest): Promise<string>;

  request(request: TRequest): Promise<Json>;

  send(session: string, render: TRender): Promise<void>;
};
