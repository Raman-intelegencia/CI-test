interface Entity {
    iid: string;
    type: string;
}

export interface Target {
    entity: Entity;
    type: string;
}

interface Grant {
    actions: string[];
    targets: Target[];
}

export interface Permission {
    entity: Entity;
    grants: Grant[];
}

interface AllActions {
    [key: string]: string;
}

interface ActionMap {
    [key: string]: string[];
}

export interface Institution {
    id: string;
    short_name: string;
    name: string;
}

export interface InstituePermissionResponse {
    status: string;
    permission: Permission;
    all_actions: AllActions;
    actions_sorted: string[];
    action_map: ActionMap;
    institutions: { [key: string]: Institution };
}
export interface GrantTarget {
    type: string;
    entity: {
        type: string;
        iid: string;
    };
}

export interface MainGrant {
    targets: GrantTarget[];
    actions: string[];
}

export interface GrantDetails {
    instName: string;
    communicatein: boolean;
    communicateout: boolean;
    searchpatientsin: boolean;
    searchpatientsout: boolean;
    instId: string
}

export interface GrantJson {
    grants: MainGrant[];
    entity: {
        type: string;
        iid: string;
    };
}
export interface InstitutionJson {
    type?: string;
    entity?: {
        type?: string;
        iid?: string;
    };
}

export interface InstitutePermission {
    grants: Grant[];
    entity: Entity;
}
export interface AdditionalGrantDetails {
    instName: string[];
    communicatein: boolean;
    communicateout: boolean;
    searchpatientsin: boolean;
    searchpatientsout: boolean;
    instadmin: boolean;
    instId: string[];
    [key: string]: boolean | string[];
}
