import React from 'react';

const OnHoverExtraHud = ({ name }) => {
  return (
    <div className="hover-children absolute z-40 top-full left-1/2 transform -translate-x-1/2 bg-stone-700 text-white py-1 px-3 rounded-md whitespace-nowrap shadow-md">
      <p className="text-xs">{name}</p>
    </div>
  );
};

export default OnHoverExtraHud;