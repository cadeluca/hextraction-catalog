// TakeMeBackButton.js
import React from 'react';

const TakeMeBackButton = () => {
  const handleBack = () => {
    // This will navigate the user back to the previous page
    console.log("history", window.history)
    window.history.back();
  };

  return (
    <button
      onClick={handleBack}
      className={"_rounded"}
    >
      {"<"} Take me back
    </button>
  );
};

export default TakeMeBackButton;
