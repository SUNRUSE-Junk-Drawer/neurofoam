import isContentEncodingHeaderValid from "./is-content-encoding-header-valid"

describe(`@neurofoam/channel-node-http`, () => {
  describe(`isContentEncodingHeaderValid`, () => {
    function accepts(accept: undefined | string): void {
      it(`accepts "${accept}"`, () => expect(isContentEncodingHeaderValid(accept)).toBeTrue())
    }

    function rejects(accept: undefined | string): void {
      it(`rejects "${accept}"`, () => expect(isContentEncodingHeaderValid(accept)).toBeFalse())
    }

    accepts(undefined)
    accepts(``)
    accepts(`     `)
    accepts(`idenTITY`)
    accepts(`idenTITY,IDENtity`)
    accepts(`  idenTITY    ,  IDENtity     `)
    accepts(`idenTITY,IDENtity,idENtity`)
    accepts(`  idenTITY    ,  IDENtity   ,     idENtity   `)

    rejects(`unSUPPorted`)
    rejects(`unSUPPorted,IDENtity`)
    rejects(`  unSUPPorted    ,  IDENtity     `)
    rejects(`idenTITY,unSUPPorted`)
    rejects(`  identity    ,  unSUPPorted     `)
    rejects(`unSUPPorted,UNAVAILable`)
    rejects(`  unSUPPorted    ,  UNAVAILable     `)
    rejects(`unSUPPorted,IDENtity,idENtity`)
    rejects(`  unSUPPorted    ,  IDENtity   ,     idENtity   `)
    rejects(`idenTITY,unSUPPorted,idENtity`)
    rejects(`  idenTITY    ,  unSUPPorted   ,     idENtity   `)
    rejects(`idenTITY,IDENtity,unSUPPorted`)
    rejects(`  idenTITY    ,  IDENtity   ,     unSUPPorted   `)

    rejects(`unSUPPorted,UNAVAILable,idENtity`)
    rejects(`  unSUPPorted    ,  UNAVAILable   ,     idENtity   `)
    rejects(`unSUPPorted,IDENtity,UNAVAILable`)
    rejects(`  unSUPPorted    ,  IDENtity   ,     UNAVAILable   `)
    rejects(`idenTITY,unSUPPorted,UNAVAILable`)
    rejects(`  idenTITY    ,  unSUPPorted   ,     UNAVAILable   `)
    rejects(`unSUPPorted,UNAVAILable,notanOption`)
    rejects(`  unSUPPorted    ,  UNAVAILable   ,     notanOption   `)
  })
})
