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
  | `requestShorterThanIndicated`
  | `requestLongerThanIndicated`
  | `invalidRequestLength`;

export default ErrorResponse;
