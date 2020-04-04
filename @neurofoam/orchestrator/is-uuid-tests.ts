import isUuid from "./is-uuid"

describe(`@neurofoam/orchestrator`, () => {
  describe(`isUuid`, () => {
    function accepts(
      authorization: string,
    ): void {
      describe(`given ${JSON.stringify(authorization)}`, () => {
        it(`returns true`, () => expect(isUuid(authorization)).toBeTrue())
      })
    }

    function rejects(
      authorization: string,
    ): void {
      describe(`given ${JSON.stringify(authorization)}`, () => {
        it(`returns false`, () => expect(isUuid(authorization)).toBeFalse())
      })
    }

    accepts(`91a7b5af-52c6-46b0-a565-c01cd3b8c193`)

    rejects(``)
    rejects(` `)
    rejects(`91a7b5af-52c6-46b0-a565-c01cd3b8c193d`)
    rejects(`91a7b5af-52c6-46b0-a5d65-c01cd3b8c193`)
    rejects(`91a7b5af-52c6-46db0-a565-c01cd3b8c193`)
    rejects(`91a7b5af-5d2c6-46b0-a565-c01cd3b8c193`)
    rejects(`91da7b5af-52c6-46b0-a565-c01cd3b8c193`)
    rejects(`91a7b5a-52c6-46b0-a565-c01cd3b8c193`)
    rejects(`91a7b5af-52c-46b0-a565-c01cd3b8c193`)
    rejects(`91a7b5af-52c6-460-a565-c01cd3b8c193`)
    rejects(`91a7b5af-52c6-46b0-a55-c01cd3b8c193`)
    rejects(`91a7b5af-52c6-46b0-a565-c01cd3b8c19`)
    rejects(`91a7b$af-52c6-46b0-a565-c01cd3b8c193`)
    rejects(`91a7b5af-52$6-46b0-a565-c01cd3b8c193`)
    rejects(`91a7b5af-52c6-46$0-a565-c01cd3b8c193`)
    rejects(`91a7b5af-52c6-46b0-a5$5-c01cd3b8c193`)
    rejects(`91a7b5af-52c6-46b0-a565-c01cd3$8c193`)
    rejects(`91a7b5af-52c6-46b0-a565-c01cg3b8c193`)
    rejects(`91a7b5af-52c6-46b0-a5g5-c01cd3b8c193`)
    rejects(`91a7b5af-52c6-4gb0-a565-c01cd3b8c193`)
    rejects(`91a7b5af-52g6-46b0-a565-c01cd3b8c193`)
    rejects(`91agb5af-52c6-46b0-a565-c01cd3b8c193`)
  })
})
