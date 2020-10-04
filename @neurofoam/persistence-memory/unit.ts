// import * as neurofoamTypes from "@neurofoam/types";
// import { NeurofoamPersistenceMemory } from ".";

// describe(`@neurofoam/persistence-memory`, () => {
//   describe(`index`, () => {
//     type TestState = { readonly stateValue: string };
//     type TestEvent = { readonly eventValue: string };

//     describe(`when the database is used correctly`, () => {
//       let instance: NeurofoamPersistenceMemory<TestState, TestEvent>;

//       let resultOfCreatingBubble: neurofoamTypes.PersistenceResult;
//       let resultOfUpdatingBubbleOnce: neurofoamTypes.PersistenceResult;
//       let resultOfUpdatingBubbleTwice: neurofoamTypes.PersistenceResult;
//       let resultOfCreatingBubbleTwice: neurofoamTypes.PersistenceResult;
//       let resultOfUpdateConflictA: neurofoamTypes.PersistenceResult;
//       let resultOfUpdateConflictB: neurofoamTypes.PersistenceResult;

//       beforeAll(async () => {
//         instance = new NeurofoamPersistenceMemory<TestState, TestEvent>();

//         await instance.initialize();

//         resultOfCreatingBubble = await instance.recordFirstEvent(
//           `Test Newly Created Bubble Uuid`,
//           `Test Newly Created Event Uuid A`,
//           `Test Session Uuid A`,
//           { eventValue: `Test Event Value A` },
//           { stateValue: `Test State Value A` }
//         );

//         await instance.recordFirstEvent(
//           `Test Updated Once Bubble Uuid`,
//           `Test Updated Once Event Uuid A`,
//           `Test Session Uuid B`,
//           { eventValue: `Test Event Value B` },
//           { stateValue: `Test State Value B` }
//         );
//         resultOfUpdatingBubbleOnce = await instance.recordSubsequentEvent(
//           `Test Updated Once Bubble Uuid`,
//           `Test Updated Once Event Uuid A`,
//           `Test Updated Once Event Uuid B`,
//           `Test Session Uuid C`,
//           { eventValue: `Test Event Value C` },
//           { stateValue: `Test State Value C` }
//         );

//         await instance.recordFirstEvent(
//           `Test Updated Twice Bubble Uuid`,
//           `Test Updated Twice Event Uuid A`,
//           `Test Session Uuid D`,
//           { eventValue: `Test Event Value D` },
//           { stateValue: `Test State Value D` }
//         );
//         await instance.recordSubsequentEvent(
//           `Test Updated Twice Bubble Uuid`,
//           `Test Updated Twice Event Uuid A`,
//           `Test Updated Twice Event Uuid B`,
//           `Test Session Uuid E`,
//           { eventValue: `Test Event Value E` },
//           { stateValue: `Test State Value E` }
//         );
//         resultOfUpdatingBubbleTwice = await instance.recordSubsequentEvent(
//           `Test Updated Twice Bubble Uuid`,
//           `Test Updated Twice Event Uuid B`,
//           `Test Updated Twice Event Uuid C`,
//           `Test Session Uuid F`,
//           { eventValue: `Test Event Value F` },
//           { stateValue: `Test State Value F` }
//         );

//         await instance.recordFirstEvent(
//           `Test Twice Created Bubble Uuid`,
//           `Test Twice Created Event Uuid A`,
//           `Test Session Uuid G`,
//           { eventValue: `Test Event Value G` },
//           { stateValue: `Test State Value G` }
//         );
//         resultOfCreatingBubbleTwice = await instance.recordFirstEvent(
//           `Test Twice Created Bubble Uuid`,
//           `Test Twice Created Event Uuid A`,
//           `Test Session Uuid H`,
//           { eventValue: `Test Event Value H` },
//           { stateValue: `Test State Value H` }
//         );

//         await instance.recordFirstEvent(
//           `Test Update Conflict A Bubble Uuid`,
//           `Test Update Conflict A Event Uuid A`,
//           `Test Session Uuid I`,
//           { eventValue: `Test Event Value I` },
//           { stateValue: `Test State Value I` }
//         );
//         await instance.recordSubsequentEvent(
//           `Test Update Conflict A Bubble Uuid`,
//           `Test Update Conflict A Event Uuid A`,
//           `Test Update Conflict A Event Uuid B`,
//           `Test Session Uuid J`,
//           { eventValue: `Test Event Value J` },
//           { stateValue: `Test State Value J` }
//         );
//         resultOfUpdateConflictA = await instance.recordSubsequentEvent(
//           `Test Update Conflict A Bubble Uuid`,
//           `Test Update Conflict A Event Uuid A`,
//           `Test Update Conflict A Event Uuid C`,
//           `Test Session Uuid K`,
//           { eventValue: `Test Event Value K` },
//           { stateValue: `Test State Value K` }
//         );

//         await instance.recordFirstEvent(
//           `Test Update Conflict B Bubble Uuid`,
//           `Test Update Conflict B Event Uuid A`,
//           `Test Session Uuid L`,
//           { eventValue: `Test Event Value L` },
//           { stateValue: `Test State Value L` }
//         );
//         await instance.recordSubsequentEvent(
//           `Test Update Conflict B Bubble Uuid`,
//           `Test Update Conflict B Event Uuid A`,
//           `Test Update Conflict B Event Uuid B`,
//           `Test Session Uuid M`,
//           { eventValue: `Test Event Value M` },
//           { stateValue: `Test State Value M` }
//         );
//         await instance.recordSubsequentEvent(
//           `Test Update Conflict B Bubble Uuid`,
//           `Test Update Conflict B Event Uuid B`,
//           `Test Update Conflict B Event Uuid C`,
//           `Test Session Uuid N`,
//           { eventValue: `Test Event Value N` },
//           { stateValue: `Test State Value N` }
//         );
//         resultOfUpdateConflictB = await instance.recordSubsequentEvent(
//           `Test Update Conflict B Bubble Uuid`,
//           `Test Update Conflict B Event Uuid A`,
//           `Test Update Conflict B Event Uuid D`,
//           `Test Session Uuid O`,
//           { eventValue: `Test Event Value O` },
//           { stateValue: `Test State Value O` }
//         );
//       });

//       it(`recordFirstEvent returns successful for a previously nonexistent bubble`, () =>
//         expect(resultOfCreatingBubble).toEqual(`successful`));
//       it(`recordSubsequentEvent returns successful the first time`, () =>
//         expect(resultOfUpdatingBubbleOnce).toEqual(`successful`));
//       it(`recordSubsequentEvent returns successful the second time`, () =>
//         expect(resultOfUpdatingBubbleTwice).toEqual(`successful`));
//       it(`getBubble returns null for nonexistent bubbles`, () =>
//         expectAsync(
//           instance.getBubble(`Test Nonexistent Bubble Uuid`)
//         ).toBeResolvedTo(null));
//       it(`getBubble returns details for newly created bubbles`, () =>
//         expectAsync(
//           instance.getBubble(`Test Newly Created Bubble Uuid`)
//         ).toBeResolvedTo({
//           currentState: { stateValue: `Test State Value A` },
//           latestEventUuid: `Test Newly Created Event Uuid A`,
//         }));
//       it(`getBubble returns details for bubbles updated once`, () =>
//         expectAsync(
//           instance.getBubble(`Test Updated Once Bubble Uuid`)
//         ).toBeResolvedTo({
//           currentState: { stateValue: `Test State Value C` },
//           latestEventUuid: `Test Updated Once Event Uuid B`,
//         }));
//       it(`getBubble returns details for bubbles updated twice`, () =>
//         expectAsync(
//           instance.getBubble(`Test Updated Twice Bubble Uuid`)
//         ).toBeResolvedTo({
//           currentState: { stateValue: `Test State Value F` },
//           latestEventUuid: `Test Updated Twice Event Uuid C`,
//         }));
//       it(`recordFirstEvent returns optimisticConcurrencyControlCollision should the bubble already exist`, () =>
//         expect(resultOfCreatingBubbleTwice).toEqual(
//           `optimisticConcurrencyControlCollision`
//         ));
//       it(`recordFirstEvent makes no change should the bubble already exist`, () =>
//         expectAsync(
//           instance.getBubble(`Test Twice Created Bubble Uuid`)
//         ).toBeResolvedTo({
//           currentState: { stateValue: `Test State Value G` },
//           latestEventUuid: `Test Twice Created Event Uuid A`,
//         }));
//       it(`recordSubsequentEvent returns optimisticConcurrencyControlCollision should the bubble be updated once since the call to getBubble`, () =>
//         expect(resultOfUpdateConflictA).toEqual(
//           `optimisticConcurrencyControlCollision`
//         ));
//       it(`recordSubsequentEvent makes no changes should the bubble be updated once since the call to getBubble`, () =>
//         expectAsync(
//           instance.getBubble(`Test Update Conflict A Bubble Uuid`)
//         ).toBeResolvedTo({
//           currentState: { stateValue: `Test State Value J` },
//           latestEventUuid: `Test Update Conflict A Event Uuid B`,
//         }));
//       it(`recordSubsequentEvent returns optimisticConcurrencyControlCollision should the bubble be updated twice since the call to getBubble`, () =>
//         expect(resultOfUpdateConflictB).toEqual(
//           `optimisticConcurrencyControlCollision`
//         ));
//       it(`recordSubsequentEvent makes no changes should the bubble be updated twice since the call to getBubble`, () =>
//         expectAsync(
//           instance.getBubble(`Test Update Conflict B Bubble Uuid`)
//         ).toBeResolvedTo({
//           currentState: { stateValue: `Test State Value N` },
//           latestEventUuid: `Test Update Conflict B Event Uuid C`,
//         }));
//     });
//   });
// });
