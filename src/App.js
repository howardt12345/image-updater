import React from "react";
import Routes from "@routes";
import { UserProvider } from "@api";

function App() {
  return (
    <UserProvider>
      <Routes />
    </UserProvider>
  );
}

export default App;