# Stella's Tiramisu Quest

An original static browser game where Surya gathers tiramisu equipment and ingredients by answering Stella's relationship-memory questions. It uses only HTML, CSS, and JavaScript, so it can be hosted directly on GitHub Pages.

## Run locally

Open `index.html` in a modern browser. No install or build command is required.

## Personalize the ending

Open `adventure.js` and find the bracketed placeholder in `renderFinale()`. Replace it with Rayhan's final letter.

The equipment, ingredients, and ten relationship-memory questions are at the top of `adventure.js`. They can be edited without changing the rendering code below them.

## Use a real Stella sprite

Add a transparent PNG named `stella.png` inside an `assets` folder at the project root. The game will load `assets/stella.png` automatically. A square image around 256x256 pixels works well; leave some transparent padding around the cat so it does not touch the edges. If the file is missing, the built-in CSS pixel cat appears instead.

## Publish with GitHub Pages

1. Create a new GitHub repository and upload these files to its `main` branch.
2. In the repository, open **Settings** then **Pages**.
3. Under **Build and deployment**, select **Deploy from a branch**.
4. Choose branch `main`, folder `/(root)`, then save.
5. GitHub will show the public game URL after publishing.

Because this is a static site and uses relative asset paths, it works at either a custom domain or the usual repository Pages URL.