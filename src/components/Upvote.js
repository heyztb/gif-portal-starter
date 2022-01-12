import React from 'react';
import PropTypes from 'prop-types';
import upArrow from '../assets/chevron-up.svg';

const Upvote = ({ voteCount }) => {
  return (
  <div>
    <button className='cta-button upvote-button'>
        {voteCount} Upvote this GIF
    <img src={upArrow} alt="Upvote GIF" className="upvote-arrow" />
    </button>
  </div>
  )
}

Upvote.propTypes = {
  voteCount: PropTypes.number,
}

export default Upvote;
