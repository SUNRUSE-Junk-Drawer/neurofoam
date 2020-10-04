import * as neurofoamTypes from "@neurofoam/types";
import { ExecutableRequest } from "../executable-request";
import { executeOnce } from ".";

type TestState =
  | `Test Initial State`
  | `Test Existing State`
  | `Test Applied State`;

type TestEvent = `Test Event`;

type TestRequest = `Test Request`;

describe(`@neurofoam/orchestrator`, () => {
  describe(`executeOnce`, () => {
    describe(`when the bubble did not previously exist`, () => {
      describe(`when there is nothing to persist`, () => {
        let persistenceInitialize: jasmine.Spy;
        let persistenceGetBubble: jasmine.Spy;
        let persistenceRecordFirstEvent: jasmine.Spy;
        let persistenceRecordSubsequentEvent: jasmine.Spy;
        let persistence: neurofoamTypes.Persistence<TestState, TestEvent>;

        let applicationRequestCallback: jasmine.Spy;
        let applicationApplyEvent: jasmine.Spy;
        let application: neurofoamTypes.Application<
          TestState,
          TestEvent,
          TestRequest
        >;

        let executableRequest: ExecutableRequest<TestRequest>;

        let result: undefined | neurofoamTypes.Json;

        beforeAll(async () => {
          persistenceInitialize = jasmine.createSpy(`persistenceInitialize`);
          persistenceGetBubble = jasmine
            .createSpy(`persistenceGetBubble`)
            .and.returnValue(Promise.resolve(null));
          persistenceRecordFirstEvent = jasmine.createSpy(
            `persistenceRecordFirstEvent`
          );
          persistenceRecordSubsequentEvent = jasmine.createSpy(
            `persistenceRecordSubsequentEvent`
          );
          persistence = {
            initialize: persistenceInitialize,
            getBubble: persistenceGetBubble,
            recordFirstEvent: persistenceRecordFirstEvent,
            recordSubsequentEvent: persistenceRecordSubsequentEvent,
          };

          applicationRequestCallback = jasmine
            .createSpy(`applicationRequestCallback`)
            .and.returnValue(
              Promise.resolve({
                response: `Test Application Response`,
                event: null,
              })
            );
          applicationApplyEvent = jasmine.createSpy(`applicationApplyEvent`);
          application = {
            initialState: `Test Initial State`,
            requestLengthLimit: 1234,
            requestSchema: {},
            requestCallback: applicationRequestCallback,
            applyEvent: applicationApplyEvent,
          };

          executableRequest = {
            bubbleUuid: `Test Bubble Uuid`,
            sessionUuid: `Test Session Uuid`,
            request: `Test Request`,
          };

          result = await executeOnce(
            persistence,
            application,
            executableRequest
          );
        });

        it(`does not initialize persistence`, () =>
          expect(persistenceInitialize).not.toHaveBeenCalled());
        it(`gets one bubble`, () =>
          expect(persistenceGetBubble).toHaveBeenCalledTimes(1));
        it(`gets the requested bubble`, () =>
          expect(persistenceGetBubble).toHaveBeenCalledWith(
            `Test Bubble Uuid`
          ));
        it(`does not record a first event`, () =>
          expect(persistenceRecordFirstEvent).not.toHaveBeenCalled());
        it(`does not record a subsequent event`, () =>
          expect(persistenceRecordFirstEvent).not.toHaveBeenCalled());

        it(`processes one request`, () =>
          expect(applicationRequestCallback).toHaveBeenCalledTimes(1));
        it(`uses the bubble's current state when processing requests`, () =>
          expect(applicationRequestCallback).toHaveBeenCalledWith(
            `Test Initial State`,
            jasmine.any(String),
            jasmine.any(String)
          ));
        it(`uses the session uuid when processing requests`, () =>
          expect(applicationRequestCallback).toHaveBeenCalledWith(
            jasmine.any(String),
            `Test Session Uuid`,
            jasmine.any(String)
          ));
        it(`uses the request when processing requests`, () =>
          expect(applicationRequestCallback).toHaveBeenCalledWith(
            jasmine.any(String),
            jasmine.any(String),
            `Test Request`
          ));
        it(`does not apply any events`, () =>
          expect(applicationApplyEvent).not.toHaveBeenCalled());

        it(`returns the application's response`, () =>
          expect(result).toEqual(`Test Application Response`));
      });

      describe(`when an optimistic concurrency control collision occurs`, () => {
        let persistenceInitialize: jasmine.Spy;
        let persistenceGetBubble: jasmine.Spy;
        let persistenceRecordFirstEvent: jasmine.Spy;
        let persistenceRecordSubsequentEvent: jasmine.Spy;
        let persistence: neurofoamTypes.Persistence<TestState, TestEvent>;

        let applicationRequestCallback: jasmine.Spy;
        let applicationApplyEvent: jasmine.Spy;
        let application: neurofoamTypes.Application<
          TestState,
          TestEvent,
          TestRequest
        >;

        let executableRequest: ExecutableRequest<TestRequest>;

        let result: undefined | neurofoamTypes.Json;

        beforeAll(async () => {
          persistenceInitialize = jasmine.createSpy(`persistenceInitialize`);
          persistenceGetBubble = jasmine
            .createSpy(`persistenceGetBubble`)
            .and.returnValue(Promise.resolve(null));
          persistenceRecordFirstEvent = jasmine
            .createSpy(`persistenceRecordFirstEvent`)
            .and.returnValue(
              Promise.resolve(`optimisticConcurrencyControlCollision`)
            );
          persistenceRecordSubsequentEvent = jasmine.createSpy(
            `persistenceRecordSubsequentEvent`
          );
          persistence = {
            initialize: persistenceInitialize,
            getBubble: persistenceGetBubble,
            recordFirstEvent: persistenceRecordFirstEvent,
            recordSubsequentEvent: persistenceRecordSubsequentEvent,
          };

          applicationRequestCallback = jasmine
            .createSpy(`applicationRequestCallback`)
            .and.returnValue(
              Promise.resolve({
                response: `Test Application Response`,
                event: `Test Event`,
              })
            );
          applicationApplyEvent = jasmine
            .createSpy(`applicationApplyEvent`)
            .and.returnValue(`Test Applied State`);
          application = {
            initialState: `Test Initial State`,
            requestLengthLimit: 1234,
            requestSchema: {},
            requestCallback: applicationRequestCallback,
            applyEvent: applicationApplyEvent,
          };

          executableRequest = {
            bubbleUuid: `Test Bubble Uuid`,
            sessionUuid: `Test Session Uuid`,
            request: `Test Request`,
          };

          result = await executeOnce(
            persistence,
            application,
            executableRequest
          );
        });

        it(`does not initialize persistence`, () =>
          expect(persistenceInitialize).not.toHaveBeenCalled());
        it(`gets one bubble`, () =>
          expect(persistenceGetBubble).toHaveBeenCalledTimes(1));
        it(`gets the requested bubble`, () =>
          expect(persistenceGetBubble).toHaveBeenCalledWith(
            `Test Bubble Uuid`
          ));
        it(`records one first event`, () =>
          expect(persistenceRecordFirstEvent).toHaveBeenCalledTimes(1));
        it(`uses the bubble uuid when recording first events`, () =>
          expect(persistenceRecordFirstEvent).toHaveBeenCalledWith(
            `Test Bubble Uuid`,
            jasmine.any(String),
            jasmine.any(String),
            jasmine.any(String),
            jasmine.any(String)
          ));
        it(`uses an event uuid when recording first events`, () =>
          expect(persistenceRecordFirstEvent).toHaveBeenCalledWith(
            jasmine.any(String),
            jasmine.stringMatching(
              /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/
            ),
            jasmine.any(String),
            jasmine.any(String),
            jasmine.any(String)
          ));
        it(`does not reuse the bubble uuid as the next event uuid when recording first events`, () =>
          expect(persistenceRecordFirstEvent).not.toHaveBeenCalledWith(
            jasmine.any(String),
            `Test Bubble Uuid`,
            jasmine.any(String),
            jasmine.any(String),
            jasmine.any(String)
          ));
        it(`does not reuse the session uuid as the next event uuid when recording first events`, () =>
          expect(persistenceRecordFirstEvent).not.toHaveBeenCalledWith(
            jasmine.any(String),
            `Test Session Uuid`,
            jasmine.any(String),
            jasmine.any(String),
            jasmine.any(String)
          ));
        it(`uses the session uuid when recording first events`, () =>
          expect(persistenceRecordFirstEvent).toHaveBeenCalledWith(
            jasmine.any(String),
            jasmine.any(String),
            `Test Session Uuid`,
            jasmine.any(String),
            jasmine.any(String)
          ));
        it(`uses the event returned by the application when recording first events`, () =>
          expect(persistenceRecordFirstEvent).toHaveBeenCalledWith(
            jasmine.any(String),
            jasmine.any(String),
            jasmine.any(String),
            `Test Event`,
            jasmine.any(String)
          ));
        it(`uses the applied state when recording first events`, () =>
          expect(persistenceRecordFirstEvent).toHaveBeenCalledWith(
            jasmine.any(String),
            jasmine.any(String),
            jasmine.any(String),
            jasmine.any(String),
            `Test Applied State`
          ));
        it(`does not record a subsequent event`, () =>
          expect(persistenceRecordSubsequentEvent).not.toHaveBeenCalled());

        it(`processes one request`, () =>
          expect(applicationRequestCallback).toHaveBeenCalledTimes(1));
        it(`uses the bubble's current state when processing requests`, () =>
          expect(applicationRequestCallback).toHaveBeenCalledWith(
            `Test Initial State`,
            jasmine.any(String),
            jasmine.any(String)
          ));
        it(`uses the session uuid when processing requests`, () =>
          expect(applicationRequestCallback).toHaveBeenCalledWith(
            jasmine.any(String),
            `Test Session Uuid`,
            jasmine.any(String)
          ));
        it(`uses the request when processing requests`, () =>
          expect(applicationRequestCallback).toHaveBeenCalledWith(
            jasmine.any(String),
            jasmine.any(String),
            `Test Request`
          ));
        it(`applies one event`, () =>
          expect(applicationApplyEvent).toHaveBeenCalledTimes(1));
        it(`uses the application's initial state when applying events`, () =>
          expect(applicationApplyEvent).toHaveBeenCalledWith(
            `Test Initial State`,
            jasmine.any(String)
          ));
        it(`uses the application's returned event when applying events`, () =>
          expect(applicationApplyEvent).toHaveBeenCalledWith(
            jasmine.any(String),
            `Test Event`
          ));

        it(`returns undefined`, () => expect(result).toBeUndefined());
      });

      describe(`when persistence succeeds`, () => {
        let persistenceInitialize: jasmine.Spy;
        let persistenceGetBubble: jasmine.Spy;
        let persistenceRecordFirstEvent: jasmine.Spy;
        let persistenceRecordSubsequentEvent: jasmine.Spy;
        let persistence: neurofoamTypes.Persistence<TestState, TestEvent>;

        let applicationRequestCallback: jasmine.Spy;
        let applicationApplyEvent: jasmine.Spy;
        let application: neurofoamTypes.Application<
          TestState,
          TestEvent,
          TestRequest
        >;

        let executableRequest: ExecutableRequest<TestRequest>;

        let result: undefined | neurofoamTypes.Json;

        beforeAll(async () => {
          persistenceInitialize = jasmine.createSpy(`persistenceInitialize`);
          persistenceGetBubble = jasmine
            .createSpy(`persistenceGetBubble`)
            .and.returnValue(Promise.resolve(null));
          persistenceRecordFirstEvent = jasmine
            .createSpy(`persistenceRecordFirstEvent`)
            .and.returnValue(Promise.resolve(`successful`));
          persistenceRecordSubsequentEvent = jasmine.createSpy(
            `persistenceRecordSubsequentEvent`
          );
          persistence = {
            initialize: persistenceInitialize,
            getBubble: persistenceGetBubble,
            recordFirstEvent: persistenceRecordFirstEvent,
            recordSubsequentEvent: persistenceRecordSubsequentEvent,
          };

          applicationRequestCallback = jasmine
            .createSpy(`applicationRequestCallback`)
            .and.returnValue(
              Promise.resolve({
                response: `Test Application Response`,
                event: `Test Event`,
              })
            );
          applicationApplyEvent = jasmine
            .createSpy(`applicationApplyEvent`)
            .and.returnValue(`Test Applied State`);
          application = {
            initialState: `Test Initial State`,
            requestLengthLimit: 1234,
            requestSchema: {},
            requestCallback: applicationRequestCallback,
            applyEvent: applicationApplyEvent,
          };

          executableRequest = {
            bubbleUuid: `Test Bubble Uuid`,
            sessionUuid: `Test Session Uuid`,
            request: `Test Request`,
          };

          result = await executeOnce(
            persistence,
            application,
            executableRequest
          );
        });

        it(`does not initialize persistence`, () =>
          expect(persistenceInitialize).not.toHaveBeenCalled());
        it(`gets one bubble`, () =>
          expect(persistenceGetBubble).toHaveBeenCalledTimes(1));
        it(`gets the requested bubble`, () =>
          expect(persistenceGetBubble).toHaveBeenCalledWith(
            `Test Bubble Uuid`
          ));
        it(`records one first event`, () =>
          expect(persistenceRecordFirstEvent).toHaveBeenCalledTimes(1));
        it(`uses the bubble uuid when recording first events`, () =>
          expect(persistenceRecordFirstEvent).toHaveBeenCalledWith(
            `Test Bubble Uuid`,
            jasmine.any(String),
            jasmine.any(String),
            jasmine.any(String),
            jasmine.any(String)
          ));
        it(`uses an event uuid when recording first events`, () =>
          expect(persistenceRecordFirstEvent).toHaveBeenCalledWith(
            jasmine.any(String),
            jasmine.stringMatching(
              /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/
            ),
            jasmine.any(String),
            jasmine.any(String),
            jasmine.any(String)
          ));
        it(`does not reuse the bubble uuid as the next event uuid when recording first events`, () =>
          expect(persistenceRecordFirstEvent).not.toHaveBeenCalledWith(
            jasmine.any(String),
            `Test Bubble Uuid`,
            jasmine.any(String),
            jasmine.any(String),
            jasmine.any(String)
          ));
        it(`does not reuse the session uuid as the next event uuid when recording first events`, () =>
          expect(persistenceRecordFirstEvent).not.toHaveBeenCalledWith(
            jasmine.any(String),
            `Test Session Uuid`,
            jasmine.any(String),
            jasmine.any(String),
            jasmine.any(String)
          ));
        it(`uses the session uuid when recording first events`, () =>
          expect(persistenceRecordFirstEvent).toHaveBeenCalledWith(
            jasmine.any(String),
            jasmine.any(String),
            `Test Session Uuid`,
            jasmine.any(String),
            jasmine.any(String)
          ));
        it(`uses the event returned by the application when recording first events`, () =>
          expect(persistenceRecordFirstEvent).toHaveBeenCalledWith(
            jasmine.any(String),
            jasmine.any(String),
            jasmine.any(String),
            `Test Event`,
            jasmine.any(String)
          ));
        it(`uses the applied state when recording first events`, () =>
          expect(persistenceRecordFirstEvent).toHaveBeenCalledWith(
            jasmine.any(String),
            jasmine.any(String),
            jasmine.any(String),
            jasmine.any(String),
            `Test Applied State`
          ));
        it(`does not record a subsequent event`, () =>
          expect(persistenceRecordSubsequentEvent).not.toHaveBeenCalled());

        it(`processes one request`, () =>
          expect(applicationRequestCallback).toHaveBeenCalledTimes(1));
        it(`uses the bubble's current state when processing requests`, () =>
          expect(applicationRequestCallback).toHaveBeenCalledWith(
            `Test Initial State`,
            jasmine.any(String),
            jasmine.any(String)
          ));
        it(`uses the session uuid when processing requests`, () =>
          expect(applicationRequestCallback).toHaveBeenCalledWith(
            jasmine.any(String),
            `Test Session Uuid`,
            jasmine.any(String)
          ));
        it(`uses the request when processing requests`, () =>
          expect(applicationRequestCallback).toHaveBeenCalledWith(
            jasmine.any(String),
            jasmine.any(String),
            `Test Request`
          ));
        it(`applies one event`, () =>
          expect(applicationApplyEvent).toHaveBeenCalledTimes(1));
        it(`uses the application's initial state when applying events`, () =>
          expect(applicationApplyEvent).toHaveBeenCalledWith(
            `Test Initial State`,
            jasmine.any(String)
          ));
        it(`uses the application's returned event when applying events`, () =>
          expect(applicationApplyEvent).toHaveBeenCalledWith(
            jasmine.any(String),
            `Test Event`
          ));

        it(`returns the application's response`, () =>
          expect(result).toEqual(`Test Application Response`));
      });
    });

    describe(`when the bubble previously existed`, () => {
      describe(`when there is nothing to persist`, () => {
        let persistenceInitialize: jasmine.Spy;
        let persistenceGetBubble: jasmine.Spy;
        let persistenceRecordFirstEvent: jasmine.Spy;
        let persistenceRecordSubsequentEvent: jasmine.Spy;
        let persistence: neurofoamTypes.Persistence<TestState, TestEvent>;

        let applicationRequestCallback: jasmine.Spy;
        let applicationApplyEvent: jasmine.Spy;
        let application: neurofoamTypes.Application<
          TestState,
          TestEvent,
          TestRequest
        >;

        let executableRequest: ExecutableRequest<TestRequest>;

        let result: undefined | neurofoamTypes.Json;

        beforeAll(async () => {
          persistenceInitialize = jasmine.createSpy(`persistenceInitialize`);
          persistenceGetBubble = jasmine
            .createSpy(`persistenceGetBubble`)
            .and.returnValue(
              Promise.resolve({
                currentState: `Test Current State`,
                latestEventUuid: `Test Latest Event Uuid`,
              })
            );
          persistenceRecordFirstEvent = jasmine.createSpy(
            `persistenceRecordFirstEvent`
          );
          persistenceRecordSubsequentEvent = jasmine.createSpy(
            `persistenceRecordSubsequentEvent`
          );
          persistence = {
            initialize: persistenceInitialize,
            getBubble: persistenceGetBubble,
            recordFirstEvent: persistenceRecordFirstEvent,
            recordSubsequentEvent: persistenceRecordSubsequentEvent,
          };

          applicationRequestCallback = jasmine
            .createSpy(`applicationRequestCallback`)
            .and.returnValue(
              Promise.resolve({
                response: `Test Application Response`,
                event: null,
              })
            );
          applicationApplyEvent = jasmine.createSpy(`applicationApplyEvent`);
          application = {
            initialState: `Test Initial State`,
            requestLengthLimit: 1234,
            requestSchema: {},
            requestCallback: applicationRequestCallback,
            applyEvent: applicationApplyEvent,
          };

          executableRequest = {
            bubbleUuid: `Test Bubble Uuid`,
            sessionUuid: `Test Session Uuid`,
            request: `Test Request`,
          };

          result = await executeOnce(
            persistence,
            application,
            executableRequest
          );
        });

        it(`does not initialize persistence`, () =>
          expect(persistenceInitialize).not.toHaveBeenCalled());
        it(`gets one bubble`, () =>
          expect(persistenceGetBubble).toHaveBeenCalledTimes(1));
        it(`gets the requested bubble`, () =>
          expect(persistenceGetBubble).toHaveBeenCalledWith(
            `Test Bubble Uuid`
          ));
        it(`does not record a first event`, () =>
          expect(persistenceRecordFirstEvent).not.toHaveBeenCalled());
        it(`does not record a subsequent event`, () =>
          expect(persistenceRecordFirstEvent).not.toHaveBeenCalled());

        it(`processes one request`, () =>
          expect(applicationRequestCallback).toHaveBeenCalledTimes(1));
        it(`uses the bubble's current state when processing requests`, () =>
          expect(applicationRequestCallback).toHaveBeenCalledWith(
            `Test Initial State`,
            jasmine.any(String),
            jasmine.any(String)
          ));
        it(`uses the session uuid when processing requests`, () =>
          expect(applicationRequestCallback).toHaveBeenCalledWith(
            jasmine.any(String),
            `Test Session Uuid`,
            jasmine.any(String)
          ));
        it(`uses the request when processing requests`, () =>
          expect(applicationRequestCallback).toHaveBeenCalledWith(
            jasmine.any(String),
            jasmine.any(String),
            `Test Request`
          ));
        it(`does not apply any events`, () =>
          expect(applicationApplyEvent).not.toHaveBeenCalled());

        it(`returns the application's response`, () =>
          expect(result).toEqual(`Test Application Response`));
      });

      describe(`when an optimistic concurrency control collision occurs`, () => {
        let persistenceInitialize: jasmine.Spy;
        let persistenceGetBubble: jasmine.Spy;
        let persistenceRecordFirstEvent: jasmine.Spy;
        let persistenceRecordSubsequentEvent: jasmine.Spy;
        let persistence: neurofoamTypes.Persistence<TestState, TestEvent>;

        let applicationRequestCallback: jasmine.Spy;
        let applicationApplyEvent: jasmine.Spy;
        let application: neurofoamTypes.Application<
          TestState,
          TestEvent,
          TestRequest
        >;

        let executableRequest: ExecutableRequest<TestRequest>;

        let result: undefined | neurofoamTypes.Json;

        beforeAll(async () => {
          persistenceInitialize = jasmine.createSpy(`persistenceInitialize`);
          persistenceGetBubble = jasmine
            .createSpy(`persistenceGetBubble`)
            .and.returnValue(
              Promise.resolve({
                currentState: `Test Current State`,
                latestEventUuid: `Test Latest Event Uuid`,
              })
            );
          persistenceRecordFirstEvent = jasmine.createSpy(
            `persistenceRecordFirstEvent`
          );
          persistenceRecordSubsequentEvent = jasmine
            .createSpy(`persistenceRecordSubsequentEvent`)
            .and.returnValue(
              Promise.resolve(`optimisticConcurrencyControlCollision`)
            );
          persistence = {
            initialize: persistenceInitialize,
            getBubble: persistenceGetBubble,
            recordFirstEvent: persistenceRecordFirstEvent,
            recordSubsequentEvent: persistenceRecordSubsequentEvent,
          };

          applicationRequestCallback = jasmine
            .createSpy(`applicationRequestCallback`)
            .and.returnValue(
              Promise.resolve({
                response: `Test Application Response`,
                event: `Test Event`,
              })
            );
          applicationApplyEvent = jasmine
            .createSpy(`applicationApplyEvent`)
            .and.returnValue(`Test Applied State`);
          application = {
            initialState: `Test Initial State`,
            requestLengthLimit: 1234,
            requestSchema: {},
            requestCallback: applicationRequestCallback,
            applyEvent: applicationApplyEvent,
          };

          executableRequest = {
            bubbleUuid: `Test Bubble Uuid`,
            sessionUuid: `Test Session Uuid`,
            request: `Test Request`,
          };

          result = await executeOnce(
            persistence,
            application,
            executableRequest
          );
        });

        it(`does not initialize persistence`, () =>
          expect(persistenceInitialize).not.toHaveBeenCalled());
        it(`gets one bubble`, () =>
          expect(persistenceGetBubble).toHaveBeenCalledTimes(1));
        it(`gets the requested bubble`, () =>
          expect(persistenceGetBubble).toHaveBeenCalledWith(
            `Test Bubble Uuid`
          ));
        it(`does not record a first event`, () =>
          expect(persistenceRecordFirstEvent).not.toHaveBeenCalled());
        it(`records one subsequent event`, () =>
          expect(persistenceRecordSubsequentEvent).toHaveBeenCalledTimes(1));
        it(`uses the bubble uuid when recording subsequent events`, () =>
          expect(persistenceRecordSubsequentEvent).toHaveBeenCalledWith(
            `Test Bubble Uuid`,
            jasmine.any(String),
            jasmine.any(String),
            jasmine.any(String),
            jasmine.any(String),
            jasmine.any(String)
          ));
        it(`uses the latest event uuid when recording subsequent events`, () =>
          expect(persistenceRecordSubsequentEvent).toHaveBeenCalledWith(
            jasmine.any(String),
            `Test Latest Event Uuid`,
            jasmine.any(String),
            jasmine.any(String),
            jasmine.any(String),
            jasmine.any(String)
          ));
        it(`uses an event uuid when recording subsequent events`, () =>
          expect(persistenceRecordSubsequentEvent).toHaveBeenCalledWith(
            jasmine.any(String),
            jasmine.any(String),
            jasmine.stringMatching(
              /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/
            ),
            jasmine.any(String),
            jasmine.any(String),
            jasmine.any(String)
          ));
        it(`does not reuse the bubble uuid as the next event uuid when recording subsequent events`, () =>
          expect(persistenceRecordSubsequentEvent).not.toHaveBeenCalledWith(
            jasmine.any(String),
            jasmine.any(String),
            `Test Bubble Uuid`,
            jasmine.any(String),
            jasmine.any(String),
            jasmine.any(String)
          ));
        it(`does not reuse the session uuid as the next event uuid when recording subsequent events`, () =>
          expect(persistenceRecordSubsequentEvent).not.toHaveBeenCalledWith(
            jasmine.any(String),
            jasmine.any(String),
            `Test Session Uuid`,
            jasmine.any(String),
            jasmine.any(String),
            jasmine.any(String)
          ));
        it(`does not reuse the latest event uuid as the next event uuid when recording subsequent events`, () => () =>
          expect(persistenceRecordSubsequentEvent).not.toHaveBeenCalledWith(
            jasmine.any(String),
            jasmine.any(String),
            `Test Latest Event Uuid`,
            jasmine.any(String),
            jasmine.any(String),
            jasmine.any(String)
          ));
        it(`uses the session uuid when recording subsequent events`, () =>
          expect(persistenceRecordSubsequentEvent).toHaveBeenCalledWith(
            jasmine.any(String),
            jasmine.any(String),
            jasmine.any(String),
            `Test Session Uuid`,
            jasmine.any(String),
            jasmine.any(String)
          ));
        it(`uses the event returned by the application when recording subsequent events`, () =>
          expect(persistenceRecordSubsequentEvent).toHaveBeenCalledWith(
            jasmine.any(String),
            jasmine.any(String),
            jasmine.any(String),
            jasmine.any(String),
            `Test Event`,
            jasmine.any(String)
          ));
        it(`uses the applied state when recording subsequent events`, () =>
          expect(persistenceRecordSubsequentEvent).toHaveBeenCalledWith(
            jasmine.any(String),
            jasmine.any(String),
            jasmine.any(String),
            jasmine.any(String),
            jasmine.any(String),
            `Test Applied State`
          ));

        it(`processes one request`, () =>
          expect(applicationRequestCallback).toHaveBeenCalledTimes(1));
        it(`uses the bubble's current state when processing requests`, () =>
          expect(applicationRequestCallback).toHaveBeenCalledWith(
            `Test Initial State`,
            jasmine.any(String),
            jasmine.any(String)
          ));
        it(`uses the session uuid when processing requests`, () =>
          expect(applicationRequestCallback).toHaveBeenCalledWith(
            jasmine.any(String),
            `Test Session Uuid`,
            jasmine.any(String)
          ));
        it(`uses the request when processing requests`, () =>
          expect(applicationRequestCallback).toHaveBeenCalledWith(
            jasmine.any(String),
            jasmine.any(String),
            `Test Request`
          ));
        it(`applies one event`, () =>
          expect(applicationApplyEvent).toHaveBeenCalledTimes(1));
        it(`uses the bubble's current state when applying events`, () =>
          expect(applicationApplyEvent).toHaveBeenCalledWith(
            `Test Current State`,
            jasmine.any(String)
          ));
        it(`uses the application's returned event when applying events`, () =>
          expect(applicationApplyEvent).toHaveBeenCalledWith(
            jasmine.any(String),
            `Test Event`
          ));

        it(`returns undefined`, () => expect(result).toBeUndefined());
      });

      describe(`when persistence succeeds`, () => {
        let persistenceInitialize: jasmine.Spy;
        let persistenceGetBubble: jasmine.Spy;
        let persistenceRecordFirstEvent: jasmine.Spy;
        let persistenceRecordSubsequentEvent: jasmine.Spy;
        let persistence: neurofoamTypes.Persistence<TestState, TestEvent>;

        let applicationRequestCallback: jasmine.Spy;
        let applicationApplyEvent: jasmine.Spy;
        let application: neurofoamTypes.Application<
          TestState,
          TestEvent,
          TestRequest
        >;

        let executableRequest: ExecutableRequest<TestRequest>;

        let result: undefined | neurofoamTypes.Json;

        beforeAll(async () => {
          persistenceInitialize = jasmine.createSpy(`persistenceInitialize`);
          persistenceGetBubble = jasmine
            .createSpy(`persistenceGetBubble`)
            .and.returnValue(
              Promise.resolve({
                currentState: `Test Current State`,
                latestEventUuid: `Test Latest Event Uuid`,
              })
            );
          persistenceRecordFirstEvent = jasmine.createSpy(
            `persistenceRecordFirstEvent`
          );
          persistenceRecordSubsequentEvent = jasmine
            .createSpy(`persistenceRecordSubsequentEvent`)
            .and.returnValue(Promise.resolve(`successful`));
          persistence = {
            initialize: persistenceInitialize,
            getBubble: persistenceGetBubble,
            recordFirstEvent: persistenceRecordFirstEvent,
            recordSubsequentEvent: persistenceRecordSubsequentEvent,
          };

          applicationRequestCallback = jasmine
            .createSpy(`applicationRequestCallback`)
            .and.returnValue(
              Promise.resolve({
                response: `Test Application Response`,
                event: `Test Event`,
              })
            );
          applicationApplyEvent = jasmine
            .createSpy(`applicationApplyEvent`)
            .and.returnValue(`Test Applied State`);
          application = {
            initialState: `Test Initial State`,
            requestLengthLimit: 1234,
            requestSchema: {},
            requestCallback: applicationRequestCallback,
            applyEvent: applicationApplyEvent,
          };

          executableRequest = {
            bubbleUuid: `Test Bubble Uuid`,
            sessionUuid: `Test Session Uuid`,
            request: `Test Request`,
          };

          result = await executeOnce(
            persistence,
            application,
            executableRequest
          );
        });

        it(`does not initialize persistence`, () =>
          expect(persistenceInitialize).not.toHaveBeenCalled());
        it(`gets one bubble`, () =>
          expect(persistenceGetBubble).toHaveBeenCalledTimes(1));
        it(`gets the requested bubble`, () =>
          expect(persistenceGetBubble).toHaveBeenCalledWith(
            `Test Bubble Uuid`
          ));
        it(`does not record a first event`, () =>
          expect(persistenceRecordFirstEvent).not.toHaveBeenCalled());
        it(`records one subsequent event`, () =>
          expect(persistenceRecordSubsequentEvent).toHaveBeenCalledTimes(1));
        it(`uses the bubble uuid when recording subsequent events`, () =>
          expect(persistenceRecordSubsequentEvent).toHaveBeenCalledWith(
            `Test Bubble Uuid`,
            jasmine.any(String),
            jasmine.any(String),
            jasmine.any(String),
            jasmine.any(String),
            jasmine.any(String)
          ));
        it(`uses the latest event uuid when recording subsequent events`, () =>
          expect(persistenceRecordSubsequentEvent).toHaveBeenCalledWith(
            jasmine.any(String),
            `Test Latest Event Uuid`,
            jasmine.any(String),
            jasmine.any(String),
            jasmine.any(String),
            jasmine.any(String)
          ));
        it(`uses an event uuid when recording subsequent events`, () =>
          expect(persistenceRecordSubsequentEvent).toHaveBeenCalledWith(
            jasmine.any(String),
            jasmine.any(String),
            jasmine.stringMatching(
              /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/
            ),
            jasmine.any(String),
            jasmine.any(String),
            jasmine.any(String)
          ));
        it(`does not reuse the bubble uuid as the next event uuid when recording subsequent events`, () =>
          expect(persistenceRecordSubsequentEvent).not.toHaveBeenCalledWith(
            jasmine.any(String),
            jasmine.any(String),
            `Test Bubble Uuid`,
            jasmine.any(String),
            jasmine.any(String),
            jasmine.any(String)
          ));
        it(`does not reuse the session uuid as the next event uuid when recording subsequent events`, () =>
          expect(persistenceRecordSubsequentEvent).not.toHaveBeenCalledWith(
            jasmine.any(String),
            jasmine.any(String),
            `Test Session Uuid`,
            jasmine.any(String),
            jasmine.any(String),
            jasmine.any(String)
          ));
        it(`does not reuse the latest event uuid as the next event uuid when recording subsequent events`, () => () =>
          expect(persistenceRecordSubsequentEvent).not.toHaveBeenCalledWith(
            jasmine.any(String),
            jasmine.any(String),
            `Test Latest Event Uuid`,
            jasmine.any(String),
            jasmine.any(String),
            jasmine.any(String)
          ));
        it(`uses the session uuid when recording subsequent events`, () =>
          expect(persistenceRecordSubsequentEvent).toHaveBeenCalledWith(
            jasmine.any(String),
            jasmine.any(String),
            jasmine.any(String),
            `Test Session Uuid`,
            jasmine.any(String),
            jasmine.any(String)
          ));
        it(`uses the event returned by the application when recording subsequent events`, () =>
          expect(persistenceRecordSubsequentEvent).toHaveBeenCalledWith(
            jasmine.any(String),
            jasmine.any(String),
            jasmine.any(String),
            jasmine.any(String),
            `Test Event`,
            jasmine.any(String)
          ));
        it(`uses the applied state when recording subsequent events`, () =>
          expect(persistenceRecordSubsequentEvent).toHaveBeenCalledWith(
            jasmine.any(String),
            jasmine.any(String),
            jasmine.any(String),
            jasmine.any(String),
            jasmine.any(String),
            `Test Applied State`
          ));

        it(`processes one request`, () =>
          expect(applicationRequestCallback).toHaveBeenCalledTimes(1));
        it(`uses the bubble's current state when processing requests`, () =>
          expect(applicationRequestCallback).toHaveBeenCalledWith(
            `Test Initial State`,
            jasmine.any(String),
            jasmine.any(String)
          ));
        it(`uses the session uuid when processing requests`, () =>
          expect(applicationRequestCallback).toHaveBeenCalledWith(
            jasmine.any(String),
            `Test Session Uuid`,
            jasmine.any(String)
          ));
        it(`uses the request when processing requests`, () =>
          expect(applicationRequestCallback).toHaveBeenCalledWith(
            jasmine.any(String),
            jasmine.any(String),
            `Test Request`
          ));
        it(`applies one event`, () =>
          expect(applicationApplyEvent).toHaveBeenCalledTimes(1));
        it(`uses the bubble's current state when applying events`, () =>
          expect(applicationApplyEvent).toHaveBeenCalledWith(
            `Test Current State`,
            jasmine.any(String)
          ));
        it(`uses the application's returned event when applying events`, () =>
          expect(applicationApplyEvent).toHaveBeenCalledWith(
            jasmine.any(String),
            `Test Event`
          ));

        it(`returns the application's response`, () =>
          expect(result).toEqual(`Test Application Response`));
      });
    });
  });
});
