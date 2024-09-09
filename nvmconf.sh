app=$1
env=$2
export NVM_DIR="$HOME/.nvm"
if [ $env == "live" ]
then
    api_host=https://api.amsconnectapp.com
elif [ $env == "play" ]
then
    api_host=https://api.play.amsconnectapp.com
else
    var=$(echo $env | awk -F'-' '{print $2}')
    api_host=https://api-$var.play.amsconnectapp.com
fi
echo $api_host
sed -i "s|{api_hostname}|$api_host|g" config/account-headers.yaml
sed -i "s|{api_hostname}|$api_host|g" config/admin-headers.yaml
sed -i "s|{api_hostname}|$api_host|g" config/extmsg-headers.yaml
sed -i "s|{api_hostname}|$api_host|g" config/messenger-headers.yaml
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
nvm use 18.15.0
npm i --legacy-peer-deps
nx build $app --configuration=$env --verbose