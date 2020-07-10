import React, { useContext } from 'react';
import { LoginPage, MainPage } from '@pages';
import { UserContext } from '@api';


function Routes() {
  const user = useContext(UserContext);
  return (
    user ? <MainPage /> : <LoginPage />
  );
}

export default Routes;