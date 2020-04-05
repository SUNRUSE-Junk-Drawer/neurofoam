import isContentTypeHeaderValid from "./is-content-type-header-valid"

describe(`@neurofoam/channel-node-http`, () => {
  describe(`isContentTypeHeaderValid`, () => {
    function accepts(accept: undefined | string): void {
      it(`accepts "${accept}"`, () => expect(isContentTypeHeaderValid(accept)).toBeTrue())
    }

    function rejects(accept: undefined | string): void {
      it(`rejects "${accept}"`, () => expect(isContentTypeHeaderValid(accept)).toBeFalse())
    }

    accepts(undefined)
    accepts(``)
    accepts(`     `)
    accepts(`application/json`)
    accepts(`   application   /   json   `)
    accepts(`application/json;charset=utf-8`)
    accepts(`   application   /   json    ;     charset =  utf-8  `)

    rejects(`image/json`)
    rejects(`application/xml`)
    rejects(`image/json;charset=utf-8`)
    rejects(`application/xml;charset=utf-8`)
    rejects(`application/json;notcharset=utf-8`)
    rejects(`application/json;charset=anythingelse`)
    rejects(`application/json;charset=anything-else`)
  })
})
