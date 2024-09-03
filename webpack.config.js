const fs = require('fs');
const path = require('path');
const webpack = require('webpack');

const adminCert = fs.readFileSync(path.join(__dirname, '.ssl', 'admin-vm.dev.crt'));
const adminKey = fs.readFileSync(path.join(__dirname, '.ssl', 'admin-vm.dev.key'));
const accountCert = fs.readFileSync(path.join(__dirname, '.ssl', 'account-dev.amsconnectapp.crt.pem'));
const accountKey = fs.readFileSync(
  path.join(__dirname, ".ssl", "account-dev.amsconnectapp.key.pem")
);

module.exports = {
  devServer: {
    https: [
      {
        cert: adminCert,
        key: adminKey,
        hostname: 'admin-vm.dev',
      },
      {
        cert: accountCert,
        key: accountKey,
        hostname: 'account-dev.amsconnectapp',
      },
    ],
  },
};
