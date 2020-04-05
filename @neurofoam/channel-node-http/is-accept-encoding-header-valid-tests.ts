import isAcceptEncodingHeaderValid from "./is-accept-encoding-header-valid"

describe(`@neurofoam/channel-node-http`, () => {
  describe(`isAcceptEncodingHeaderValid`, () => {
    function accepts(accept: undefined | string): void {
      it(`accepts "${accept}"`, () => expect(isAcceptEncodingHeaderValid(accept)).toBeTrue())
    }

    function rejects(accept: undefined | string): void {
      it(`rejects "${accept}"`, () => expect(isAcceptEncodingHeaderValid(accept)).toBeFalse())
    }

    accepts(undefined)
    accepts(``)
    accepts(`     `)
    accepts(`*`)
    accepts(`    *  `)
    accepts(`*;ignored if present`)
    accepts(`    *      ;    ignored   if  present   `)
    accepts(`identity`)
    accepts(`    identity   `)
    accepts(`identity;ignored if present`)
    accepts(`      identity     ;      ignored   if  present     `)

    accepts(`unsupported;extraneous information,unavailable,notanoption;anything additional,*`)
    accepts(`     unsupported;      extraneous      information     ,      unavailable     ,       notanoption       ;    anything  additional  ,          *  `)
    accepts(`unsupported;extraneous information,unavailable,notanoption;anything additional,*;ignored if present`)
    accepts(`     unsupported;      extraneous      information     ,      unavailable     ,       notanoption       ;    anything  additional  ,          *      ;    ignored   if  present   `)
    accepts(`unsupported;extraneous information,unavailable,notanoption;anything additional,identity`)
    accepts(`     unsupported;      extraneous      information     ,      unavailable     ,       notanoption       ;    anything  additional  ,          identity   `)
    accepts(`unsupported;extraneous information,unavailable,notanoption;anything additional,identity;ignored if present`)
    accepts(`     unsupported;      extraneous      information     ,      unavailable     ,       notanoption       ;    anything  additional  ,            identity     ;      ignored   if  present     `)

    accepts(`*,notacceptable,willberejected,willnotbeaccepted;also unneeded`)
    accepts(`    *    ,      notacceptable   ,    willberejected   ,     willnotbeaccepted     ;     also       unneeded     `)
    accepts(`*;ignored if present,notacceptable,willberejected,willnotbeaccepted;also unneeded`)
    accepts(`    *      ;    ignored   if  present     ,      notacceptable   ,    willberejected   ,     willnotbeaccepted     ;     also       unneeded     `)
    accepts(`identity,notacceptable,willberejected,willnotbeaccepted;also unneeded`)
    accepts(`    identity     ,      notacceptable   ,    willberejected   ,     willnotbeaccepted     ;     also       unneeded     `)
    accepts(`identity;ignored if present,notacceptable,willberejected,willnotbeaccepted;also unneeded`)
    accepts(`      identity     ;      ignored   if  present       ,      notacceptable   ,    willberejected   ,     willnotbeaccepted     ;     also       unneeded     `)

    accepts(`unsupported;extraneous information,unavailable,notanoption;anything additional,*,willberejected,willnotbeaccepted;also unneeded`)
    accepts(`     unsupported;      extraneous      information     ,      unavailable     ,       notanoption       ;    anything  additional  ,          *      ,      notacceptable   ,    willberejected   ,     willnotbeaccepted     ;     also       unneeded     `)
    accepts(`unsupported;extraneous information,unavailable,notanoption;anything additional,*;ignored if present,willberejected,willnotbeaccepted;also unneeded`)
    accepts(`     unsupported;      extraneous      information     ,      unavailable     ,       notanoption       ;    anything  additional  ,          *      ;    ignored   if  present       ,      notacceptable   ,    willberejected   ,     willnotbeaccepted     ;     also       unneeded     `)
    accepts(`unsupported;extraneous information,unavailable,notanoption;anything additional,identity,willberejected,willnotbeaccepted;also unneeded`)
    accepts(`     unsupported;      extraneous      information     ,      unavailable     ,       notanoption       ;    anything  additional  ,          identity       ,      notacceptable   ,    willberejected   ,     willnotbeaccepted     ;     also       unneeded     `)
    accepts(`unsupported;extraneous information,unavailable,notanoption;anything additional,identity;ignored if present,willberejected,willnotbeaccepted;also unneeded`)
    accepts(`     unsupported;      extraneous      information     ,      unavailable     ,       notanoption       ;    anything  additional  ,            identity     ;      ignored   if  present         ,      notacceptable   ,    willberejected   ,     willnotbeaccepted     ;     also       unneeded     `)

    rejects(`unsupported;extraneous information,unavailable,notanoption;anything additional,notacceptable,willberejected,willnotbeaccepted;also unneeded`)
    rejects(`     unsupported;      extraneous      information     ,      unavailable     ,       notanoption       ;    anything  additional  ,      notacceptable   ,    willberejected   ,     willnotbeaccepted     ;     also       unneeded     `)
  })
})
