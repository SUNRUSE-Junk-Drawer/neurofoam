import * as neurofoamTypes from "@neurofoam/types";
import { ExecutableRequest } from "../executable-request";
import { executeUntilSuccessful } from ".";

type TestState = `Test Initial State` | `Test Applied State`;

type TestEvent = `Test Event`;

type TestRequest = `Test Request`;

describe(`@neurofoam/orchestrator`, () => {
  describe(`executeUntilSuccessful`, () => {
    describe(`when the first attempt succeeds`, () => {
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

        result = await executeUntilSuccessful(
          persistence,
          application,
          executableRequest
        );
      });

      it(`does not initialize persistence`, () =>
        expect(persistenceInitialize).not.toHaveBeenCalled());
      it(`gets one bubble`, () =>
        expect(persistenceGetBubble).toHaveBeenCalledTimes(1));
      it(`records one first event`, () =>
        expect(persistenceRecordFirstEvent).toHaveBeenCalledTimes(1));
      it(`does not record a subsequent event`, () =>
        expect(persistenceRecordSubsequentEvent).not.toHaveBeenCalled());

      it(`processes one request`, () =>
        expect(applicationRequestCallback).toHaveBeenCalledTimes(1));
      it(`applies one event`, () =>
        expect(applicationApplyEvent).toHaveBeenCalledTimes(1));

      it(`returns the application's response`, () =>
        expect(result).toEqual(`Test Application Response`));
    });

    describe(`when the second attempt succeeds`, () => {
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
          .and.returnValues(
            Promise.resolve(`optimisticConcurrencyControlCollision`),
            Promise.resolve(`successful`)
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

        result = await executeUntilSuccessful(
          persistence,
          application,
          executableRequest
        );
      });

      it(`does not initialize persistence`, () =>
        expect(persistenceInitialize).not.toHaveBeenCalled());
      it(`gets two bubbles`, () =>
        expect(persistenceGetBubble).toHaveBeenCalledTimes(2));
      it(`records two first events`, () =>
        expect(persistenceRecordFirstEvent).toHaveBeenCalledTimes(2));
      it(`does not record a subsequent event`, () =>
        expect(persistenceRecordSubsequentEvent).not.toHaveBeenCalled());

      it(`processes two requests`, () =>
        expect(applicationRequestCallback).toHaveBeenCalledTimes(2));
      it(`applies two events`, () =>
        expect(applicationApplyEvent).toHaveBeenCalledTimes(2));

      it(`returns the application's response`, () =>
        expect(result).toEqual(`Test Application Response`));
    });

    describe(`when the third attempt succeeds`, () => {
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
          .and.returnValues(
            Promise.resolve(`optimisticConcurrencyControlCollision`),
            Promise.resolve(`optimisticConcurrencyControlCollision`),
            Promise.resolve(`successful`)
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

        result = await executeUntilSuccessful(
          persistence,
          application,
          executableRequest
        );
      });

      it(`does not initialize persistence`, () =>
        expect(persistenceInitialize).not.toHaveBeenCalled());
      it(`gets two bubbles`, () =>
        expect(persistenceGetBubble).toHaveBeenCalledTimes(3));
      it(`records two first events`, () =>
        expect(persistenceRecordFirstEvent).toHaveBeenCalledTimes(3));
      it(`does not record a subsequent event`, () =>
        expect(persistenceRecordSubsequentEvent).not.toHaveBeenCalled());

      it(`processes two requests`, () =>
        expect(applicationRequestCallback).toHaveBeenCalledTimes(3));
      it(`applies two events`, () =>
        expect(applicationApplyEvent).toHaveBeenCalledTimes(3));

      it(`returns the application's response`, () =>
        expect(result).toEqual(`Test Application Response`));
    });
  });
});
