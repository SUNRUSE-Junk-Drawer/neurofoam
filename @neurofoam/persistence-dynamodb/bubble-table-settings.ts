import TableSettings from "./table-settings";

type BubbleTableSettings = TableSettings & {
  readonly attributeNames: {
    readonly bubbleUuid: string;
    readonly currentStateJson: string;
    readonly latestEventUuid: string;
  };
};

export default BubbleTableSettings;
