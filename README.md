# styled-proxy

An exprimental css-in-js react library to style components using Proxy

## Instalation

This is still just an experiment. To play with clone or download this repo and add files from src to your react project⚛. You will also need to install `stylis`:

`npm i stylis --save`

## Example

A basic example:

```jsx
/** @jsx jsx */
import { jsx, Styled } from '../src/main';
import React from 'react';
const styled = Styled();

styled.Card = ({ styles, color = 'pink', children }) => {
  styles.default = {
    backgroundColor: () => color,
    height: '300px',
    width: '250px',
    color: 'black',
    padding: '10px',
    margin: '20px',
  };
  return <div sx={styles.default}>{children}</div>;
};

export default function App() {
  return (
    <div>
      <styled.Card color='green'>
        <h2>Title</h2>
        <p>Some text</p>
      </styled.Card>
    </div>
  );
}
```

## Usage

First add custom `JSX pragma` anotation at the top of your file:

```jsx
/** @jsx jsx */
```

Then `import` `jsx` and `Styled` from `src/main.js` file of this repo:

```jsx
/** @jsx jsx */
import { jsx, Styled } from '../src/main';
import React from 'react';
```

> Note you have to import `React` for `JSX pragma` annotation to work

Initialize `styled` and you're ready to go

```jsx
const styled = Styled();
```

> The phrase `const styled = Styled();` creates an instance of styled. You can make many of them across the modules to keep your components isolated

### Declare styled component

```jsx
styled.BlueBox = ({ styles }) => {
  styles.default = {
    background: 'blue',
    width: '4rem',
    height: '4rem',
  };
  return <div sx={styles.default} />;
};
```

As it can be seen it looks pretty similar to standard react component. Styled components have `styles` prop that lets you define many styles for any component. You deliver style to an element by ataching it to `sx` prop

### Add many styles

```jsx
styled.RedOrBlueBox = ({ styles, variant }) => {
  styles.default = {
    background: 'red',
    width: '4rem',
    height: '4rem',
  };
  styles.blue = {
    ...styles.default,
    background: 'blue',
  };
  return <div sx={styles[variant]} />;
};
```

Then...

```jsx
function App() {
  return (
    <div>
      <styled.Box />
      <styled.Box variant={'blue'} />
    </div>
  );
}
```

> `styles.default` is applied if you don't provide any name

### Dynamic styles

```jsx
styled.ColorBox = ({ styles, bg = 'red' }) => {
  styles.default = {
    background: () => bg, //dynamic🧨
    width: '4rem',
    height: '4rem'
  };
  return <div sx={styles[]} />;
};
```

> Dynamic properties of style are passed as functions

```jsx
<>
  <styled.Box />
  <styled.Box bg={'pink'} />
</>
```

### Short styled

It's shorter way of defining styled component

```jsx
styled.Box.div = ({bg}) => {
    background: () => bg,
    width: '4rem',
    height: '4rem'
  };
```

Use `as` prop to change the element type:

```jsx
<styled.Box bg={'pink'} as={'button'} />
```

### Global styles

Daclare `styled.Global` to atach global styles

```jsx
const Zilla = 'https://fonts.googleapis.com/css?family=Zilla+Slab&display=swap';

styled.Global = {
  link: [Zilla],
  body: {
    margin: 0,
    fontFamily: `
        'Zilla Slab',
        'Helvetica Neue',
        'Helvetica',
        'Arial',
        sans-serif
      `,
    backgroundColor: 'rgb(34, 34, 34)',
    color: 'aliceblue',
  },

  h1: {
    h2: { fontSize: '5vh' },
    h3: { fontSize: '3vh' },
    fontSize: '8vh',
  },
};
```

> Adding url to `link` property works as `<link>` tag

### Getting `css` class name

Sometimes you might need to get the real name of `css` class in document. It's simple as calling `.getClass()`:

```jsx
styled.Card = ({ styles }) => {
  styles.default = {
    backgroundColor: () => color,
    height: '300px',
    width: '250px',
    color: 'black',
  };

  const className = styles.default.getClass(); // Outputs name of css class in the document 💫
  return (
    <div sx={styles.default}>
      <h2>Title</h2>
      <p>Some text</p>
    </div>
  );
};
```

### `Import` and `export` styled components

#### `Export`

Just export styled instance:

```jsx
//module-one.js

/** @jsx jsx */
import { jsx, Styled } from 'styled-proxy';
import React from 'react';
const styled = Styled();

styled.Title.h1 = () => ({
  fontSize: '10rem',
  fontWeight: 'bolder',
});

export default styled;
```

#### `Import`

And `import` it:

```jsx
//module-two.js

import { jsx } from 'styled-proxy';
import React from 'react';
import imported from './module-one';

export default () => (
  <div>
    <imported.Title>Lick me👅</imported.Title>
  </div>
);
```
