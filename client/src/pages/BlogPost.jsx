import blog from '../assets/blog.png';
import { useSelector } from 'react-redux';


const BlogPost = () => {
    const user = useSelector(state => state.user);
    
    return (
        <div className={`${user?._id ? 'md:ml-64 bg-gradient-to-br from-[#eff8f9d6] to-[#f3e8ded7]' : ''} min-h-screen`}>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
                {/* Hero/Header Section */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
                <div className="flex flex-col md:flex-row">
                    {/* Image Half - Left */}
                    <div className="md:w-1/2 h-64 md:h-auto">
                    <img
                        src={blog}
                        alt="Mindfulness Techniques"
                        className="w-full h-full object-cover"
                    />
                    </div>
                    
                    {/* Content Half - Right */}
                    <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-center">
                    <div className="inline-flex items-center gap-2 mb-4">
                        <span className="bg-[#30459D]/10 text-[#30459D] text-xs font-medium px-3 py-1 rounded-full">
                        Wellness
                        </span>
                        <span className="text-gray-500 text-sm">5 min read</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        5 Mindfulness Techniques for Daily Peace
                    </h1>
                    <p className="text-lg text-gray-600 mb-6">
                        Discover simple yet powerful practices to cultivate mindfulness in your everyday life.
                    </p>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-medium">
                        SJ
                        </div>
                        <div>
                        <p className="text-sm font-medium text-gray-900">Sarah Johnson</p>
                        <p className="text-xs text-gray-500">Clinical Psychologist</p>
                        </div>
                    </div>
                    </div>
                </div>
                </div>
        
                {/* Blog Content Section */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden p-6 md:p-8">
                <div className="prose max-w-none">
                    <p className="text-lg text-gray-700 mb-6">
                    In today's fast-paced world, finding moments of peace can feel challenging. These five techniques can help you center yourself throughout the day.
                    </p>
                    
                    <h2 className="text-2xl font-bold text-[#30459D] mb-4">1. Morning Intention Setting</h2>
                    <p className="text-gray-700 mb-6">
                    Begin your day by sitting quietly for just two minutes. Set an intention for how you want to feel today. This simple practice creates mental clarity and purpose.
                    </p>
                    
                    <div className="bg-[#30459D]/5 p-4 rounded-xl border border-[#30459D]/10 mb-6">
                    <h3 className="font-medium text-[#30459D] mb-2">Try This:</h3>
                    <p className="text-gray-700">
                        Place one hand on your heart and one on your belly. Breathe deeply three times while repeating: "Today, I choose peace."
                    </p>
                    </div>
                    
                    <h2 className="text-2xl font-bold text-[#30459D] mb-4">2. Sensory Grounding</h2>
                    <p className="text-gray-700 mb-6">
                    When feeling overwhelmed, pause and name: 5 things you see, 4 things you feel, 3 things you hear, 2 things you smell, and 1 thing you taste. This brings you back to the present moment.
                    </p>
                    
                    <img
                    src="/images/mindfulness-practice.jpg"
                    alt="Woman practicing mindfulness"
                    className="w-full h-auto rounded-lg mb-6"
                    />
                    
                    <h2 className="text-2xl font-bold text-[#30459D] mb-4">3. Gratitude Pause</h2>
                    <p className="text-gray-700 mb-6">
                    Before meals, take 30 seconds to reflect on three things you're grateful for. This cultivates positive neural pathways while nourishing your body.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                        <h3 className="font-medium text-gray-900 mb-2">Morning Routine</h3>
                        <p className="text-sm text-gray-600">Start with 5 minutes of silent breathing before checking your phone</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                        <h3 className="font-medium text-gray-900 mb-2">Evening Wind Down</h3>
                        <p className="text-sm text-gray-600">Journal three positive moments from your day</p>
                    </div>
                    </div>
                    
                    <h2 className="text-2xl font-bold text-[#30459D] mb-4">4. Walking Meditation</h2>
                    <p className="text-gray-700 mb-6">
                    Transform daily walks into meditative practice by focusing on the sensation of each step. Notice the rhythm of your movement and breath.
                    </p>
                    
                    <h2 className="text-2xl font-bold text-[#30459D] mb-4">5. Digital Sunset</h2>
                    <p className="text-gray-700 mb-6">
                    Create a "sunset" for your devices 30 minutes before bed. This digital boundary improves sleep quality and mental clarity.
                    </p>
                    
                    <div className="bg-gradient-to-r from-[#30459D] to-[#4066D0] rounded-xl p-6 text-white">
                    <h3 className="text-xl font-bold mb-2">Remember</h3>
                    <p>
                        Mindfulness isn't about perfection. Even one conscious breath amid a busy day is a victory. What matters is the intention to return to presence, again and again.
                    </p>
                    </div>
                </div>
                
                {/* Author Bio */}
                <div className="mt-12 pt-6 border-t border-gray-200">
                    <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-medium text-xl">
                        SJ
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Sarah Johnson</h3>
                        <p className="text-sm text-gray-500 mb-3">Clinical Psychologist specializing in mindfulness-based therapies</p>
                        <p className="text-gray-700">
                        With over 10 years of experience, Sarah helps individuals cultivate resilience through evidence-based mindfulness practices.
                        </p>
                    </div>
                    </div>
                </div>
                </div>
            </div>
        </div>
    );
  };


  export default BlogPost
