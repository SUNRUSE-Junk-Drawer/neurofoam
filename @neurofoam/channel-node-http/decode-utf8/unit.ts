import { decodeUtf8 } from ".";

describe(`@neurofoam/channel-node-http`, () => {
  describe(`decodeUtf8`, () => {
    function accepts(input: Buffer, output: string): void {
      describe(`given ${input.toString(`hex`)}`, () => {
        it(`returns ${JSON.stringify(output)}`, () =>
          expect(decodeUtf8(input)).toEqual(output));
      });
    }

    function rejects(input: Buffer): void {
      describe(`given ${input.toString(`hex`)}`, () => {
        it(`returns null`, () => expect(decodeUtf8(input)).toBeNull());
      });
    }

    accepts(Buffer.from([]), ``);
    accepts(
      Buffer.from([
        0x48,
        0x65,
        0x6c,
        0x6c,
        0x6f,
        0x20,
        0x77,
        0x6f,
        0x72,
        0x6c,
        0x64,
        0x2e,
        0x20,
        0x20,
        0xe3,
        0x81,
        0x82,
        0x2c,
        0x20,
        0xf0,
        0xa9,
        0xb8,
        0xbd,
        0x2c,
        0x20,
        0xc2,
        0xa7,
        0x2e,
      ]),
      `Hello world.  あ, 𩸽, §.`
    );
    rejects(
      Buffer.from([
        0x48,
        0x65,
        0x6c,
        0x6c,
        0x6f,
        0x20,
        0xff,
        0x20,
        0x77,
        0x6f,
        0x72,
        0x6c,
        0x64,
      ])
    );
    rejects(
      Buffer.from([0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x20, 0xf0, 0xa9, 0xb8])
    );
    rejects(Buffer.from([0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x20, 0xe3, 0x81]));
    rejects(Buffer.from([0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x20, 0xc2]));
  });
});
