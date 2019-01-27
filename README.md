# Book Inquiry

_Book Inquiry_ is a simple Javascript application used to search for books via the Google Books API. Each request returns up to 20 books, and the user can use pagination controls to view additional search results.

The application is built to be hosted in Firebase with the server-side logic performed via Firebase Functions. The UI is built with [Svelte](https://svelte.technology/), while the functions use [Express](https://expressjs.com/). Tests are performed with [Jest](https://jestjs.io/).

A running example of _Book Inquiry_ can be found here: https://book-inquiry.firebaseapp.com

## The creation process

### Planning

Initially I wanted to write the application to be entirely self-contained in the browser, with all API requests made directly to the Google Books API. At the same time, I also wanted to increase the number of API requests available per day by using an API key (perhaps this was an unjustified concern for the scope of this application). In the end, I chose a JAMstack approach with Firebase used as the hosting platform.

I then prepared a basic outline of how I envisioned the search page to be structured, and reviewed the Google Books API documentation to get a grasp on the available parameters.

#### Why Svelte?

Other frameworks (my experience mostly being with Vue) bring more power and size than what I felt was necessary for this application. I also wanted to create this application using single-file components, as I have grown very fond of the clean composition separation that they provide. Svelte leverages single-file components with scoped styles and it builds down to plain JS. I had been eyeing Svelte for some time, and this seemed like the perfect opportunity to try it out!

#### Why Express?

Firebase Functions use Express for HTTP request routing by default. I wanted to easily configure CORS in the application — and Express middleware makes this very straightforward.

### Building

#### The process

Most of the application logic and data-processing was written in a TDD style. The UI layer was incrementally built to match and evolve from the initial outline. Components and functions were split and as possibilities of future pain became apparent.

The UI components were built to be as "dumb" as possible, with all client-side logic being handled in the state management store and all data logic being performed on the server. The domain-specific item verbiage from Google Books was decoupled from the rendering components (the UI doesn't need to know about `item.volumeInfo.imageLinks.thumbnail` — `item.thumbnail` should be all it needs!).

#### Some difficulties

##### Location Error

When first deploying the application to Firebase, after only running it locally, the search was returning an error. All that could be found in the StackDriver error logs was `Error: [object Object]`. After digging deeper I realized that I was manually throwing any errors received from `https` requests, which were actually plain JS objects and not `Error` instances. (`err.toString()` returns the `message` property from the error, whereas `({}).toString()` returns `[object Object]`)

The actual `https` error was due to the Google API not being able to attribute a location to each API request from the production server, so I had to manually attribute each request with a two-letter country code.

##### Deployment confusion

The default rollup.js configuration with Svelte outputs the development files and the production files into the same directory. Running the build & deploy scripts while the dev server was running caused the development version to be deployed into production. It took me more time than I'm proud of to figure out the root of the issue.

### Looking forward

While _Book Inquiry_ can perform basic searches and properly handle many edge cases, it has plenty of opportunities for improvement. Some of these opportunities include:

- Javascript
  - Improve search string processing to better support search modifiers
  - Properly handle cases where `nextPage` doesn't actually return items (even though `totalItems` suggests that it should)
  - Cache search results when navigating through results pages to increase the speed that previous pages can be rendered
  - Add E2E & integration tests
- CSS
  - Use a CSS preprocessor to reduce CSS duplication between components
  - Rewrite CSS media queries to be mobile-first
  - Add an ellipsis to the end of clipped description text
- Build Process
  - Hash public CSS / JS filenames on build to avoid cache issues with updates
- Features
  - Allow the user to select the way the items are sorted (most relevant / most recent)
  - Perform each API request with the user's country code
  - Add an item details page so that the user doesn't need to navigate outside the application to view more information
  - Integrate with Google Bookshelves to allow the user to add items found in the search

## Setup

### Installation

All dependencies can be installed from the project root:

```
npm install
```

Please note that, while yarn can be used in the initial installation, the postinstall script manually attempts to install dependencies in the subdirectories using npm. If npm is not installed, the dependencies in the subdirectories will need to be manually installed.

### Project structure

The application is split into two primary directories:

```
.
├── functions
|   └── ...
└── hosting
    └── ...
```

`hosting` contains all of the files used for hosting the client application. `functions` contains the server-side logic that stands between the client API requests and the Google Books API.

The project root contains the shared linting, testing, and tooling configurations and dependencies.

A `.runtimeconfig.json` file will need to be created in `./functions` in order to run the functions server locally. The required fields for development can be found in `./functions/sample.runtimeconfig.json`.

### Development

The development servers can be run by running `npm run dev` in the project root. Similar to the installation, this script will manually call `npm run dev` in the subdirectories. If yarn is used, each dev server must be started separately, or the root `package.json` file will need to be edited.

The web client can be found at `localhost:8080`.

### Testing

```
npm run tests
```

### Deployment

```sh
npm run build
# and
npm run dev
# or
firebase deploy
```

The deployment is done through `firebase-tools`. This requires that `firebase-tools` is installed globally and a user has logged in. The `.firebaserc` file will need to be edited to point reference a project for which the current user has editing privileges.
