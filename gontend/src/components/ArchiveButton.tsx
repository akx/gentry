import React from 'react';
import ArchiveButtonImage from '../images/box-add.svg';

const ArchiveButton = ({ onClick }) => (
  <button type="button" onClick={onClick}>
    <img src={ArchiveButtonImage} alt="Archive" />
  </button>
);

export default ArchiveButton;
