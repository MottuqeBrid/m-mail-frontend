import { Link } from "react-router";

const Logo = ({ className = "", size = "md", link = "/" }) => {
  const sizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-14 h-14",
    xl: "w-20 h-20",
  };

  return (
    <Link to={link} aria-label="m-mail logo">
      <svg
        className={`${sizes[size] || sizes.md} ${className}`}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="m-mail logo"
      >
        <rect
          width="40"
          height="40"
          rx="8"
          fill="currentColor"
          className="text-primary"
        />
        <path
          d="M10 28V14l10 7 10-7v14"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M10 14h20v14H10z"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M20 21l-4-4m4 4l4-4"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </Link>
  );
};

export default Logo;
