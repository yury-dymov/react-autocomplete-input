import React                      from 'react';
import { findDOMNode }            from 'react-dom';
import chai, { expect }           from 'chai';
import chaiEnzyme                 from 'chai-enzyme';
import { shallow, mount, render } from 'enzyme';
import jsdom                      from 'jsdom';
import { spy }                    from 'sinon';

const KEY_UP = 38;
const KEY_DOWN = 40;
const KEY_RETURN = 13;
const KEY_ENTER = 14;
const KEY_ESCAPE = 27;

chai.use(chaiEnzyme());

const doc = jsdom.jsdom('<!doctype html><html><body><div id="app"></div></body></html>');

global.document = doc;
global.window = doc.defaultView;
global.navigator = window.navigator;

// we need to define these two functions to satisfy textarea-caret and mitigate its bug
global.window.getComputedStyle = () => { return {}; };
global.getComputedStyle = () => { return {}; };

// We need to have `document` and `window` in global scope before requiring TextField
const TextField = require('../dist/bundle').default;

function createOnChangeEvent(value) {
  return {
    target: {
      selectionStart: value.length,
      selectionEnd: value.length,
      value
    }
  };
}

describe('className and style are propagated', () => {
  it('className: rnd-1234 -> .rnd-1234', () => {
    const component = render(<TextField className="rnd-1234" />);

    expect(component.find('.rnd-1234')).to.have.length(1);
  });

  it('style: { zIndex: "-9876"} => style={"z-index:-9876"}', () => {
    const component = render(<TextField style={{ zIndex: '-9876' }} />);

    expect(component.find('textarea')).to.have.attr('style').match(/\-9876/);
  });
});

describe('option list is shown for different trigger strings', () => {
  it('trigger @', () => {
    const component = mount(<TextField trigger="@" options={["aa", "ab"]} />);

    component.find('textarea').simulate('change', createOnChangeEvent('@'));

    expect(component.find('.react-autocomplete-input')).to.have.length(1);
  });

  it('trigger @@ 1/2', () => {
    const component = mount(<TextField trigger="@@" options={["aa", "ab"]} />);

    component.find('textarea').simulate('change', createOnChangeEvent('@'));

    expect(component.find('.react-autocomplete-input')).to.have.length(0);
  });

  it('trigger @@ 2/2', () => {
    const component = mount(<TextField trigger="@@" options={["aa", "ab"]} />);

    component.find('textarea').simulate('change', createOnChangeEvent('@@'));

    expect(component.find('.react-autocomplete-input')).to.have.length(1);
  });

  it('trigger empty only with first character 1/2', () => {
    const component = mount(<TextField trigger="" options={["aa", "ab"]} />);

    component.find('textarea').simulate('change', createOnChangeEvent(' '));

    expect(component.find('.react-autocomplete-input')).to.have.length(0);
  });

  it('trigger empty only with first character 2/2', () => {
    const component = mount(<TextField trigger="" options={["aa", "ab"]} />);

    component.find('textarea').simulate('change', createOnChangeEvent(' a'));

    expect(component.find('.react-autocomplete-input')).to.have.length(1);
  });

  it('trigger empty, option list should appear if first letter matched', () => {
    const component = mount(<TextField options={["aa", "ab"]} trigger="" />);

    component.find('textarea').simulate('change', createOnChangeEvent('a'));

    expect(component.find('.react-autocomplete-input > li')).to.have.length(2);
  });
});

describe('option list appearance', () => {
  it('hide if no options available', () => {
    const component = mount(<TextField trigger="@" options={["aa", "ab"]} />);

    component.find('textarea').simulate('change', createOnChangeEvent('@a'));
    expect(component.find('.react-autocomplete-input')).to.have.length(1);

    component.find('textarea').simulate('change', createOnChangeEvent('@ad'));
    expect(component.find('.react-autocomplete-input')).to.have.length(0);
  });

  it('hide on blur', (done) => {
    const component = mount(<TextField trigger="@" options={["aa", "ab"]} />);

    component.find('textarea').simulate('change', createOnChangeEvent('@a'));
    expect(component.find('.react-autocomplete-input')).to.have.length(1);

    component.find('textarea').simulate('blur');

    setTimeout(() => {
      expect(component.find('.react-autocomplete-input')).to.have.length(0);
      done();
    }, 100);
  });
});

describe('option list filtering', () => {
  it('a => 4 options', () => {
    const component = mount(<TextField trigger="@" options={["aa", "ab", "abc", "abcd"]} />);

    component.find('textarea').simulate('change', createOnChangeEvent('@a'));
    expect(component.find('.react-autocomplete-input > li')).to.have.length(4);
  });

  it('ab => 3 options', () => {
    const component = mount(<TextField trigger="@" options={["aa", "ab", "abc", "abcd"]} />);

    component.find('textarea').simulate('change', createOnChangeEvent('@a'));
    component.find('textarea').simulate('change', createOnChangeEvent('@ab'));
    expect(component.find('.react-autocomplete-input > li')).to.have.length(3);
  });

  it('abc => 2 options', () => {
    const component = mount(<TextField trigger="@" options={["aa", "ab", "abc", "abcd"]} />);

    component.find('textarea').simulate('change', createOnChangeEvent('@a'));
    component.find('textarea').simulate('change', createOnChangeEvent('@abc'));
    expect(component.find('.react-autocomplete-input > li')).to.have.length(2);
  });

});

describe('max options test', () => {
  it('options: 3, maxOptions: 5 => 3 options', () => {
    const component = mount(<TextField trigger="@" options={["aa", "ab", "abc"]} maxOptions={5} />);

    component.find('textarea').simulate('change', createOnChangeEvent('@a'));

    expect(component.find('.react-autocomplete-input > li')).to.have.length(3);
  });

  it('options: 5, maxOptions: 3 => 3 options', () => {
    const component = mount(<TextField trigger="@" options={["aa", "ab", "abc", "abcd", "abcde"]} maxOptions={3} />);

    component.find('textarea').simulate('change', createOnChangeEvent('@a'));

    expect(component.find('.react-autocomplete-input > li')).to.have.length(3);
  });

  it('options: 10, maxOptions: 0 => 10 options', () => {
    const component = mount(<TextField trigger="@" options={["aa", "ab", "abc", "abcd", "abcde", "ae", "af", "ag", "ah", "az"]} maxOptions={0} />);

    component.find('textarea').simulate('change', createOnChangeEvent('@a'));

    expect(component.find('.react-autocomplete-input > li')).to.have.length(10);
  });
});

describe('disabled test', () => {
  it('disabled works', () => {
    const component = render(<TextField disabled trigger="@" options={["aa", "ab", "abc", "abcd", "abcde"]} />);

    expect(component.find('textarea')).to.have.attr('disabled');
  });
});

describe('Component', () => {
  it('default is textarea', () => {
    const component = render(<TextField />);

    expect(component.find('textarea')).to.have.length(1);
  });

  it('Component=input => input', () => {
    const component = render(<TextField Component="input" />);

    expect(component.find('input')).to.have.length(1);
  });
});

describe('regex', () => {
  it('if matches we can see options', () => {
    const component = mount(<TextField trigger="@" options={["aa", "ab", "abc", "abcd", "abcde"]} regex="^[a-z]+$" />);

    component.find('textarea').simulate('change', createOnChangeEvent('@a'));

    expect(component.find('.react-autocomplete-input > li')).to.have.length(5);
  });

  it('if not matches, no options rendered', () => {
    const component = mount(<TextField trigger="@" options={["aa", "ab", "abc", "abcd", "abcde"]} regex="^[b-z]+$" />);

    component.find('textarea').simulate('change', createOnChangeEvent('@a'));

    expect(component.find('.react-autocomplete-input')).to.have.length(0);
  });
});

describe('defaultValue and value propagated', () => {
  it('defaultValue', () => {
    const component = render(<TextField defaultValue="hello" />);

    expect(component.find('textarea')).to.have.html().match(/hello/);
  });

  it('value', () => {
    const component = render(<TextField value="hello" />);

    expect(component.find('textarea')).to.have.html().match(/hello/);
  });
});

describe('spaceRemovers', () => {
  it('space is removed if option matched', () => {
    const component = mount(<TextField spaceRemovers={[';']} options={["aa", "ab"]} />);

    component.find('textarea').simulate('change', createOnChangeEvent('@aa '));
    component.find('textarea').simulate('change', createOnChangeEvent('@aa ;'));

    expect(component.find('textarea')).to.have.html().match(/@aa; /);
  });

  it('space is not removed if option is not matched', () => {
    const component = mount(<TextField spaceRemovers={[';']} options={["aa", "ab"]} />);

    component.find('textarea').simulate('change', createOnChangeEvent('@ad ;'));

    expect(component.find('textarea')).to.have.html().match(/@ad ;/);
  });

  it('space is not removed for double-space situation', () => {
    const component = mount(<TextField spaceRemovers={[';']} options={["aa", "ab"]} />);

    component.find('textarea').simulate('change', createOnChangeEvent('@aa  ;'));

    expect(component.find('textarea')).to.have.html().match(/@aa  ;/);
  });
});

describe('onRequestOptions and requestOnlyIfNoOptions', () => {
  it('expect to call requestOptions with full string after trigger', () => {
    function handleRequestOptions(str) {
      expect(str).to.equal('ab');
    }

    const component = mount(<TextField trigger="@@" onRequestOptions={handleRequestOptions}/>);

    component.find('textarea').simulate('change', createOnChangeEvent('@@ab'));
  });

  it('expect no call if options left', () => {
    function handleRequestOptions(str) {
      throw new Error('unexpected call');
    }

    const component = mount(<TextField trigger="@@" onRequestOptions={handleRequestOptions} options={["ab"]} />);

    component.find('textarea').simulate('change', createOnChangeEvent('@@ab'));
  });

  it ('expect call after trigger in any case if requestOnlyIfNoOptions=true', () => {
    function handleRequestOptions(str) {
      expect(str).to.equal('ab');
    }

    const component = mount(<TextField trigger="@@" onRequestOptions={handleRequestOptions} options={["ab"]} requestOnlyIfNoOptions />);

    component.find('textarea').simulate('change', createOnChangeEvent('@@ab'));
  });

  it ('expect not call if no trigger found and requestOnlyIfNoOptions=true', () => {
    function handleRequestOptions(str) {
      throw new Error('unexpected call');
    }

    const component = mount(<TextField trigger="@@" onRequestOptions={handleRequestOptions} options={["ab"]} requestOnlyIfNoOptions />);

    component.find('textarea').simulate('change', createOnChangeEvent('@ab'));
  });
});

describe("events should be propagated", () => {
  it('onBlur', (done) => {
    let call = false;

    function handleBlur() {
      call = true;
      setTimeout(() => expect(component.find('.react-autocomplete-input')).to.have.length(0), 100);
    }

    const component = mount(<TextField trigger="@" options={["aa", "ab"]} onBlur={handleBlur}/>);

    component.find('textarea').simulate('blur');

    setTimeout(() => {
      expect(call).to.equal(true);
      done();
    }, 150);
  });

  it('onChange', (done) => {
    let call = false;

    function handleChange(value) {
      call = true;
      expect(value).to.equal('@a');
    }

    const component = mount(<TextField trigger="@" options={["aa", "ab"]} onChange={handleChange}/>);

    component.find('textarea').simulate('change', createOnChangeEvent('@a'));

    setTimeout(() => {
      expect(call).to.equal(true);
      done();
    }, 50);
  });

  it('onKeyDown', (done) => {
    let call = false;

    function handleKeyDown() {
      call = true;
    }

    const component = mount(<TextField trigger="@" options={["aa", "ab"]} onKeyDown={handleKeyDown}/>);

    component.find('textarea').simulate('keyDown', { keyCode: '13' });

    setTimeout(() => {
      expect(call).to.equal(true);
      done();
    }, 50);
  });
});

describe('selecting option from list', () => {
  it('mouse click => hide options, update textarea', () => {
    const component = mount(<TextField options={["aa", "ab"]} />);

    component.find('textarea').simulate('change', createOnChangeEvent('@'));
    component.find('textarea').simulate('change', createOnChangeEvent('@a'));

    expect(component.find('.react-autocomplete-input')).to.have.length(1);

    component.find('.active').simulate('click');

    expect(component.find('.react-autocomplete-input')).to.have.length(0);
    expect(component.find('textarea')).to.have.html().match(/@aa/);
  });

  it('return => hide options, update textarea', () => {
    const component = mount(<TextField options={["aa", "ab"]} />);

    component.find('textarea').simulate('change', createOnChangeEvent('@'));
    component.find('textarea').simulate('change', createOnChangeEvent('@a'));

    expect(component.find('.react-autocomplete-input')).to.have.length(1);

    component.find('textarea').simulate('keyDown', { keyCode: KEY_RETURN });

    expect(component.find('.react-autocomplete-input')).to.have.length(0);
    expect(component.find('textarea')).to.have.html().match(/@aa/);
  });

  it('enter => hide options, update textarea', () => {
    const component = mount(<TextField options={["aa", "ab"]} />);

    component.find('textarea').simulate('change', createOnChangeEvent('@'));
    component.find('textarea').simulate('change', createOnChangeEvent('@a'));

    expect(component.find('.react-autocomplete-input')).to.have.length(1);

    component.find('textarea').simulate('keyDown', { keyCode: KEY_ENTER });

    expect(component.find('.react-autocomplete-input')).to.have.length(0);
    expect(component.find('textarea')).to.have.html().match(/@aa/);
  });

  it('press down => make next list item active', () => {
    const component = mount(<TextField options={["aa", "az"]} />);

    component.find('textarea').simulate('change', createOnChangeEvent('@'));
    component.find('textarea').simulate('change', createOnChangeEvent('@a'));

    expect(component.find('.react-autocomplete-input')).to.have.length(1);

    component.find('textarea').simulate('keyDown', { keyCode: KEY_DOWN });

    expect(component.find('.active')).to.have.html().match(/a.*?>z</);
  });

  it('press up => make prev list item active', () => {
    const component = mount(<TextField options={["aa", "ab"]} />);

    component.find('textarea').simulate('change', createOnChangeEvent('@'));
    component.find('textarea').simulate('change', createOnChangeEvent('@a'));

    expect(component.find('.react-autocomplete-input')).to.have.length(1);

    component.find('textarea').simulate('keyDown', { keyCode: KEY_DOWN });
    component.find('textarea').simulate('keyDown', { keyCode: KEY_UP });

    expect(component.find('.active')).to.have.html().match(/a.*?>a</);
  });

  it('press down on last elen => make first list item active', () => {
    const component = mount(<TextField options={["aa", "ab"]} />);

    component.find('textarea').simulate('change', createOnChangeEvent('@'));
    component.find('textarea').simulate('change', createOnChangeEvent('@a'));

    expect(component.find('.react-autocomplete-input')).to.have.length(1);

    component.find('textarea').simulate('keyDown', { keyCode: KEY_DOWN });
    component.find('textarea').simulate('keyDown', { keyCode: KEY_DOWN });
    component.find('textarea').simulate('keyDown', { keyCode: KEY_DOWN });

    expect(component.find('.active')).to.have.html().match(/a.*?>a</);
  });

  it('mouse over second elem => second elem is active', () => {
    const component = mount(<TextField options={["aa", "ab"]} />);

    component.find('textarea').simulate('change', createOnChangeEvent('@'));
    component.find('textarea').simulate('change', createOnChangeEvent('@a'));

    expect(component.find('.react-autocomplete-input')).to.have.length(1);

    component.find('li').last().simulate('mouseEnter');

    expect(component.find('.active')).to.have.html().match(/a.*?>b</);
  });
});

describe('different key events', () => {
  it('hide options if trigger is deleted', () => {
    const component = mount(<TextField options={["aa", "ab"]} />);

    component.find('textarea').simulate('change', createOnChangeEvent('@a'));

    expect(component.find('.react-autocomplete-input')).to.have.length(1);

    component.find('textarea').simulate('change', createOnChangeEvent(''));

    expect(component.find('.react-autocomplete-input')).to.have.length(0);
  });

  it('hide options if escape pressed', () => {
    const component = mount(<TextField options={["aa", "ab"]} />);

    component.find('textarea').simulate('change', createOnChangeEvent('@a'));

    expect(component.find('.react-autocomplete-input')).to.have.length(1);

    component.find('textarea').simulate('keyDown', { keyCode:  KEY_ESCAPE });

    expect(component.find('.react-autocomplete-input')).to.have.length(0);
  });

  it('other keyDown events are propagated if helper not visible', () => {
    const handleKeyDown = spy();

    const component = mount(<TextField options={["aa", "ab"]} onKeyDown={handleKeyDown} />);

    expect(component.find('.react-autocomplete-input')).to.have.length(0);

    component.find('textarea').simulate('keyDown', { keyCode: 55 });

    expect(handleKeyDown.calledOnce).to.equal(true);
  });

  it('other keyDown events are propagated if helper is visible', () => {
    const handleKeyDown = spy();

    const component = mount(<TextField options={["aa", "ab"]} onKeyDown={handleKeyDown} />);

    component.find('textarea').simulate('change', createOnChangeEvent('@a'));

    expect(component.find('.react-autocomplete-input')).to.have.length(1);

    component.find('textarea').simulate('keyDown', { keyCode: 55 });

    expect(handleKeyDown.calledOnce).to.equal(true);
  });
});

describe('updating props', () => {
  it('option list is updated if props value is updated', () => {
    const component = mount(<TextField options={["aa", "ab"]} />);

    component.find('textarea').simulate('change', createOnChangeEvent('@a'));

    expect(component.find('.react-autocomplete-input > li')).to.have.length(2);

    component.setProps({ options: ["aa", "ab", "ac"] });

    expect(component.find('.react-autocomplete-input > li')).to.have.length(3);
  });
});
