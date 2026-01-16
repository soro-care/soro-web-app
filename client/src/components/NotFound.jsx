import { Link } from 'react-router-dom';

const NotFound = () => (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-6">Oops! The post you're looking for doesn't exist.</p>
        <Link 
            to="/blog" 
            className="px-6 py-3 bg-[#30459D] text-white rounded-lg hover:bg-[#263685] transition-colors"
        >
            Browse All Posts
        </Link>
    </div>
);

export default NotFound;