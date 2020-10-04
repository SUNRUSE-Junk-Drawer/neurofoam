import { isContentTypeHeaderValid } from ".";

describe(`@neurofoam/channel-node-http`, () => {
  describe(`isContentTypeHeaderValid`, () => {
    function accepts(accept: undefined | string): void {
      it(`accepts "${accept}"`, () =>
        expect(isContentTypeHeaderValid(accept)).toBeTrue());
    }

    function rejects(accept: undefined | string): void {
      it(`rejects "${accept}"`, () =>
        expect(isContentTypeHeaderValid(accept)).toBeFalse());
    }

    accepts(undefined);
    accepts(``);
    accepts(`     `);
    accepts(`appLICation/JSon`);
    accepts(`   appLICation   /   JSon   `);
    accepts(`appLICation/JSon;charSET=uTF-8`);
    accepts(`   appLICation   /   JSon    ;     charSET =  uTF-8  `);

    rejects(`iMAGE/JSon`);
    rejects(`appLICation/Xml`);
    rejects(`iMAGE/JSon;charSET=uTF-8`);
    rejects(`appLICation/Xml;charSET=uTF-8`);
    rejects(`appLICation/JSon;notcharSET=uTF-8`);
    rejects(`appLICation/JSon;charSET=aNYTHINGelse`);
    rejects(`appLICation/JSon;charSET=aNYTHING-eLSe`);
  });
});
