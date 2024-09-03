export const environment = {
    production: false,
    envName: 'play-retention1',
    baseUrl: 'https://api-retention1.play.amsconnectapp.com',
    messenger_server_url: 'https://messenger-retention1.play.amsconnectapp.com/',
    offloadUrl: 'https://api-offload-retention1.play.amsconnectapp.com',
    admin_server_url: 'https://admin-retention1.play.amsconnectapp.com/',
    accounts_server_url: 'https://account-retention1.play.amsconnectapp.com/',
    notification_server_url: 'https://notify-retention1.play.amsconnectapp.com:443',
    notification_fallback_server_url:
      'https://notify-retention1.play.amsconnectapp.com:8443',
    existing_url: '-retention1.play.',
    domain_key: 'play-retention1',
    user_data_cookie_key: 's-play-retention1',
    PORT: 5103,
    RELEASE_STAGE: 'development',
    DEPLOY_ID: 'development',
    SUBDOMAIN_MODIFIER: '',
    ALTERNATE: '',
    BASE_HREF: '',
    ASSET_HOST_PREFIX: 'play-retention1',
    ASSET_HOST: '',
    API_HOST: 'https://api.cureatr-vm.dev:5001',
    SUPPORT_EMAIL: 'amsconnect@americanmessaging.net',
    EMAIL_CONFIG_IID: "AmerMsgTest"
  };
  environment.ASSET_HOST = `https://${environment.ASSET_HOST_PREFIX}-profileimages-ams.s3.amazonaws.com/`
  
  