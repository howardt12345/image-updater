import React, { Component, createContext } from "react";
import { auth } from "@firebase-api";
import { GlobalStyle } from '@styles';


export const UserContext = createContext({ user: null });

class UserProvider extends Component {
  state = {
    user: null
  };

  
  
  componentDidMount = async () => {
    auth.onAuthStateChanged(async userAuth => {
      const user = userAuth;
      this.setState({ user });
    });
  };

  render() {
    const { user } = this.state;

    return (
      <UserContext.Provider value={user}>
        <GlobalStyle />
        {this.props.children}
      </UserContext.Provider>
    );
  }
}

export default UserProvider;