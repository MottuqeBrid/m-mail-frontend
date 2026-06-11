import { Link } from "react-router";

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <h1 className="text-6xl font-bold text-primary">404</h1>
      <p className="text-lg text-base-content/70">Page not found</p>
      <Link to="/" className="btn btn-primary">Go home</Link>
    </div>
  );
};

export default NotFoundPage;
