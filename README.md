# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

#### App functionality

- [x] Working Expo Go project, should be able to scan the QR code and see the app running on any device.
- [x] PokeAPI is used to fetch Pokémon data https://pokeapi.co/
  - [x] List of Pokémon is loaded from the API.
  - [x] Pokémon details (metadata, stats, evolution chain) are loaded from the API.
- [x] List of Pokémon is displayed in a FlatList.
  - [x] Must be able to filter the list by name using the search bar.
- [x] Pokémon details are displayed in a ScrollView.
  - [x] Must be able to navigate to the Pokémon details page from the list.
  - [x] Must be able to favorite the Pokémon.
  - [x] Must display type(s) for the Pokémon and use a unique color for each type.
  - [x] Pokémon detail tabs should be swipeable left and right.
- [x] Favorites list is displayed in a FlatList.
  - [x] Must be able to navigate to the Pokémon details page from the favorites list.
  - [x] Must be able to unfavorite the Pokémon.
  - [x] Empty state must be displayed when there are no favorites.
- [x] Pokémon actions must include:
    - [x] Favorite.
    - [x] Share.
    - [x] Open in detail view.
- [x] All async operations must include an loading and error state.
    - [x] Fetching Pokémon list.
    - [x] Fetching Pokémon details.
    - [x] Fetching Pokémon evolution chain.

#### Project setup
- [x] Tanstack Query for API calls.
- [x] Expo Router for navigation.
- [x] SQLite for local storage.
- [x] Uses Typescript with no TS errors.
- [x] Uses ESLint with no ESLint errors. (ideally use [React Compiler Linter](https://docs.expo.dev/guides/react-compiler/#enabling-the-linter))
- [x] Uses Separation of Concerns (determine a project structure that follows this principle).
- [x] Expo Font is used to implement [the font](./assets/fonts.zip).


### Optional items
Each optional item is worth 1 extra point.

- [ ] Use of animations (e.g. loading in UI elements).
- [ ] Dark mode support (making use of theming).
- [x] Pokémon list is paginated and infinite scroll is used.
- [ ] Clean Typescript: no use of `any`, typecasting `as SomeType`, or TS ignore comments.
- [ ] Pixel Perfect Design on either iOS or Android.
- [x] No bugs, console errors and use of console.log.
- [ ] Added [localizations](https://docs.expo.dev/guides/localization/) for the app.
- [x] Adds Pokémon Battle Feature.
