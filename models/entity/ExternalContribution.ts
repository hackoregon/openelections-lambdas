import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  AfterUpdate,
  AfterInsert,
  PrimaryColumn,
  getConnection,
} from 'typeorm';
import { IsDefined, validate, ValidationError } from 'class-validator';
import { geocodeAddressAsync } from '@services/geocodeContributions';

export enum ContributionType {
  CONTRIBUTION = 'contribution',
  OTHER = 'other'
}

export enum ContributionSubType {
  CASH = 'cash',
  INKIND_CONTRIBUTION = 'inkind_contribution',
  INKIND_PAID_SUPERVISION = 'inkind_paid_supervision',
  INKIND_FORGIVEN_ACCOUNT = 'inkind_forgiven_account',
  INKIND_FORGIVEN_PERSONAL = 'inkind_forgiven_personal',
  ITEM_SOLD_FAIR_MARKET = 'item_sold_fair_market',
  ITEM_RETURNED_CHECK = 'item_returned_check',
  ITEM_MISC = 'item_misc',
  ITEM_REFUND = 'item_refund'
}

export enum ContributorType {
  INDIVIDUAL = 'individual',
  BUSINESS = 'business',
  FAMILY = 'family',
  LABOR = 'labor',
  POLITICAL_COMMITTEE = 'political_committee',
  POLITICAL_PARTY = 'political_party',
  UNREGISTERED = 'unregistered',
  OTHER = 'other'
}

export enum PhoneType {
  MOBILE = 'Mobile',
  WORK = 'Work',
  HOME = 'Home'
}

export enum ContributionStatus {
  ARCHIVED = 'Archived',
  DRAFT = 'Draft',
  SUBMITTED = 'Submitted',
  PROCESSED = 'Processed',
  AWAITING = 'Awaiting',
}

export enum MatchStrength {
  STRONG = 'strong',
  EXACT = 'exact',
  WEAK = 'weak',
  NONE = 'none'
}

export enum InKindDescriptionType {
  WAGES = 'wages',
  BROADCAST = 'broadcast_advertising',
  FUNDRAISING = 'fundraising_event_expenses',
  GENERAL_OPERATING = 'general_operating_expenses',
  PRIMTING = 'printing',
  MANAGEMENT = 'management',
  NEWSPAPER = 'print_advertising',
  OTHER_AD = 'other_advertising',
  PETITION = 'petition_circulators',
  POSTAGE = 'postage',
  PREP_AD = 'preparation_of_advertising',
  POLLING = 'surveys_and_polls',
  TRAVEL = 'travel_expenses',
  UTILITIES = 'utilities'
}

export enum OaeType {
  SEED = 'seed',
  MATCHABLE = 'matchable',
  PUBLICMATCHING = 'public_matching_contribution',
  QUALIFYING = 'qualifying',
  ALLOWABLE = 'allowable',
  INKIND = 'inkind'
}

export enum PaymentMethod {
  CASH = 'cash',
  CHECK = 'check',
  MONEY_ORDER = 'money_order',
  CREDIT_CARD_ONLINE = 'credit_card_online',
  CREDIT_CARD_PAPER = 'credit_card_paper',
  ETF = 'electronic_funds_transfer',
  DEBIT = 'debit'
}

// Note, if you change any column type on the model, it will do a drop column operation, which means data loss in production.
@Entity('external_contributions')
export class ExternalContribution {
  // New: from Orestar
  @PrimaryColumn()
  orestarOriginalId: string;

  // New: from Orestar
  @Column()
  orestarTransactionId: string;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  @Column({
    type: 'enum',
    enum: ContributionType,
    default: ContributionType.CONTRIBUTION,
  })
  @IsDefined()
  type: ContributionType;

  @Column({
    type: 'enum',
    enum: ContributionSubType,
  })
  @IsDefined()
  subType: ContributionSubType;

  @Column({
    type: 'enum',
    enum: ContributorType,
  })
  @IsDefined()
  contributorType: ContributorType;

  @Column({ nullable: true })
  name?: string;

  @IsDefined()
  @Column()
  address1: string;

  @Column({ nullable: true })
  address2?: string;

  @IsDefined()
  @Column()
  city: string;

  @IsDefined()
  @Column()
  state: string;

  @IsDefined()
  @Column()
  zip: string;

  @Column()
  country: string;

  @Column({ nullable: true })
  notes?: string;

  @Column({
    type: 'decimal',
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  amount: number;

  @Column({ nullable: true })
  occupation?: string;

  @Column({ nullable: true })
  employerName?: string;

  @Column({ nullable: true })
  employerCity?: string;

  @Column({ nullable: true })
  employerState?: string;

  @Column()
  @IsDefined()
  date: Date;

  @Column({
    type: 'geometry',
    nullable: true,
    spatialFeatureType: 'Point',
    srid: 4326,
  })
  addressPoint?: any; // geoJson coordinates for address

  public errors: ValidationError[] = [];

  @AfterUpdate()
  updateStatus() {
    console.log('UPDATED')
  }

  @AfterInsert()
  async inserted() {
    const geoCode = await geocodeAddressAsync({
      address1: this.address1,
      city: this.city,
      state: this.state,
      zip: this.zip
    })
    const connection = await getConnection('default');
    const repo = connection.getRepository('external_contributions');
    console.log(this.orestarOriginalId)
    await repo.update(this.orestarOriginalId, {
      addressPoint: {
        type: 'Point',
        coordinates: geoCode
    }
    }).then((res) => console.log('inserted', res))
  }


  async isValidAsync(): Promise<boolean> {
    await this.validateAsync();
    return this.errors.length === 0;
  }

  async validateAsync(): Promise<ValidationError[]> {
    const errors = await validate(this);
    this.errors = errors;
    this.validateType();
    this.validateName();
    this.validateContributorAddress();
    return this.errors;
  }

  validateType() {
    if (this.type === ContributionType.CONTRIBUTION) {
      if (
        ![
          ContributionSubType.CASH,
          ContributionSubType.INKIND_CONTRIBUTION,
          ContributionSubType.INKIND_PAID_SUPERVISION,
          ContributionSubType.INKIND_FORGIVEN_ACCOUNT,
          ContributionSubType.INKIND_FORGIVEN_PERSONAL,
        ].includes(this.subType)
      ) {
        const error = new ValidationError();
        error.property = 'subType';
        error.constraints = {
          notAllowed: 'Type "contribution" must have a valid subType of "cash or an inkind value"',
        };
        this.errors.push(error);
      }
    } else if (
      [
        ContributionSubType.CASH,
        ContributionSubType.INKIND_CONTRIBUTION,
        ContributionSubType.INKIND_PAID_SUPERVISION,
        ContributionSubType.INKIND_FORGIVEN_ACCOUNT,
        ContributionSubType.INKIND_FORGIVEN_PERSONAL,
      ].includes(this.subType)
    ) {
      const error = new ValidationError();
      error.property = 'subType';
      error.constraints = { notAllowed: 'Type "other" cannot have a subType of "cash or inkind value"' };
      this.errors.push(error);
    }
  }

  validateName() {
    if (!this.name || this.name.trim() === '') {
      const error = new ValidationError();
      error.property = 'name';
      error.constraints = { isDefined: 'name should not be null or undefined' };
      this.errors.push(error);
    }
  }

  validateContributorAddress() {
    if (this.contributorType === ContributorType.INDIVIDUAL || this.contributorType === ContributorType.FAMILY) {
      return this.address1 && this.city && this.zip && this.state;
    }
    return true;
  }
}

export const contributionSummaryFields = <const>[
  'orestarOriginalId',
  'orestarTransactionId',
  'country',
  'amount',
  'createdAt',
  'updatedAt',
  'type',
  'subType',
  'contributorType',
  'name',
  'address1',
  'address2',
  'city',
  'state',
  'zip',
  'occupation',
  'employerName',
  'employerCity',
  'employerState',
  'notes',
  'date',
  'addressPoint',
];
export type IContributionSummary = Pick<ExternalContribution, typeof contributionSummaryFields[number]>;
