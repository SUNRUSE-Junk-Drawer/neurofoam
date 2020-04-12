// These modules export only types, so include them in a test file just to get
// the coverage.
import "./get-bubble-uuid-instance"
import "./get-session-uuid-instance"
import "./check-metadata-instance"
import "./get-request-length-instance"
import "./get-request-instance"
import "./respond-with-error-instance"
import "./respond-instance"
import "./node-http-instance"

import * as neurofoamTypes from "@neurofoam/types"
import NeurofoamChannelNodeHttp from "./"

describe(`@neurofoam/channel-node-http`, () => {
  describe(`index`, () => {
    let nodeHttpChannel: NeurofoamChannelNodeHttp

    beforeAll(() => {
      nodeHttpChannel = new NeurofoamChannelNodeHttp()
    })

    describe(`getBubbleUuid`, () => {
      function invalid(url: undefined | string): void {
        describe(`given ${JSON.stringify(url)}`, () => it(`returns type "invalid"`, () => expectAsync(nodeHttpChannel.getBubbleUuid({
          request: {
            url
          },
        })).toBeResolvedTo({
          type: `invalid`,
        })))
      }

      function maps(url: string, bubbleUuid: string): void {
        describe(`given ${JSON.stringify(url)}`, () => it(`returns the extracted bubble uuid`, () => expectAsync(nodeHttpChannel.getBubbleUuid({
          request: {
            url
          },
        })).toBeResolvedTo({
          type: `given`,
          bubbleUuid,
        })))
      }

      describe(`given no url`, () => it(`returns type "invalid"`, () => expectAsync(nodeHttpChannel.getBubbleUuid({
        request: {},
      })).toBeResolvedTo({ type: `invalid` })))

      invalid(undefined)
      invalid(``)
      invalid(`/`)

      invalid(`/?`)
      invalid(`/?anything=value`)
      invalid(`/?anything=value&else=other`)
      invalid(`/?anything=value&else=other&whatever=ignored`)
      invalid(`/?anything=value&also-ignored&else=other&whatever=ignored`)

      invalid(`//?`)
      invalid(`//?anything=value`)
      invalid(`//?anything=value&else=other`)
      invalid(`//?anything=value&else=other&whatever=ignored`)
      invalid(`//?anything=value&also-ignored&else=other&whatever=ignored`)

      invalid(`/#ignored-hash-fragment`)
      invalid(`/?#ignored-hash-fragment`)
      invalid(`/?anything=value#ignored-hash-fragment`)
      invalid(`/?anything=value&else=other#ignored-hash-fragment`)
      invalid(`/?anything=value&else=other&whatever=ignored#ignored-hash-fragment`)
      invalid(`/?anything=value&also-ignored&else=other&whatever=ignored#ignored-hash-fragment`)

      invalid(`//#ignored-hash-fragment`)
      invalid(`//?#ignored-hash-fragment`)
      invalid(`//?anything=value#ignored-hash-fragment`)
      invalid(`//?anything=value&else=other#ignored-hash-fragment`)
      invalid(`//?anything=value&else=other&whatever=ignored#ignored-hash-fragment`)
      invalid(`//?anything=value&also-ignored&else=other&whatever=ignored#ignored-hash-fragment`)

      maps(`/teST-buBBLe-uuiD-1`, `teST-buBBLe-uuiD-1`)
      maps(`/teST-buBBLe-uuiD-1?`, `teST-buBBLe-uuiD-1`)
      maps(`/teST-buBBLe-uuiD-1?anything=value`, `teST-buBBLe-uuiD-1`)
      maps(`/teST-buBBLe-uuiD-1?anything=value&else=other`, `teST-buBBLe-uuiD-1`)
      maps(`/teST-buBBLe-uuiD-1?anything=value&else=other&whatever=ignored`, `teST-buBBLe-uuiD-1`)
      maps(`/teST-buBBLe-uuiD-1?anything=value&also-ignored&else=other&whatever=ignored`, `teST-buBBLe-uuiD-1`)

      maps(`/teST-buBBLe-uuiD-1/`, `teST-buBBLe-uuiD-1`)
      maps(`/teST-buBBLe-uuiD-1/?`, `teST-buBBLe-uuiD-1`)
      maps(`/teST-buBBLe-uuiD-1/?anything=value`, `teST-buBBLe-uuiD-1`)
      maps(`/teST-buBBLe-uuiD-1/?anything=value&else=other`, `teST-buBBLe-uuiD-1`)
      maps(`/teST-buBBLe-uuiD-1/?anything=value&else=other&whatever=ignored`, `teST-buBBLe-uuiD-1`)
      maps(`/teST-buBBLe-uuiD-1/?anything=value&also-ignored&else=other&whatever=ignored`, `teST-buBBLe-uuiD-1`)

      maps(`/teST-buBBLe-uuiD-1#ignored-hash-fragment`, `teST-buBBLe-uuiD-1`)
      maps(`/teST-buBBLe-uuiD-1?#ignored-hash-fragment`, `teST-buBBLe-uuiD-1`)
      maps(`/teST-buBBLe-uuiD-1?anything=value#ignored-hash-fragment`, `teST-buBBLe-uuiD-1`)
      maps(`/teST-buBBLe-uuiD-1?anything=value&else=other#ignored-hash-fragment`, `teST-buBBLe-uuiD-1`)
      maps(`/teST-buBBLe-uuiD-1?anything=value&else=other&whatever=ignored#ignored-hash-fragment`, `teST-buBBLe-uuiD-1`)
      maps(`/teST-buBBLe-uuiD-1?anything=value&also-ignored&else=other&whatever=ignored#ignored-hash-fragment`, `teST-buBBLe-uuiD-1`)

      maps(`/teST-buBBLe-uuiD-1/#ignored-hash-fragment`, `teST-buBBLe-uuiD-1`)
      maps(`/teST-buBBLe-uuiD-1/?#ignored-hash-fragment`, `teST-buBBLe-uuiD-1`)
      maps(`/teST-buBBLe-uuiD-1/?anything=value#ignored-hash-fragment`, `teST-buBBLe-uuiD-1`)
      maps(`/teST-buBBLe-uuiD-1/?anything=value&else=other#ignored-hash-fragment`, `teST-buBBLe-uuiD-1`)
      maps(`/teST-buBBLe-uuiD-1/?anything=value&else=other&whatever=ignored#ignored-hash-fragment`, `teST-buBBLe-uuiD-1`)
      maps(`/teST-buBBLe-uuiD-1/?anything=value&also-ignored&else=other&whatever=ignored#ignored-hash-fragment`, `teST-buBBLe-uuiD-1`)

      maps(`/teST-buBBLe-uuiD-1/TEst-BUBBLE-UUid-2`, `teST-buBBLe-uuiD-1/TEst-BUBBLE-UUid-2`)
      maps(`/teST-buBBLe-uuiD-1/TEst-BUBBLE-UUid-2?`, `teST-buBBLe-uuiD-1/TEst-BUBBLE-UUid-2`)
      maps(`/teST-buBBLe-uuiD-1/TEst-BUBBLE-UUid-2?anything=value`, `teST-buBBLe-uuiD-1/TEst-BUBBLE-UUid-2`)
      maps(`/teST-buBBLe-uuiD-1/TEst-BUBBLE-UUid-2?anything=value&else=other`, `teST-buBBLe-uuiD-1/TEst-BUBBLE-UUid-2`)
      maps(`/teST-buBBLe-uuiD-1/TEst-BUBBLE-UUid-2?anything=value&else=other&whatever=ignored`, `teST-buBBLe-uuiD-1/TEst-BUBBLE-UUid-2`)
      maps(`/teST-buBBLe-uuiD-1/TEst-BUBBLE-UUid-2?anything=value&also-ignored&else=other&whatever=ignored`, `teST-buBBLe-uuiD-1/TEst-BUBBLE-UUid-2`)

      maps(`/teST-buBBLe-uuiD-1/TEst-BUBBLE-UUid-2/`, `teST-buBBLe-uuiD-1/TEst-BUBBLE-UUid-2`)
      maps(`/teST-buBBLe-uuiD-1/TEst-BUBBLE-UUid-2/?`, `teST-buBBLe-uuiD-1/TEst-BUBBLE-UUid-2`)
      maps(`/teST-buBBLe-uuiD-1/TEst-BUBBLE-UUid-2/?anything=value`, `teST-buBBLe-uuiD-1/TEst-BUBBLE-UUid-2`)
      maps(`/teST-buBBLe-uuiD-1/TEst-BUBBLE-UUid-2/?anything=value&else=other`, `teST-buBBLe-uuiD-1/TEst-BUBBLE-UUid-2`)
      maps(`/teST-buBBLe-uuiD-1/TEst-BUBBLE-UUid-2/?anything=value&else=other&whatever=ignored`, `teST-buBBLe-uuiD-1/TEst-BUBBLE-UUid-2`)
      maps(`/teST-buBBLe-uuiD-1/TEst-BUBBLE-UUid-2/?anything=value&also-ignored&else=other&whatever=ignored`, `teST-buBBLe-uuiD-1/TEst-BUBBLE-UUid-2`)

      maps(`/teST-buBBLe-uuiD-1/TEst-BUBBLE-UUid-2#ignored-hash-fragment`, `teST-buBBLe-uuiD-1/TEst-BUBBLE-UUid-2`)
      maps(`/teST-buBBLe-uuiD-1/TEst-BUBBLE-UUid-2?#ignored-hash-fragment`, `teST-buBBLe-uuiD-1/TEst-BUBBLE-UUid-2`)
      maps(`/teST-buBBLe-uuiD-1/TEst-BUBBLE-UUid-2?anything=value#ignored-hash-fragment`, `teST-buBBLe-uuiD-1/TEst-BUBBLE-UUid-2`)
      maps(`/teST-buBBLe-uuiD-1/TEst-BUBBLE-UUid-2?anything=value&else=other#ignored-hash-fragment`, `teST-buBBLe-uuiD-1/TEst-BUBBLE-UUid-2`)
      maps(`/teST-buBBLe-uuiD-1/TEst-BUBBLE-UUid-2?anything=value&else=other&whatever=ignored#ignored-hash-fragment`, `teST-buBBLe-uuiD-1/TEst-BUBBLE-UUid-2`)
      maps(`/teST-buBBLe-uuiD-1/TEst-BUBBLE-UUid-2?anything=value&also-ignored&else=other&whatever=ignored#ignored-hash-fragment`, `teST-buBBLe-uuiD-1/TEst-BUBBLE-UUid-2`)

      maps(`/teST-buBBLe-uuiD-1/TEst-BUBBLE-UUid-2/#ignored-hash-fragment`, `teST-buBBLe-uuiD-1/TEst-BUBBLE-UUid-2`)
      maps(`/teST-buBBLe-uuiD-1/TEst-BUBBLE-UUid-2/?#ignored-hash-fragment`, `teST-buBBLe-uuiD-1/TEst-BUBBLE-UUid-2`)
      maps(`/teST-buBBLe-uuiD-1/TEst-BUBBLE-UUid-2/?anything=value#ignored-hash-fragment`, `teST-buBBLe-uuiD-1/TEst-BUBBLE-UUid-2`)
      maps(`/teST-buBBLe-uuiD-1/TEst-BUBBLE-UUid-2/?anything=value&else=other#ignored-hash-fragment`, `teST-buBBLe-uuiD-1/TEst-BUBBLE-UUid-2`)
      maps(`/teST-buBBLe-uuiD-1/TEst-BUBBLE-UUid-2/?anything=value&else=other&whatever=ignored#ignored-hash-fragment`, `teST-buBBLe-uuiD-1/TEst-BUBBLE-UUid-2`)
      maps(`/teST-buBBLe-uuiD-1/TEst-BUBBLE-UUid-2/?anything=value&also-ignored&else=other&whatever=ignored#ignored-hash-fragment`, `teST-buBBLe-uuiD-1/TEst-BUBBLE-UUid-2`)
    })

    describe(`getSessionUuid`, () => {
      function invalid(authorization: undefined | string): void {
        describe(`given ${JSON.stringify(authorization)}`, () => it(`returns type "invalid"`, () => expectAsync(nodeHttpChannel.getSessionUuid({
          request: {
            headers: {
              authorization,
            },
          },
        })).toBeResolvedTo({
          type: `invalid`,
        })))
      }

      function none(authorization: undefined | string): void {
        describe(`given ${JSON.stringify(authorization)}`, () => it(`returns type "none"`, () => expectAsync(nodeHttpChannel.getSessionUuid({
          request: {
            headers: {
              authorization,
            },
          },
        })).toBeResolvedTo({
          type: `none`,
        })))
      }

      function maps(authorization: string, sessionUuid: string): void {
        describe(`given ${JSON.stringify(authorization)}`, () => it(`returns the extracted session uuid`, () => expectAsync(nodeHttpChannel.getSessionUuid({
          request: {
            headers: {
              authorization,
            },
          },
        })).toBeResolvedTo({
          type: `given`,
          sessionUuid,
        })))
      }

      describe(`given no authorization header`, () => it(`returns type "none"`, () => expectAsync(nodeHttpChannel.getSessionUuid({
        request: {
          headers: {},
        },
      })).toBeResolvedTo({ type: `none` })))

      none(undefined)
      none(``)
      none(`      `)

      maps(`BEAreR teST sesSION UUid`, `teST sesSION UUid`)
      maps(`  BEAreR   teST    sesSION   UUid    `, `teST    sesSION   UUid`)

      invalid(`teST sesSION UUid`)
      invalid(`  teST  sesSION   UUid  `)
      invalid(`BEA reR teST sesSION UUid`)
      invalid(`  BEA   reR   teST    sesSION   UUid  `)

      invalid(`teST sesSION UUid BEAreR`)
      invalid(`  teST    sesSION   UUid   BEAreR   `)

      invalid(`teST BEAreR sesSION UUid`)
      invalid(`   teST   BEAreR    sesSION   UUid    `)
    })

    describe(`checkMetadata`, () => {
      function fails(statusCode: number, request: {
        readonly method?: string
        readonly headers: {
          "content-type": string
          "content-encoding": string
          accept: string
          "accept-charset": string
          "accept-encoding": string
        }
      }): void {
        describe(`given ${JSON.stringify(request)}`, () => {
          describe(`before the request footer is written`, () => {
            let writeHead: jasmine.Spy
            let end: jasmine.Spy
            let resolvedOrRejected = false

            beforeAll(async () => {
              writeHead = jasmine.createSpy(`writeHead`)
              end = jasmine.createSpy(`end`)

              const response = {
                writeHead,
                end,
              }

              writeHead.and.returnValue(response)
              end.and.returnValue(response)

              nodeHttpChannel
                .checkMetadata({ request, response })
                .then(
                  () => resolvedOrRejected = true,
                  () => resolvedOrRejected = true,
                )

              await new Promise(resolve => setTimeout(resolve, 100))
            })

            it(`writes one request header`, () => expect(writeHead).toHaveBeenCalledTimes(1))
            it(`includes status code ${statusCode}`, () => expect(writeHead).toHaveBeenCalledWith(statusCode))
            it(`writes one request footer`, () => expect(end).toHaveBeenCalledTimes(1))
            it(`writes the request header before the footer`, () => expect(writeHead).toHaveBeenCalledBefore(end))
            it(`does not resolve the promise`, () => expect(resolvedOrRejected).toBeFalse())
          })
          describe(`after the request footer is written`, () => {
            let writeHead: jasmine.Spy
            let end: jasmine.Spy
            let promise: Promise<boolean>

            beforeAll(async () => {
              writeHead = jasmine.createSpy(`writeHead`)
              end = jasmine.createSpy(`end`)

              const response = {
                writeHead,
                end,
              }

              writeHead.and.returnValue(response)
              end.and.returnValue(response)

              promise = nodeHttpChannel.checkMetadata({ request, response })

              await new Promise(resolve => setTimeout(resolve, 100))

              end.calls.argsFor(0)[0]()

              await new Promise(resolve => setTimeout(resolve, 100))
            })

            it(`does not write any further request headers`, () => expect(writeHead).toHaveBeenCalledTimes(1))
            it(`does not write any further request footers`, () => expect(end).toHaveBeenCalledTimes(1))
            it(`resolves the promise to false`, () => expectAsync(promise).toBeResolvedTo(false))
          })
        })
      }

      describe(`when the request is valid`, () => {
        let writeHead: jasmine.Spy
        let end: jasmine.Spy
        let promise: Promise<boolean>

        beforeAll(async () => {
          writeHead = jasmine.createSpy(`writeHead`)
          end = jasmine.createSpy(`end`)

          const response = {
            writeHead,
            end,
          }

          promise = nodeHttpChannel.checkMetadata({
            request: {
              method: `POST`,
              headers: {
                "content-type": `application/json; charset=utf-8`,
                "content-encoding": `identity`,
                accept: `application/json`,
                "accept-charset": `utf-8`,
                "accept-encoding": `identity`,
              },
            }, response
          })

          await new Promise(resolve => setTimeout(resolve, 100))
        })

        it(`does not write a request header`, () => expect(writeHead).not.toHaveBeenCalled())
        it(`does not write a request footer`, () => expect(end).not.toHaveBeenCalled())
        it(`resolves the promise to true`, () => expectAsync(promise).toBeResolvedTo(true))
      })

      fails(405, {
        headers: {
          "content-type": `application/json; charset=utf-8`,
          "content-encoding": `identity`,
          accept: `application/json`,
          "accept-charset": `utf-8`,
          "accept-encoding": `identity`,
        },
      })

      fails(405, {
        method: ``,
        headers: {
          "content-type": `application/json; charset=utf-8`,
          "content-encoding": `identity`,
          accept: `application/json`,
          "accept-charset": `utf-8`,
          "accept-encoding": `identity`,
        },
      })

      fails(405, {
        method: `   `,
        headers: {
          "content-type": `application/json; charset=utf-8`,
          "content-encoding": `identity`,
          accept: `application/json`,
          "accept-charset": `utf-8`,
          "accept-encoding": `identity`,
        },
      })

      fails(405, {
        method: `PUT`,
        headers: {
          "content-type": `application/json; charset=utf-8`,
          "content-encoding": `identity`,
          accept: `application/json`,
          "accept-charset": `utf-8`,
          "accept-encoding": `identity`,
        },
      })

      fails(415, {
        method: `POST`,
        headers: {
          "content-type": `invalid`,
          "content-encoding": `identity`,
          accept: `application/json`,
          "accept-charset": `utf-8`,
          "accept-encoding": `identity`,
        },
      })

      fails(415, {
        method: `POST`,
        headers: {
          "content-type": `application/json; charset=utf-8`,
          "content-encoding": `invalid`,
          accept: `application/json`,
          "accept-charset": `utf-8`,
          "accept-encoding": `identity`,
        },
      })

      fails(406, {
        method: `POST`,
        headers: {
          "content-type": `application/json; charset=utf-8`,
          "content-encoding": `identity`,
          accept: `invalid`,
          "accept-charset": `utf-8`,
          "accept-encoding": `identity`,
        },
      })

      fails(406, {
        method: `POST`,
        headers: {
          "content-type": `application/json; charset=utf-8`,
          "content-encoding": `identity`,
          accept: `application/json`,
          "accept-charset": `invalid`,
          "accept-encoding": `identity`,
        },
      })

      fails(406, {
        method: `POST`,
        headers: {
          "content-type": `application/json; charset=utf-8`,
          "content-encoding": `identity`,
          accept: `application/json`,
          "accept-charset": `utf-8`,
          "accept-encoding": `invalid`,
        },
      })
    })

    describe(`getRequestLength`, () => {
      function none(contentLength: undefined | string): void {
        describe(`given ${JSON.stringify(contentLength)}`, () => it(`returns a type of "none"`, () => expectAsync(nodeHttpChannel.getRequestLength({
          request: {
            headers: {
              "content-length": contentLength,
            },
          },
        })).toBeResolvedTo({
          type: `none`,
        })))
      }

      function maps(contentLength: string, length: number): void {
        describe(`given ${JSON.stringify(contentLength)}`, () => it(`returns the extracted content length`, () => expectAsync(nodeHttpChannel.getRequestLength({
          request: {
            headers: {
              "content-length": contentLength,
            },
          },
        })).toBeResolvedTo({
          type: `given`,
          length,
        })))
      }

      function rejects(contentLength: string): void {
        describe(`given ${JSON.stringify(contentLength)}`, () => it(`returns type "invalid"`, () => expectAsync(nodeHttpChannel.getRequestLength({
          request: {
            headers: {
              "content-length": contentLength,
            },
          },
        })).toBeResolvedTo({
          type: `invalid`,
        })))
      }

      describe(`given no content-length header`, () => it(`returns type "none"`, () => expectAsync(nodeHttpChannel.getRequestLength({
        request: {
          headers: {},
        },
      })).toBeResolvedTo({ type: `none` })))

      none(undefined)
      none(``)
      none(`     `)

      maps(`0`, 0)
      rejects(`+0`)
      rejects(`-0`)
      maps(`4`, 4)
      rejects(`+4`)
      rejects(`-4`)
      maps(`426`, 426)
      maps(`     426         `, 426)
      rejects(`+426`)
      rejects(`-426`)
      rejects(`4.26`)
      rejects(`+4.26`)
      rejects(`-4.26`)
      rejects(`.`)
      rejects(`+.`)
      rejects(`-.`)
      rejects(`4.`)
      rejects(`+4.`)
      rejects(`-4.`)
      rejects(`.26`)
      rejects(`+.26`)
      rejects(`-.26`)
      rejects(`1e4`)
      rejects(`+1e4`)
      rejects(`-1e4`)
    })

    describe(`getRequest`, () => {
      function doesNotComplete(
        description: string,
        act: (callbacks: {
          error(err: Error): void
          aborted(): void
          data(chunk: Buffer): void
          end(): void
        }) => void,
      ): void {
        describe(description, () => {
          const addListener = jasmine.createSpy(`addListener`)
          const removeListener = jasmine.createSpy(`removeListener`)
          const request = {
            addListener,
            removeListener,
          }
          addListener.and.returnValue(request)
          removeListener.and.returnValue(request)
          let resolvedOrRejected = false

          beforeAll(async () => {
            nodeHttpChannel.getRequest({ request }, 8).then(
              () => resolvedOrRejected = true,
              () => resolvedOrRejected = true,
            )

            await new Promise(resolve => setTimeout(resolve, 100))

            act({
              error(err: Error): void {
                addListener
                  .calls
                  .allArgs().filter(call => call[0] === `error`)[0][1](err)
              },
              aborted(): void {
                addListener
                  .calls
                  .allArgs().filter(call => call[0] === `aborted`)[0][1]()
              },
              data(chunk: Buffer): void {
                addListener
                  .calls
                  .allArgs().filter(call => call[0] === `data`)[0][1](chunk)
              },
              end(): void {
                addListener
                  .calls
                  .allArgs().filter(call => call[0] === `end`)[0][1]()
              },
            })

            await new Promise(resolve => setTimeout(resolve, 100))
          })

          it(`registers one error handler`, () => expect(addListener).toHaveBeenCalledWith(`error`, jasmine.any(Function)))
          it(`registers one aborted handler`, () => expect(addListener).toHaveBeenCalledWith(`aborted`, jasmine.any(Function)))
          it(`registers one data handler`, () => expect(addListener).toHaveBeenCalledWith(`data`, jasmine.any(Function)))
          it(`registers one end handler`, () => expect(addListener).toHaveBeenCalledWith(`end`, jasmine.any(Function)))
          it(`does not register any further handlers`, () => expect(addListener).toHaveBeenCalledTimes(4))
          it(`does not deregister any handlers`, () => () => expect(removeListener).not.toHaveBeenCalled())
          it(`does not resolve or reject the returned promise`, () => expect(resolvedOrRejected).toBeFalsy())
        })
      }

      function completes(
        description: string,
        act: (callbacks: {
          error(err: Error): void
          aborted(): void
          data(chunk: Buffer): void
          end(): void
        }) => void,
        result: neurofoamTypes.FetchedRequest,
      ): void {
        describe(description, () => {
          const addListener = jasmine.createSpy(`addListener`)
          const removeListener = jasmine.createSpy(`removeListener`)
          const request = {
            addListener,
            removeListener,
          }
          addListener.and.returnValue(request)
          removeListener.and.returnValue(request)
          let promise: Promise<neurofoamTypes.FetchedRequest>

          beforeAll(async () => {
            promise = nodeHttpChannel.getRequest({ request }, 8)

            await new Promise(resolve => setTimeout(resolve, 100))

            act({
              error(err: Error): void {
                addListener
                  .calls
                  .allArgs().filter(call => call[0] === `error`)[0][1](err)
              },
              aborted(): void {
                addListener
                  .calls
                  .allArgs().filter(call => call[0] === `aborted`)[0][1]()
              },
              data(chunk: Buffer): void {
                addListener
                  .calls
                  .allArgs().filter(call => call[0] === `data`)[0][1](chunk)
              },
              end(): void {
                addListener
                  .calls
                  .allArgs().filter(call => call[0] === `end`)[0][1]()
              },
            })

            await new Promise(resolve => setTimeout(resolve, 100))
          })

          it(`registers one error handler`, () => expect(addListener).toHaveBeenCalledWith(`error`, jasmine.any(Function)))
          it(`registers one aborted handler`, () => expect(addListener).toHaveBeenCalledWith(`aborted`, jasmine.any(Function)))
          it(`registers one data handler`, () => expect(addListener).toHaveBeenCalledWith(`data`, jasmine.any(Function)))
          it(`registers one end handler`, () => expect(addListener).toHaveBeenCalledWith(`end`, jasmine.any(Function)))
          it(`does not register any further handlers`, () => expect(addListener).toHaveBeenCalledTimes(4))
          it(`deregisters the error handler`, () => expect(removeListener).toHaveBeenCalledWith(`error`, addListener.calls.allArgs().filter(call => call[0] === `error`)[0][1]))
          it(`deregisters the aborted handler`, () => expect(removeListener).toHaveBeenCalledWith(`aborted`, addListener.calls.allArgs().filter(call => call[0] === `aborted`)[0][1]))
          it(`deregisters the data handler`, () => expect(removeListener).toHaveBeenCalledWith(`data`, addListener.calls.allArgs().filter(call => call[0] === `data`)[0][1]))
          it(`deregisters the end handler`, () => expect(removeListener).toHaveBeenCalledWith(`end`, addListener.calls.allArgs().filter(call => call[0] === `end`)[0][1]))
          it(`does not deregister any further handlers`, () => expect(removeListener).toHaveBeenCalledTimes(4))
          it(`resolves the promise`, () => expectAsync(promise).toBeResolvedTo(result))
        })
      }

      doesNotComplete(`when no events occur`, () => { })

      completes(`when the request is aborted`, callbacks => {
        callbacks.aborted()
      }, {
        type: `aborted`,
      })

      completes(`when an error occurs`, callbacks => {
        callbacks.error(new Error())
      }, {
        type: `error`,
      })

      completes(`when the request ends`, callbacks => {
        callbacks.end()
      }, {
        type: `tooShort`,
      })

      describe(`when some of the data is received`, () => {
        doesNotComplete(`then nothing happens`, callbacks => {
          callbacks.data(Buffer.from([0x54, 0x65, 0x73]))
        })

        completes(`then the request is aborted`, callbacks => {
          callbacks.data(Buffer.from([0x54, 0x65, 0x73]))
          callbacks.aborted()
        }, {
          type: `aborted`,
        })

        completes(`then an error occurs`, callbacks => {
          callbacks.data(Buffer.from([0x54, 0x65, 0x73]))
          callbacks.error(new Error())
        }, {
          type: `error`,
        })

        completes(`then the request ends`, callbacks => {
          callbacks.data(Buffer.from([0x54, 0x65, 0x73]))
          callbacks.end()
        }, {
          type: `tooShort`,
        })

        describe(`then some more of the data is received`, () => {
          doesNotComplete(`then nothing happens`, callbacks => {
            callbacks.data(Buffer.from([0x54, 0x65, 0x73]))
            callbacks.data(Buffer.from([0x74, 0x20, 0x53]))
          })

          completes(`then the request is aborted`, callbacks => {
            callbacks.data(Buffer.from([0x54, 0x65, 0x73]))
            callbacks.data(Buffer.from([0x74, 0x20, 0x53]))
            callbacks.aborted()
          }, {
            type: `aborted`,
          })

          completes(`then an error occurs`, callbacks => {
            callbacks.data(Buffer.from([0x54, 0x65, 0x73]))
            callbacks.data(Buffer.from([0x74, 0x20, 0x53]))
            callbacks.error(new Error())
          }, {
            type: `error`,
          })

          completes(`then the request ends`, callbacks => {
            callbacks.data(Buffer.from([0x54, 0x65, 0x73]))
            callbacks.data(Buffer.from([0x74, 0x20, 0x53]))
            callbacks.end()
          }, {
            type: `tooShort`,
          })

          describe(`then some more of the data is received`, () => {
            doesNotComplete(`then nothing happens`, callbacks => {
              callbacks.data(Buffer.from([0x54, 0x65, 0x73]))
              callbacks.data(Buffer.from([0x74, 0x20]))
              callbacks.data(Buffer.from([0x53, 0x74]))
            })

            completes(`then the request is aborted`, callbacks => {
              callbacks.data(Buffer.from([0x54, 0x65, 0x73]))
              callbacks.data(Buffer.from([0x74, 0x20]))
              callbacks.data(Buffer.from([0x53, 0x74]))
              callbacks.aborted()
            }, {
              type: `aborted`,
            })

            completes(`then an error occurs`, callbacks => {
              callbacks.data(Buffer.from([0x54, 0x65, 0x73]))
              callbacks.data(Buffer.from([0x74, 0x20]))
              callbacks.data(Buffer.from([0x53, 0x74]))
              callbacks.error(new Error())
            }, {
              type: `error`,
            })

            completes(`then the request ends`, callbacks => {
              callbacks.data(Buffer.from([0x54, 0x65, 0x73]))
              callbacks.data(Buffer.from([0x74, 0x20]))
              callbacks.data(Buffer.from([0x53, 0x74]))
              callbacks.end()
            }, {
              type: `tooShort`,
            })
          })

          describe(`then the rest of the data is received`, () => {
            doesNotComplete(`then nothing happens`, callbacks => {
              callbacks.data(Buffer.from([0x54, 0x65, 0x73]))
              callbacks.data(Buffer.from([0x74, 0x20]))
              callbacks.data(Buffer.from([0x53, 0x74, 0x72]))
            })

            completes(`then the request is aborted`, callbacks => {
              callbacks.data(Buffer.from([0x54, 0x65, 0x73]))
              callbacks.data(Buffer.from([0x74, 0x20]))
              callbacks.data(Buffer.from([0x53, 0x74, 0x72]))
              callbacks.aborted()
            }, {
              type: `aborted`,
            })

            completes(`then an error occurs`, callbacks => {
              callbacks.data(Buffer.from([0x54, 0x65, 0x73]))
              callbacks.data(Buffer.from([0x74, 0x20]))
              callbacks.data(Buffer.from([0x53, 0x74, 0x72]))
              callbacks.error(new Error())
            }, {
              type: `error`,
            })

            completes(`then the request ends`, callbacks => {
              callbacks.data(Buffer.from([0x54, 0x65, 0x73]))
              callbacks.data(Buffer.from([0x74, 0x20]))
              callbacks.data(Buffer.from([0x53, 0x74, 0x72]))
              callbacks.end()
            }, {
              type: `successful`,
              request: `Test Str`,
            })
          })

          completes(`then too much data is received`, callbacks => {
            callbacks.data(Buffer.from([0x54, 0x65, 0x73]))
            callbacks.data(Buffer.from([0x74, 0x20]))
            callbacks.data(Buffer.from([0x53, 0x74, 0x72, 0x0a]))
          }, {
            type: `tooLong`,
          })
        })

        describe(`then the rest of the data is received`, () => {
          doesNotComplete(`then nothing happens`, callbacks => {
            callbacks.data(Buffer.from([0x54, 0x65, 0x73]))
            callbacks.data(Buffer.from([0x74, 0x20, 0x53, 0x74, 0x72]))
          })

          completes(`then the request is aborted`, callbacks => {
            callbacks.data(Buffer.from([0x54, 0x65, 0x73]))
            callbacks.data(Buffer.from([0x74, 0x20, 0x53, 0x74, 0x72]))
            callbacks.aborted()
          }, {
            type: `aborted`,
          })

          completes(`then an error occurs`, callbacks => {
            callbacks.data(Buffer.from([0x54, 0x65, 0x73]))
            callbacks.data(Buffer.from([0x74, 0x20, 0x53, 0x74, 0x72]))
            callbacks.error(new Error())
          }, {
            type: `error`,
          })

          completes(`then the request ends`, callbacks => {
            callbacks.data(Buffer.from([0x54, 0x65, 0x73]))
            callbacks.data(Buffer.from([0x74, 0x20, 0x53, 0x74, 0x72]))
            callbacks.end()
          }, {
            type: `successful`,
            request: `Test Str`,
          })
        })

        completes(`then too much data is received`, callbacks => {
          callbacks.data(Buffer.from([0x54, 0x65, 0x73, 0x74, 0x20, 0x53, 0x74]))
          callbacks.data(Buffer.from([0x72, 0x0a]))
        }, {
          type: `tooLong`,
        })
      })

      describe(`when all of the data is received`, () => {
        doesNotComplete(`then nothing happens`, callbacks => {
          callbacks.data(Buffer.from([0x54, 0x65, 0x73, 0x74, 0x20, 0x53, 0x74, 0x72]))
        })

        completes(`then the request is aborted`, callbacks => {
          callbacks.data(Buffer.from([0x54, 0x65, 0x73, 0x74, 0x20, 0x53, 0x74, 0x72]))
          callbacks.aborted()
        }, {
          type: `aborted`,
        })

        completes(`then an error occurs`, callbacks => {
          callbacks.data(Buffer.from([0x54, 0x65, 0x73, 0x74, 0x20, 0x53, 0x74, 0x72]))
          callbacks.error(new Error())
        }, {
          type: `error`,
        })

        completes(`then the request ends`, callbacks => {
          callbacks.data(Buffer.from([0x54, 0x65, 0x73, 0x74, 0x20, 0x53, 0x74, 0x72]))
          callbacks.end()
        }, {
          type: `successful`,
          request: `Test Str`,
        })

        completes(`then more data is received`, callbacks => {
          callbacks.data(Buffer.from([0x54, 0x65, 0x73, 0x74, 0x20, 0x53, 0x74, 0x72]))
          callbacks.data(Buffer.from([0x0a]))
        }, {
          type: `tooLong`,
        })
      })

      completes(`when decoding fails in a one part message`, callbacks => {
        callbacks.data(Buffer.from([0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x20, 0xe3, 0x81]))
        callbacks.end()
      }, {
        type: `invalidEncoding`,
      })

      completes(`when decoding fails in a two part message`, callbacks => {
        callbacks.data(Buffer.from([0x48, 0x65, 0x6c, 0x6c, 0x6f]))
        callbacks.data(Buffer.from([0x20, 0xe3, 0x81]))
        callbacks.end()
      }, {
        type: `invalidEncoding`,
      })

      completes(`when decoding fails in a three part message`, callbacks => {
        callbacks.data(Buffer.from([0x48, 0x65, 0x6c]))
        callbacks.data(Buffer.from([0x6c, 0x6f, 0x20]))
        callbacks.data(Buffer.from([0xe3, 0x81]))
        callbacks.end()
      }, {
        type: `invalidEncoding`,
      })

      completes(`when decoding only succeeds by waiting until the entire string is available`, callbacks => {
        callbacks.data(Buffer.from([0x21, 0x21, 0x20, 0xe3, 0x81]))
        callbacks.data(Buffer.from([0x82, 0x20, 0x21]))
        callbacks.end()
      }, {
        type: `successful`,
        request: `!! あ !`,
      })
    })

    describe(`respondWithError`, () => {
      function maps(error: neurofoamTypes.ErrorResponse, statusCode: number): void {
        describe(`given error ${JSON.stringify(error)}`, () => {
          describe(`when the callback is not executed`, () => {
            let writeHead: jasmine.Spy
            let end: jasmine.Spy
            let resolvedOrRejected = false

            beforeAll(() => {
              writeHead = jasmine.createSpy(`writeHead`)
              end = jasmine.createSpy(`end`)

              const response = {
                writeHead,
                end,
              }

              writeHead.and.returnValue(response)
              end.and.returnValue(end)

              nodeHttpChannel.respondWithError({ response }, error).then(() => resolvedOrRejected = true, () => resolvedOrRejected = true)
            })

            it(`writes one response header`, () => expect(writeHead).toHaveBeenCalledTimes(1))
            it(`includes HTTP status code in the response header`, () => expect(writeHead).toHaveBeenCalledWith(statusCode))
            it(`writes one response footer`, () => expect(end).toHaveBeenCalledTimes(1))
            it(`writes the response header before the response footer`, () => expect(writeHead).toHaveBeenCalledBefore(end))
            it(`includes the response body in the footer`, () => expect(end).toHaveBeenCalledWith(jasmine.anything()))
            it(`does not reject or resolve the returned promise`, () => expect(resolvedOrRejected).toBeFalse())
          })

          describe(`when the callback is executed`, () => {
            let writeHead: jasmine.Spy
            let end: jasmine.Spy
            let promise: Promise<void>

            beforeAll(async () => {
              writeHead = jasmine.createSpy(`writeHead`)
              end = jasmine.createSpy(`end`)

              const response = {
                writeHead,
                end,
              }

              writeHead.and.returnValue(response)
              end.and.returnValue(end)

              promise = nodeHttpChannel.respondWithError({ response }, error)

              await new Promise(resolve => setTimeout(resolve, 100))

              end.calls.argsFor(0)[0]()

              await new Promise(resolve => setTimeout(resolve, 100))
            })

            it(`does not write another response header`, () => expect(writeHead).toHaveBeenCalledTimes(1))
            it(`does not write another response footer`, () => expect(end).toHaveBeenCalledTimes(1))
            it(`resolves the returned promise`, () => expectAsync(promise).toBeResolved())
          })
        })
      }

      function ignores(error: neurofoamTypes.ErrorResponse): void {
        describe(`given error ${JSON.stringify(error)}`, () => {
          let writeHead: jasmine.Spy
          let end: jasmine.Spy
          let promise: Promise<void>

          beforeAll(async () => {
            writeHead = jasmine.createSpy(`writeHead`)
            end = jasmine.createSpy(`end`)

            const response = {
              writeHead,
              end,
            }

            writeHead.and.returnValue(response)
            end.and.returnValue(end)

            promise = nodeHttpChannel.respondWithError({ response }, error)

            await new Promise(resolve => setTimeout(resolve, 100))
          })

          it(`does not write a response header`, () => expect(writeHead).not.toHaveBeenCalled())
          it(`does not write a response footer`, () => expect(end).not.toHaveBeenCalled())
          it(`resolves the returned promise`, () => expectAsync(promise).toBeResolved())
        })
      }

      maps(`invalidBubbleUuid`, 404)
      maps(`invalidSessionUuid`, 403)
      maps(`requestTooShort`, 411)
      maps(`requestTooLong`, 413)
      ignores(`requestAborted`)
      ignores(`requestInterruptedByError`)
      maps(`requestIncorrectlyEncoded`, 415)
      maps(`nonJsonRequest`, 400)
      maps(`requestFailsSchemaValidation`, 422)
      maps(`requestShorterThanIndicated`, 400)
      maps(`requestLongerThanIndicated`, 400)
      maps(`invalidRequestLength`, 400)
    })

    describe(`respond`, () => {
      describe(`when no session uuid is given`, () => {
        describe(`when the callback is not executed`, () => {
          let writeHead: jasmine.Spy
          let end: jasmine.Spy
          let resolvedOrRejected = false

          beforeAll(async () => {
            writeHead = jasmine.createSpy(`writeHead`)
            end = jasmine.createSpy(`end`)

            const response = {
              writeHead,
              end,
            }

            writeHead.and.returnValue(response)
            end.and.returnValue(end)

            nodeHttpChannel.respond({ response }, null, `Test Response`).then(() => resolvedOrRejected = true, () => resolvedOrRejected = true)

            await new Promise(resolve => setTimeout(resolve, 100))
          })

          it(`writes one response header`, () => expect(writeHead).toHaveBeenCalledTimes(1))
          it(`includes HTTP status code in the response header`, () => expect(writeHead).toHaveBeenCalledWith(200))
          it(`writes one response footer`, () => expect(end).toHaveBeenCalledTimes(1))
          it(`writes the response header before the response footer`, () => expect(writeHead).toHaveBeenCalledBefore(end))
          it(`includes the response body in the footer`, () => expect(end).toHaveBeenCalledWith(`Test Response`, jasmine.anything()))
          it(`does not reject or resolve the returned promise`, () => expect(resolvedOrRejected).toBeFalse())
        })

        describe(`when the callback is executed`, () => {
          let writeHead: jasmine.Spy
          let end: jasmine.Spy
          let promise: Promise<void>

          beforeAll(async () => {
            writeHead = jasmine.createSpy(`writeHead`)
            end = jasmine.createSpy(`end`)

            const response = {
              writeHead,
              end,
            }

            writeHead.and.returnValue(response)
            end.and.returnValue(end)

            promise = nodeHttpChannel.respond({ response }, null, `Test Response`)

            await new Promise(resolve => setTimeout(resolve, 100))

            end.calls.argsFor(0)[1]()

            await new Promise(resolve => setTimeout(resolve, 100))
          })

          it(`does not write another response header`, () => expect(writeHead).toHaveBeenCalledTimes(1))
          it(`does not write another response footer`, () => expect(end).toHaveBeenCalledTimes(1))
          it(`resolves the returned promise`, () => expectAsync(promise).toBeResolved())
        })
      })

      describe(`when a session uuid is given`, () => {
        describe(`when the callback is not executed`, () => {
          let writeHead: jasmine.Spy
          let end: jasmine.Spy
          let resolvedOrRejected = false

          beforeAll(async () => {
            writeHead = jasmine.createSpy(`writeHead`)
            end = jasmine.createSpy(`end`)

            const response = {
              writeHead,
              end,
            }

            writeHead.and.returnValue(response)
            end.and.returnValue(end)

            nodeHttpChannel.respond({ response }, `Test Session Uuid`, `Test Response`).then(() => resolvedOrRejected = true, () => resolvedOrRejected = true)

            await new Promise(resolve => setTimeout(resolve, 100))
          })

          it(`writes one response header`, () => expect(writeHead).toHaveBeenCalledTimes(1))
          it(`includes HTTP status code in the response header`, () => expect(writeHead).toHaveBeenCalledWith(200, jasmine.anything()))
          it(`includes an Authorization HTTP header in the response header`, () => expect(writeHead).toHaveBeenCalledWith(jasmine.anything(), jasmine.objectContaining({ Authorization: `BEARER Test Session Uuid` })))
          it(`writes one response footer`, () => expect(end).toHaveBeenCalledTimes(1))
          it(`writes the response header before the response footer`, () => expect(writeHead).toHaveBeenCalledBefore(end))
          it(`includes the response body in the footer`, () => expect(end).toHaveBeenCalledWith(`Test Response`, jasmine.anything()))
          it(`does not reject or resolve the returned promise`, () => expect(resolvedOrRejected).toBeFalse())
        })

        describe(`when the callback is executed`, () => {
          let writeHead: jasmine.Spy
          let end: jasmine.Spy
          let promise: Promise<void>

          beforeAll(async () => {
            writeHead = jasmine.createSpy(`writeHead`)
            end = jasmine.createSpy(`end`)

            const response = {
              writeHead,
              end,
            }

            writeHead.and.returnValue(response)
            end.and.returnValue(end)

            promise = nodeHttpChannel.respond({ response }, `Test Session Uuid`, `Test Response`)

            await new Promise(resolve => setTimeout(resolve, 100))

            end.calls.argsFor(0)[1]()

            await new Promise(resolve => setTimeout(resolve, 100))
          })

          it(`does not write another response header`, () => expect(writeHead).toHaveBeenCalledTimes(1))
          it(`does not write another response footer`, () => expect(end).toHaveBeenCalledTimes(1))
          it(`resolves the returned promise`, () => expectAsync(promise).toBeResolved())
        })
      })
    })
  })
})
