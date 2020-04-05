import TableSettings from "./table-settings"

type EventTableSettings = TableSettings & {
  readonly attributeNames: {
    readonly eventUuid: string
    readonly previousEventUuid: string
    readonly bubbleUuid: string
    readonly sessionUuid: string
    readonly eventJson: string
    readonly recorded: string
  }
}

export default EventTableSettings
