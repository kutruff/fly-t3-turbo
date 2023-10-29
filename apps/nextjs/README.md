# Create T3 App for Fly.io and VSCode Dev Containers

Makes a full fly.io deployment:

- Next.js web app in standalone mode.
- PG HA cluster on fly.io.
- DB migrator that executes on fly.io.

This is a fork of the [T3 Stack](https://create.t3.gg/) project bootstrapped with `create-t3-app` but completely setup for Fly.io and dockerized development with dockerized Drizzle migrations.

- [Next.js](https://nextjs.org)
- [NextAuth.js](https://next-auth.js.org)
- [Drizzle](https://orm.drizzle.team)
- [Tailwind CSS](https://tailwindcss.com)
- [tRPC](https://trpc.io)

Uses vscode dev containers to provide a fully dockerized development environment:

- Automatically launches a local postgres instance for you.
- `fly.io` cli
- `aws` cli (not needed but its there for you)
- `psql` tools
- Docker compose for dev containers
- Customizable `Dockerfile` for additional your apt packages
- Scriptable tooling installation

## How do I use this project?

This project uses Docker exectinsively provides a completely local docker environment in addition to working with fly.io. It uses VSCode dev containers.

When you launch vscode the dev container it will automatically launch a local postgres instance for you.

### VSCode setup.

1. Make sure you have docker installed on your machine.
1. In VSCode install the dev containers extension(https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers.)
1. Fork this repo or use it as a template.
1. In VSCode, hit `F1` and run the `Dev Containers: Clone Repository in Named Container Volume`
1. Paste your repo url in the prompt.
1. Name your container volume to match the name of your project.
1. For the folder name it doesn't matter. I use `code`.
1. Wait for the container to build and launch. This may take a minute or two the first time, but will be fast next time you launch VS.

### Accounts and secrets setup

1. Copy and paste the `.env.example` file to a new file called `.env`. We are going to fill in these values and then reuse them in a few places.
1. Create a Fly.io account
1. Pick a unique app name that is globally unique that will be your app's subdomain. For example, `demo-app` will turn into `demo-app.fly.dev` We're going to need to use that alot. Make sure you pick somethine no one else has picked.
1. For OAuth2 create a discord app [here](https://discord.com/developers/applications).
   - Hit "new application"
   - Open your app's settings
   - Note the client id and client secret. Put then in your `.env` file:
     - `DISCORD_CLIENT_ID`
     - `DISCORD_CLIENT_SECRET`
   - Go to the OAuth2 section on the left side of the screen.
   - Add two redirect urls, but make sure you put the name of your app in the url:
     - `http://localhost:3000/api/auth/callback/discord`
     - `https://<your-app-name>.fly.dev/api/auth/callback/discord`
   - Hit save at the bottom of the page.
1. Create a value for your `NEXTAUTH_SECRET` and put it in your `.env` file:

```bash
openssl rand -base64 32
```

6. Open a terminal in VSCode and login to fly.io:

```bash
fly auth login
```

7. Authorize fly to push docker images

```
fly auth docker
```

8. Add Github secret

Go to your repo's settings and navigate to the secrets and add your fly token there.
The link looks like this. Just add your username and repo name:

`https://github.com/<username>/<repo>/settings/secrets/actions`

The secret name should be: `FLY_API_TOKEN`

And you can get a token that works on all your apps by running this command:

```bash
fly tokens create org
```

Pick your personal org or the org you made for the project. org tokens allow you to use them for several apps at once.

9. Set your environment variables in both `deployment/web.toml`. `APP_NAME` and region are your fly.io web app name you picked earliear

10. Set the similarly named environment variables in `.github/workflows/web.yml`

11. install dependencies

```bash
pnpm i
```

12. Test your app locally which should now be at http://localhost:3000. The local postgres container is already funning for you.

```bash
pnpm dev
```

13. Builda and deploy a full stack to fly.io. You'll get a next.js deployment and a postgres cluster. It will also build and run the one-off DB migrator for you.

```bash
./scripts/create-full-stack.sh -a your-app-name -o organization -r region
```

14. You can also test the same container locally with docker compose:

```bash
docker-compose up
```
