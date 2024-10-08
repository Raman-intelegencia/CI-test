// Generated by https://quicktype.io

import { AMSConnectService, VendorService, AMSConnectUser, VendorUser } from "../app/institutions/institution-details/integration-wizard/view-models/card-data-handlers";

export interface DefaultServerResponse {
    status: string;
    message?: string;
}

export interface IntegrationTimeUnits {
    pollingUnits: string[];
    scanUnits: string[];
}
export interface IntegrationEnumResponse {
    timeUnits: IntegrationTimeUnits;
    vendorTypes: string[];
}

export interface DashboardIntegrationResponse {
    integrations?: DashboardIntegration[];
}

export interface ModifyIntegrationDTO {
    institutionId?: string;
    vendorType: string | IntegrationVendorType;
    pollingPeriod: number;
    pollingUnit: string;
    scanUnit: string;
    scanPeriod: number;

    childOrganizations?: string[];
    connectionDetails?: AmTelcoConnectionDetails;
    credentials?: object;
}

export interface AmTelcoConnectionDetails {
    host: string,
    directoryId?: number;
    columnInfo?: AmTelcoColumnData[];
}

export interface AmTelcoColumnData {
    type: string;
    id: number;
}

export interface DashboardIntegration {
    integrationData: Integration

    totalUnmatchedEntities?: number;
    lastSyncTime?: string | Date;
    childOrganizations?: string[]
    isHealthy: boolean;
    problems?: SyncProblem[];
    totalSyncsConsidered: number;
    successfulSyncs: number;
}

export interface SyncProblem {
    type: string
}

export interface OutdatedSyncProblem extends SyncProblem{
    lastSyncTime: Date
}

export interface IntegrationSyncStatus {
    status: string;
    isDone: boolean;
}

export interface IntegrationSyncScheduledData {
    status: string;
    jobId: string;
}

export enum IntegrationVendorType {
    Amion = "Amion", AmTelco = "AmTelco", QGenda = "QGenda"
}

export interface Integration {
    id: number;
    childOrganizations?: string[]
    institutionId: string;
    vendorType: string | IntegrationVendorType;
    pollingPeriod: number;
    pollingUnit: string;
    scanPeriod: number;
    scanUnit: string;
    connectionDetails?: AmTelcoConnectionDetails;
    isActive: boolean;
}

export interface ReportConfigDTO {
    interval?: number,
    intervalUnit?: "Hour" | "Day",
    recipientEmailAddresses: string[]
}

export interface ServicesAndMatchesDTO {
    unmatched_ams_services: AmsServiceDTO[];
    unmatched_vendor_services: VendorServiceDTO[];
    matches: ServiceMatchDTO[];
    ignored_ams_services: AmsServiceDTO[];
    ignored_vendor_services: VendorServiceDTO[];
}

export interface UpdateUserMatchesDTO {
    ignoredAmsUsers: IgnoredAmsUserDTO[];
    ignoredVendorUsers: IgnoredVendorUserDTO[];
    matchedUsers: SetUserMatchDTO[];

    unmatchedEntityCount?: number
}

export interface UpdateServiceMatchesDTO {
    ignoredAmsServiceTeams: IgnoredAmsServiceDTO[];
    ignoredVendorEntities: IgnoredVendorScheduleDTO[];
    matchedServiceTeams: SetServiceMatchDTO[];

    unmatchedEntityCount?: number;
    serviceTeamSource?: string;
}

export interface VendorServiceDTO {
    id: string;
    name: string;
    pagerNumber?: string;
    secondaryPagerOptions: string[];
    additionalProperties: { [property: string]: string | null };
    externalIntegrationId?: string;
}

export interface AmsServiceDTO {
    contactInformation: {
        pagerNumber?: string;
        name: string;
    };
    institution: {
        id: string;
        name: string;
    };
    id: { $oid: string };
    externalIntegrationId?: string;
}

export interface ServiceMatchDTO {
    ams_service: AmsServiceDTO;
    vendor_entity: VendorServiceDTO;
    matchMeta?: {
        matches?: MatchMeta[];
    }
}

export interface IgnoredAmsServiceDTO {
    organizationId: string;
    amsServiceTeamId: string;
}

export interface IgnoredVendorScheduleDTO {
    vendorEntityId: string;
}

export interface SetServiceMatchDTO {
    organizationId: string;
    amsServiceTeamId: string;
    vendorEntityId: string;
    matchMeta?: {
        matches?: MatchMeta[];
    }
}

export interface SetUserMatchDTO {
    organizationId: string;
    amsUserId: string;
    vendorUserId: string;
    matchMeta?: {
        matches?: MatchMeta[];
    }
}

export interface ServiceMatch {
    ams_service: AMSConnectService;
    vendor_service: VendorService;
    matchMeta?: {
        matches?: MatchMeta[];
    }
}

export interface UsersAndMatchesDTO {
    unmatched_ams_users: AmsUserDTO[];
    unmatched_vendor_users: VendorUserDTO[];
    matches: UserMatchDTO[];
    ignored_ams_users: AmsUserDTO[];
    ignored_vendor_users: VendorUserDTO[];
}

export interface VendorUserDTO {
    id: string;
    name: string;
    emailAddress?: string;
    mobilePhone?: string;
    pagerNumber?: string;
    secondaryPagerOptions: string[];
    additionalProperties: { [property: string]: string | null };
}

export interface AmsUserDTO {
    contactInformation: {
        firstName: string;
        lastName: string;
        title: string;
        department: string;
        emailAddress: string;
        cellPhoneNumber: string;
        pagerNumber?: string;
    };
    id: { $oid: string };
    institution: {
        id: string;
        name: string;
    };
    isInactive: boolean;
}

export interface IgnoredAmsUserDTO {
    organizationId: string;
    amsUserId: string;
}

export interface IgnoredVendorUserDTO {
    vendorUserId: string;
}

export interface UserMatchDTO {
    ams_user: AmsUserDTO;
    vendor_user: VendorUserDTO;
    matchMeta?: {
        matches?: MatchMeta[];
    }
}

export interface UserMatch {
    ams_user: AMSConnectUser;
    vendor_user: VendorUser;
    matchMeta?: {
        matches?: MatchMeta[];
    }
}

export enum IntegrationWizardSteps {
    SETTINGS = "Settings",
    MATCH_USERS = "Match Users",
    MATCH_TEAMS = "Match Teams",
    DONE = "Done"
}

export const getNextStep = (step: IntegrationWizardSteps | string): IntegrationWizardSteps | null => {
    switch (step) {
        case IntegrationWizardSteps.SETTINGS:
            return IntegrationWizardSteps.MATCH_USERS;
        case IntegrationWizardSteps.MATCH_USERS:
            return IntegrationWizardSteps.MATCH_TEAMS;
        case IntegrationWizardSteps.MATCH_TEAMS:
            return IntegrationWizardSteps.DONE;
        default:
            return null;
    }
}

export const getPreviousStep = (step: IntegrationWizardSteps | string): IntegrationWizardSteps | null => {
    switch (step) {
        case IntegrationWizardSteps.MATCH_USERS:
            return IntegrationWizardSteps.SETTINGS;
        case IntegrationWizardSteps.MATCH_TEAMS:
            return IntegrationWizardSteps.MATCH_USERS;
        case IntegrationWizardSteps.DONE:
            return IntegrationWizardSteps.MATCH_TEAMS;
        default:
            return null;
    }
}

export interface AmTelcoDirectoryDTO {
    id: string;
    name: string;
}

export interface AmTelcoDirectoryFieldDTO {
    id: number;
    displayName: string;
}

export interface VendorCredentials {
    username: string;
    password: string;
}

export interface VendorCredentialsRequest {
    username: string;
    password: string;
    host?: string;
    vendorType: string | IntegrationVendorType;
}

export enum CredentialsState {
    BadOrganization = -2,
    BadCredentials = -1,
    Undefined = 0,
    Success = 1
}

// automatic matching
export interface MatchMeta {
    vendorAttribute?: string;
    vendorValue?: string;
    amsAttribute?: string;
    amsValue?: string;
    confidence: number;
}

export enum VendorRowTypes {
    EmailAddress = "EmailAddress",
    MobilePhone = "MobilePhone",
    Name = "Name",
    PagerNumber = "PagerNumber",
}

export enum AMSRowTypes {
    CellPhoneNumber = "CellPhoneNumber",
    Name = "Name",
    PagerNumber = "PagerNumber",
    EmailAddress = "EmailAddress",
}