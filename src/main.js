/** @jsx jsx */
import React from 'react';
import stylis from 'stylis';

let classNames = []; //classNames are global
let dynamicStyles = {}; //stores dynamic dependencies

const styledProxy = counter => {
  return (() => {
    let components = {};
    return {
      set: (fun, componentName, componentBody) => {
        components[componentName] = {
          name: componentName,
          component: componentBody,
          scope: counter
        };
        return true;
      },
      get: (fun, componentName) => {
        if (components[componentName]) return components[componentName];
        return new Proxy(
          {},
          {
            set: (obj, Tag, fun) => {
              components[componentName] = {
                name: componentName,
                component: ({ styles, ...props }) => {
                  if (props.as) Tag = props.as;
                  styles.primitive = fun(props);
                  return (
                    <Tag sx={styles.primitive} {...props}>
                      {props.children}
                    </Tag>

                    // jsx(
                    //   Tag.toString(),
                    //   { sx: styles.primitive, ...props },
                    //   ...props.children
                    // )
                  );
                },
                scope: counter
              };
              return true;
            }
          }
        );
      }
    };
  })();
};

const isLowerCase = string => string.toLowerCase === string;

export const Styled = (() => {
  let counter = 0; //to count per module(per execute of Styled())
  return () => new Proxy({}, styledProxy(counter++));
})();
//Then do: styled = overStyled()
// example:
// styled.Box = props => {
//   return ...;
// }; //👌
const setStyles = name =>
  new Proxy(
    {},
    {
      get: (obj, styleName) => {
        if (obj[styleName] === undefined) {
          //throw new ReferenceError(`'styles.${styleName}' is not defined`);
          console.warn(`'styles.${styleName.toString()}' is not defined`);
          return undefined;
        }
        let pair = {};
        try {
          pair = {
            getClass: createStyle(name, styleName.toString(), obj[styleName])
          };
        } catch (e) {}
        return { ...obj[styleName], ...pair };
      }
    }
  );

export const jsx = (el, props, ...children) => {
  let element = el;
  let properties = props;
  if (props && !props.className && props.sx) {
    // to atach styles🎨 from sx
    if (props.sx.getClass) properties.className = props.sx.getClass();
    delete properties.sx;
  }
  // checking if el is styled object💄
  if (typeof el == 'object') {
    // const [name, component] = el;
    const [name, component, scope] = [el.name, el.component, el.scope];
    if (name == 'Global') {
      if (component.link) attachLinks(...component.link);
      attachStyle('', component);
      return true;
    }
    properties.componentName = name;
    properties.styles = setStyles(`${scope}-${name}`);
    properties.hook = letHook;
    element = component;
    element.displayName = `styled.${name}`;
  }
  return React.createElement(element, properties, ...children);
};

const letHook = hook => (...values) => hook(...values);

const kebabCase = string => {
  return string
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/([0-9])([^0-9])/g, '$1-$2')
    .replace(/([^0-9])([0-9])/g, '$1-$2')
    .replace(/-+/g, '-')
    .replace('.', '-')

    .toLowerCase();
};

// const mapObject = (obj, fun) =>
//   Object.fromEntries(
//     Object.entries(obj).map(([key, val], i) => {
//       if (typeof val == 'object') return [key, mapObject(val, fun)];
//       return [key, fun(val, key, i)];
//     })
//   );
const mapObject = (obj, fun) => {
  for (let key in obj) {
    const val = obj[key];
    if (typeof val == 'object') {
      obj[key] = mapObject(val, fun);
    } else obj[key] = fun(val, key);
  }
  return obj;
};

class Extractor {
  constructor(fun) {
    this.stored = [];
    this.extract = (...val) => fun(...val, this.stored);
  }
}
const extractTransition = (key, val, stored) => {
  if (key === 'transition') return val;
  const regEx = /(^|\s)(\d+\.?\d*m?s)($|\s)/g;
  const match = `${val}`.match(regEx);
  if (match) {
    stored.push(`${kebabCase(key)} ${match[0]}`);
    return `${val}`.replace(regEx, '');
  }
  return val;
};
const extractDynamic = (val, stored) => {
  if (typeof val == 'function') {
    const value = val();
    stored.push(value);
    return value;
  }
  console.log('dupa', val, typeof val, `${val}`);
  return val;
};

const getTag = tag => document[tag] || document.getElementsByTagName(tag)[0];
const attachStyle = (name, style) => {
  const pre = name === '' ? ':global()' : ' & ';
  console.time('tim_preStyle');
  const stringStyle =
    pre +
    JSON.stringify(style, null, 1)
      .replace(/"(?![^[]*\])/gm, '')
      .replace(/[\[\]]/gm, '')
      .replace(/('|\\"|`)/gm, `"`)
      .replace(/\\n/g, '\n')
      .replace(/,(?=\s*[\w\-\.]*:)/gm, ';')
      .replace(/("")/g, '')

      //.replace(/"/gm, '')
      //.replace(/'/gm, '"')
      .replace(/:\s+{/gm, ' {')

      .replace(/(?<=^.*)[A-Z](?=.*:)/gm, m => `-${m}`.toLowerCase());
  console.timeEnd('tim_preStyle');
  console.log('pre-style: ', stringStyle);
  console.time('tim_stylis');
  const css = stylis('.' + name, stringStyle);
  console.timeEnd('tim_stylis');
  const head = getTag('head');
  const styleElement = document.createElement('style');

  head.appendChild(styleElement);
  //styleElement.type = 'text/css';
  if (styleElement.styleSheet) {
    // This is required for IE8 and below.
    styleElement.styleSheet.cssText = css;
  } else {
    styleElement.appendChild(document.createTextNode(css));
  }
};
const attachLink = url => {
  console.log('attaching: ', url);
  const head = getTag('head');
  const link = document.createElement('link');
  head.appendChild(link);
  link.href = url;
  link.rel = 'stylesheet';
};
const attachLinks = (...links) => {
  console.log('assss: ', ...links);
  for (let x of links) attachLink(x);
};
const createStyle = (componentName, styleName, style) => () => {
  delete style.getClass;
  const name = `s${componentName}-${styleName}`;
  console.log('className: ' + name);
  if (classNames.includes(name)) return name; //style already attached
  console.time('tim_create');
  const dynamicExtractor = new Extractor(extractDynamic);
  const transitionExtractor = new Extractor(extractTransition);
  console.timeLog('tim_create');
  style = mapObject(style, (val, key) =>
    transitionExtractor.extract(key, dynamicExtractor.extract(val))
  );
  console.timeLog('tim_create');
  const transitions = transitionExtractor.stored.join();
  const dynamicVariant = kebabCase(dynamicExtractor.stored.join('-'));
  console.timeLog('tim_create');
  console.log(`transition: ${transitions}`);
  console.log(`dynamicName: ${dynamicVariant}`);
  style.transition = transitions;
  if (!dynamicVariant) {
    //atach new static style
    console.log('attach static');
    attachStyle(name, style);
    classNames.push(name);
    return name;
  }
  console.timeEnd('tim_create');
  console.log('dynamic');
  if (!dynamicStyles[name]) dynamicStyles[name] = [];
  let index = dynamicStyles[name].length;
  if (dynamicStyles[name].includes(dynamicVariant)) {
    //dynamic style already attached
    index = dynamicStyles[name].indexOf(dynamicVariant);
  } else {
    dynamicStyles[name].push(dynamicVariant);
    //atach new dynamic style
    console.log('attach dynamic');
    attachStyle(`${name}-${index}`, style);
  }
  return `${name}-${index}`;
};
