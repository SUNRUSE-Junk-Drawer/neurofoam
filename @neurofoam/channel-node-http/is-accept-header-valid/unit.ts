import isAcceptHeaderValid from ".";

describe(`@neurofoam/channel-node-http`, () => {
  describe(`isAcceptHeaderValid`, () => {
    function accepts(accept: undefined | string): void {
      it(`accepts "${accept}"`, () =>
        expect(isAcceptHeaderValid(accept)).toBeTrue());
    }

    function rejects(accept: undefined | string): void {
      it(`rejects "${accept}"`, () =>
        expect(isAcceptHeaderValid(accept)).toBeFalse());
    }

    accepts(undefined);
    accepts(``);
    accepts(`     `);
    accepts(`*/*`);
    accepts(`*/*;IGNOred iF pReSeNt`);
    accepts(`appLicAtion/*`);
    accepts(`appLicAtion/*;IGNOred iF pReSeNt`);
    accepts(`*/jsON`);
    accepts(`*/jsON;IGNOred iF pReSeNt`);
    accepts(`appLicAtion/jsON`);
    accepts(`appLicAtion/jsON;IGNOred iF pReSeNt`);

    accepts(
      `PRECeding/*;extrANEOUS infoRMAtion,*/misMATCHING,REJECTed/TYPes;anyThInG addITionAL,*/*,TRAILING/mismATchED,TYPes/*,*/ALsoREJECTed;ALso unNEEdED`
    );
    accepts(
      `PRECeding/*;extrANEOUS infoRMAtion,*/misMATCHING,REJECTed/TYPes;anyThInG addITionAL,*/*;IGNOred iF pReSeNt,TRAILING/mismATchED,TYPes/*,*/ALsoREJECTed;ALso unNEEdED`
    );
    accepts(
      `PRECeding/*;extrANEOUS infoRMAtion,*/misMATCHING,REJECTed/TYPes;anyThInG addITionAL,appLicAtion/*,TRAILING/mismATchED,TYPes/*,*/ALsoREJECTed;ALso unNEEdED`
    );
    accepts(
      `PRECeding/*;extrANEOUS infoRMAtion,*/misMATCHING,REJECTed/TYPes;anyThInG addITionAL,appLicAtion/*;IGNOred iF pReSeNt,TRAILING/mismATchED,TYPes/*,*/ALsoREJECTed;ALso unNEEdED`
    );
    accepts(
      `PRECeding/*;extrANEOUS infoRMAtion,*/misMATCHING,REJECTed/TYPes;anyThInG addITionAL,*/jsON,TRAILING/mismATchED,TYPes/*,*/ALsoREJECTed;ALso unNEEdED`
    );
    accepts(
      `PRECeding/*;extrANEOUS infoRMAtion,*/misMATCHING,REJECTed/TYPes;anyThInG addITionAL,*/jsON;IGNOred iF pReSeNt,TRAILING/mismATchED,TYPes/*,*/ALsoREJECTed;ALso unNEEdED`
    );
    accepts(
      `PRECeding/*;extrANEOUS infoRMAtion,*/misMATCHING,REJECTed/TYPes;anyThInG addITionAL,appLicAtion/jsON,TRAILING/mismATchED,TYPes/*,*/ALsoREJECTed;ALso unNEEdED`
    );
    accepts(
      `PRECeding/*;extrANEOUS infoRMAtion,*/misMATCHING,REJECTed/TYPes;anyThInG addITionAL,appLicAtion/jsON;IGNOred iF pReSeNt,TRAILING/mismATchED,TYPes/*,*/ALsoREJECTed;ALso unNEEdED`
    );

    accepts(
      `   PRECeding /   *   ;   extrANEOUS       infoRMAtion   ,   * /    misMATCHING     ,   REJECTed  /   TYPes  ;   anyThInG    addITionAL  ,       *             /       *                               ,   TRAILING  /   mismATchED    ,  TYPes  /  *   ,     *  /   ALsoREJECTed   ;    ALso   unNEEdED    `
    );
    accepts(
      `   PRECeding /   *   ;   extrANEOUS       infoRMAtion   ,   * /    misMATCHING     ,   REJECTed  /   TYPes  ;   anyThInG    addITionAL  ,       *             /       *  ;  IGNOred   iF   pReSeNt    ,   TRAILING  /   mismATchED    ,  TYPes  /  *   ,     *  /   ALsoREJECTed   ;    ALso   unNEEdED    `
    );
    accepts(
      `   PRECeding /   *   ;   extrANEOUS       infoRMAtion   ,   * /    misMATCHING     ,   REJECTed  /   TYPes  ;   anyThInG    addITionAL  ,       appLicAtion   /       *                               ,   TRAILING  /   mismATchED    ,  TYPes  /  *   ,     *  /   ALsoREJECTed   ;    ALso   unNEEdED    `
    );
    accepts(
      `   PRECeding /   *   ;   extrANEOUS       infoRMAtion   ,   * /    misMATCHING     ,   REJECTed  /   TYPes  ;   anyThInG    addITionAL  ,       appLicAtion   /       *  ;  IGNOred   iF   pReSeNt    ,   TRAILING  /   mismATchED    ,  TYPes  /  *   ,     *  /   ALsoREJECTed   ;    ALso   unNEEdED    `
    );
    accepts(
      `   PRECeding /   *   ;   extrANEOUS       infoRMAtion   ,   * /    misMATCHING     ,   REJECTed  /   TYPes  ;   anyThInG    addITionAL  ,       *             /    jsON                               ,   TRAILING  /   mismATchED    ,  TYPes  /  *   ,     *  /   ALsoREJECTed   ;    ALso   unNEEdED    `
    );
    accepts(
      `   PRECeding /   *   ;   extrANEOUS       infoRMAtion   ,   * /    misMATCHING     ,   REJECTed  /   TYPes  ;   anyThInG    addITionAL  ,       *             /    jsON  ;  IGNOred   iF   pReSeNt    ,   TRAILING  /   mismATchED    ,  TYPes  /  *   ,     *  /   ALsoREJECTed   ;    ALso   unNEEdED    `
    );
    accepts(
      `   PRECeding /   *   ;   extrANEOUS       infoRMAtion   ,   * /    misMATCHING     ,   REJECTed  /   TYPes  ;   anyThInG    addITionAL  ,       appLicAtion   /    jsON                               ,   TRAILING  /   mismATchED    ,  TYPes  /  *   ,     *  /   ALsoREJECTed   ;    ALso   unNEEdED    `
    );
    accepts(
      `   PRECeding /   *   ;   extrANEOUS       infoRMAtion   ,   * /    misMATCHING     ,   REJECTed  /   TYPes  ;   anyThInG    addITionAL  ,       appLicAtion   /    jsON  ;  IGNOred   iF   pReSeNt    ,   TRAILING  /   mismATchED    ,  TYPes  /  *   ,     *  /   ALsoREJECTed   ;    ALso   unNEEdED    `
    );

    rejects(`misMATCHING/jsON`);
    rejects(`misMATCHING/jsON;IGNOred iF pReSeNt`);
    rejects(`misMATCHING/*`);
    rejects(`misMATCHING/*;IGNOred iF pReSeNt`);
    rejects(`appLicAtion/misMATCHING`);
    rejects(`appLicAtion/misMATCHING;IGNOred iF pReSeNt`);
    rejects(`*/misMATCHING`);
    rejects(`*/misMATCHING;IGNOred iF pReSeNt`);
    rejects(`misMATCHING/TYpe`);
    rejects(`misMATCHING/TYpe;IGNOred iF pReSeNt`);
    rejects(
      `PRECeding/*;extrANEOUS infoRMAtion,*/misMATCHING,REJECTed/TYPes;anyThInG addITionAL,TRAILING/mismATchED,TYPes/*,*/ALsoREJECTed;ALso unNEEdED`
    );
    rejects(
      `   PRECeding /   *   ;   extrANEOUS       infoRMAtion   ,   * /    misMATCHING     ,   REJECTed  /   TYPes  ;   anyThInG    addITionAL  ,    TRAILING  /   mismATchED    ,  TYPes  /  *   ,     *  /   ALsoREJECTed   ;    ALso   unNEEdED    `
    );
  });
});
