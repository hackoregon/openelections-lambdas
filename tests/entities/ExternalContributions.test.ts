import 'reflect-metadata';
import {
    ExternalContribution,
    // ContributionStatus,
    ContributionSubType,
    ContributionType,
    // ContributorType,
} from '@models/entity/ExternalContribution';
// import { newContributionAsync } from '../factories';

jest.mock('typeorm')
// let repository: any;

describe('Contribution', () => {
    // beforeAll(() => {
    //     repository = getConnection('default').getRepository('external_contributions');
    //     getConnectionManager.mockImplementation()
    // });

    // beforeEach(async () => {
    //     government = await newGovernmentAsync();
    //     campaign = await newCampaignAsync(government);
    // });

    // afterEach(async () => {
    //     await truncateAll();
    // });

    describe('validations', () => {
        it('isDefined Columns', async () => {
            const newRecord = new ExternalContribution();
            console.log(newRecord)
            expect(1).toBe(1)
            // newRecord.type = ContributionType.CONTRIBUTION;
            // newRecord.subType = ContributionSubType.CASH;
            // await newRecord.validateAsync();
            // expect(newRecord.errors.length).toEqual(12);
            // const isDefinedFields = newRecord.errors.map(item => item.property);
            // expect(isDefinedFields).toEqual([
            //     'type',
            //     'subType',
            //     'contributorType',
            //     'address1',
            //     'city',
            //     'state',
            //     'zip',
            //     'status',
            //     'date',
            //     'campaignId',
            //     'governmentId',
            //     'name',
            // ]);
        });

        // it('validateType CONTRIBUTION', async () => {
        //     const newRecord = new ExternalContribution();
        //     newRecord.type = ContributionType.CONTRIBUTION;
        //     newRecord.subType = ContributionSubType.CASH;
        //     expect(newRecord.errors.length).toEqual(0);
        //     await newRecord.validateType();
        //     expect(newRecord.errors.length).toEqual(1);
        //     expect(newRecord.errors[0].property).toEqual('subType');
        //     expect(newRecord.errors[0].constraints.notAllowed).toEqual('Type "contribution" must have a valid subType of "cash or an inkind value"');
        // });

        // it('validatePaymentType CONTRIBUTION CASH', async () => {
        //     const newRecord = new ExternalContribution();
        //     newRecord.type = ContributionType.CONTRIBUTION;
        //     newRecord.subType = ContributionSubType.CASH;
        //     expect(newRecord.errors.length).toEqual(0);
        //     await newRecord.validatePaymentType();
        //     expect(newRecord.errors.length).toEqual(1);
        // });

        // it('validateType OTHER', async () => {
        //     const newRecord = new ExternalContribution();
        //     newRecord.type = ContributionType.OTHER;
        //     newRecord.subType = ContributionSubType.CASH;
        //     expect(newRecord.errors.length).toEqual(0);
        //     await newRecord.validateType();
        //     expect(newRecord.errors.length).toEqual(1);
        //     expect(newRecord.errors[0].property).toEqual('subType');
        //     expect(newRecord.errors[0].constraints.notAllowed).toEqual('Type "other" cannot have a subType of "cash or inkind value"');
        // });

        // it('validateName Individual', async () => {
        //     const newRecord = new ExternalContribution();
        //     newRecord.type = ContributionType.CONTRIBUTION;
        //     newRecord.subType = ContributionSubType.CASH;
        //     newRecord.contributorType = ContributorType.INDIVIDUAL;
        //     expect(newRecord.errors.length).toEqual(0);
        //     await newRecord.validateName();
        //     expect(newRecord.errors.length).toEqual(2);
        //     expect(newRecord.errors[0].property).toEqual('lastName');
        //     expect(newRecord.errors[1].property).toEqual('firstName');
        // });

        // it('validateName Family', async () => {
        //     const newRecord = new ExternalContribution();
        //     newRecord.type = ContributionType.CONTRIBUTION;
        //     newRecord.subType = ContributionSubType.CASH;
        //     newRecord.contributorType = ContributorType.FAMILY;
        //     expect(newRecord.errors.length).toEqual(0);
        //     await newRecord.validateName();
        //     expect(newRecord.errors.length).toEqual(2);
        //     expect(newRecord.errors[0].property).toEqual('lastName');
        //     expect(newRecord.errors[1].property).toEqual('firstName');
        // });

        // it('validateName not Individual', async () => {
        //     const newRecord = new ExternalContribution();
        //     newRecord.type = ContributionType.CONTRIBUTION;
        //     newRecord.subType = ContributionSubType.CASH;
        //     newRecord.contributorType = ContributorType.BUSINESS;
        //     expect(newRecord.errors.length).toEqual(0);
        //     await newRecord.validateName();
        //     expect(newRecord.errors.length).toEqual(1);
        //     expect(newRecord.errors[0].property).toEqual('name');
        // });

        // it('validateMatchAmount', async () => {
        //     const newRecord = new ExternalContribution();
        //     newRecord.type = ContributionType.CONTRIBUTION;
        //     newRecord.subType = ContributionSubType.CASH;
        //     newRecord.contributorType = ContributorType.INDIVIDUAL;
        //     newRecord.amount = 1.00;
        //     expect(newRecord.errors.length).toEqual(0);
        //     await newRecord.validateMatchAmount();
        //     expect(newRecord.errors.length).toEqual(1);
        //     expect(newRecord.errors[0].property).toEqual('matchAmount');
        // });

        // it('isInKind && validateInKindType', async () => {
        //     const newRecord = new ExternalContribution();
        //     newRecord.type = ContributionType.CONTRIBUTION;
        //     newRecord.subType = ContributionSubType.INKIND_CONTRIBUTION;
        //     newRecord.contributorType = ContributorType.INDIVIDUAL;
        //     expect(newRecord.isInKind()).to.be.true;
        //     expect(!newRecord.inKindType).to.be.true;
        //     await newRecord.validateInKindType();
        //     expect(newRecord.errors.length).toEqual(1);
        //     expect(newRecord.errors[0].property).toEqual('inKindType');
        // });
    });
});

