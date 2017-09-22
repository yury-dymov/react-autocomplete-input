import React from 'react';
import PropTypes from 'prop-types';
import { findDOMNode } from 'react-dom';
import getCaretCoordinates from 'textarea-caret';
import getInputSelection, { setCaretPosition } from 'get-input-selection';
import './AutoCompleteTextField.css';

const KEY_UP = 38;
const KEY_DOWN = 40;
const KEY_RETURN = 13;
const KEY_ENTER = 14;
const KEY_ESCAPE = 27;

const OPTION_LIST_Y_OFFSET = 10;
const OPTION_LIST_MIN_WIDTH = 100;

const propTypes = {
  Component: PropTypes.string,
  defaultValue: PropTypes.string,
  disabled: PropTypes.bool,
  maxOptions: PropTypes.number,
  onBlur: PropTypes.func,
  onChange: PropTypes.func,
  onKeyDown: PropTypes.func,
  onRequestOptions: PropTypes.func,
  options: PropTypes.array,
  regex: PropTypes.string,
  matchAny: PropTypes.bool,
  requestOnlyIfNoOptions: PropTypes.bool,
  spaceRemovers: PropTypes.array,
  trigger: PropTypes.string,
  value: PropTypes.any,
  offsetX: PropTypes.number,
  offsetY: PropTypes.number,
};

const defaultProps = {
  Component: 'textarea',
  defaultValue: '',
  disabled: false,
  maxOptions: 6,
  onBlur: () => {},
  onChange: () => {},
  onKeyDown: () => {},
  onRequestOptions: () => {},
  options: [],
  regex: '^[A-Za-z0-9\\-_]+$',
  matchAny: false,
  requestOnlyIfNoOptions: true,
  spaceRemovers: [',', '.', '!', '?'],
  trigger: '@',
  offsetX: 0,
  offsetY: 0,
};

class AutocompleteTextField extends React.Component {
  constructor(props) {
    super(props);

    this.isTrigger = this.isTrigger.bind(this);
    this.getMatch = this.getMatch.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.handleSelection = this.handleSelection.bind(this);
    this.updateCaretPosition = this.updateCaretPosition.bind(this);
    this.updateHelper = this.updateHelper.bind(this);
    this.resetHelper = this.resetHelper.bind(this);
    this.renderAutocompleteList = this.renderAutocompleteList.bind(this);

    this.state = {
      helperVisible: false,
      left: 0,
      matchLength: 0,
      matchStart: 0,
      options: [],
      selection: 0,
      top: 0,
      value: null,
    };

    this.recentValue = props.defaultValue;
    this.enableSpaceRemovers = false;
  }

  componentDidMount() {
    window.addEventListener('resize', this.handleResize);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.options.length !== this.props.options.length) {
      this.updateHelper(this.recentValue, this.state.caret, nextProps.options);
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }

  getMatch(str, caret, providedOptions) {
    const { trigger, matchAny } = this.props;
    const re = new RegExp(this.props.regex);
    const triggerLength = trigger.length;
    const triggerMatch = trigger.match(re);

    for (let i = caret - 1; i >= 0; --i) {
      const substr = str.substring(i, caret);
      const match = substr.match(re);
      let matchStart = -1;

      if (triggerLength > 0) {
        const triggerIdx = triggerMatch ? i : i - triggerLength + 1;

        if (triggerIdx < 0) { // out of input
          return null;
        }

        if (this.isTrigger(str, triggerIdx)) {
          matchStart = triggerIdx + triggerLength;
        }

        if (!match && matchStart < 0) {
          return null;
        }
      } else {
        if (match && i > 0) { // find first non-matching character or begin of input
          continue;
        }
        matchStart = i === 0 && match ? 0 : i + 1;

        if (caret - matchStart === 0) { // matched slug is empty
          return null;
        }
      }

      if (matchStart >= 0) {
        const matchedSlug = str.substring(matchStart, caret);
        const options = providedOptions.filter((slug) => {
          const idx = slug.indexOf(matchedSlug);
          return idx !== -1 && (matchAny || idx === 0);
        });
        const matchLength = matchedSlug.length;

        return { matchStart, matchLength, options };
      }
    }

    return null;
  }

  isTrigger(str, i) {
    const { trigger } = this.props;

    if (!trigger || !trigger.length) {
      return true;
    }

    if (str.substr(i, trigger.length) === trigger) {
      return true;
    }

    return false;
  }

  handleChange(e) {
    const { onChange, options, spaceRemovers } = this.props;

    const old = this.recentValue;
    const str = e.target.value;
    const caret = getInputSelection(e.target).end;

    if (!str.length) {
      this.setState({ helperVisible: false });
    }

    this.recentValue = str;

    this.setState({ caret, value: e.target.value });

    if (!str.length || !caret) {
      return onChange(e.target.value);
    }

    // '@wonderjenny ,|' -> '@wonderjenny, |'
    if (this.enableSpaceRemovers && spaceRemovers.length && str.length > 2) {
      for (let i = 0; i < Math.max(old.length, str.length); ++i) {
        if (old[i] !== str[i]) {
          if (
            i >= 2 &&
            str[i - 1] === ' ' &&
            spaceRemovers.indexOf(str[i - 2]) === -1 &&
            spaceRemovers.indexOf(str[i]) !== -1 &&
            this.getMatch(str.substring(0, i - 2).toLowerCase(), caret - 3, options)
          ) {
            const newValue = (`${str.slice(0, i - 1)}${str.slice(i, i + 1)}${str.slice(i - 1, i)}${str.slice(i + 1)}`);

            this.updateCaretPosition(i + 1);
            findDOMNode(this.refInput).value = newValue;

            if (!this.props.value) {
              this.setState({ value: newValue });
            }

            return onChange(newValue);
          }

          break;
        }
      }

      this.enableSpaceRemovers = false;
    }

    this.updateHelper(str, caret, options);

    if (!this.props.value) {
      this.setState({ value: e.target.value });
    }

    return onChange(e.target.value);
  }

  handleKeyDown(event) {
    if (this.state.helperVisible) {
      const { options, selection } = this.state;

      switch (event.keyCode) {
        case KEY_ESCAPE:
          event.preventDefault();
          this.resetHelper();
          break;
        case KEY_UP:
          event.preventDefault();
          this.setState({ selection: ((options.length + selection) - 1) % options.length });
          break;
        case KEY_DOWN:
          event.preventDefault();
          this.setState({ selection: (selection + 1) % options.length });
          break;
        case KEY_ENTER:
        case KEY_RETURN:
          event.preventDefault();
          this.handleSelection(selection);
          break;
        default:
          this.props.onKeyDown(event);
          break;
      }
    } else {
      this.props.onKeyDown(event);
    }
  }

  handleResize() {
    this.setState({ helperVisible: false });
  }

  handleSelection(idx) {
    const { matchStart, matchLength, options } = this.state;

    const slug = options[idx];
    const value = this.recentValue;
    const part1 = value.substring(0, matchStart);
    const part2 = value.substring(matchStart + matchLength);

    const event = { target: findDOMNode(this.refInput) };

    event.target.value = `${part1}${slug} ${part2}`;
    this.handleChange(event);

    this.resetHelper();

    this.updateCaretPosition(part1.length + slug.length + 1);
    this.enableSpaceRemovers = true;
  }

  updateCaretPosition(caret) {
    this.setState({ caret }, () => setCaretPosition(findDOMNode(this.refInput), caret));
  }

  updateHelper(str, caret, options) {
    const input = findDOMNode(this.refInput);

    const slug = this.getMatch(str.toLowerCase(), caret, options);

    if (slug) {
      const caretPos = getCaretCoordinates(input, caret);
      const rect = input.getBoundingClientRect();

      const top = caretPos.top + input.offsetTop;
      const left = Math.min(
        caretPos.left + input.offsetLeft - OPTION_LIST_Y_OFFSET,
        input.offsetLeft + rect.width - OPTION_LIST_MIN_WIDTH
      );

      if (slug.options.length > 1 || (slug.options.length === 1 && slug.options[0].length !== slug.matchLength)) {
        this.setState({ helperVisible: true, top, left, ...slug });
      } else {
        if (!this.props.requestOnlyIfNoOptions || !slug.options.length) {
          this.props.onRequestOptions(str.substr(slug.matchStart, slug.matchLength));
        }

        this.resetHelper();
      }
    } else {
      this.resetHelper();
    }
  }

  resetHelper() {
    this.setState({ helperVisible: false, selection: 0 });
  }

  /* eslint-disable jsx-a11y/no-static-element-interactions */

  renderAutocompleteList() {
    if (!this.state.helperVisible) {
      return null;
    }

    const { maxOptions, offsetX, offsetY } = this.props;
    const { value, left, matchStart, matchLength, options, selection, top } = this.state;

    const optionNumber = this.props.maxOptions === 0 ? options.length : maxOptions;

    const helperOptions = options.slice(0, optionNumber).map((val, idx) => {
      const highlightStart = val.indexOf(value.substr(matchStart, matchLength));

      return (
        <li
          className={idx === selection ? 'active' : null}
          key={val}
          onClick={() => { this.handleSelection(idx); }}
          onMouseEnter={() => { this.setState({ selection: idx }); }}
        >
          {val.slice(0, highlightStart)}
          <strong>{val.substr(highlightStart, matchLength)}</strong>
          {val.slice(highlightStart + matchLength)}
        </li>
      );
    });

    return (
      <ul className="react-autocomplete-input" style={{ left: left + offsetX, top: top + offsetY }}>
        {helperOptions}
      </ul>
    );
  }

  /* eslint-enable jsx-a11y/no-static-element-interactions */

  render() {
    const { Component, defaultValue, disabled, value, ...rest } = this.props;

    const propagated = Object.assign({}, rest);
    Object.keys(this.constructor.propTypes).forEach((k) => { delete propagated[k]; });

    let val = '';

    if (typeof value !== 'undefined' && value !== null) {
      val = value;
    } else if (this.state.value) {
      val = this.state.value;
    } else if (defaultValue) {
      val = defaultValue;
    }

    return (
      <span>
        <Component
          disabled={disabled}
          onBlur={this.props.onBlur}
          onChange={this.handleChange}
          onKeyDown={this.handleKeyDown}
          ref={(c) => { this.refInput = c; }}
          value={val}
          {...propagated}
        />
        {this.renderAutocompleteList()}
      </span>
    );
  }
}

AutocompleteTextField.propTypes = propTypes;
AutocompleteTextField.defaultProps = defaultProps;

export default AutocompleteTextField;
