// These modules export only types, so include them in a test file just to get
// the coverage.
import "./table-settings"
import "./bubble-table-settings"
import "./event-table-settings"

import * as childProcess from "child_process"
import * as awsSdk from "aws-sdk"
import * as localDynamo from "local-dynamo"
import * as neurofoamTypes from "@neurofoam/types"
import BubbleTableSettings from "./bubble-table-settings"
import EventTableSettings from "./event-table-settings"
import NeurofoamPersistenceDynamoDb from "."

describe(`@neurofoam/persistence-dynamodb`, () => {
  describe(`index`, () => {
    type TestState = { readonly stateValue: string }
    type TestEvent = { readonly eventValue: string }

    function dynamoDbSettings(port: number): awsSdk.DynamoDB.ClientConfiguration {
      return {
        credentials: new awsSdk.Credentials(`Test Access Key Id`, `Test Secret Access Key`),
        endpoint: `http://localhost:${port}`,
        region: `local`,
      }
    }

    const bubbleTableSettings: BubbleTableSettings = {
      tableName: `Test-Bubble-Table-Name`,
      attributeNames: {
        bubbleUuid: `Test-Bubble-Table-Bubble-Uuid-Attribute-Name`,
        currentStateJson: `Test-Bubble-Table-Current-State-Json-Attribute-Name`,
        latestEventUuid: `Test-Bubble-Table-Latest-Event-Uuid-Attribute-Name`,
      },
      billing: {
        type: `provisioned`,
        readCapacityUnits: 4,
        writeCapacityUnits: 2,
      },
      encryption: {
        type: `none`,
      },
      tags: {
        testBubbleTableTagAKey: `Test Bubble Table Tag A Value`,
        testBubbleTableTagBKey: `Test Bubble Table Tag B Value`,
        testBubbleTableTagCKey: `Test Bubble Table Tag C Value`,
      },
    }

    const eventTableSettings: EventTableSettings = {
      tableName: `Test-Event-Table-Name`,
      attributeNames: {
        eventUuid: `Test-Event-Table-Event-Uuid-Attribute-Name`,
        previousEventUuid: `Test-Event-Table-Previous-Event-Uuid-Attribute-Name`,
        bubbleUuid: `Test-Event-Table-Bubble-Uuid-Attribute-Name`,
        sessionUuid: `Test-Event-Table Session-Uuid-Attribute-Name`,
        eventJson: `Test-Event-Table-Event-Json-Attribute-Name`,
        recorded: `Test-Event-Table-Recorded-Attribute-Name`,
      },
      billing: {
        type: `payPerRequest`,
      },
      encryption: {
        type: `kms`,
        masterKeyId: `Test Event Table Master Key Id`
      },
      tags: {
        testEventTableTagAKey: `Test Event Table Tag A Value`,
        testEventTableTagBKey: `Test Event Table Tag B Value`,
        testEventTableTagCKey: `Test Event Table Tag C Value`,
      },
    }

    const newlyCreatedBubbleUuid = `c15d7a46-4ebf-48c9-ba83-773164119916`
    const updatedOnceBubbleUuid = `31ea3182-c4fe-4766-aa7c-d9bdde83c79d`
    const updatedTwiceBubbleUuid = `ac61e617-f471-48c1-a9c6-d6bff280263c`
    const twiceCreatedBubbleUuid = `9a3f9500-1190-4d90-8abd-7a6439deac60`
    const updateConflictABubbleUuid = `9b5e853c-bf3d-4ecc-93d1-47194d96073c`
    const updateConflictBBubbleUuid = `8d14d6a3-6e06-4ffa-849e-e32e11326076`
    const nonexistentBubbleUuid = `5658578f-eb0e-439f-a5bb-3ac4b945d498`
    const newlyCreatedEventUuidA = `24dd4126-f5a5-4397-9cc2-3992fe8b7e1a`
    const updatedOnceEventUuidA = `050334ed-84b5-476b-b9fd-015a9ce13b73`
    const updatedOnceEventUuidB = `e9cc2deb-2d63-43d0-92c1-34d3d63fb9a5`
    const updatedTwiceEventUuidA = `6625814d-b3eb-4574-82be-137f402782f5`
    const updatedTwiceEventUuidB = `4a24e639-97ad-441c-998a-b2c0ffe262c8`
    const updatedTwiceEventUuidC = `18c2cbf8-ca84-4619-846d-f588411be15c`
    const twiceCreatedEventUuidA = `4197bccc-564c-41ce-9769-bc83013892fb`
    const updateConflictAEventUuidA = `c94e4e91-fc5c-4664-96ca-9a27f53bdaaf`
    const updateConflictAEventUuidB = `2e240aa5-863b-4aa6-b340-931f5ada4c26`
    const updateConflictAEventUuidC = `46abd2a4-4124-4dd5-aa44-0e2301ff6750`
    const updateConflictBEventUuidA = `1ef07597-ac19-485e-9849-557eb3e08041`
    const updateConflictBEventUuidB = `62e26cfa-5615-45ba-b924-25df9d58ddcb`
    const updateConflictBEventUuidC = `3f0b5411-c7e8-4392-8bad-b9f217635219`
    const updateConflictBEventUuidD = `e5b574b1-e27c-48f3-b8d4-03a58ff1a0c8`
    const sessionUuidA = `f9b3a55e-ebb8-4700-b9c5-f6be117927a5`
    const sessionUuidB = `a4a61cc2-04c1-4afa-b280-6d1a61880d2c`
    const sessionUuidC = `9408ded9-abc8-4124-b774-2f8d911f4781`
    const sessionUuidD = `253ddf15-f29d-4e81-bd3a-a119bc35cb63`
    const sessionUuidE = `e5543fa5-8d9d-46ff-ada9-574d006b1e5e`
    const sessionUuidF = `227cd8f1-0de0-443f-860a-599faa5ac2d5`
    const sessionUuidG = `98e6cfd0-6d7b-4dad-9850-0dba79cfe849`
    const sessionUuidH = `db513b60-8b94-4da3-acf1-e39d4ced62b6`
    const sessionUuidI = `eb1379da-5b2d-4da0-ad7f-0a927e701006`
    const sessionUuidJ = `3a9b192b-2dc5-4c1a-a280-edfa3385ad42`
    const sessionUuidK = `3e3616c4-4d82-4e06-92bc-7364f808d8e3`
    const sessionUuidL = `e5f594bc-5c89-424f-af19-56939f3f8994`
    const sessionUuidM = `8fc9b083-bd59-4325-9e04-9e7874e01ef2`
    const sessionUuidN = `d8e12cdb-f2fb-4cee-a6a6-b316c24e65d0`
    const sessionUuidO = `29228de6-09d3-498d-a2f6-805450d19128`

    describe(`when the bubble table cannot be created`, () => {
      let dynamoDbProcess: childProcess.ChildProcess
      let instance: NeurofoamPersistenceDynamoDb<TestState, TestEvent>

      beforeAll(async () => {
        dynamoDbProcess = localDynamo.launch({
          port: 61341,
        })

        instance = new NeurofoamPersistenceDynamoDb<TestState, TestEvent>(dynamoDbSettings(61341), {
          tableName: `BT`,
          attributeNames: {
            bubbleUuid: `Test-Bubble-Table-Bubble-Uuid-Attribute-Name`,
            currentStateJson: `Test-Bubble-Table-Current-State-Json-Attribute-Name`,
            latestEventUuid: `Test-Bubble-Table-Latest-Event-Uuid-Attribute-Name`,
          },
          billing: {
            type: `provisioned`,
            readCapacityUnits: 4,
            writeCapacityUnits: 2,
          },
          encryption: {
            type: `none`,
          },
          tags: {
            testBubbleTableTagAKey: `Test Bubble Table Tag A Value`,
            testBubbleTableTagBKey: `Test Bubble Table Tag B Value`,
            testBubbleTableTagCKey: `Test Bubble Table Tag C Value`,
          },
        }, eventTableSettings)
      }, 20000)

      afterAll(async () => {
        dynamoDbProcess.kill()
        await new Promise(resolve => dynamoDbProcess.on(`exit`, resolve))
      })

      it(`rejects as expected`, () => expectAsync(instance.initialize()).toBeRejectedWithError(`Invalid table/index name.  Table/index names must be between 3 and 255 characters long, and may contain only the characters a-z, A-Z, 0-9, '_', '-', and '.'`))
    })

    describe(`when the event table cannot be created`, () => {
      let dynamoDbProcess: childProcess.ChildProcess
      let instance: NeurofoamPersistenceDynamoDb<TestState, TestEvent>

      beforeAll(async () => {
        dynamoDbProcess = localDynamo.launch({
          port: 61342,
        })

        instance = new NeurofoamPersistenceDynamoDb<TestState, TestEvent>(dynamoDbSettings(61342), bubbleTableSettings, {
          tableName: `ET`,
          attributeNames: {
            eventUuid: `Test-Event-Table-Event-Uuid-Attribute-Name`,
            previousEventUuid: `Test-Event-Table-Previous-Event-Uuid-Attribute-Name`,
            bubbleUuid: `Test-Event-Table-Bubble-Uuid-Attribute-Name`,
            sessionUuid: `Test-Event-Table Session-Uuid-Attribute-Name`,
            eventJson: `Test-Event-Table-Event-Json-Attribute-Name`,
            recorded: `Test-Event-Table-Recorded-Attribute-Name`,
          },
          billing: {
            type: `payPerRequest`,
          },
          encryption: {
            type: `kms`,
            masterKeyId: `Test Event Table Master Key Id`
          },
          tags: {
            testEventTableTagAKey: `Test Event Table Tag A Value`,
            testEventTableTagBKey: `Test Event Table Tag B Value`,
            testEventTableTagCKey: `Test Event Table Tag C Value`,
          },
        })
      }, 20000)

      afterAll(async () => {
        dynamoDbProcess.kill()
        await new Promise(resolve => dynamoDbProcess.on(`exit`, resolve))
      })

      it(`rejects as expected`, () => expectAsync(instance.initialize()).toBeRejectedWithError(`Invalid table/index name.  Table/index names must be between 3 and 255 characters long, and may contain only the characters a-z, A-Z, 0-9, '_', '-', and '.'`))
    })

    describe(`when the bubble table exists but not the event table`, () => {
      let dynamoDbProcess: childProcess.ChildProcess
      let instance: NeurofoamPersistenceDynamoDb<TestState, TestEvent>

      beforeAll(async () => {
        dynamoDbProcess = localDynamo.launch({
          port: 61343,
        })

        const previousInstance = new NeurofoamPersistenceDynamoDb<TestState, TestEvent>(dynamoDbSettings(61343), bubbleTableSettings, {
          tableName: `ET`,
          attributeNames: {
            eventUuid: `Test-Event-Table-Event-Uuid-Attribute-Name`,
            previousEventUuid: `Test-Event-Table-Previous-Event-Uuid-Attribute-Name`,
            bubbleUuid: `Test-Event-Table-Bubble-Uuid-Attribute-Name`,
            sessionUuid: `Test-Event-Table Session-Uuid-Attribute-Name`,
            eventJson: `Test-Event-Table-Event-Json-Attribute-Name`,
            recorded: `Test-Event-Table-Recorded-Attribute-Name`,
          },
          billing: {
            type: `payPerRequest`,
          },
          encryption: {
            type: `kms`,
            masterKeyId: `Test Event Table Master Key Id`
          },
          tags: {
            testEventTableTagAKey: `Test Event Table Tag A Value`,
            testEventTableTagBKey: `Test Event Table Tag B Value`,
            testEventTableTagCKey: `Test Event Table Tag C Value`,
          },
        })

        try {
          await previousInstance.initialize()
        } catch (e) { }

        instance = new NeurofoamPersistenceDynamoDb<TestState, TestEvent>(dynamoDbSettings(61343), bubbleTableSettings, eventTableSettings)

        await instance.initialize()
      }, 20000)

      afterAll(async () => {
        dynamoDbProcess.kill()
        await new Promise(resolve => dynamoDbProcess.on(`exit`, resolve))
      })

      it(
        `does not modify the bubble table`,
        async () => expect(await new awsSdk.DynamoDB(dynamoDbSettings(61343)).describeTable({ TableName: `Test-Bubble-Table-Name` }).promise())
          .toEqual({
            Table: {
              AttributeDefinitions: [
                {
                  AttributeName: `Test-Bubble-Table-Bubble-Uuid-Attribute-Name`,
                  AttributeType: `B`,
                },
              ],
              TableName: `Test-Bubble-Table-Name`,
              KeySchema: [
                {
                  AttributeName: `Test-Bubble-Table-Bubble-Uuid-Attribute-Name`,
                  KeyType: `HASH`,
                },
              ],
              TableStatus: `ACTIVE`,
              CreationDateTime: jasmine.any(Date),
              ProvisionedThroughput: {
                LastIncreaseDateTime: jasmine.any(Date),
                LastDecreaseDateTime: jasmine.any(Date),
                NumberOfDecreasesToday: jasmine.any(Number),
                "ReadCapacityUnits": 4,
                "WriteCapacityUnits": 2,
              },
              TableSizeBytes: jasmine.any(Number),
              ItemCount: jasmine.any(Number),
              TableArn: jasmine.any(String),
            },
          } as any)
      )

      it(
        `creates the event table as per settings`,
        async () => expect(await new awsSdk.DynamoDB(dynamoDbSettings(61343)).describeTable({ TableName: `Test-Event-Table-Name` }).promise())
          .toEqual({
            Table: {
              AttributeDefinitions: [
                {
                  AttributeName: `Test-Event-Table-Event-Uuid-Attribute-Name`,
                  AttributeType: `B`,
                },
              ],
              TableName: `Test-Event-Table-Name`,
              KeySchema: [
                {
                  AttributeName: `Test-Event-Table-Event-Uuid-Attribute-Name`,
                  KeyType: `HASH`,
                },
              ],
              TableStatus: `ACTIVE`,
              CreationDateTime: jasmine.any(Date),
              ProvisionedThroughput: {
                LastIncreaseDateTime: jasmine.any(Date),
                LastDecreaseDateTime: jasmine.any(Date),
                NumberOfDecreasesToday: jasmine.any(Number),
                "ReadCapacityUnits": 1,
                "WriteCapacityUnits": 1,
              },
              TableSizeBytes: jasmine.any(Number),
              ItemCount: jasmine.any(Number),
              TableArn: jasmine.any(String),
            },
          } as any)
      )
    })

    describe(`when the database is used correctly`, () => {
      let dynamoDbProcess: childProcess.ChildProcess
      let instance: NeurofoamPersistenceDynamoDb<TestState, TestEvent>

      let resultOfCreatingBubble: neurofoamTypes.PersistenceResult
      let resultOfUpdatingBubbleOnce: neurofoamTypes.PersistenceResult
      let resultOfUpdatingBubbleTwice: neurofoamTypes.PersistenceResult
      let resultOfCreatingBubbleTwice: neurofoamTypes.PersistenceResult
      let resultOfUpdateConflictA: neurofoamTypes.PersistenceResult
      let resultOfUpdateConflictB: neurofoamTypes.PersistenceResult

      beforeAll(async () => {
        dynamoDbProcess = localDynamo.launch({
          port: 61344,
        })

        instance = new NeurofoamPersistenceDynamoDb<TestState, TestEvent>(dynamoDbSettings(61344), bubbleTableSettings, eventTableSettings)

        await instance.initialize()

        resultOfCreatingBubble = await instance.recordFirstEvent(newlyCreatedBubbleUuid, newlyCreatedEventUuidA, sessionUuidA, { eventValue: `Test Event Value A` }, { stateValue: `Test State Value A` })

        await instance.recordFirstEvent(updatedOnceBubbleUuid, updatedOnceEventUuidA, sessionUuidB, { eventValue: `Test Event Value B` }, { stateValue: `Test State Value B` })
        resultOfUpdatingBubbleOnce = await instance.recordSubsequentEvent(updatedOnceBubbleUuid, updatedOnceEventUuidA, updatedOnceEventUuidB, sessionUuidC, { eventValue: `Test Event Value C` }, { stateValue: `Test State Value C` })

        await instance.recordFirstEvent(updatedTwiceBubbleUuid, updatedTwiceEventUuidA, sessionUuidD, { eventValue: `Test Event Value D` }, { stateValue: `Test State Value D` })
        await instance.recordSubsequentEvent(updatedTwiceBubbleUuid, updatedTwiceEventUuidA, updatedTwiceEventUuidB, sessionUuidE, { eventValue: `Test Event Value E` }, { stateValue: `Test State Value E` })
        resultOfUpdatingBubbleTwice = await instance.recordSubsequentEvent(updatedTwiceBubbleUuid, updatedTwiceEventUuidB, updatedTwiceEventUuidC, sessionUuidF, { eventValue: `Test Event Value F` }, { stateValue: `Test State Value F` })

        await instance.recordFirstEvent(twiceCreatedBubbleUuid, twiceCreatedEventUuidA, sessionUuidG, { eventValue: `Test Event Value G` }, { stateValue: `Test State Value G` })
        resultOfCreatingBubbleTwice = await instance.recordFirstEvent(twiceCreatedBubbleUuid, twiceCreatedEventUuidA, sessionUuidH, { eventValue: `Test Event Value H` }, { stateValue: `Test State Value H` })

        await instance.recordFirstEvent(updateConflictABubbleUuid, updateConflictAEventUuidA, sessionUuidI, { eventValue: `Test Event Value I` }, { stateValue: `Test State Value I` })
        await instance.recordSubsequentEvent(updateConflictABubbleUuid, updateConflictAEventUuidA, updateConflictAEventUuidB, sessionUuidJ, { eventValue: `Test Event Value J` }, { stateValue: `Test State Value J` })
        resultOfUpdateConflictA = await instance.recordSubsequentEvent(updateConflictABubbleUuid, updateConflictAEventUuidA, updateConflictAEventUuidC, sessionUuidK, { eventValue: `Test Event Value K` }, { stateValue: `Test State Value K` })

        await instance.recordFirstEvent(updateConflictBBubbleUuid, updateConflictBEventUuidA, sessionUuidL, { eventValue: `Test Event Value L` }, { stateValue: `Test State Value L` })
        await instance.recordSubsequentEvent(updateConflictBBubbleUuid, updateConflictBEventUuidA, updateConflictBEventUuidB, sessionUuidM, { eventValue: `Test Event Value M` }, { stateValue: `Test State Value M` })
        await instance.recordSubsequentEvent(updateConflictBBubbleUuid, updateConflictBEventUuidB, updateConflictBEventUuidC, sessionUuidN, { eventValue: `Test Event Value N` }, { stateValue: `Test State Value N` })
        resultOfUpdateConflictB = await instance.recordSubsequentEvent(updateConflictBBubbleUuid, updateConflictBEventUuidA, updateConflictBEventUuidD, sessionUuidO, { eventValue: `Test Event Value O` }, { stateValue: `Test State Value O` })
      }, 20000)

      afterAll(async () => {
        dynamoDbProcess.kill()
        await new Promise(resolve => dynamoDbProcess.on(`exit`, resolve))
      })

      it(
        `creates the bubble table as per settings`,
        async () => expect(await new awsSdk.DynamoDB(dynamoDbSettings(61344)).describeTable({ TableName: `Test-Bubble-Table-Name` }).promise())
          .toEqual({
            Table: {
              AttributeDefinitions: [
                {
                  AttributeName: `Test-Bubble-Table-Bubble-Uuid-Attribute-Name`,
                  AttributeType: `B`,
                },
              ],
              TableName: `Test-Bubble-Table-Name`,
              KeySchema: [
                {
                  AttributeName: `Test-Bubble-Table-Bubble-Uuid-Attribute-Name`,
                  KeyType: `HASH`,
                },
              ],
              TableStatus: `ACTIVE`,
              CreationDateTime: jasmine.any(Date),
              ProvisionedThroughput: {
                LastIncreaseDateTime: jasmine.any(Date),
                LastDecreaseDateTime: jasmine.any(Date),
                NumberOfDecreasesToday: jasmine.any(Number),
                "ReadCapacityUnits": 4,
                "WriteCapacityUnits": 2,
              },
              TableSizeBytes: jasmine.any(Number),
              ItemCount: jasmine.any(Number),
              TableArn: jasmine.any(String),
            },
          } as any)
      )

      it(
        `creates the event table as per settings`,
        async () => expect(await new awsSdk.DynamoDB(dynamoDbSettings(61344)).describeTable({ TableName: `Test-Event-Table-Name` }).promise())
          .toEqual({
            Table: {
              AttributeDefinitions: [
                {
                  AttributeName: `Test-Event-Table-Event-Uuid-Attribute-Name`,
                  AttributeType: `B`,
                },
              ],
              TableName: `Test-Event-Table-Name`,
              KeySchema: [
                {
                  AttributeName: `Test-Event-Table-Event-Uuid-Attribute-Name`,
                  KeyType: `HASH`,
                },
              ],
              TableStatus: `ACTIVE`,
              CreationDateTime: jasmine.any(Date),
              ProvisionedThroughput: {
                LastIncreaseDateTime: jasmine.any(Date),
                LastDecreaseDateTime: jasmine.any(Date),
                NumberOfDecreasesToday: jasmine.any(Number),
                "ReadCapacityUnits": 1,
                "WriteCapacityUnits": 1,
              },
              TableSizeBytes: jasmine.any(Number),
              ItemCount: jasmine.any(Number),
              TableArn: jasmine.any(String),
            },
          } as any)
      )

      it(`recordFirstEvent returns successful for a previously nonexistent bubble`, () => expect(resultOfCreatingBubble).toEqual(`successful`))
      it(`recordSubsequentEvent returns successful the first time`, () => expect(resultOfUpdatingBubbleOnce).toEqual(`successful`))
      it(`recordSubsequentEvent returns successful the second time`, () => expect(resultOfUpdatingBubbleTwice).toEqual(`successful`))
      it(`getBubble returns null for nonexistent bubbles`, () => expectAsync(instance.getBubble(nonexistentBubbleUuid)).toBeResolvedTo(null))
      it(`getBubble returns details for newly created bubbles`, () => expectAsync(instance.getBubble(newlyCreatedBubbleUuid)).toBeResolvedTo({
        currentState: { stateValue: `Test State Value A` },
        latestEventUuid: newlyCreatedEventUuidA,
      }))
      it(`getBubble returns details for bubbles updated once`, () => expectAsync(instance.getBubble(updatedOnceBubbleUuid)).toBeResolvedTo({
        currentState: { stateValue: `Test State Value C` },
        latestEventUuid: updatedOnceEventUuidB,
      }))
      it(`getBubble returns details for bubbles updated twice`, () => expectAsync(instance.getBubble(updatedTwiceBubbleUuid)).toBeResolvedTo({
        currentState: { stateValue: `Test State Value F` },
        latestEventUuid: updatedTwiceEventUuidC,
      }))
      it(`recordFirstEvent returns optimisticConcurrencyControlCollision should the bubble already exist`, () => expect(resultOfCreatingBubbleTwice).toEqual(`optimisticConcurrencyControlCollision`))
      it(`recordFirstEvent makes no change should the bubble already exist`, () => expectAsync(instance.getBubble(twiceCreatedBubbleUuid)).toBeResolvedTo({
        currentState: { stateValue: `Test State Value G` },
        latestEventUuid: twiceCreatedEventUuidA,
      }))
      it(`recordSubsequentEvent returns optimisticConcurrencyControlCollision should the bubble be updated once since the call to getBubble`, () => expect(resultOfUpdateConflictA).toEqual(`optimisticConcurrencyControlCollision`))
      it(`recordSubsequentEvent makes no changes should the bubble be updated once since the call to getBubble`, () => expectAsync(instance.getBubble(updateConflictABubbleUuid)).toBeResolvedTo({
        currentState: { stateValue: `Test State Value J` },
        latestEventUuid: updateConflictAEventUuidB,
      }))
      it(`recordSubsequentEvent returns optimisticConcurrencyControlCollision should the bubble be updated twice since the call to getBubble`, () => expect(resultOfUpdateConflictB).toEqual(`optimisticConcurrencyControlCollision`))
      it(`recordSubsequentEvent makes no changes should the bubble be updated twice since the call to getBubble`, () => expectAsync(instance.getBubble(updateConflictBBubbleUuid)).toBeResolvedTo({
        currentState: { stateValue: `Test State Value N` },
        latestEventUuid: updateConflictBEventUuidC,
      }))
    })

    describe(`when connecting to a previously created database `, () => {
      let dynamoDbProcess: childProcess.ChildProcess
      let instance: NeurofoamPersistenceDynamoDb<TestState, TestEvent>

      beforeAll(async () => {
        dynamoDbProcess = localDynamo.launch({
          port: 61345,
        })

        const previousInstance = new NeurofoamPersistenceDynamoDb<TestState, TestEvent>(dynamoDbSettings(61345), bubbleTableSettings, eventTableSettings)

        await previousInstance.initialize()

        await previousInstance.recordFirstEvent(newlyCreatedBubbleUuid, newlyCreatedEventUuidA, sessionUuidA, { eventValue: `Test Event Value A` }, { stateValue: `Test State Value A` })

        await previousInstance.recordFirstEvent(updatedOnceBubbleUuid, updatedOnceEventUuidA, sessionUuidB, { eventValue: `Test Event Value B` }, { stateValue: `Test State Value B` })
        await previousInstance.recordSubsequentEvent(updatedOnceBubbleUuid, updatedOnceEventUuidA, updatedOnceEventUuidB, sessionUuidC, { eventValue: `Test Event Value C` }, { stateValue: `Test State Value C` })

        await previousInstance.recordFirstEvent(updatedTwiceBubbleUuid, updatedTwiceEventUuidA, sessionUuidD, { eventValue: `Test Event Value D` }, { stateValue: `Test State Value D` })
        await previousInstance.recordSubsequentEvent(updatedTwiceBubbleUuid, updatedTwiceEventUuidA, updatedTwiceEventUuidB, sessionUuidE, { eventValue: `Test Event Value E` }, { stateValue: `Test State Value E` })
        await previousInstance.recordSubsequentEvent(updatedTwiceBubbleUuid, updatedTwiceEventUuidB, updatedTwiceEventUuidC, sessionUuidF, { eventValue: `Test Event Value F` }, { stateValue: `Test State Value F` })

        await previousInstance.recordFirstEvent(twiceCreatedBubbleUuid, twiceCreatedEventUuidA, sessionUuidG, { eventValue: `Test Event Value G` }, { stateValue: `Test State Value G` })
        await previousInstance.recordFirstEvent(twiceCreatedBubbleUuid, twiceCreatedEventUuidA, sessionUuidH, { eventValue: `Test Event Value H` }, { stateValue: `Test State Value H` })

        await previousInstance.recordFirstEvent(updateConflictABubbleUuid, updateConflictAEventUuidA, sessionUuidI, { eventValue: `Test Event Value I` }, { stateValue: `Test State Value I` })
        await previousInstance.recordSubsequentEvent(updateConflictABubbleUuid, updateConflictAEventUuidA, updateConflictAEventUuidB, sessionUuidJ, { eventValue: `Test Event Value J` }, { stateValue: `Test State Value J` })
        await previousInstance.recordSubsequentEvent(updateConflictABubbleUuid, updateConflictAEventUuidA, updateConflictAEventUuidC, sessionUuidK, { eventValue: `Test Event Value K` }, { stateValue: `Test State Value K` })

        await previousInstance.recordFirstEvent(updateConflictBBubbleUuid, updateConflictBEventUuidA, sessionUuidL, { eventValue: `Test Event Value L` }, { stateValue: `Test State Value L` })
        await previousInstance.recordSubsequentEvent(updateConflictBBubbleUuid, updateConflictBEventUuidA, updateConflictBEventUuidB, sessionUuidM, { eventValue: `Test Event Value M` }, { stateValue: `Test State Value M` })
        await previousInstance.recordSubsequentEvent(updateConflictBBubbleUuid, updateConflictBEventUuidB, updateConflictBEventUuidC, sessionUuidN, { eventValue: `Test Event Value N` }, { stateValue: `Test State Value N` })
        await previousInstance.recordSubsequentEvent(updateConflictBBubbleUuid, updateConflictBEventUuidA, updateConflictBEventUuidD, sessionUuidO, { eventValue: `Test Event Value O` }, { stateValue: `Test State Value O` })

        instance = new NeurofoamPersistenceDynamoDb<TestState, TestEvent>(dynamoDbSettings(61345), bubbleTableSettings, eventTableSettings)

        await instance.initialize()
      }, 20000)

      afterAll(async () => {
        dynamoDbProcess.kill()
        await new Promise(resolve => dynamoDbProcess.on(`exit`, resolve))
      })

      it(
        `does not modify the bubble table`,
        async () => expect(await new awsSdk.DynamoDB(dynamoDbSettings(61345)).describeTable({ TableName: `Test-Bubble-Table-Name` }).promise())
          .toEqual({
            Table: {
              AttributeDefinitions: [
                {
                  AttributeName: `Test-Bubble-Table-Bubble-Uuid-Attribute-Name`,
                  AttributeType: `B`,
                },
              ],
              TableName: `Test-Bubble-Table-Name`,
              KeySchema: [
                {
                  AttributeName: `Test-Bubble-Table-Bubble-Uuid-Attribute-Name`,
                  KeyType: `HASH`,
                },
              ],
              TableStatus: `ACTIVE`,
              CreationDateTime: jasmine.any(Date),
              ProvisionedThroughput: {
                LastIncreaseDateTime: jasmine.any(Date),
                LastDecreaseDateTime: jasmine.any(Date),
                NumberOfDecreasesToday: jasmine.any(Number),
                "ReadCapacityUnits": 4,
                "WriteCapacityUnits": 2,
              },
              TableSizeBytes: jasmine.any(Number),
              ItemCount: jasmine.any(Number),
              TableArn: jasmine.any(String),
            },
          } as any)
      )

      it(
        `does not modify the event table`,
        async () => expect(await new awsSdk.DynamoDB(dynamoDbSettings(61345)).describeTable({ TableName: `Test-Event-Table-Name` }).promise())
          .toEqual({
            Table: {
              AttributeDefinitions: [
                {
                  AttributeName: `Test-Event-Table-Event-Uuid-Attribute-Name`,
                  AttributeType: `B`,
                },
              ],
              TableName: `Test-Event-Table-Name`,
              KeySchema: [
                {
                  AttributeName: `Test-Event-Table-Event-Uuid-Attribute-Name`,
                  KeyType: `HASH`,
                },
              ],
              TableStatus: `ACTIVE`,
              CreationDateTime: jasmine.any(Date),
              ProvisionedThroughput: {
                LastIncreaseDateTime: jasmine.any(Date),
                LastDecreaseDateTime: jasmine.any(Date),
                NumberOfDecreasesToday: jasmine.any(Number),
                "ReadCapacityUnits": 1,
                "WriteCapacityUnits": 1,
              },
              TableSizeBytes: jasmine.any(Number),
              ItemCount: jasmine.any(Number),
              TableArn: jasmine.any(String),
            },
          } as any)
      )

      it(`getBubble returns null for nonexistent bubbles`, () => expectAsync(instance.getBubble(nonexistentBubbleUuid)).toBeResolvedTo(null))
      it(`getBubble returns details for newly created bubbles`, () => expectAsync(instance.getBubble(newlyCreatedBubbleUuid)).toBeResolvedTo({
        currentState: { stateValue: `Test State Value A` },
        latestEventUuid: newlyCreatedEventUuidA,
      }))
      it(`getBubble returns details for bubbles updated once`, () => expectAsync(instance.getBubble(updatedOnceBubbleUuid)).toBeResolvedTo({
        currentState: { stateValue: `Test State Value C` },
        latestEventUuid: updatedOnceEventUuidB,
      }))
      it(`getBubble returns details for bubbles updated twice`, () => expectAsync(instance.getBubble(updatedTwiceBubbleUuid)).toBeResolvedTo({
        currentState: { stateValue: `Test State Value F` },
        latestEventUuid: updatedTwiceEventUuidC,
      }))
      it(`getBubble returns details for bubbles created twice`, () => expectAsync(instance.getBubble(twiceCreatedBubbleUuid)).toBeResolvedTo({
        currentState: { stateValue: `Test State Value G` },
        latestEventUuid: twiceCreatedEventUuidA,
      }))
      it(`getBubble returns details for bubbles with conflicting updates`, () => expectAsync(instance.getBubble(updateConflictABubbleUuid)).toBeResolvedTo({
        currentState: { stateValue: `Test State Value J` },
        latestEventUuid: updateConflictAEventUuidB,
      }))
      it(`getBubble returns details for bubbles with multiple conflicting updates`, () => expectAsync(instance.getBubble(updateConflictBBubbleUuid)).toBeResolvedTo({
        currentState: { stateValue: `Test State Value N` },
        latestEventUuid: updateConflictBEventUuidC,
      }))
    })

    describe(`when an unexpected error is encountered while recording a new bubble`, () => {
      let dynamoDbProcess: childProcess.ChildProcess
      let instance: NeurofoamPersistenceDynamoDb<TestState, TestEvent>

      beforeAll(async () => {
        dynamoDbProcess = localDynamo.launch({
          port: 61346,
        })

        await new NeurofoamPersistenceDynamoDb<TestState, TestEvent>(dynamoDbSettings(61346), {
          tableName: `Test-Other-Bubble-Table-Name`,
          attributeNames: {
            bubbleUuid: `Test-Bubble-Table-Bubble-Uuid-Attribute-Name`,
            currentStateJson: `Test-Bubble-Table-Current-State-Json-Attribute-Name`,
            latestEventUuid: `Test-Bubble-Table-Latest-Event-Uuid-Attribute-Name`,
          },
          billing: {
            type: `provisioned`,
            readCapacityUnits: 4,
            writeCapacityUnits: 2,
          },
          encryption: {
            type: `none`,
          },
          tags: {
            testBubbleTableTagAKey: `Test Bubble Table Tag A Value`,
            testBubbleTableTagBKey: `Test Bubble Table Tag B Value`,
            testBubbleTableTagCKey: `Test Bubble Table Tag C Value`,
          },
        }, eventTableSettings).initialize()

        instance = new NeurofoamPersistenceDynamoDb<TestState, TestEvent>(dynamoDbSettings(61346), bubbleTableSettings, eventTableSettings)
      }, 20000)

      afterAll(async () => {
        dynamoDbProcess.kill()
        await new Promise(resolve => dynamoDbProcess.on(`exit`, resolve))
      })

      it(`rejects as expected`, () => expectAsync(instance.recordFirstEvent(`61420c90-df36-4237-85ca-661fa15c9399`, `b7a08ba5-6fca-4c99-9864-34a7cb8997c2`, `2b43a6aa-1a22-40a0-9ac5-969f01729332`, { eventValue: `Test Failing Event Value` }, { stateValue: `Test Failing State Value` })).toBeRejectedWith(jasmine.objectContaining({ code: `ResourceNotFoundException` })))
    })

    describe(`when an unexpected error is encountered while recording an update to an existing bubble`, () => {
      let dynamoDbProcess: childProcess.ChildProcess
      let instance: NeurofoamPersistenceDynamoDb<TestState, TestEvent>

      beforeAll(async () => {
        dynamoDbProcess = localDynamo.launch({
          port: 61347,
        })

        await new NeurofoamPersistenceDynamoDb<TestState, TestEvent>(dynamoDbSettings(61347), {
          tableName: `Test-Other-Bubble-Table-Name`,
          attributeNames: {
            bubbleUuid: `Test-Bubble-Table-Bubble-Uuid-Attribute-Name`,
            currentStateJson: `Test-Bubble-Table-Current-State-Json-Attribute-Name`,
            latestEventUuid: `Test-Bubble-Table-Latest-Event-Uuid-Attribute-Name`,
          },
          billing: {
            type: `provisioned`,
            readCapacityUnits: 4,
            writeCapacityUnits: 2,
          },
          encryption: {
            type: `none`,
          },
          tags: {
            testBubbleTableTagAKey: `Test Bubble Table Tag A Value`,
            testBubbleTableTagBKey: `Test Bubble Table Tag B Value`,
            testBubbleTableTagCKey: `Test Bubble Table Tag C Value`,
          },
        }, eventTableSettings).initialize()

        instance = new NeurofoamPersistenceDynamoDb<TestState, TestEvent>(dynamoDbSettings(61347), bubbleTableSettings, eventTableSettings)
      })

      afterAll(async () => {
        dynamoDbProcess.kill()
        await new Promise(resolve => dynamoDbProcess.on(`exit`, resolve))
      })

      it(`rejects as expected`, () => expectAsync(instance.recordSubsequentEvent(`61420c90-df36-4237-85ca-661fa15c9399`, `b7a08ba5-6fca-4c99-9864-34a7cb8997c2`, `2b43a6aa-1a22-40a0-9ac5-969f01729332`, `031c6390-3ab8-424f-8f02-cfba2b0d31ca`, { eventValue: `Test Failing Event Value` }, { stateValue: `Test Failing State Value` })).toBeRejectedWith(jasmine.objectContaining({ code: `ResourceNotFoundException` })))
    })
  })
})
