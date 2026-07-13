import React from "react";
import { FaRobot, FaSignOutAlt } from "react-icons/fa";


function Navbar({ username, onLogout }){

return(

<nav className="navbar">

<div className="navbar-left">
<FaRobot className="logo-icon"/>

<div>

<h1>
AI Code Review Assistant
</h1>


<p>
Smart Code Analysis using React & Flask
</p>


</div>
</div>

<div className="navbar-right">
{username && (
  <span className="username">Welcome, <strong>{username}</strong></span>
)}
{onLogout && (
  <button className="logout-button" onClick={onLogout}>
    <FaSignOutAlt /> Logout
  </button>
)}
</div>

</nav>

);

}


export default Navbar;