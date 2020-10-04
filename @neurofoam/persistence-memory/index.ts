// import * as neurofoamTypes from "@neurofoam/types";

// export class NeurofoamPersistenceMemory<
//   TState extends neurofoamTypes.Json,
//   TEvent extends neurofoamTypes.Json
// > implements neurofoamTypes.Persistence<TState, TEvent> {
//   private readonly bubbles: {
//     [bubbleUuid: string]: {
//       readonly currentState: TState;
//       readonly latestEventUuid: string;
//     };
//   } = {};

//   async initialize(): Promise<void> {
//     /* No initialization required. */
//   }

//   async getBubble(
//     bubbleUuid: string
//   ): Promise<null | {
//     readonly currentState: TState;
//     readonly latestEventUuid: string;
//   }> {
//     if (Object.prototype.hasOwnProperty.call(this.bubbles, bubbleUuid)) {
//       return this.bubbles[bubbleUuid];
//     } else {
//       return null;
//     }
//   }

//   async recordFirstEvent(
//     bubbleUuid: string,
//     eventUuid: string,
//     sessionUuid: string,
//     event: TEvent,
//     resultingState: TState
//   ): Promise<neurofoamTypes.PersistenceResult> {
//     sessionUuid;
//     event;

//     if (Object.prototype.hasOwnProperty.call(this.bubbles, bubbleUuid)) {
//       return `optimisticConcurrencyControlCollision`;
//     } else {
//       this.bubbles[bubbleUuid] = {
//         currentState: resultingState,
//         latestEventUuid: eventUuid,
//       };
//       return `successful`;
//     }
//   }

//   async recordSubsequentEvent(
//     bubbleUuid: string,
//     previousEventUuid: string,
//     nextEventUuid: string,
//     sessionUuid: string,
//     event: TEvent,
//     resultingState: TState
//   ): Promise<neurofoamTypes.PersistenceResult> {
//     sessionUuid;
//     event;

//     const bubble = this.bubbles[bubbleUuid];

//     if (bubble.latestEventUuid !== previousEventUuid) {
//       return `optimisticConcurrencyControlCollision`;
//     } else {
//       this.bubbles[bubbleUuid] = {
//         currentState: resultingState,
//         latestEventUuid: nextEventUuid,
//       };
//       return `successful`;
//     }
//   }
// }
