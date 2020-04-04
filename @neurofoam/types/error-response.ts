type ErrorResponse =
  | `invalidBubbleUuid`
  | `invalidSessionUuid`
  | `requestTooShort`
  | `requestTooLong`
  | `requestAborted`
  | `requestInterruptedByError`
  | `requestIncorrectlyEncoded`
  | `nonJsonRequest`
  | `requestFailsSchemaValidation`

export default ErrorResponse
