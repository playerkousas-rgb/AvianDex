# AvianDex

AvianDex is a fun, interactive, Pokédex-style web application designed for kids to explore a collection of bird cards. 

It is built to be extremely easy to maintain: you only need to provide the card images, and the application handles the rest!

## Features

- **Pokédex Interface:** A highly interactive, dual-screen red device interface that mimics a real piece of tech.
- **Card-Centric Design:** The app is designed to display full trading cards (images that include both the picture and the stats/text).
- **Auto-Discovery:** No database or JSON editing required. Simply drop an image into the folder, and it appears in the app.
- **Easy Navigation:** 
  - Large Next/Previous buttons
  - Keyboard arrow key support
  - Search by card number
  - Dropdown menu to jump instantly to any slot
- **Fullscreen Viewing:** Easily expand any card to read the text clearly.
- **Placeholder System:** Empty slots automatically display an "UNDISCOVERED" silhouette.

## How to Add New Cards

Updating the AvianDex is incredibly simple. You do not need to write any code or edit any data files.

1. Ensure your new card image is in PNG format (though JPG works if you change the extension).
2. Name the image file exactly according to its slot number, using a 4-digit format. 
   - Example: For card number 1, name it `0001.png`.
   - Example: For card number 25, name it `0025.png`.
3. Place the image file into the `public/images/` directory.

The application is pre-configured to look for 151 slots. As soon as you place `0008.png` into the folder, slot #8 will automatically change from "UNDISCOVERED" to displaying your new card.

## Tech Stack

- React 19
- Vite
- Tailwind CSS v4
- Framer Motion (for animations and 3D effects)
- Lucide React (for icons)
