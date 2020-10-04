import isAcceptCharsetHeaderValid from ".";

describe(`@neurofoam/channel-node-http`, () => {
  describe(`isAcceptCharsetHeaderValid`, () => {
    function accepts(accept: undefined | string): void {
      it(`accepts "${accept}"`, () =>
        expect(isAcceptCharsetHeaderValid(accept)).toBeTrue());
    }

    function rejects(accept: undefined | string): void {
      it(`rejects "${accept}"`, () =>
        expect(isAcceptCharsetHeaderValid(accept)).toBeFalse());
    }

    accepts(undefined);
    accepts(``);
    accepts(`     `);
    accepts(`*`);
    accepts(`    *  `);
    accepts(`*;q=2.4`);
    accepts(`    *  ;   q  =   2.4  `);
    accepts(`uTf-8`);
    accepts(`    uTf-8  `);
    accepts(`uTf-8;q=2.4`);
    accepts(`    uTf-8  ;   q  =   2.4  `);
    accepts(`uTf-8,*`);
    accepts(`   uTf-8    ,  *   `);
    accepts(`*,uTf-8`);
    accepts(`   *    ,  uTf-8   `);
    accepts(`*,bAD`);
    accepts(`  *  ,   bAD  `);
    accepts(`*;q=2.4,bAD`);
    accepts(`  *   ;  q  =  2.4    ,  bAD    `);
    accepts(`*,bAD;q=2.4`);
    accepts(`   *  ,    bAD  ;   q  =   2.4   `);
    accepts(`bAD,*`);
    accepts(`   bAD  ,   *    `);
    accepts(`bAD,*;q=2.4`);
    accepts(`   bAD  ,   *   ;   q  =  2.4   `);
    accepts(`bAD;q=2.4,*`);
    accepts(`  bAD   ;  q  =   2.4  ,   *   `);
    accepts(`uTf-8,bAD`);
    accepts(`  uTf-8  ,   bAD  `);
    accepts(`uTf-8;q=2.4,bAD`);
    accepts(`  uTf-8   ;  q  =  2.4    ,  bAD    `);
    accepts(`uTf-8,bAD;q=2.4`);
    accepts(`   uTf-8  ,    bAD  ;   q  =   2.4   `);
    accepts(`bAD,uTf-8`);
    accepts(`   bAD  ,   uTf-8    `);
    accepts(`bAD,uTf-8;q=2.4`);
    accepts(`   bAD  ,   uTf-8   ;   q  =  2.4   `);
    accepts(`bAD;q=2.4,uTf-8`);
    accepts(`  bAD   ;  q  =   2.4  ,   uTf-8   `);
    accepts(`*;q=2.4,uTf-8;q=1.12`);
    accepts(`   *  ;   q  =   2.4   ,   uTf-8   ;   q  =    1.12   `);
    accepts(`uTf-8;q=2.4,*;q=1.12`);
    accepts(`   uTf-8  ;   q  =   2.4   ,   *   ;   q  =    1.12   `);
    accepts(`*;q=2.4,bAD;q=1.12`);
    accepts(`   *  ;   q  =   2.4   ,   bAD   ;   q  =    1.12   `);
    accepts(`uTf-8;q=2.4,bAD;q=1.12`);
    accepts(`   uTf-8  ;   q  =   2.4   ,   bAD   ;   q  =    1.12   `);
    accepts(`bAD;q=2.4,uTf-8;q=1.12`);
    accepts(`   bAD  ;   q  =   2.4   ,   uTf-8   ;   q  =    1.12   `);
    accepts(`bAD;q=2.4,*;q=1.12`);
    accepts(`   bAD  ;   q  =   2.4   ,   *   ;   q  =    1.12   `);

    accepts(`*,WORse,EVil`);
    accepts(`   *  ,  WORse    ,   EVil    `);
    accepts(`*;q=2.4,WORse,EVil`);
    accepts(`  *   ;  q  =   2.4  ,   WORse   ,    EVil   `);
    accepts(`*,WORse;q=2.4,EVil`);
    accepts(`  *   ,    WORse   ;   q   =   2.4   ,   EVil    `);
    accepts(`*,WORse,EVil;q=2.4`);
    accepts(`   *   ,    WORse  ,   EVil  ;   q   =   2.4   `);
    accepts(`*;q=2.4,WORse;q=1.12,EVil`);
    accepts(
      `   *    ;   q  =    2.4   ,    WORse  ;  q   =  1.12   ,   EVil    `
    );
    accepts(`*;q=2.4,WORse,EVil;q=1.12`);
    accepts(
      `   *   ;   q   =     2.4    ,   WORse  ,    EVil  ;   q  =  1.12    `
    );
    accepts(`*,WORse;q=2.4,EVil;q=1.12`);
    accepts(
      `   *  ,   WORse   ;   q  =   2.4   ,   EVil   ;   q   =    1.12   `
    );
    accepts(`*;q=2.4,WORse;q=1.12,EVil;q=3.14`);
    accepts(
      `   *    ;   q    =    2.4  ,   WORse    ;   q   =   1.12  ,    EVil  ;   q  =   3.14    `
    );

    accepts(`bAD,*,EVil`);
    accepts(`   bAD  ,  *    ,   EVil    `);
    accepts(`bAD;q=2.4,*,EVil`);
    accepts(`  bAD   ;  q  =   2.4  ,   *   ,    EVil   `);
    accepts(`bAD,*;q=2.4,EVil`);
    accepts(`  bAD   ,    *   ;   q   =   2.4   ,   EVil    `);
    accepts(`bAD,*,EVil;q=2.4`);
    accepts(`   bAD   ,    *  ,   EVil  ;   q   =   2.4   `);
    accepts(`bAD;q=2.4,*;q=1.12,EVil`);
    accepts(
      `   bAD    ;   q  =    2.4   ,    *  ;  q   =  1.12   ,   EVil    `
    );
    accepts(`bAD;q=2.4,*,EVil;q=1.12`);
    accepts(
      `   bAD   ;   q   =     2.4    ,   *  ,    EVil  ;   q  =  1.12    `
    );
    accepts(`bAD,*;q=2.4,EVil;q=1.12`);
    accepts(`   bAD  ,   *   ;   q  =   2.4   ,   EVil   ;   q   =    1.12   `);
    accepts(`bAD;q=2.4,*;q=1.12,EVil;q=3.14`);
    accepts(
      `   bAD    ;   q    =    2.4  ,   *    ;   q   =   1.12  ,    EVil  ;   q  =   3.14    `
    );

    accepts(`bAD,WORse,*`);
    accepts(`   bAD  ,  WORse    ,   *    `);
    accepts(`bAD;q=2.4,WORse,*`);
    accepts(`  bAD   ;  q  =   2.4  ,   WORse   ,    *   `);
    accepts(`bAD,WORse;q=2.4,*`);
    accepts(`  bAD   ,    WORse   ;   q   =   2.4   ,   *    `);
    accepts(`bAD,WORse,*;q=2.4`);
    accepts(`   bAD   ,    WORse  ,   *  ;   q   =   2.4   `);
    accepts(`bAD;q=2.4,WORse;q=1.12,*`);
    accepts(
      `   bAD    ;   q  =    2.4   ,    WORse  ;  q   =  1.12   ,   *    `
    );
    accepts(`bAD;q=2.4,WORse,*;q=1.12`);
    accepts(
      `   bAD   ;   q   =     2.4    ,   WORse  ,    *  ;   q  =  1.12    `
    );
    accepts(`bAD,WORse;q=2.4,*;q=1.12`);
    accepts(
      `   bAD  ,   WORse   ;   q  =   2.4   ,   *   ;   q   =    1.12   `
    );
    accepts(`bAD;q=2.4,WORse;q=1.12,*;q=3.14`);
    accepts(
      `   bAD    ;   q    =    2.4  ,   WORse    ;   q   =   1.12  ,    *  ;   q  =   3.14    `
    );

    accepts(`uTf-8,WORse,EVil`);
    accepts(`   uTf-8  ,  WORse    ,   EVil    `);
    accepts(`uTf-8;q=2.4,WORse,EVil`);
    accepts(`  uTf-8   ;  q  =   2.4  ,   WORse   ,    EVil   `);
    accepts(`uTf-8,WORse;q=2.4,EVil`);
    accepts(`  uTf-8   ,    WORse   ;   q   =   2.4   ,   EVil    `);
    accepts(`uTf-8,WORse,EVil;q=2.4`);
    accepts(`   uTf-8   ,    WORse  ,   EVil  ;   q   =   2.4   `);
    accepts(`uTf-8;q=2.4,WORse;q=1.12,EVil`);
    accepts(
      `   uTf-8    ;   q  =    2.4   ,    WORse  ;  q   =  1.12   ,   EVil    `
    );
    accepts(`uTf-8;q=2.4,WORse,EVil;q=1.12`);
    accepts(
      `   uTf-8   ;   q   =     2.4    ,   WORse  ,    EVil  ;   q  =  1.12    `
    );
    accepts(`uTf-8,WORse;q=2.4,EVil;q=1.12`);
    accepts(
      `   uTf-8  ,   WORse   ;   q  =   2.4   ,   EVil   ;   q   =    1.12   `
    );
    accepts(`uTf-8;q=2.4,WORse;q=1.12,EVil;q=3.14`);
    accepts(
      `   uTf-8    ;   q    =    2.4  ,   WORse    ;   q   =   1.12  ,    EVil  ;   q  =   3.14    `
    );

    accepts(`bAD,uTf-8,EVil`);
    accepts(`   bAD  ,  uTf-8    ,   EVil    `);
    accepts(`bAD;q=2.4,uTf-8,EVil`);
    accepts(`  bAD   ;  q  =   2.4  ,   uTf-8   ,    EVil   `);
    accepts(`bAD,uTf-8;q=2.4,EVil`);
    accepts(`  bAD   ,    uTf-8   ;   q   =   2.4   ,   EVil    `);
    accepts(`bAD,uTf-8,EVil;q=2.4`);
    accepts(`   bAD   ,    uTf-8  ,   EVil  ;   q   =   2.4   `);
    accepts(`bAD;q=2.4,uTf-8;q=1.12,EVil`);
    accepts(
      `   bAD    ;   q  =    2.4   ,    uTf-8  ;  q   =  1.12   ,   EVil    `
    );
    accepts(`bAD;q=2.4,uTf-8,EVil;q=1.12`);
    accepts(
      `   bAD   ;   q   =     2.4    ,   uTf-8  ,    EVil  ;   q  =  1.12    `
    );
    accepts(`bAD,uTf-8;q=2.4,EVil;q=1.12`);
    accepts(
      `   bAD  ,   uTf-8   ;   q  =   2.4   ,   EVil   ;   q   =    1.12   `
    );
    accepts(`bAD;q=2.4,uTf-8;q=1.12,EVil;q=3.14`);
    accepts(
      `   bAD    ;   q    =    2.4  ,   uTf-8    ;   q   =   1.12  ,    EVil  ;   q  =   3.14    `
    );

    accepts(`bAD,WORse,uTf-8`);
    accepts(`   bAD  ,  WORse    ,   uTf-8    `);
    accepts(`bAD;q=2.4,WORse,uTf-8`);
    accepts(`  bAD   ;  q  =   2.4  ,   WORse   ,    uTf-8   `);
    accepts(`bAD,WORse;q=2.4,uTf-8`);
    accepts(`  bAD   ,    WORse   ;   q   =   2.4   ,   uTf-8    `);
    accepts(`bAD,WORse,uTf-8;q=2.4`);
    accepts(`   bAD   ,    WORse  ,   uTf-8  ;   q   =   2.4   `);
    accepts(`bAD;q=2.4,WORse;q=1.12,uTf-8`);
    accepts(
      `   bAD    ;   q  =    2.4   ,    WORse  ;  q   =  1.12   ,   uTf-8    `
    );
    accepts(`bAD;q=2.4,WORse,uTf-8;q=1.12`);
    accepts(
      `   bAD   ;   q   =     2.4    ,   WORse  ,    uTf-8  ;   q  =  1.12    `
    );
    accepts(`bAD,WORse;q=2.4,uTf-8;q=1.12`);
    accepts(
      `   bAD  ,   WORse   ;   q  =   2.4   ,   uTf-8   ;   q   =    1.12   `
    );
    accepts(`bAD;q=2.4,WORse;q=1.12,uTf-8;q=3.14`);
    accepts(
      `   bAD    ;   q    =    2.4  ,   WORse    ;   q   =   1.12  ,    uTf-8  ;   q  =   3.14    `
    );

    rejects(`bAD`);
    rejects(`    bAD  `);
    rejects(`bAD;q=2.4`);
    rejects(`    bAD  ;   q  =  2.4  `);
    rejects(`bAD,WORse`);
    rejects(`     bAD  ,     WORse      `);
    rejects(`bAD;q=2.4,WORse`);
    rejects(`    bAD  ;   q   =   2.4   ,   WORse    `);
    rejects(`bAD,WORse;q=2.4`);
    rejects(`    bAD  ,   WORse   ;     q   =   2.4  `);
    rejects(`bAD;q=2.4,WORse;q=1.12`);
    rejects(`   bAD   ;    q   =    2.4  ,   WORse   ;   q  =    1.12    `);
    rejects(`bAD,WORse,EVil`);
    rejects(`   bAD  ,  WORse    ,   EVil    `);
    rejects(`bAD;q=2.4,WORse,EVil`);
    rejects(`  bAD   ;  q  =   2.4  ,   WORse   ,    EVil   `);
    rejects(`bAD,WORse;q=2.4,EVil`);
    rejects(`  bAD   ,    WORse   ;   q   =   2.4   ,   EVil    `);
    rejects(`bAD,WORse,EVil;q=2.4`);
    rejects(`   bAD   ,    WORse  ,   EVil  ;   q   =   2.4   `);
    rejects(`bAD;q=2.4,WORse;q=1.12,EVil`);
    rejects(
      `   bAD    ;   q  =    2.4   ,    WORse  ;  q   =  1.12   ,   EVil    `
    );
    rejects(`bAD;q=2.4,WORse,EVil;q=1.12`);
    rejects(
      `   bAD   ;   q   =     2.4    ,   WORse  ,    EVil  ;   q  =  1.12    `
    );
    rejects(`bAD,WORse;q=2.4,EVil;q=1.12`);
    rejects(
      `   bAD  ,   WORse   ;   q  =   2.4   ,   EVil   ;   q   =    1.12   `
    );
    rejects(`bAD;q=2.4,WORse;q=1.12,EVil;q=3.14`);
    rejects(
      `   bAD    ;   q    =    2.4  ,   WORse    ;   q   =   1.12  ,    EVil  ;   q  =   3.14    `
    );
  });
});
