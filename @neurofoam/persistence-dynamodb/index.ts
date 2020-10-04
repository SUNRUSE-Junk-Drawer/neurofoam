import * as awsSdk from "aws-sdk";
import * as neurofoamTypes from "@neurofoam/types";
import TableSettings from "./table-settings";
import BubbleTableSettings from "./bubble-table-settings";
import EventTableSettings from "./event-table-settings";

export default class<
  TState extends neurofoamTypes.Json,
  TEvent extends neurofoamTypes.Json
> implements neurofoamTypes.Persistence<TState, TEvent> {
  constructor(
    private readonly clientConfiguration: awsSdk.DynamoDB.ClientConfiguration,
    private readonly bubbleTableSettings: BubbleTableSettings,
    private readonly eventTableSettings: EventTableSettings
  ) {}

  private convertTableSettings(
    tableSettings: TableSettings,
    keyNames: ReadonlyArray<string>,
    attributeDefinitions: awsSdk.DynamoDB.AttributeDefinitions
  ): awsSdk.DynamoDB.CreateTableInput {
    return {
      AttributeDefinitions: attributeDefinitions,
      TableName: tableSettings.tableName,
      KeySchema: keyNames.map((keyName) => ({
        AttributeName: keyName,
        KeyType: `HASH`,
      })),
      BillingMode:
        tableSettings.billing.type === `provisioned`
          ? `PROVISIONED`
          : `PAY_PER_REQUEST`,
      ProvisionedThroughput: {
        ReadCapacityUnits:
          tableSettings.billing.type === `provisioned`
            ? tableSettings.billing.readCapacityUnits
            : 1,
        WriteCapacityUnits:
          tableSettings.billing.type === `provisioned`
            ? tableSettings.billing.writeCapacityUnits
            : 1,
      },
      SSESpecification:
        tableSettings.encryption.type === `kms`
          ? {
              Enabled: true,
              SSEType: `KMS`,
              KMSMasterKeyId: tableSettings.encryption.masterKeyId,
            }
          : undefined,
      Tags: Object.entries(tableSettings.tags).map(([key, value]) => ({
        Key: key,
        Value: value,
      })),
    };
  }

  async initialize(): Promise<void> {
    try {
      await new awsSdk.DynamoDB(this.clientConfiguration)
        .createTable(
          this.convertTableSettings(
            this.bubbleTableSettings,
            [this.bubbleTableSettings.attributeNames.bubbleUuid],
            [
              {
                AttributeName: this.bubbleTableSettings.attributeNames
                  .bubbleUuid,
                AttributeType: `B`,
              },
            ]
          )
        )
        .promise();
    } catch (e) {
      if (e.code !== `ResourceInUseException`) {
        throw e;
      }
    }

    try {
      await new awsSdk.DynamoDB(this.clientConfiguration)
        .createTable(
          this.convertTableSettings(
            this.eventTableSettings,
            [this.eventTableSettings.attributeNames.eventUuid],
            [
              {
                AttributeName: this.eventTableSettings.attributeNames.eventUuid,
                AttributeType: `B`,
              },
            ]
          )
        )
        .promise();
    } catch (e) {
      if (e.code !== `ResourceInUseException`) {
        throw e;
      }
    }
  }

  async getBubble(
    bubbleUuid: string
  ): Promise<null | {
    readonly currentState: TState;
    readonly latestEventUuid: string;
  }> {
    const item = await new awsSdk.DynamoDB(this.clientConfiguration)
      .getItem({
        TableName: this.bubbleTableSettings.tableName,
        Key: {
          [this.bubbleTableSettings.attributeNames.bubbleUuid]: {
            B: Buffer.from(bubbleUuid.replace(/-/g, ``), `hex`),
          },
        },
        ConsistentRead: true,
        ProjectionExpression: `#currentStateJson, #latestEventUuid`,
        ExpressionAttributeNames: {
          "#currentStateJson": this.bubbleTableSettings.attributeNames
            .currentStateJson,
          "#latestEventUuid": this.bubbleTableSettings.attributeNames
            .latestEventUuid,
        },
      })
      .promise();

    if (item.Item === undefined) {
      return null;
    }

    const currentStateJson =
      item.Item[this.bubbleTableSettings.attributeNames.currentStateJson].S;

    // As far as I am aware this cannot happen unless the database has been tampered with.
    /* istanbul ignore next */
    if (currentStateJson === undefined) {
      return null;
    }

    const currentState = JSON.parse(currentStateJson);

    const latestEventUuidBuffer =
      item.Item[this.bubbleTableSettings.attributeNames.latestEventUuid].B;

    // As far as I am aware this cannot happen unless the database has been tampered with.
    /* istanbul ignore next */
    if (!(latestEventUuidBuffer instanceof Buffer)) {
      return null;
    }

    const latestEventUuidHex = latestEventUuidBuffer.toString(`hex`);
    const latestEventUuid = `${latestEventUuidHex.slice(
      0,
      8
    )}-${latestEventUuidHex.slice(8, 12)}-${latestEventUuidHex.slice(
      12,
      16
    )}-${latestEventUuidHex.slice(16, 20)}-${latestEventUuidHex.slice(20)}`;

    return {
      currentState,
      latestEventUuid,
    };
  }

  async recordFirstEvent(
    bubbleUuid: string,
    eventUuid: string,
    sessionUuid: string,
    event: TEvent,
    resultingState: TState
  ): Promise<neurofoamTypes.PersistenceResult> {
    await new awsSdk.DynamoDB(this.clientConfiguration)
      .putItem({
        TableName: this.eventTableSettings.tableName,
        Item: {
          [this.eventTableSettings.attributeNames.eventUuid]: {
            B: Buffer.from(eventUuid.replace(/-/g, ``), `hex`),
          },
          [this.eventTableSettings.attributeNames.bubbleUuid]: {
            B: Buffer.from(bubbleUuid.replace(/-/g, ``), `hex`),
          },
          [this.eventTableSettings.attributeNames.sessionUuid]: {
            B: Buffer.from(sessionUuid.replace(/-/g, ``), `hex`),
          },
          [this.eventTableSettings.attributeNames.eventJson]: {
            S: JSON.stringify(event),
          },
          [this.eventTableSettings.attributeNames.recorded]: {
            N: `${Date.now()}`,
          },
        },
      })
      .promise();

    try {
      await new awsSdk.DynamoDB(this.clientConfiguration)
        .putItem({
          TableName: this.bubbleTableSettings.tableName,
          Item: {
            [this.bubbleTableSettings.attributeNames.bubbleUuid]: {
              B: Buffer.from(bubbleUuid.replace(/-/g, ``), `hex`),
            },
            [this.bubbleTableSettings.attributeNames.currentStateJson]: {
              S: JSON.stringify(resultingState),
            },
            [this.bubbleTableSettings.attributeNames.latestEventUuid]: {
              B: Buffer.from(eventUuid.replace(/-/g, ``), `hex`),
            },
          },
          ConditionExpression: `attribute_not_exists(#bubbleUuid)`,
          ExpressionAttributeNames: {
            "#bubbleUuid": this.bubbleTableSettings.attributeNames.bubbleUuid,
          },
        })
        .promise();
    } catch (e) {
      // This could fail, but at worst, leaves behind an orphaned event record; wastes disk space but has no other adverse effects.
      await new awsSdk.DynamoDB(this.clientConfiguration)
        .deleteItem({
          TableName: this.eventTableSettings.tableName,
          Key: {
            [this.eventTableSettings.attributeNames.eventUuid]: {
              B: Buffer.from(eventUuid.replace(/-/g, ``), `hex`),
            },
          },
        })
        .promise();

      if (e.code === `ConditionalCheckFailedException`) {
        return `optimisticConcurrencyControlCollision`;
      } else {
        throw e;
      }
    }

    return `successful`;
  }

  async recordSubsequentEvent(
    bubbleUuid: string,
    previousEventUuid: string,
    nextEventUuid: string,
    sessionUuid: string,
    event: TEvent,
    resultingState: TState
  ): Promise<neurofoamTypes.PersistenceResult> {
    await new awsSdk.DynamoDB(this.clientConfiguration)
      .putItem({
        TableName: this.eventTableSettings.tableName,
        Item: {
          [this.eventTableSettings.attributeNames.eventUuid]: {
            B: Buffer.from(nextEventUuid.replace(/-/g, ``), `hex`),
          },
          [this.eventTableSettings.attributeNames.previousEventUuid]: {
            B: Buffer.from(previousEventUuid.replace(/-/g, ``), `hex`),
          },
          [this.eventTableSettings.attributeNames.bubbleUuid]: {
            B: Buffer.from(bubbleUuid.replace(/-/g, ``), `hex`),
          },
          [this.eventTableSettings.attributeNames.sessionUuid]: {
            B: Buffer.from(sessionUuid.replace(/-/g, ``), `hex`),
          },
          [this.eventTableSettings.attributeNames.eventJson]: {
            S: JSON.stringify(event),
          },
          [this.eventTableSettings.attributeNames.recorded]: {
            N: `${Date.now()}`,
          },
        },
      })
      .promise();

    try {
      await new awsSdk.DynamoDB(this.clientConfiguration)
        .putItem({
          TableName: this.bubbleTableSettings.tableName,
          Item: {
            [this.bubbleTableSettings.attributeNames.bubbleUuid]: {
              B: Buffer.from(bubbleUuid.replace(/-/g, ``), `hex`),
            },
            [this.bubbleTableSettings.attributeNames.currentStateJson]: {
              S: JSON.stringify(resultingState),
            },
            [this.bubbleTableSettings.attributeNames.latestEventUuid]: {
              B: Buffer.from(nextEventUuid.replace(/-/g, ``), `hex`),
            },
          },
          ConditionExpression: `#latestEventUuid = :latestEventUuid`,
          ExpressionAttributeNames: {
            "#latestEventUuid": this.bubbleTableSettings.attributeNames
              .latestEventUuid,
          },
          ExpressionAttributeValues: {
            ":latestEventUuid": {
              B: Buffer.from(previousEventUuid.replace(/-/g, ``), `hex`),
            },
          },
        })
        .promise();
    } catch (e) {
      // This could fail, but at worst, leaves behind an orphaned event record; wastes disk space but has no other adverse effects.
      await new awsSdk.DynamoDB(this.clientConfiguration)
        .deleteItem({
          TableName: this.eventTableSettings.tableName,
          Key: {
            [this.eventTableSettings.attributeNames.eventUuid]: {
              B: Buffer.from(nextEventUuid.replace(/-/g, ``), `hex`),
            },
          },
        })
        .promise();

      if (e.code === `ConditionalCheckFailedException`) {
        return `optimisticConcurrencyControlCollision`;
      } else {
        throw e;
      }
    }

    return `successful`;
  }
}
