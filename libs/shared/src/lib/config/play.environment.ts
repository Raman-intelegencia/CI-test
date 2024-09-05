export const environment = {
  production: false,
  envName: 'play',
  baseUrl: 'https://api.play.amsconnectapp.com',
  messenger_server_url: 'https://messenger.play.amsconnectapp.com/',
  offloadUrl: 'https://api-offload.play.amsconnectapp.com',
  admin_server_url: 'https://admin.play.amsconnectapp.com/',
  accounts_server_url: 'https://account.play.amsconnectapp.com/',
  notification_server_url: 'https://notify.play.amsconnectapp.com:443',
  notification_fallback_server_url:
    'https://notify.play.amsconnectapp.com:8443',
  existing_url: '.play.',
  domain_key: 'play',
  user_data_cookie_key: 's-play',
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
  EMAIL_CONFIG_IID: "AmerMsgTest"
};
environment.ASSET_HOST = `https://${environment.ASSET_HOST_PREFIX}-profileimages-ams.s3.amazonaws.com/`

