import sinon from 'sinon';
import { expect } from 'chai';
import addContribution from "../../services/addContribution"
import { newContributionAsync } from "../factories"
import { Repository } from "typeorm"
import * as geoService from "../../services/geocodeContributions"

let repository
let findOneOrFailSpy
let saveSpy
let geoStub

describe('addContribution', () => {
  describe('save called', () => {
    beforeEach(() => {
      geoStub = sinon.stub(geoService, 'geocodeAddressAsync').resolves([100,100])
      findOneOrFailSpy = sinon.stub()
      saveSpy = sinon.stub()
      repository = {
        findOneOrFail: async (args: any) => {
          findOneOrFailSpy(args)
          throw new Error('Nope')
        },
        save: async (args) => {
          saveSpy(args)
        }
      }
    })
    afterEach(() => {
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
      expect(findCall.args[0]).to.equal("1") // orestarOriginalId
      expect(geoStub.called).to.equal(true)
      expect(saveCall.args[0]).to.deep.equal({
        ...contribution,
        addressPoint: { "type": "Point", "coordinates": [ 100, 100 ] },
        "errors": [],
      })
    })
    it('addContribution: passes again', async () => {
      const contribution = newContributionAsync()
      contribution.orestarOriginalId = "2"
      await addContribution(contribution, (repository as Repository<unknown>))
      expect(findOneOrFailSpy.called).to.equal(true)
      expect(saveSpy.called).to.equal(true)
      const findCall = findOneOrFailSpy.getCall(0)
      const saveCall = saveSpy.getCall(0)
      expect(findCall.args[0]).to.equal("2") // orestarOriginalId
      expect(geoStub.called).to.equal(true)
      expect(saveCall.args[0]).to.deep.equal({
        ...contribution,
        addressPoint: { "type": "Point", "coordinates": [ 100, 100 ] },
        "errors": [],
      })
    })
  })
  describe('findOneOrFail called', () => {
    beforeEach(() => {
      geoStub = sinon.stub(geoService, 'geocodeAddressAsync').resolves([100,100])
      findOneOrFailSpy = sinon.stub()
      saveSpy = sinon.stub()
    })
    afterEach(() => {
      sinon.restore()
      repository = null
    })
    it('findOneOrFail returns with no addressPoint', async () => {
      const contribution = newContributionAsync()
      repository = {
        findOneOrFail: async (args: any) => {
          findOneOrFailSpy(args)
          return contribution
        },
        save: async (args) => {
          saveSpy(args)
        }
      }
      await addContribution(contribution, (repository as Repository<unknown>))
      expect(findOneOrFailSpy.called).to.equal(true)
      expect(saveSpy.called).to.equal(true)
      const findCall = findOneOrFailSpy.getCall(0)
      const saveCall = saveSpy.getCall(0)
      expect(findCall.args[0]).to.equal("1")
      expect(geoStub.called).to.equal(true)
      expect(saveCall.args[0]).to.deep.equal({
        ...contribution,
        addressPoint: { "type": "Point", "coordinates": [ 100, 100 ] },
        "errors": [],
      })
    })
    it('findOneOrFail returns with addressPoint', async () => {
      const contribution = newContributionAsync()
      contribution.addressPoint = {
        type: 'Point',
        coordinates: [ 100, 100 ]
      }
      repository = {
        findOneOrFail: async (args: any) => {
          findOneOrFailSpy(args)
          return contribution
        },
        save: async (args) => {
          saveSpy(args)
        }
      }
      await addContribution(contribution, (repository as Repository<unknown>))
      expect(findOneOrFailSpy.called).to.equal(true)
      expect(saveSpy.called).to.equal(false)
      const findCall = findOneOrFailSpy.getCall(0)
      expect(findCall.args[0]).to.equal("1")
      expect(geoStub.called).to.equal(false)
    })
  })
})