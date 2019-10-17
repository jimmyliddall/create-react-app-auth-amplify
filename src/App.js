import React, { Component } from 'react';
import './App.css';
import OAuthButton from './OAuthButton';
import { withAuthenticator } from 'aws-amplify-react'
import Amplify, { Auth, Hub, Logger } from 'aws-amplify';
import awsconfig from './aws-exports'; // your Amplify configuration

// your Cognito Hosted UI configuration
const oauth = {
  domain: 'ctexample.auth.ap-southeast-2.amazoncognito.com',
  scope: [ 'email', 'openid', 'aws.cognito.signin.user.admin'],
  redirectSignIn: 'https://master.d1gwqjtzihrsal.amplifyapp.com/',
  redirectSignOut: 'https://master.d1gwqjtzihrsal.amplifyapp.com/',
  responseType: 'token', // or 'token', note that REFRESH token will only be generated when the responseType is code
  client_id: '5ase063lspk3ut1j76n72r0ri2'
};

Amplify.configure(awsconfig);
Auth.configure({ oauth });

const logger = new Logger('AppLog','DEBUG');

class App extends Component {
  // setup props
  constructor(props) {
    super(props);
    this.signOut = this.signOut.bind(this);
    Hub.listen('auth', (data) => {
        const { payload } = data;
        logger.debug('A new auth event has happened: ' + data.payload.data.username + ' has ' + data.payload.event);
        this.onAuthEvent(payload);           
        logger.debug('A new auth event has happened: ' + data.payload.data.username + ' has ' + data.payload.event);
    })
  }

  // define vars in state (could be done in props constructor)
  state = {
    authState: 'signIn', // used to check login in render()
    token: null, // used to check if we've got a valid login
    user: null // used to store the user object returned from currentAuthenticatedUser()
  }
  
  // ====================================================
  // getuserinfo(): custom function to get tokencode
  // getuserinfo function to retrieve via amplify & cognito the currentAuthenticatedUser
  getuserinfo = async () => {
    // call a promise to waith for currentAuthenticatedUser() to return
    const user = await Auth.currentAuthenticatedUser();
    
    // do a debug log entry
    logger.debug(user);

    // setup some variables out of our current user object
    const token = user.signInUserSession.idToken.jwtToken;
    const user_givenname = user.attributes.name;
    const user_email = user.attributes.email;

    // set the variables into the classes state.
    this.setState({ token: token });
    this.setState({ user: user });
    this.setState({ user_givenname: user_givenname });
    this.setState({ user_email: user_email });
  }

  onAuthEvent(payload) {
      const { event2 } = payload.payload.event
      logger.debug(event2)
      switch (event2) {
        case "signIn":
          this.setState({ authState: 'signedIn'});
          this.getuserinfo();
          break;
        case "signOut":
          this.setState({ authState: 'signIn'});
          this.setState({ user: null });
          break;
      }
  }

  // ====================================================
  // signOut() : used to sign out user
  // custom sign out function; has been bound in constructor(props) as well
  signOut() {
    Auth.signOut()
      .then(() => {
        this.setState({ authState: 'signIn'});
        this.setState({ user: null });
      })
      .catch(err => {
        logger.error(err);
      });
  }

  // ====================================================
  // render(): mandatory react render function
  render() {
    // vars for fun - should be buried in app
    const { authState } = this.state;
    const { token } = this.state;
    const { user_givenname } = this.state;
    const { user_email } = this.state;

    logger.debug('AuthState: ' + authState)

    // main return routine
    return (
      <div className="App">
        {
          // if authState is null display loading message.
          authState === null && (<div>loading...</div>)
        }
        {
          // if authState is set to signIn then show the login page with the single button for O365 javascript redirect
          authState === 'signIn' && <OAuthButton/>
        }
        {
          // if authState is signedIn then we've got a logged in user - lets start our app up!
          // or rather lets just show a sign out button for now.. sigh.
          authState === 'signedIn' ? 
          (
            <div class='signout'>
              <button onClick={this.signOut}>Sign out of application {user_givenname} {user_email}</button>
            </div>
          ) : null
        }
      </div>
    );
  }
}

// Export the App.  No Auth Wrapper required for AzureAD as this is undertaken in the OAuthButton.js
export default App;
