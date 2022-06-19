import React from 'react';
import { Link } from 'react-router-dom';
import Tophat from '../images/tophat.svg';

const MainNav: React.SFC<{}> = () => (
  <nav className="main">
    <Link to="/">
      <img alt="Logo" src={Tophat} />
    </Link>
    <Link to="/groups" className="t">
      Groups
    </Link>
    <Link to="/events" className="t">
      Events
    </Link>
  </nav>
);

export default MainNav;
