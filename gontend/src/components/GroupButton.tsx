import React from 'react';
import GroupButtonImage from '../images/group.svg';

const GroupButton = ({ onClick }) => (
  <button type="button" onClick={onClick}>
    <img src={GroupButtonImage} alt="Group" />
  </button>
);

export default GroupButton;
