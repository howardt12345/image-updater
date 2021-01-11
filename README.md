# Website Manager V2

This is an image updater program, designed to swap the hosted images in a given shortlink. This project is a React app running in Electron. It uses Material UI components and Styled Components. Cloud firestore is used for the database, and the Tiny.cc API is used to generate and update the shortlinks. 

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Installation & Setup

1. Installing Electron:

   ```sh
   npm install electron --save
   ```

2. Install dependencies:

   ```sh
   npm install
   ```

3. Start the development server:

   ```sh
   npm run electron-dev
   ```
   The program should now be running in a separate electron app!

## Building a Production build

1. Generate a production build:

   ```sh
   npm run electron-build
   ```

   The production build should now be found in /dist. 