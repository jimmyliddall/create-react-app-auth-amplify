// file: OAuthButton.js
import { withOAuth } from 'aws-amplify-react';
import React, { Component } from 'react';

class OAuthButton extends React.Component {
  handleClick() {
    // do something meaningful, Promises, if/else, whatever, and then
    window.location.assign('https://ctexample.auth.ap-southeast-2.amazoncognito.com/oauth2/authorize?identity_provider=AzureCognitoProvider&redirect_uri=https://master.d1gwqjtzihrsal.amplifyapp.com/&response_type=TOKEN&client_id=5ase063lspk3ut1j76n72r0ri2&scope=aws.cognito.signin.user.admin email openid');
  }

  render() {
    return (
      <div class='login'>
        <button onClick={this.handleClick}>Log back into application with Azure AD</button>
      </div>
    )
  }
}

//export default OAuthButton;
export default withOAuth(OAuthButton);