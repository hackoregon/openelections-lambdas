import sinon from 'sinon';
import { expect } from 'chai';
import addContribution from "../../services/addContribution"
import { newContributionAsync } from "../factories"
import { Repository } from "typeorm"
import * as geoService from "../../services/geocodeContributions"

let repository
let findOneOrFailSpy
let saveSpy

describe('addContribution', () => {
  beforeEach(() => {
    sinon.stub(geoService, 'geocodeAddressAsync').resolves([100,100])
    findOneOrFailSpy = sinon.stub()
    saveSpy = sinon.stub()
    repository = {
      findOneOrFail: async (args: any) => {
        console.log(args)
        findOneOrFailSpy(1)
      },
      save: async (args) => {
        console.log(args)
        saveSpy(args)
      }
    }
  })
  afterEach(() => {
    // findOneOrFailSpy.restore()
    // saveSpy.restore()
    sinon.restore()
    repository = null
  })
  it('addContribution: passes', async () => {
    const contribution = newContributionAsync()
    await addContribution(contribution, (repository as Repository<unknown>))
    expect(findOneOrFailSpy.called).to.equal(true)
    expect(saveSpy.called).to.equal(true)
    const findCall = findOneOrFailSpy.getCall(0)
    const saveCall = saveSpy.getCall(0)
    console.log(findOneOrFailSpy.getCall(0).args[0])
    expect(findCall.args[0]).to.equal(1) // orestarOriginalId
    expect(saveCall.args[0]).to.deep.equal({
      ...contribution,
      addressPoint: { "type": "Point", "coordinates": [ 100, 100 ] },
      "errors": [],
    })
  })
})