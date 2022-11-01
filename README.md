# About Climate Call
Climate Call (Klimatkoll in Swedish) is a card game about carbon emissions. It started as an analog card game and has since been made in a digital format.

The game's purpose is to teach and discuss the sources of carbon emissions. For instance, does a trip by air across the Atlantic have a greater climate impact than eating a steak a day for a year?

Carbon emissions are calculated by researchers at [Chalmers University of Technology](https://www.chalmers.se).

Official websites:
- [English](https://www.climatecallgame.com/)
- [Swedish](https://www.kortspeletklimatkoll.se/)
- [Norwegian](https://www.klimasjekken.no/)

# Contributing
All contributions are welcome! We follow the philosophy that [people are more important than code](https://booksbyus.gitbook.io/scalable-c/chapter2#problem-how-do-i-manage-contributions).

You do not have to contribute code to help out. Playing the game and giving feedback is very appreciated.

Easiest way to get involved is to join our [Discord channel](https://discord.gg/6vgvQ4Aeqd).

# Licensing
The code is licensed under MIT. The card data and images are copyright under Klimatkoll Guldheden AB.

Put simply: You are free to use the code as you like, but to get access to the cards you'll want to ask for permission.

# Project structure
The server consists of two parts:
- The **card database**, responsible for managing and distributing card data and localisation to the game server
- The **game server**, responsible for distributing the client and fetching card data, as well as managing the multiplayer connections and game logic

In production, these parts are designed to be run in separate processes.

## Card database
Simple express.js application with purely server side rendering for simplicity. Card data is stored in a local SQLite database file.

The SQLite database consists of a single table called Events, which works because the data is all [event sourced](https://www.eventstore.com/event-sourcing).

## Game server
Express.js application with code to manage WebSocket connections, distribute static files, and forward card data from the card database.

Card data is fetched continuously from the card database and saved locally. If the card database goes down, the game server can continue to function.

Multiplayer game data is all stored in temporary memory (variables in JavaScript) that gets wiped when the server process restarts.

# Build and run
The project is designed with build simplicity in mind. We try to keep the amount of libraries down to a minimum.

## Requirements
Node.js, preferably v16.x

## Install
`npm install` to install required modules

`npm run dev` runs the card database and the game server together in a single process. The server will restart when the code is changed.

`npm run build` compiles TypeScript into JavaScript files runnable in Node.js from the dist folder.
