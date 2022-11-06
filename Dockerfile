FROM node:16-slim

COPY . /opt/frontend/
COPY entrypoint.sh /opt/frontend/entrypoint.sh
WORKDIR /opt/frontend/

# Update apt packages
RUN runDeps="openssl ca-certificates patch gosu git tmux locales-all curl" \
    && apt-get update \
    && apt-get install -y --no-install-recommends $runDeps \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* \
    && npm install -g mrs-developer \
    && mkdir -p /opt/frontend/src/addons \
    && rm -rf /opt/frontend/src/addons/* \
    && find /opt/frontend -not -user node -exec chown node {} \+

USER node

WORKDIR /opt/frontend/

RUN cd /opt/frontend \
    && yarn develop \
    && yarn \
    && RAZZLE_API_PATH=VOLTO_API_PATH RAZZLE_INTERNAL_API_PATH=VOLTO_INTERNAL_API_PATH yarn build \
    && rm -rf /home/node/.cache
USER root

EXPOSE 3000 3001 4000 4001

HEALTHCHECK --interval=1m --timeout=3s \
  CMD curl -f http://localhost:3000/ || exit 1

ENTRYPOINT ["/opt/frontend/entrypoint.sh"]
CMD ["yarn", "start:prod"]
