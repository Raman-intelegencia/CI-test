export const environment = {
  production: false,
  envName: 'qa',
  baseUrl: 'https://api-qa2.play.amsconnectapp.com',
  messenger_server_url: 'https://messenger-qa2.play.amsconnectapp.com/',
  admin_server_url: 'https://admin-qa2.play.amsconnectapp.com/',
  offloadUrl: 'https://api-offload-qa2.play.amsconnectapp.com',
  accounts_server_url: 'https://account-qa2.play.amsconnectapp.com/',
  notification_server_url: 'https://notify-qa2.play.amsconnectapp.com:443',
  notification_fallback_server_url:
    'https://notify-qa2.play.amsconnectapp.com:8443',
  existing_url: '-qa2.play.',
  domain_key: 'play-qa2',
  user_data_cookie_key: 's-play-qa2',
  PORT: 5103,
  RELEASE_STAGE: 'development',
  DEPLOY_ID: 'development',
  SUBDOMAIN_MODIFIER: '',
  ALTERNATE: '',
  BASE_HREF: '',
  ASSET_HOST_PREFIX: 'play',
  ASSET_HOST: '',
  API_HOST: 'https://api.cureatr-vm.dev:5001',
  SUPPORT_EMAIL: 'amsconnect@americanmessaging.net',
  EMAIL_CONFIG_IID: "cureatr"
};
environment.ASSET_HOST = `https://${environment.ASSET_HOST_PREFIX}-profileimages-ams.s3.amazonaws.com/${environment.domain_key}/`;
