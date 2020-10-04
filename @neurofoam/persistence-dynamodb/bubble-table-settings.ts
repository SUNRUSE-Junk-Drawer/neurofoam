import { TableSettings } from "./table-settings";

export type BubbleTableSettings = TableSettings & {
  readonly attributeNames: {
    readonly bubbleUuid: string;
    readonly currentStateJson: string;
    readonly latestEventUuid: string;
  };
};
