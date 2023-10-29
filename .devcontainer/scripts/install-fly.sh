curl -L https://fly.io/install.sh | sh

echo 'export FLYCTL_INSTALL="/home/node/.fly"' >> ~/.bashrc
echo 'export PATH="$FLYCTL_INSTALL/bin:$PATH"' >> ~/.bashrc
