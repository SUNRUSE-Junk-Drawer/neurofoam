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
    accepts(`identity`)
    accepts(`identity,identity`)
    accepts(`  identity    ,  identity     `)
    accepts(`identity,identity,identity`)
    accepts(`  identity    ,  identity   ,     identity   `)

    rejects(`unsupported`)
    rejects(`unsupported,identity`)
    rejects(`  unsupported    ,  identity     `)
    rejects(`identity,unsupported`)
    rejects(`  identity    ,  unsupported     `)
    rejects(`unsupported,unavailable`)
    rejects(`  unsupported    ,  unavailable     `)
    rejects(`unsupported,identity,identity`)
    rejects(`  unsupported    ,  identity   ,     identity   `)
    rejects(`identity,unsupported,identity`)
    rejects(`  identity    ,  unsupported   ,     identity   `)
    rejects(`identity,identity,unsupported`)
    rejects(`  identity    ,  identity   ,     unsupported   `)

    rejects(`unsupported,unavailable,identity`)
    rejects(`  unsupported    ,  unavailable   ,     identity   `)
    rejects(`unsupported,identity,unavailable`)
    rejects(`  unsupported    ,  identity   ,     unavailable   `)
    rejects(`identity,unsupported,unavailable`)
    rejects(`  identity    ,  unsupported   ,     unavailable   `)
    rejects(`unsupported,unavailable,notanoption`)
    rejects(`  unsupported    ,  unavailable   ,     notanoption   `)
  })
})
