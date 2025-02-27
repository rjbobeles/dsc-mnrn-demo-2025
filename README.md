# Study Jam: Backend API Development

## Table of Contents
- [Introduction](#introduction)
- [Requirements](#requirements)
- [Container Building](#container-building)
- [Steps](#steps)
  - [Initial Setup](#00-initial-setup)
  - [Life Improvements](#01-life-improvements)
  - [Service Setup](#03-service-setup)
- [Features](#features)
- [Contributing](#contributing)
- [License](#license)

## Introduction
Welcome! In this repo you'll find a full-stack AI chat application implementing the lessons discussed during the study jam. It includes the step by step process on how the application was developed. Note that it is not production ready and this repo was made for demo purposes only.

## Requirements
These are the requirements to play around with the repo. Note that for NodeJS, the minimum recommended version is v20.

- Bruno
- Docker
- NodeJS 
- Tilt
- VSCode (With the recommended extensions installed)
- Yarn

## Container building

Run `docker build -t api-main:v1.0 -f ./docker/DockerFile.api_main .` in the root directory of the project

## Installation
Installation instructions...

## Usage
This repo contains a collection of folders that step-by-step guides you in creating the demo application. Folders 

### 00-initial-setup
This step initializes our monorepo and we make the necessary adjustments to get our base monorepo

- Run `npx create-nx-workspace`:

  ```
    > npx create-nx-workspace
    Need to install the following packages:
    create-nx-workspace@20.4.6
    Ok to proceed? (y)

    NX   Let's create a new workspace [https://nx.dev/getting-started/intro]

    ✓ Where would you like to create your workspace? · ai-chat
    ✓ Which stack do you want to use? · node
    ✓ What framework should be used? · nest
    ✓ Integrated monorepo, or standalone project? · integrated
    ✓ Application name · dsc-mnrn-demo
    ✓ Would you like to generate a Dockerfile? [https://docs.docker.com/] · Yes
    ✓ Which CI provider would you like to use? · skip
    ✓ Would you like remote caching to make your build faster? · skip

    NX   Creating your v20.4.6 workspace.

    ✓ Installing dependencies with npm
    ✓ Successfully created the workspace: ai-chat.

    NX   Directory is already under version control. Skipping initialization of git.

    NX   Welcome to the Nx community! 👋

    🌟 Star Nx on GitHub: https://github.com/nrwl/nx
    📣 Stay up to date on X: https://x.com/nxdevtools
    💬 Discuss Nx on Discord: https://go.nx.dev/community
  ```

- Replace: package-lock.json to yarn.lock by running `yarn install` and deleting the package-lock.json
- Organize: Repo by moving files to reflect the following:
  ```
  source/
  ├── api/
  │   └── main
  ├── app/
  │   └── web
  └── utils/
      └── lib
  ```
- Initialize our react and a library we will call `utils`
  - Utils: 
    - Run: `generate @nx/node:library --directory=source/lib/utils --buildable=false --compiler=swc --linter=eslint --name=utils --unitTestRunner=jest --importPath=@dsc-demo/utils --no-interactive`
  - Web: 
    - Run: `yarn nx add @nx/react`
    - Run: `yarn nx generate @nx/react:application --directory=source/app/web --bundler=webpack --linter=eslint --name=web --unitTestRunner=jest --compiler=swc --minimal=true --routing=true --style=scss --no-interactive`

### 01-life-improvements
This step sets up life improvements such as like linting and code formatting.

- Added VSCode extensions to help with workflow
- Added linting extensions to beautify code 
- Optional: Add [husky](https://typicode.github.io/husky/get-started.html) (A pre commit script that you can use to run specific tasks before it's committed)

### 02-containerization
This step setups up container building and tilt for local development

- Added Dockerfile and docker-compose
- Added `Tiltfile` and `Tiltfile.docker`
- Added `.env.sample`

To Run:
- Copy `.env.sample` to `.env`
- Run Tiltfile by running `tilt up`
- Run Tiltfile.docker by running `tilt -f ./Tiltfile.docker up`

### 03-service-setup
This step sets up the services to have a workable directory. This includes installation of necessary packages.

## Contributing
How to contribute...

## License
License information...

