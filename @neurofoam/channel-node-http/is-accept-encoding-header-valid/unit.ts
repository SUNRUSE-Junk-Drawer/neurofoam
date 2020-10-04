import isAcceptEncodingHeaderValid from ".";

describe(`@neurofoam/channel-node-http`, () => {
  describe(`isAcceptEncodingHeaderValid`, () => {
    function accepts(accept: undefined | string): void {
      it(`accepts "${accept}"`, () =>
        expect(isAcceptEncodingHeaderValid(accept)).toBeTrue());
    }

    function rejects(accept: undefined | string): void {
      it(`rejects "${accept}"`, () =>
        expect(isAcceptEncodingHeaderValid(accept)).toBeFalse());
    }

    accepts(undefined);
    accepts(``);
    accepts(`     `);
    accepts(`*`);
    accepts(`    *  `);
    accepts(`*;IGNOred iF presENT`);
    accepts(`    *      ;    IGNOred   iF  presENT   `);
    accepts(`idENTiTy`);
    accepts(`    idENTiTy   `);
    accepts(`idENTiTy;IGNOred iF presENT`);
    accepts(`      idENTiTy     ;      IGNOred   iF  presENT     `);

    accepts(
      `UNsupported;extrANEOUS INFORMaTION,unAVailABLE,NOTanOPTION;anyTHinG addITionAl,*`
    );
    accepts(
      `     UNsupported;      extrANEOUS      INFORMaTION     ,      unAVailABLE     ,       NOTanOPTION       ;    anyTHinG  addITionAl  ,          *  `
    );
    accepts(
      `UNsupported;extrANEOUS INFORMaTION,unAVailABLE,NOTanOPTION;anyTHinG addITionAl,*;IGNOred iF presENT`
    );
    accepts(
      `     UNsupported;      extrANEOUS      INFORMaTION     ,      unAVailABLE     ,       NOTanOPTION       ;    anyTHinG  addITionAl  ,          *      ;    IGNOred   iF  presENT   `
    );
    accepts(
      `UNsupported;extrANEOUS INFORMaTION,unAVailABLE,NOTanOPTION;anyTHinG addITionAl,idENTiTy`
    );
    accepts(
      `     UNsupported;      extrANEOUS      INFORMaTION     ,      unAVailABLE     ,       NOTanOPTION       ;    anyTHinG  addITionAl  ,          idENTiTy   `
    );
    accepts(
      `UNsupported;extrANEOUS INFORMaTION,unAVailABLE,NOTanOPTION;anyTHinG addITionAl,idENTiTy;IGNOred iF presENT`
    );
    accepts(
      `     UNsupported;      extrANEOUS      INFORMaTION     ,      unAVailABLE     ,       NOTanOPTION       ;    anyTHinG  addITionAl  ,            idENTiTy     ;      IGNOred   iF  presENT     `
    );

    accepts(`*,notACCEPTable,WILLbeREJECTED,willNOTbeACCEPTED;ALSO unNEEDed`);
    accepts(
      `    *    ,      notACCEPTable   ,    WILLbeREJECTED   ,     willNOTbeACCEPTED     ;     ALSO       unNEEDed     `
    );
    accepts(
      `*;IGNOred iF presENT,notACCEPTable,WILLbeREJECTED,willNOTbeACCEPTED;ALSO unNEEDed`
    );
    accepts(
      `    *      ;    IGNOred   iF  presENT     ,      notACCEPTable   ,    WILLbeREJECTED   ,     willNOTbeACCEPTED     ;     ALSO       unNEEDed     `
    );
    accepts(
      `idENTiTy,notACCEPTable,WILLbeREJECTED,willNOTbeACCEPTED;ALSO unNEEDed`
    );
    accepts(
      `    idENTiTy     ,      notACCEPTable   ,    WILLbeREJECTED   ,     willNOTbeACCEPTED     ;     ALSO       unNEEDed     `
    );
    accepts(
      `idENTiTy;IGNOred iF presENT,notACCEPTable,WILLbeREJECTED,willNOTbeACCEPTED;ALSO unNEEDed`
    );
    accepts(
      `      idENTiTy     ;      IGNOred   iF  presENT       ,      notACCEPTable   ,    WILLbeREJECTED   ,     willNOTbeACCEPTED     ;     ALSO       unNEEDed     `
    );

    accepts(
      `UNsupported;extrANEOUS INFORMaTION,unAVailABLE,NOTanOPTION;anyTHinG addITionAl,*,WILLbeREJECTED,willNOTbeACCEPTED;ALSO unNEEDed`
    );
    accepts(
      `     UNsupported;      extrANEOUS      INFORMaTION     ,      unAVailABLE     ,       NOTanOPTION       ;    anyTHinG  addITionAl  ,          *      ,      notACCEPTable   ,    WILLbeREJECTED   ,     willNOTbeACCEPTED     ;     ALSO       unNEEDed     `
    );
    accepts(
      `UNsupported;extrANEOUS INFORMaTION,unAVailABLE,NOTanOPTION;anyTHinG addITionAl,*;IGNOred iF presENT,WILLbeREJECTED,willNOTbeACCEPTED;ALSO unNEEDed`
    );
    accepts(
      `     UNsupported;      extrANEOUS      INFORMaTION     ,      unAVailABLE     ,       NOTanOPTION       ;    anyTHinG  addITionAl  ,          *      ;    IGNOred   iF  presENT       ,      notACCEPTable   ,    WILLbeREJECTED   ,     willNOTbeACCEPTED     ;     ALSO       unNEEDed     `
    );
    accepts(
      `UNsupported;extrANEOUS INFORMaTION,unAVailABLE,NOTanOPTION;anyTHinG addITionAl,idENTiTy,WILLbeREJECTED,willNOTbeACCEPTED;ALSO unNEEDed`
    );
    accepts(
      `     UNsupported;      extrANEOUS      INFORMaTION     ,      unAVailABLE     ,       NOTanOPTION       ;    anyTHinG  addITionAl  ,          idENTiTy       ,      notACCEPTable   ,    WILLbeREJECTED   ,     willNOTbeACCEPTED     ;     ALSO       unNEEDed     `
    );
    accepts(
      `UNsupported;extrANEOUS INFORMaTION,unAVailABLE,NOTanOPTION;anyTHinG addITionAl,idENTiTy;IGNOred iF presENT,WILLbeREJECTED,willNOTbeACCEPTED;ALSO unNEEDed`
    );
    accepts(
      `     UNsupported;      extrANEOUS      INFORMaTION     ,      unAVailABLE     ,       NOTanOPTION       ;    anyTHinG  addITionAl  ,            idENTiTy     ;      IGNOred   iF  presENT         ,      notACCEPTable   ,    WILLbeREJECTED   ,     willNOTbeACCEPTED     ;     ALSO       unNEEDed     `
    );

    rejects(
      `UNsupported;extrANEOUS INFORMaTION,unAVailABLE,NOTanOPTION;anyTHinG addITionAl,notACCEPTable,WILLbeREJECTED,willNOTbeACCEPTED;ALSO unNEEDed`
    );
    rejects(
      `     UNsupported;      extrANEOUS      INFORMaTION     ,      unAVailABLE     ,       NOTanOPTION       ;    anyTHinG  addITionAl  ,      notACCEPTable   ,    WILLbeREJECTED   ,     willNOTbeACCEPTED     ;     ALSO       unNEEDed     `
    );
  });
});
