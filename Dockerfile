FROM node:20@sha256:cb7cd40ba6483f37f791e1aace576df449fc5f75332c19ff59e2c6064797160e AS base

# Install latest chrome dev package and fonts to support major charsets (Chinese, Japanese, Arabic, Hebrew, Thai and a few others)
# Note: this installs the necessary libs to make the bundled version of Chrome that Puppeteer
# installs, work.
RUN apt-get update \
    && apt-get install -y wget gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /usr/share/keyrings/googlechrome-linux-keyring.gpg \
    && sh -c 'echo "deb [arch=amd64 signed-by=/usr/share/keyrings/googlechrome-linux-keyring.gpg] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-khmeros fonts-kacst fonts-freefont-ttf libxss1 dbus dbus-x11 \
      --no-install-recommends \
    && service dbus start \
    && rm -rf /var/lib/apt/lists/* 
    # && groupadd -r root && useradd -rm -g root -G audio,video root

# RUN mkdir /app
# RUN chmod a+rwx ~/
RUN npm i -g pnpm
# USER pptruser

# FROM base AS dependencies

# WORKDIR /app
# COPY package.json pnpm-lock.yaml ./
# RUN pnpm install

FROM base AS build
ENV DBUS_SESSION_BUS_ADDRESS autolaunch:

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install
COPY . .
# COPY --from=dependencies /app/node_modules ./node_modules
RUN pnpm prisma generate
RUN pnpm build
RUN pnpm build pipeline-worker
RUN pnpm build materialise-worker

# FROM base AS deploy

# WORKDIR /app
# COPY --from=build /app/dist/ ./dist/
# COPY --from=build /app/node_modules ./node_modules/

CMD [ "node", "dist/apps/hunter/main.js" ]