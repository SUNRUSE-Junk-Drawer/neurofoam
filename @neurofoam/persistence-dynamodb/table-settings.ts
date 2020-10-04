type BillingSettings =
  | {
      readonly type: `payPerRequest`;
    }
  | {
      readonly type: `provisioned`;
      readonly readCapacityUnits: number;
      readonly writeCapacityUnits: number;
    };

type EncryptionSettings =
  | {
      readonly type: `none`;
    }
  | {
      readonly type: `kms`;
      readonly masterKeyId: string;
    };

export type TableSettings = {
  readonly tableName: string;
  readonly billing: BillingSettings;
  readonly encryption: EncryptionSettings;
  readonly tags: { readonly [key: string]: string };
};
