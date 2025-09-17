import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="px-6 py-4 flex justify-between items-center bg-white fixed w-full z-50 ">
      <Link to="/" className="text-xl font-iowan">Superfloat</Link>
      <div className="space-x-6">
        <Link to="/blogs" className="hover:underline">Blog</Link>
        <Link to="/" className="hover:underline">Home</Link>
        
      </div>
    </nav>
  );
}
