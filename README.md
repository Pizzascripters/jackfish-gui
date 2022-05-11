# Jackfish GUI
A mobile-friendly graphical interface written in React for the JS Blackjack engine [Jackfish](http://github.com/Pizzascripters/Jackfish).
Live demo available [here](https://blackjack-engine.herokuapp.com/).

## Development Setup
Use `npm run react-start` to start a local development server.
Jackfish will use your system's `PORT` environment variable if it is set, otherwise it defaults to `http://localhost:3000`.
To change the port on Linux use `PORT=<PORT>` or `set PORT=<PORT>` on windows.

Create a production build of the Jackfish GUI with `npm run build --prod` and deploy with `npm start`.
