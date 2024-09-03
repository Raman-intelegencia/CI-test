export const environment = {
  production: true,
  envName: 'production',
  baseUrl: 'https://api.amsconnectapp.com',
  messenger_server_url: 'https://messenger.amsconnectapp.com/',
  admin_server_url: 'https://admin.amsconnectapp.com/',
  offloadUrl: 'https://api-offload.amsconnectapp.com',
  accounts_server_url: 'https://account.amsconnectapp.com/',
  notification_server_url: 'https://notify.amsconnectapp.com:443',
  notification_fallback_server_url: 'https://notify.amsconnectapp.com:8443',
  existing_url: '.',
  domain_key: '',
  user_data_cookie_key: 's',
  RELEASE_STAGE: 'production',
  DEPLOY_ID: '',
  SUBDOMAIN_MODIFIER: '',
  ALTERNATE: '',
  BASE_HREF:'',
  API_HOST: '',
  ASSET_HOST_PREFIX: 'live',
  ASSET_HOST:'',
  SUPPORT_EMAIL: 'amsconnect@americanmessaging.net',
  EMAIL_CONFIG_IID: "AmerMsg"
};

environment.BASE_HREF = `https://secure{{ALTERNATE}}.${environment.SUBDOMAIN_MODIFIER}amsconnectapp.com/version/${environment.DEPLOY_ID}/htdocs/`
environment.API_HOST = `https://api{{ALTERNATE}}.${environment.SUBDOMAIN_MODIFIER}amsconnectapp.com`
environment.ASSET_HOST = `https://${environment.ASSET_HOST_PREFIX}-profileimages-ams.s3.amazonaws.com/`