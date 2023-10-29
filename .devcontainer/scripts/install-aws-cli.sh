INSTALL_DIR=$(mktemp -d)
pushd $INSTALL_DIR

curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"

unzip awscliv2.zip
sudo ./aws/install
popd

rm -rf $INSTALL_DIR