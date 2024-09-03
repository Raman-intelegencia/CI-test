import Fuse from "fuse.js";
import { CardDataTransformable } from "../card-list/card-list.component";
import { AmsUserDTO, IgnoredAmsUserDTO, VendorUserDTO, IgnoredVendorUserDTO, AmsServiceDTO, IgnoredAmsServiceDTO, VendorServiceDTO, IgnoredVendorScheduleDTO, AMSRowTypes, VendorRowTypes } from "apps/admin/src/models/integration.model";
import { CardData, CardDataRow, CardDataRowIcon } from "../base-card/base-card.component";

const searchStrategies = {
    includes: (searchTerm: string, targetText: string[]): boolean => {
        return targetText.some(x => x.includes(searchTerm));
    },
    distance: (searchTerm: string, targetText: string[], maxDistance = 0.19): boolean => {
        const fuse = new Fuse(targetText, { includeScore: true });
        const results = fuse.search(searchTerm);

        return results.some(x => x.score != null && x.score <= maxDistance);
    }
}

const handleSearch = (searchTerm: string, targetText: string[]): boolean => {
    const digitsOnly = /^[0-9]*$/;
    if (searchTerm.match(digitsOnly) !== null) {
        return searchStrategies.includes(searchTerm, targetText);
    } else {
        return searchStrategies.distance(searchTerm, targetText);
    }
}

export class AMSConnectUser implements CardDataTransformable {
    constructor(
        public user: AmsUserDTO,
    ) {
        this.id = this.user.id.$oid
    }

    public id: string;

    public isSelected: boolean = false;

    private get termsToSearch(): string[] {
        return [
            this.user.contactInformation.firstName,
            this.user.contactInformation.lastName,
            this.user.contactInformation.cellPhoneNumber,
            this.user.contactInformation.department,
            this.user.contactInformation.emailAddress,
            this.user.contactInformation.pagerNumber,
            this.user.contactInformation.title,
            this.user.institution.name
        ].filter<string>((x: string | undefined): x is string => {
            return (x?.length ?? 0) > 0
        });
    }

    matchesSearch = (searchTerm: string): boolean => {
        return handleSearch(searchTerm, this.termsToSearch);
    }

    transformToCardData = (): CardData => {
        const rows: CardDataRow[] = [];
        if ((this.user.contactInformation.emailAddress?.length ?? 0) > 0) {
            rows.push({ dataType: AMSRowTypes.EmailAddress, icon: CardDataRowIcon.EMAIL, text: this.user.contactInformation.emailAddress! });
        }
        if ((this.user.contactInformation.pagerNumber?.length ?? 0) > 0) {
            rows.push({ dataType: AMSRowTypes.PagerNumber, icon: CardDataRowIcon.PAGER, text: this.user.contactInformation.pagerNumber! });
        }
        if ((this.user.contactInformation.cellPhoneNumber?.length ?? 0) > 0) {
            rows.push({ dataType: AMSRowTypes.CellPhoneNumber, icon: CardDataRowIcon.PHONE, text: this.user.contactInformation.cellPhoneNumber! });
        }
        return {
            header: `${this.user.contactInformation.firstName}  ${this.user.contactInformation.lastName}`,
            subheader: this.user.institution.name,
            rows,
            infoMessage: this.user.isInactive ? "inactive" : undefined,
            isVendor: false,
        }
    };

    transformToIgnoreDTO = (organizationId: string): IgnoredAmsUserDTO => {
        return {
            amsUserId: this.user.id.$oid,
            organizationId: organizationId
        }
    }
}

export class VendorUser implements CardDataTransformable {
    constructor(public user: VendorUserDTO) {
        this.id = user.id
    }

    public id: string;

    public isSelected: boolean = false;

    private get termsToSearch(): string[] {
        return [
            this.user.name,
            this.user.emailAddress,
            this.user.mobilePhone,
            this.user.pagerNumber,
            ...Object.values(this.user.additionalProperties),
            ...this.user.secondaryPagerOptions
        ].filter<string>((x: string | undefined | null): x is string => {
            return (x?.length ?? 0) > 0
        });
    }

    matchesSearch = (searchTerm: string): boolean => {
        return handleSearch(searchTerm, this.termsToSearch);
    }

    transformToCardData = (): CardData => {
        const rows: CardDataRow[] = [];
        if ((this.user.emailAddress?.length ?? 0) > 0) {
            rows.push({ dataType: VendorRowTypes.EmailAddress, icon: CardDataRowIcon.EMAIL, text: this.user.emailAddress! });
        }
        if ((this.user.pagerNumber?.length ?? 0) > 0) {
            rows.push({ dataType: VendorRowTypes.PagerNumber, icon: CardDataRowIcon.PAGER, text: this.user.pagerNumber! });
        }
        if ((this.user.mobilePhone?.length ?? 0) > 0) {
            rows.push({ dataType: VendorRowTypes.MobilePhone, icon: CardDataRowIcon.PHONE, text: this.user.mobilePhone! });
        }

        if (Object.keys(this.user.additionalProperties).length > 0) {
            for (const prop in this.user.additionalProperties) {
                const data = this.user.additionalProperties[prop];
                if (typeof(data) === 'string' && data.length > 0) {
                    rows.push({ dataType: prop, text: `${prop}: ${data}` })
                }
            }
        }

        return {
            header: this.user.name,
            rows,
            isVendor: true,
        }
    };

    transformToIgnoreDTO = (): IgnoredVendorUserDTO => {
        return {
            vendorUserId: this.id
        }
    }
}

export class AMSConnectService implements CardDataTransformable {
    constructor(
        public service: AmsServiceDTO
    ) {
        this.id = this.service.id.$oid
    }

    public id: string;

    public isSelected: boolean = false;

    private get termsToSearch(): string[] {
        return [
            this.service.contactInformation.pagerNumber,
            this.service.contactInformation.name,
        ].filter<string>((x: string | undefined): x is string => {
            return (x?.length ?? 0) > 0
        });
    }

    matchesSearch = (searchTerm: string): boolean => {
        return handleSearch(searchTerm, this.termsToSearch);
    }

    transformToCardData = (): CardData => {
        const rows: CardDataRow[] = [];
        if ((this.service.contactInformation.pagerNumber?.length ?? 0) > 0) {
            rows.push({ dataType: AMSRowTypes.PagerNumber, icon: CardDataRowIcon.PAGER, text: this.service.contactInformation.pagerNumber! });
        }
        return {
            header: `${this.service.contactInformation.name}`,
            subheader: this.service.institution.name,
            rows,
            disabledMessage: this.service.externalIntegrationId ? "Matched Elsewhere" : undefined,
            isVendor: false,
        }
    };

    transformToIgnoreDTO = (organizationId: string): IgnoredAmsServiceDTO => {
        return {
            amsServiceTeamId : this.service.id.$oid,
            organizationId: organizationId
        }
    }
}
export class VendorService implements CardDataTransformable {
    constructor(
        public service: VendorServiceDTO
    ) {
        this.id = this.service.id
    }

    public id: string;

    public isSelected: boolean = false;

    private get termsToSearch(): string[] {
        return [
            this.service.pagerNumber,
            this.service.name,
            ...Object.values(this.service.additionalProperties),
            ...this.service.secondaryPagerOptions
        ].filter<string>((x: string | undefined | null): x is string => {
            return (x?.length ?? 0) > 0
        });
    }

    matchesSearch = (searchTerm: string): boolean => {
        return handleSearch(searchTerm, this.termsToSearch);
    }

    transformToCardData = (): CardData => {
        const rows: CardDataRow[] = [];
        if ((this.service.pagerNumber?.length ?? 0) > 0) {
            rows.push({ dataType: VendorRowTypes.PagerNumber, icon: CardDataRowIcon.PAGER, text: this.service.pagerNumber! });
        } else if (this.service.secondaryPagerOptions.length > 0) {
            const addQuestion = this.service.secondaryPagerOptions.length > 1 ? "?" : "";
            this.service.secondaryPagerOptions.forEach(x =>
                rows.push({ dataType: VendorRowTypes.PagerNumber, icon: CardDataRowIcon.PAGER, text: x + addQuestion })
            );
        }

        if (Object.keys(this.service.additionalProperties).length > 0) {
            for (const prop in this.service.additionalProperties) {
                const data = this.service.additionalProperties[prop];
                if (typeof(data) === 'string' && data.length > 0) {
                    rows.push({ dataType: prop, text: `${prop}: ${data}` })
                }
            }
        }

        return {
            header: `${this.service.name}`,
            rows,
            disabledMessage: this.service.externalIntegrationId ? "Matched Elsewhere" : undefined,
            isVendor: false,
        }
    };

    transformToIgnoreDTO = (organizationId: string): IgnoredVendorScheduleDTO => {
        return {
            vendorEntityId: this.service.id,
        }
    }
}