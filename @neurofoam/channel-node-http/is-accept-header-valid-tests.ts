import isAcceptHeaderValid from "./is-accept-header-valid"

describe(`@neurofoam/channel-node-http`, () => {
  describe(`isAcceptHeaderValid`, () => {
    function accepts(accept: undefined | string): void {
      it(`accepts "${accept}"`, () => expect(isAcceptHeaderValid(accept)).toBeTrue())
    }

    function rejects(accept: undefined | string): void {
      it(`rejects "${accept}"`, () => expect(isAcceptHeaderValid(accept)).toBeFalse())
    }

    accepts(undefined)
    accepts(``)
    accepts(`     `)
    accepts(`*/*`)
    accepts(`*/*;ignored if present`)
    accepts(`application/*`)
    accepts(`application/*;ignored if present`)
    accepts(`*/json`)
    accepts(`*/json;ignored if present`)
    accepts(`application/json`)
    accepts(`application/json;ignored if present`)

    accepts(`preceding/*;extraneous information,*/mismatching,rejected/types;anything additional,*/*,trailing/mismatched,types/*,*/alsorejected;also unneeded`)
    accepts(`preceding/*;extraneous information,*/mismatching,rejected/types;anything additional,*/*;ignored if present,trailing/mismatched,types/*,*/alsorejected;also unneeded`)
    accepts(`preceding/*;extraneous information,*/mismatching,rejected/types;anything additional,application/*,trailing/mismatched,types/*,*/alsorejected;also unneeded`)
    accepts(`preceding/*;extraneous information,*/mismatching,rejected/types;anything additional,application/*;ignored if present,trailing/mismatched,types/*,*/alsorejected;also unneeded`)
    accepts(`preceding/*;extraneous information,*/mismatching,rejected/types;anything additional,*/json,trailing/mismatched,types/*,*/alsorejected;also unneeded`)
    accepts(`preceding/*;extraneous information,*/mismatching,rejected/types;anything additional,*/json;ignored if present,trailing/mismatched,types/*,*/alsorejected;also unneeded`)
    accepts(`preceding/*;extraneous information,*/mismatching,rejected/types;anything additional,application/json,trailing/mismatched,types/*,*/alsorejected;also unneeded`)
    accepts(`preceding/*;extraneous information,*/mismatching,rejected/types;anything additional,application/json;ignored if present,trailing/mismatched,types/*,*/alsorejected;also unneeded`)

    accepts(`   preceding /   *   ;   extraneous       information   ,   * /    mismatching     ,   rejected  /   types  ;   anything    additional  ,       *             /       *                               ,   trailing  /   mismatched    ,  types  /  *   ,     *  /   alsorejected   ;    also   unneeded    `)
    accepts(`   preceding /   *   ;   extraneous       information   ,   * /    mismatching     ,   rejected  /   types  ;   anything    additional  ,       *             /       *  ;  ignored   if   present    ,   trailing  /   mismatched    ,  types  /  *   ,     *  /   alsorejected   ;    also   unneeded    `)
    accepts(`   preceding /   *   ;   extraneous       information   ,   * /    mismatching     ,   rejected  /   types  ;   anything    additional  ,       application   /       *                               ,   trailing  /   mismatched    ,  types  /  *   ,     *  /   alsorejected   ;    also   unneeded    `)
    accepts(`   preceding /   *   ;   extraneous       information   ,   * /    mismatching     ,   rejected  /   types  ;   anything    additional  ,       application   /       *  ;  ignored   if   present    ,   trailing  /   mismatched    ,  types  /  *   ,     *  /   alsorejected   ;    also   unneeded    `)
    accepts(`   preceding /   *   ;   extraneous       information   ,   * /    mismatching     ,   rejected  /   types  ;   anything    additional  ,       *             /    json                               ,   trailing  /   mismatched    ,  types  /  *   ,     *  /   alsorejected   ;    also   unneeded    `)
    accepts(`   preceding /   *   ;   extraneous       information   ,   * /    mismatching     ,   rejected  /   types  ;   anything    additional  ,       *             /    json  ;  ignored   if   present    ,   trailing  /   mismatched    ,  types  /  *   ,     *  /   alsorejected   ;    also   unneeded    `)
    accepts(`   preceding /   *   ;   extraneous       information   ,   * /    mismatching     ,   rejected  /   types  ;   anything    additional  ,       application   /    json                               ,   trailing  /   mismatched    ,  types  /  *   ,     *  /   alsorejected   ;    also   unneeded    `)
    accepts(`   preceding /   *   ;   extraneous       information   ,   * /    mismatching     ,   rejected  /   types  ;   anything    additional  ,       application   /    json  ;  ignored   if   present    ,   trailing  /   mismatched    ,  types  /  *   ,     *  /   alsorejected   ;    also   unneeded    `)

    rejects(`mismatching/json`)
    rejects(`mismatching/json;ignored if present`)
    rejects(`mismatching/*`)
    rejects(`mismatching/*;ignored if present`)
    rejects(`application/mismatching`)
    rejects(`application/mismatching;ignored if present`)
    rejects(`*/mismatching`)
    rejects(`*/mismatching;ignored if present`)
    rejects(`mismatching/type`)
    rejects(`mismatching/type;ignored if present`)
    rejects(`preceding/*;extraneous information,*/mismatching,rejected/types;anything additional,trailing/mismatched,types/*,*/alsorejected;also unneeded`)
    rejects(`   preceding /   *   ;   extraneous       information   ,   * /    mismatching     ,   rejected  /   types  ;   anything    additional  ,    trailing  /   mismatched    ,  types  /  *   ,     *  /   alsorejected   ;    also   unneeded    `)
  })
})
