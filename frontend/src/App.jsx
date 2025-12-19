
import { useState } from 'react'
import './App.css'
import './style.css'

import { BrowserRouter, Routes, Route } from "react-router-dom";

import UserProvider from "./UserProvider";
import Navbar from "./components/Navbar";
import Search from "./pages/Search";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Orders from "./pages/Orders";
import Settings from "./pages/Settings";
import EditUser from "./pages/EditUser";
import EditPassword from "./pages/EditPassword";
import EditAddress from "./pages/EditAddress";
import EditPayment from "./pages/EditPayment";
import Checkout from "./pages/Checkout";
import Summary from "./pages/Summary";
import Product from "./pages/Product";
import Users from "./pages/Users";

export default function App() {
  const [user, setUser] = useState(null);

  return (
    <BrowserRouter>
      <UserProvider>
        <Navbar user={user} setUser={setUser} />
        <Routes>
          <Route path="/" element={ <Search /> } />
          <Route path="/cart" element={ <Cart /> } />
          <Route path="/login" element={ <Login /> } />
          <Route path="/register" element={ <Register /> } />
          <Route path="/orders" element={ <Orders /> } />
          <Route path="/settings/:id" element={ <Settings /> } />
          <Route path="/user/:id" element={ <EditUser /> } />
          <Route path="/password/:id" element={ <EditPassword /> } />
          <Route path="/address/:id/new" element={ <EditAddress /> } />
          <Route path="/address/:id/:aid" element={ <EditAddress /> } />
          <Route path="/payment/:id/new" element={ <EditPayment /> } />
          <Route path="/payment/:id/:pid" element={ <EditPayment /> } />
          <Route path="/checkout" element={ <Checkout /> } />
          <Route path="/summary/:id" element={ <Summary /> } />
          <Route path="/product/:id" element={ <Product /> } />
          <Route path="/users" element={ <Users /> } />
        </Routes>
      </UserProvider>
    </BrowserRouter>
  );
}
