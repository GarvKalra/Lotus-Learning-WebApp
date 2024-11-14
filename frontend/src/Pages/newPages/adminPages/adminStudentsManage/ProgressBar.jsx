const ProgressBar = ({ progress }) => {
    const adjustedWidth = progress > 0 ? `${progress}%` : '0px';
  
    return (
      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
        <div
          className={`bg-green-500 h-full transition-all`}
          style={{ width: adjustedWidth }}
        ></div>
      </div>
    );
  };
  
  
  export default ProgressBar;