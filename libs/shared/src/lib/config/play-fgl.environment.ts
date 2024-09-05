export const environment = {
    production: false,
    envName: 'play-fgl',
    baseUrl: 'https://api-fgl.play.amsconnectapp.com',
    messenger_server_url: 'https://messenger-fglbeta.play.amsconnectapp.com',
    admin_server_url: 'https://admin-fglbeta.play.amsconnectapp.com/',
    offloadUrl: 'https://api-offload-fgl.play.amsconnectapp.com',
    accounts_server_url: 'https://account-fglbeta.play.amsconnectapp.com/',
    notification_server_url: 'https://notify-fgl.play.amsconnectapp.com:443',
    notification_fallback_server_url:
      'https://notify-fgl.play.amsconnectapp.com:8443',
    existing_url: '-play-fgl.',
    domain_key: 'play-fgl',
    PORT: 5103,
    RELEASE_STAGE: 'development',
    DEPLOY_ID: 'development',
    SUBDOMAIN_MODIFIER: '',
    ALTERNATE: '',
    BASE_HREF: '',
    ASSET_HOST_PREFIX: 'play-fgl',
    ASSET_HOST: '',
    API_HOST: '',
    SUPPORT_EMAIL: 'amsconnect@americanmessaging.net',
    EMAIL_CONFIG_IID: "cureatr"
  };
  environment.ASSET_HOST = `https://${environment.ASSET_HOST_PREFIX}-profileimages-ams.s3.amazonaws.com/`
  