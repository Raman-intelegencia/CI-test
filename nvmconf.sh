app=$1
env=$2
export NVM_DIR="$HOME/.nvm"
case $env in
    live)
        api_host=https://api.amsconnectapp.com
        notify_host=https://notify.amsconnectapp.com:443
        notify_wsshost=wss://notify.amsconnectapp.com:8443
        profile_url=https://live-profileimages-ams.s3.amazonaws.com/
        offload_url=https://api-offload.amsconnectapp.com
        ;;
    play)
        api_host=https://api.play.amsconnectapp.com
        notify_host=https://notify.play.amsconnectapp.com:443
        notify_wsshost=wss://notify.play.amsconnectapp.com:8443
        profile_url=https://play-profileimages-ams.s3.amazonaws.com/
        offload_url=https://api-offload.play.amsconnectapp.com
        ;;
    *)
        var=$(echo $env | awk -F'-' '{print $2}')
        api_host=https://api-$var.play.amsconnectapp.com
        notify_host=https://notify-$var.amsconnectapp.com:443
        notify_wsshost=wss://notify-$var.amsconnectapp.com:8443
        profile_url=https://play-profileimages-ams.s3.amazonaws.com/$env
        offload_url=https://api-offload-$var.amsconnectapp.com
        ;;
esac
config_files="config/account-headers.yaml config/admin-headers.yaml config/extmsg-headers.yaml config/messenger-headers.yaml"


# Replace placeholders with actual values in the config files
for config_file in ${config_files}
do
    sed "s|{api_hostname}|$api_host|g;s|{notify_hostname}|$notify_host|g;s|{notify_wss_hostname}|$notify_wsshost|g;s|{profile_images_hostname}|$profile_url|g;s|{offload_api}|$offload_url|g" $config_file
done

[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
nvm use 18.15.0
npm i --legacy-peer-deps
nx build $app --configuration=$env --verbose