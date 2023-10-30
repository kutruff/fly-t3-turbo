# [Choice] Node.js version (use -bullseye variants on local arm64/Apple Silicon): 18, 16, 14, 18-bullseye, 16-bullseye, 14-bullseye, 18-buster, 16-buster, 14-buster
ARG VARIANT=20-buster
FROM mcr.microsoft.com/vscode/devcontainers/typescript-node:0-${VARIANT}

COPY .devcontainer/scripts/install-aws-cli.sh /tmp/user-devcontainer-scripts/
COPY .devcontainer/scripts/install-fly.sh /tmp/user-devcontainer-scripts/
# [Optional] Uncomment this section to install additional OS packages.
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
    clang \
    postgresql-client \
    udev \    
    && bash /tmp/user-devcontainer-scripts/install-aws-cli.sh \
    && sudo -u node bash /tmp/user-devcontainer-scripts/install-fly.sh \
    && mkdir -p /home/node/.aws \
    && chown node:node /home/node/.aws \
    && mkdir -p /data \
    && chown -R node:node /data \
    && curl -fsSL https://raw.githubusercontent.com/platformio/platformio-core/develop/platformio/assets/system/99-platformio-udev.rules | sudo tee /etc/udev/rules.d/99-platformio-udev.rules \
    && service udev restart \
    && usermod -a -G dialout node \
    && usermod -a -G plugdev node 
     

# [Optional] Uncomment if you want to install an additional version of node using nvm
# ARG EXTRA_NODE_VERSION=10
# RUN su node -c "source /usr/local/share/nvm/nvm.sh && nvm install ${EXTRA_NODE_VERSION}"

# [Optional] Uncomment if you want to install more global node packages
# RUN su node -c "npm install -g <your-package-list -here>"
USER node