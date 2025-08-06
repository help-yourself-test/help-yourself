import React from "react";
import "./Loader.css";

const Loader = ({
  type = "default",
  text = "Loading...",
  size = "medium",
  className = "",
}) => {
  const getLoaderClass = () => {
    const baseClass = "loader-container";
    const typeClass = `loader-${type}`;
    const sizeClass = `loader-${size}`;
    return `${baseClass} ${typeClass} ${sizeClass} ${className}`.trim();
  };

  const getSpinnerClass = () => {
    return `loader-spinner loader-spinner-${size}`;
  };

  return (
    <div className={getLoaderClass()}>
      <div className={getSpinnerClass()}></div>
      {text && <p className="loader-text">{text}</p>}
    </div>
  );
};

// Specific loader components for different use cases
export const PageLoader = ({ text = "Loading page..." }) => (
  <Loader type="page" text={text} size="large" />
);

export const SectionLoader = ({ text = "Loading..." }) => (
  <Loader type="section" text={text} size="medium" />
);

export const ButtonLoader = ({ text = "" }) => (
  <Loader type="button" text={text} size="small" />
);

export const InlineLoader = ({ text = "Loading..." }) => (
  <Loader type="inline" text={text} size="small" />
);

export default Loader;
