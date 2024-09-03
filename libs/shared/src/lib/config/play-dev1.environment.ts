export const environment = {
    production: false,
    envName: 'play-dev1',
    baseUrl: 'https://api-dev1.play.amsconnectapp.com',
    messenger_server_url: 'https://messenger-dev1.play.amsconnectapp.com/',
    admin_server_url: 'https://admin-dev1.play.amsconnectapp.com/',
    offloadUrl: 'https://api-offload-dev1.play.amsconnectapp.com',
    accounts_server_url: 'https://account-dev1.play.amsconnectapp.com/',
    notification_server_url: 'https://notify-dev1.play.amsconnectapp.com:443',
    notification_fallback_server_url:
      'https://notify-dev1.play.amsconnectapp.com:8443',
    existing_url: '-dev1.play.',
    domain_key: 'play-dev1',
    user_data_cookie_key: 's-play-dev1',
    PORT: 5103,
    RELEASE_STAGE: 'development',
    DEPLOY_ID: 'development',
    SUBDOMAIN_MODIFIER: '',
    ALTERNATE: '',
    BASE_HREF: '',
    ASSET_HOST_PREFIX: 'play',
    ASSET_HOST: '',
    API_HOST: '',
    SUPPORT_EMAIL: 'amsconnect@americanmessaging.net',
    EMAIL_CONFIG_IID: "cureatr"
  };
  environment.ASSET_HOST = `https://${environment.ASSET_HOST_PREFIX}-profileimages-ams.s3.amazonaws.com/${environment.domain_key}/`;