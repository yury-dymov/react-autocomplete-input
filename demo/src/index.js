import React, { Component } from 'react';
import ReactDOM, { findDOMNode } from 'react-dom';
import TextField from '../../src/AutoCompleteTextField';

import '../../dist/bundle.css';

class App extends Component {
  constructor() {
    super();

    this.handleAddOption = this.handleAddOption.bind(this);
    this.handleDisable = this.handleDisable.bind(this);
    this.handleMaxOptionChange = this.handleMaxOptionChange.bind(this);
    this.handleRegexChange = this.handleRegexChange.bind(this);
    this.handleRequestOnlyIfNoOptions = this.handleRequestOnlyIfNoOptions.bind(this);
    this.handleRequestOptions = this.handleRequestOptions.bind(this);
    this.handleSpaceRemoversChange = this.handleSpaceRemoversChange.bind(this);
    this.handleSpacerChange = this.handleSpacerChange.bind(this);
    this.handleTriggerChange = this.handleTriggerChange.bind(this);
    this.handleTriggerArrayChange = this.handleTriggerArrayChange.bind(this)
    this.handleTriggerSwitch = this.handleTriggerSwitch.bind(this)
    this.handleTriggerMatchWholeWordChange = this.handleTriggerMatchWholeWordChange.bind(this);
    this.handleTriggerCaseInsensitiveChange = this.handleTriggerCaseInsensitiveChange.bind(this);

    this.state = {
      disabled: false,
      maxOptions: "6",
      options: ["apple", "apricot", "banana", "bounty"],
      regex: '^[a-zA-Z0-9_\\-]+$',
      requestOnlyIfNoOptions: true,
      spaceRemovers: "[',', '.', '?', '!']",
      spacer: " ",
      trigger: '@',
      triggerArray: ['@', '!!'],
      isTriggerArray: false,
      triggerMatchWholeWord: false,
      triggerCaseInsensitive: false
    };
  }

  handleAddOption() {
    const nextOptions = this.state.options;

    nextOptions.push(findDOMNode(this.refOptionField).value.trim());
    this.setState({ options: nextOptions });
  }

  handleDisable() {
    this.setState({ disabled: !this.state.disabled });
  }

  handleMaxOptionChange(e) {
    this.setState({ maxOptions: e.target.value });
  }

  handleRegexChange(e) {
    this.setState({ regex: e.target.value });
  }

  handleRequestOptions(str) {
    console.log(`Requesting options for string: ${str}`);
  }

  handleRequestOnlyIfNoOptions(e) {
    this.setState({ requestOnlyIfNoOptions: !this.state.requestOnlyIfNoOptions });
  }

  handleSpaceRemoversChange(e) {
    this.setState({ spaceRemovers: e.target.value })
  }

  handleSpacerChange(e) {
    this.setState({ spacer: e.target.value })
  }

  handleTriggerChange(e) {
    this.setState({ trigger: e.target.value })
  }

  handleTriggerArrayChange(e) {
    this.setState({ triggerArray: e.target.value.split(',') })
  }

  handleTriggerSwitch() {
    this.setState({ isTriggerArray: !this.state.isTriggerArray })
  }

  handleTriggerMatchWholeWordChange() {
    this.setState({ triggerMatchWholeWord: !this.state.triggerMatchWholeWord });
  }

  handleTriggerCaseInsensitiveChange() {
    this.setState({ triggerCaseInsensitive: !this.state.triggerCaseInsensitive });
  }

  render() {
    const options = this.state.options.sort((a, b) => a.localeCompare(b)).map(option => <li key={option}>{option}</li>);

    return (
      <div>
        <div>
          <h2>AutoCompletion demo</h2>
          <p><i>Hint:</i> input "@a" to see in action</p>
          <TextField
            disabled={this.state.disabled}
            style={{ width: '300px', height: '100px', display: 'block' }}
            maxOptions={parseInt(this.state.maxOptions, 10)}
            onRequestOptions={this.handleRequestOptions}
            onSelect={v => alert(`value selected: ${v}`)}
            options={this.state.options}
            regex={this.state.regex}
            requestOnlyIfNoOptions={this.state.requestOnlyIfNoOptions}
            spaceRemovers={this.state.spaceRemovers}
            spacer={this.state.spacer}
            trigger={this.state.isTriggerArray ? this.state.triggerArray : this.state.trigger}
            triggerMatchWholeWord={this.state.triggerMatchWholeWord}
            triggerCaseInsensitive={this.state.triggerCaseInsensitive}
          />
        </div>
        <hr style={{ margin: '20px 0' }} />
        <h2>Options</h2>
        <div>
          <button onClick={this.handleTriggerSwitch}>{`is trigger array : ${this.state.isTriggerArray}`}</button>
          <div className="option-block">
            <h3>trigger : string</h3>
            <p>Show autocomplete option list if trigger string is met.</p>
            <p>Default value: '@'. </p>
            <div className="field">
              <input onChange={this.handleTriggerChange} value={this.state.trigger} />
            </div>
          </div>
          <div className="option-block">
            <h3>trigger : Array of strings</h3>
            <p>Show autocomplete option list if any of trigger strings is met.</p>
            <p>Default value: ['@', '!!']. </p>
            <div className="field">
              <input onChange={this.handleTriggerArrayChange} value={this.state.triggerArray.toString()} />
            </div>
          </div>
        </div>
        <div className="option-block">
          <h3>spaceRemovers : array</h3>
          <p>If one of this characters is putted after selected option, space is removed. I.e. "@option ,|" -> "@option, |".</p>
          <p>Default value: [',', '.', '!', '?'].</p>
          <div className="field">
            <input onBlur={this.handleSpaceRemoversChange} defaultValue={this.state.spaceRemovers} />
          </div>
        </div>
        <div className="option-block">
          <h3>spacer : string</h3>
          <p>Character to add after selected option.</p>
          <p>Default value: ' '.</p>
          <div className="field">
            <input onBlur={this.handleSpacerChange} defaultValue={this.state.spacer} />
          </div>
        </div>
        <div className="option-block">
          <h3>maxOptions : integer</h3>
          <p>Maximum number of options provided in the option list. Rest of option list is truncated.</p>
          <p>Default value: 6</p>
          <div className="field">
            <input onChange={this.handleMaxOptionChange} value={this.state.maxOptions} />
          </div>
        </div>
        <div className="option-block">
          <h3>options : array</h3>
          <p>List of autocomplete options</p>
          <p>Default value: []</p>
          <p>Demo options</p>
          <ul className='options'>
            {options}
          </ul>
          <div className="field">
            <input ref={c => { this.refOptionField = c; }} />
          </div>
          <button onClick={this.handleAddOption}>Add</button>
        </div>
        <div className="option-block">
          <h3>requestOnlyIfNoOptions : boolean</h3>
          <p>Control parent calls to get new options. If true calls are executed only if all provided options don't match the pattern. Otherwise, call is performed on every field change after trigger is found.</p>
          <p>Default value: true</p>
          <div className="field">
            <input type="checkbox" onChange={this.handleRequestOnlyIfNoOptions} checked={this.state.requestOnlyIfNoOptions} />
          </div>
        </div>
        <div className="option-block">
          <h3>regex : string</h3>
          <p>Autocomplete options must match provided regex</p>
          <p>Default value: '^[a-zA-Z0-9\-_]+$'</p>
          <div className="field">
            <input onBlur={this.handleRegexChange} defaultValue={this.state.regex} />
          </div>
        </div>
        <div className="option-block">
          <h3>triggerMatchWholeWord : boolean</h3>
          <p>Only match the trigger when it is an isolated word (i.e. do not trigger on subwords)</p>
          <p>Default value: false</p>
          <div className="field">
            <input type="checkbox" onChange={this.handleTriggerMatchWholeWordChange} checked={this.state.triggerMatchWholeWord} />
          </div>
        </div>            
        <div className="option-block">
          <h3>triggerCaseInsensitive : boolean</h3>
          <p>Use case-insensitive comparison of input text with trigger</p>
          <p>Default value: false</p>
          <div className="field">
            <input type="checkbox" onChange={this.handleTriggerCaseInsensitiveChange} checked={this.state.triggerCaseInsensitive} />
          </div>
        </div>
        <div className="option-block">
          <h3>disabled : boolean</h3>
          <p>Disable field, i.e. during submission</p>
          <p>Default value: false</p>
          <div className="field">
            <input type="checkbox" onChange={this.handleDisable} checked={this.state.disabled} />
          </div>
        </div>
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('app'));
