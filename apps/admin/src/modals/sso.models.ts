export interface commonDynamicFormInterface{
    common:commonDynamicFormInterfaceData
}

export interface commonDynamicFormInterfaceData{
    disabled:string;
    type:string;
    iid:string;
    alt:string;
    normalize:string;
    time_updated:string;
}

export interface configurationsDataInterface{
    configurations:configurationInterface
}

export interface configurationInterface{
    attributes:attributesconfigurationData;
    downloads:downloadsconfigurationData;
}

export interface configurationDataBasedTabInterface{
    attributes:attributesconfigurationData;
    downloads:downloadsconfigurationData;
    index:number;
}
export interface attributesconfigurationData{
    type: string;
    iid: string;
    alt?: string;
    time_updated: string;
    issuer?: string;
    app_id?: string;
    app_secret?: string;
    scope?: string;
    identifier_system?: string;
    introspect_url?: string;
    disabled?: boolean;
    certificates?: string;
    certificate_expiration_days?: number;
    redirect_url?: string;
    metadata?:string;
}

export interface downloadsconfigurationData{
    metadata:string;
}


export interface DeleteSSOResponse{
    deleted:boolean
    status:string
}

// schema-data.model.ts

export interface Attribute {
    attribute: string;
    type: string;
    label: string;
    description: string;
    constraint: string;
    choices?: string[];
    metadata?:string;
  }
  
  export interface CommonAttribute extends Attribute {}
  
  export interface SAMLAttribute extends Attribute {
    logout_enabled?: boolean;
    force_auth?: boolean;
    nameid_format?: string;
    logout_sign_alg?: string;
    entity_id?: string;
    id_attribute?: string;
    redirect_to?: string;
    certificates: string;
    certificate_expiration_days?: string;
    metadata: string;
  }
  
  export interface OIDCAttribute extends Attribute {
    logout_enabled?: boolean;
    force_auth?: boolean;
    issuer?: string;
    request_email?: boolean;
    client_id?: string;
    client_secret?: string;
    select_account?: boolean;
    enable_biometrics?: boolean;
  }
  
  export interface SMARTAttribute extends Attribute {
    issuer?: string;
    app_id?: string;
    app_secret?: string;
    scope?: string;
    identifier_system?: string;
    introspect_url?: string;
    alternate_sub?: boolean;
  }
  
  export interface DisabledAttribute extends Attribute {
    redirect_url: string;
  }

  export interface SchemaInterface {
    common: CommonAttribute[];
    saml: SAMLAttribute[];
    oidc: OIDCAttribute[];
    smart: SMARTAttribute[];
    disabled: DisabledAttribute[];
    [key: string]: Attribute[];
  }

  export interface SchemaFormInterface {
    common: CommonAttribute[];
    saml: SAMLAttribute[];
    oidc: OIDCAttribute[];
    smart: SMARTAttribute[];
    disabled: DisabledAttribute[];
    [key: string]: Attribute[];
  }
  
  export interface Configuration {
    attributes: attributesconfigurationData;
    downloads: {
      metadata: string;
    };
  }
  
  export interface SchemaData {
    status: string;
    schema: SchemaInterface;
    configurations: Configuration[];
  }

  export interface OtherSSOKeysInterface {
    common: string;
    saml: string;
    oidc: string;
    smart: string;
    disabled: string;
  }
  
  export interface FieldAttributeInterface {
    attribute: string;
    type: string | boolean | number;
    label: string;
    description: string;
    constraint: string;
    choices?: string[];
  }


  export interface YourInterfaceName {
    disabled: (boolean | null)[];
    type: (string | null)[];
    iid: {
      value: string;
      disabled: boolean;
    };
    alt: (string | null)[];
    normalize: (null | unknown)[]; // Assuming normalize can be any type, adjust as needed
    time_updated: (string | null)[];
  }


  export interface ConfigurationFilterData {
    attributes: attributesconfigurationData;
    downloads?: {
      metadata?: string;
    };
  }
  
export interface ConfigDataKeysInterface extends Array<string> {}