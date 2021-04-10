# react-autocomplete-input
Autocomplete input field for React

[![react-autocomplete-input](https://github.com/yury-dymov/react-autocomplete-input/raw/master/docs/demo.gif)](https://github.com/yury-dymov/react-autocomplete-input)

[![npm version](https://img.shields.io/npm/v/react-autocomplete-input.svg?style=flat)](https://www.npmjs.com/package/react-autocomplete-input)
[![Downloads](http://img.shields.io/npm/dm/react-autocomplete-input.svg?style=flat-square)](https://npmjs.org/package/react-autocomplete-input)
[![Build Status](https://img.shields.io/travis/yury-dymov/react-autocomplete-input/master.svg?style=flat)](https://travis-ci.org/yury-dymov/react-autocomplete-input)
[![Coverage Status](https://coveralls.io/repos/github/yury-dymov/react-autocomplete-input/badge.svg?branch=master)](https://coveralls.io/github/yury-dymov/react-autocomplete-input?branch=master)

# Demo
Demo and playground are available [here](https://yury-dymov.github.io/react-autocomplete-input/)

# Usage Example
```JavaScript
import TextInput from 'react-autocomplete-input';
import 'react-autocomplete-input/dist/bundle.css';

<TextInput options={["apple", "apricot", "banana", "carrot"]} />
```

# Multiple Triggers and Options Example
```JavaScript
import TextInput from 'react-autocomplete-input';
import 'react-autocomplete-input/dist/bundle.css';

<TextField trigger={["@", "@@"]} options={{"@": ["aa", "ab", "abc", "abcd"], "@@": ["az", "ar"]}} />
```
Here for trigger `@` first set of options will resolve and for `@@` — second set.

# Features
* Supports both keyboard and mouse for option selection
* Supports responsiveness and works on every device
* Supports lazy-loading and dynamic option list updates
* Supports all major browsers including IE 8+

# Configurable Props
*Note*: All props are optional.

## Component : string or func
#### Default value: `"textarea"`
Widget for rendering input field

## defaultValue : string
#### Default value: `""`
Initial text for input

## disabled : boolean
#### Default value: `false`
Disables widget, i.e. during form submission

## maxOptions : number
#### Default value: `6`
Defines how many options can be listed simultaneously. Show all matched options if maxOptions equals 0.

## onSelect : func
#### Default value: `() => {}`
Callback invoked upon selecting an option. Receives selection value as a parameter.

## changeOnSelect : func
#### Default value: `(trigger, slug) => trigger + slug`
Callback invoked upon selecting an option, will display what the function returns. Receives trigger and selection value as a parameter.

## onRequestOptions : func
#### Default value: `() => {}`
Callback for requesting new options to support lazy-loading. If `requestOnlyIfNoOptions` is true, then `onRequestOptions` called only if no options are currently available. Otherwise `onRequestOptions` is called every time text is changed and `trigger` is found.

```JavaScript
import React from 'react';
import TextInput from 'react-autocomplete-input';

class MyComponent extends React.Component {
  constructor(props) {
    super(props);

    this.handleRequestOptions = this.handleRequestOptions.bind(this);

    this.state = { options: ["apple", "apricot", "banana", "carror"] };
  }

  // text in input is "I want @ap"
  handleRequestOptions(part) {
    console.log(part);          // -> "ap", which is part after trigger "@"
    this.setState({ options: SOME_NEW_OPTION_ARRAY });
  }

  render() {
    return <TextInput onRequestOptions={this.handleRequestOptions} options={this.state.options} />;
  }
}
```

## matchAny: boolean
#### Default value: false
If true, will match options in the middle of the word as well

## offsetX: number
#### Default value: 0
Popup horizontal offset

## offsetY: number
#### Default value: 0
Popup vertical offset

## options : array
#### Default value: `[]`
List of available options for autocomplete

## regex : string
#### Default value: `^[a-zA-Z0-9_\-]+$`
This regular expression checks if text after `trigger` can be autocompleted or not. I.e. "@ap" matches the default regex as "ap" matches the regex, therefore library will try to find appropriate option. "@a$p" fails to match the regex as there is not "$" character in it, therefore library considering this string as irrelevant.

## requestOnlyIfNoOptions : boolean
#### Default value: `true`
If `requestOnlyIfNoOptions` is true, then `onRequestOptions` called only if no options are currently available. Otherwise `onRequestOptions` is called every time text is changed and `trigger` is found.

## spaceRemovers : array
#### Default value: `[',', '.', '!', '?']`
By default, after option is selected, it is inserted with following `spacer`. If user inputs one of the characters from `spaceRemovers` array, then `spacer` is automatically removed. I.e. `@apple ,|` is automatically changed to `@apple, |`, where `|` represents caret.

## spacer : string
#### Default value: `' '`
Character which is inserted along with the selected option.

## trigger : string
#### Default value: `'@'`
Character or string, which triggers showing autocompletion option list. '' and '@@' are both valid triggers. Keep in mind that user have to input at least one extra character to make option list available if empty trigger is used.

## minChars: number
#### Default value: 0
Only show autocompletion option list after this many characters have been typed after the trigger character.

## value : string
#### Default value: `''`
Widget supports both controlling options: by value and by state. If you explicitly pass `value` prop, you have to update it manually every time `onChange` event is emitted. If you don't pass `value` prop, then widget uses internal state for value manipulation.

## passThroughEnter: boolean
#### Default value: false
If true, then an enter / return keypress is passed on (after being used to autocomplete).
Useful if you want to have the form submit as soon as a single value is chosen.

# Styles Customization
By default styles are defined in `"react-autocomplete-input/dist/bundle.css"`, however, you may define your custom styles instead for following entities:

* `ul.react-autocomplete-input`
* `ul.react-autocomplete-input > li`
* `ul.react-autocomplete-input > li.active`

# Design Considerations
1. Native "Undo" action is not fully supported. It might be changed in the future but currently there is no out-of-the-box solution, which solves this issue for all browsers at once.
2. It is considered that list of options will be always small, lets say up to 2000 items. Therefore, options are stored internally as array. If your use-case requires to work with huge lists, I would recommend to reimplement option internal representation as binary search tree instead.

# License
MIT (c) Yury Dymov
