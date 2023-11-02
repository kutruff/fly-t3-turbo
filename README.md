# Create T3 App for Fly.io and VSCode Dev Containers

Makes a full fly.io deployment with two environments for development and production:

- Next.js web app in standalone mode with a super trimmed down docker image.
- Postgrest HA cluster on fly.io.
- CI/CD available for two environments: 
  - `dev` is automatically triggered on push to `main` branch.
  - `production` is manually triggered.
- Database migrator 
  - Dockerized for direct execution on fly.io so you don't need to leak your DB credentials
  - Can be run manually as a github action.
  - Runs as the fly.io `release_command` when deploying the web app ensuring your migration completes before the web app starts.

Uses VSCode dev containers to provide a fully dockerized development environment:

- Automatically launches a local postgres database for you as well as pgadmin.
- `fly.io` cli installed
- `psql` tools installed
- Docker compose for dev containers
- Customizable `Dockerfile` for additional your apt packages
- Scriptable tooling installation
- `aws` cli installed as a convenience even though it's not needed for this starter project 

This is a fork of the [T3 Stack](https://create.t3.gg/) project bootstrapped with `create-t3-turbo` but completely setup for Fly.io and dockerized development with dockerized Drizzle migrations.

- [Next.js](https://nextjs.org)
- [NextAuth.js](https://next-auth.js.org)
- [Drizzle](https://orm.drizzle.team)
- [Tailwind CSS](https://tailwindcss.com)
- [tRPC](https://trpc.io)

The `db-migrate` package is new to this fork and not in the original T3 stack.  It's a thin Drizzle migration runner that executes stand-alone without any additional project dependencies.

### VSCode setup.

1. **Important:** Make sure to stop any other local postgres, pgadmin, or webservers that may be running.  Otherwise you'll get port conflicts.
1. Instal Docker on your machine.
1. In VSCode install the dev containers extension(https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers.)
1. Click "Use this template" on github.  **Do not** pull it locally into a folder.  That's not how this works.
1. In VSCode, hit `F1` and run the `Dev Containers: Clone Repository in Named Container Volume`
1. Paste the git url of **your fork** in the prompt. For example when using ssh, it would be `git@github.com:your-username/your-fork-name.git`
1. Select `Create a new container volume.`
1. Name your container volume to match the name of your repo.
1. Use your repo name for the folder name as well.
1. Wait for the container to build and launch. This may take a minute or two the first time, as it is building a fresh docker image for your local environment.  However, the next time you relaunch VSCode it will only take 10 seconds or so.

### Pick a name for your project.

Think of an app name that is globally unique on fly.io that will also serve as your app's subdomain. You cannot reuse `fly-t3` as it is already taken on fly.io. For example, if you chose `happy-app` will turn into `happy-app.fly.dev`. Make sure you pick something no one else has picked. We are going to be using the name a lot below and we need it for setting up OAuth even before we use the command line.  You don't need to do anything on the fly website or command line yet. You just need to decide what the name will be.

### Local development environment setup

1. Copy and paste the `.env.example` file to a new file called `.env`. We are going to fill in these values and then reuse them in a few places.
1. For OAuth2 create a discord app [here](https://discord.com/developers/applications).
   - Hit "new application"
   - Open your app's settings
   - Note the client id and client secret. Put them in your `.env` file:
     - `DISCORD_CLIENT_ID`
     - `DISCORD_CLIENT_SECRET`
   - Go to the OAuth2 section on the left side of the screen.
   - Add two redirect urls, but make sure you put the name of your app in the url: **Pay attention to http vs https in the urls!** Only localhost is http.
     - `http://localhost:3000/api/auth/callback/discord`
     - `https://<your-app-name>.fly.dev/api/auth/callback/discord`
     - `https://<your-app-name>-dev.fly.dev/api/auth/callback/discord`
   - Hit save at the bottom of the page.
1. Create a value for your `NEXTAUTH_SECRET` and put it in your `.env` file:
   ```bash
   openssl rand -base64 32
   ```
1. Test your local development setup:
   - Install dependencies
     ```bash
     pnpm i
     ```
   - Run your app locally. The local postgres container is already running for you.
     ```bash
     pnpm db:push
     pnpm dev
     ```

You should now be able to see the demo at http://localhost:3000. 

### Configure and create your fly.io deployment

1. Create a Fly.io account
1. Open a terminal in VSCode and login to fly.io:
   ```bash
   fly auth login
   ```
1. Authorize fly to push docker images
   ```bash
   fly auth docker
   ```
1. Get your fly api token and don't lose it or share it out.  
   ```bash
   fly tokens create org
   ```
   It's a long number that will wrap in your terminal so when you copy/paste it later make sure no new lines get added. We'll be using it later
1. Rename the `toml` files.  
   In the `deployment` folder there are two `toml` files:
   - `fly-t3-dev.toml` - for dev
   - `fly-t3.toml` - for production  
   You need to rename these files to match your app name. For example, if your app name is `demo-app` then rename them to `demo-app-dev.toml` and `demo-app.toml`.  

1. Set environment variables:
   - In each toml file, you need to set the environment and build variables matching each of your GH environments: `dev` and `production`
   - For the dev environment, make sure you follow the same pattern of adding `-dev` to your app name in the urls.
1. Build and deploy your production stack to fly.io. 
   - You'll get a next.js deployment and a postgres cluster. It will also build and run the one-off DB migrator for you.
   - You will be prompted to enter your `DISCORD_CLIENT_SECRET` and your `NEXTAUTH_SECRET`. We are creating the **production stack first** so make sure you are using the right values for the production environment and not the dev environment.
   - Just use a single node postgres cluster, and don't let it scale to zero. You can change that later.
   - `organization` is an optional parameter to the script.
   ```bash
   ./deployment/scripts/create-full-stack.sh -a your-app-name -o organization -r ord
   ```
   - You can now visit your app at `https://<your-app-name>.fly.dev`
1. Repeat the above for your dev stack.  However, enter your app name with the `-dev` suffix in the command line.
   ```bash
   ./deployment/scripts/create-full-stack.sh -a your-app-name-dev -o organization -r ord
   ```
   - You can see your dev deployment at `https://<your-app-name>-dev.fly.dev`

### Github CI/CD setup - Github Environments with variables and secrets

1. Go to your repo's settings. Click "Secrets and Variables" on the left and create two environments: `dev` and `production`.   You'll then set environment variables and secrets for each.
1. Set all the environment variables and secrets in each environment.  You can copy/paste the values from your `.env` file.  The `FLY_API_TOKEN` secret is the one you got from the `fly tokens create org` command. Note - you may also want to make sure the `NEXTAUTH_SECRET` is different between environments for security. (You can also create two different discord apps with different credentials if you want to.)  
   - For `APP_NAME`, this will be the name of your app on fly.io but with `-dev` added to the end for the `dev` environment.  
   - For example, if your app name is `demo-app`:
     - `dev` environment: `APP_NAME` is `demo-app-dev`
     - `production` environment: `APP_NAME` is `demo-app`  
  
   This is what each environment should look like:
   <img width="751" alt="image" src="https://github.com/kutruff/fly-t3-turbo/assets/874049/19f66b01-e924-46e6-87fe-79b9017c9910">

1. In VSCode Push your changes.  If all worked correctly, your Github actions should run and update your dev stack on every push to main from now on.
1. To deploy to production.  Go to "Actions" on Github, pick the `web - deploy()` workflow on the left.  Then hit "Run workflow button" below.  When prompted for an environment, type `production`.  That will build, and deploy to your production as well as migrate your database.

### Testing docker deployments locally

You can also test the container you'll be sending to fly locally with docker compose:
```bash
docker-compose up
```
You'll be able to to see it running at `http://localhost:3000`

### Manual deployments of web app with migrations.

You can run migrations on github or from inside a VSCode terminal.

Using a VSCode terminal:
```bash
./deployment/scripts/build-db-migrator.sh -a your-app-name
./deployment/scripts/deploy-db-migrator.sh -a your-app-name -r ord
```

Using Github actions:

Go to "Actions" on Github, pick the `web - deploy()` workflow on the left.  Then hit "Run workflow button" below.  When prompted for an environment, type either `dev` or `production`.  That will build, and deploy to your production as well as migrate your database.

### Manual migrations

You can run migrations on github or from inside a VSCode terminal.

Using a VSCode terminal:
```bash
./deployment/scripts/build-db-migrator.sh -a your-app-name
./deployment/scripts/deploy-db-migrator.sh -a your-app-name -r ord
```

Using Github actions:

Go to "Actions" on Github, pick the `db-migrate - deploy()` workflow on the left.  Then hit "Run workflow button" below.  When prompted for an environment, type either `dev` or `production`.  That will run your migration directly on fly.io by using the fly machines.  Check the logs on fly.io for the app named `<your-app-name>-db-migrate` and you'll see if it's successful or not.

### Destroying project or to start over

This wil destroy both your production and dev stacks:
 ```bash
  ./deployment/scripts/destroy-project.sh -a your-app-name
  ./deployment/scripts/destroy-project.sh -a your-app-name-dev
 ```
