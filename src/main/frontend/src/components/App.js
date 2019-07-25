import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import Layout from './Layout/LayoutView';
import { CustomThemeProvider } from './ThemeContext';

// This is the place to check login ref to https://medium.com/@tomlarge/private-routes-with-react-router-dom-28e9f40c7146 for sample code

const App = () => {
  return(
    <CustomThemeProvider>
      {/* Reminder: Ajay need to replace the ICDC with env variable and change build npm to read env variable*/}
      <BrowserRouter>
      <Switch>
        <Route path="/" component={Layout} />
        {/* <Route component={Error} /> */}
      </Switch>
    </BrowserRouter>
  </CustomThemeProvider>
  )
  };

export default App;