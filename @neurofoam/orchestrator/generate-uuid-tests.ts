import generateUuid from "./generate-uuid"

describe(`@neurofoam/orchestrator`, () => {
  describe(`generateUuid`, () => {
    it(`generates a valid uuid`, () => async () => expect(
      await generateUuid()
    ).toMatch(/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/))

    it(`returns a different value each time`, async () => expect(
      await generateUuid()
    ).not.toEqual(
      await generateUuid()
    ))
  })
})
