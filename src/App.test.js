import React from 'react';
import ReactDOM from 'react-dom';
import ZAbacus from './App';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<ZAbacus />, div);
  ReactDOM.unmountComponentAtNode(div);
});
