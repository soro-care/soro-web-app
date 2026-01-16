import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import { ArrowRight, Clock, Calendar, Heart, Plus, Minus, ArrowRightCircle, Send } from 'lucide-react'
import { motion } from 'framer-motion';
import about from '../assets/about.jpeg'
import start from '../assets/better.png'
import mock from '../assets/mock.png'
import hero from '../assets/hero.png'
import logo from '../assets/logo.png'
import logo2 from '../assets/logo-white.png'
import faqImage from '../assets/faq2.png'
import work1 from '../assets/work1.png'
import work2 from '../assets/work2.png'
import work4 from '../assets/work4.png'
import tool1 from '../assets/tool1.png'
import tool2 from '../assets/tool2.png'
import tool3 from '../assets/tool3.png'
import tool4 from '../assets/tool4.png'
import { FaTwitter, FaInstagram, FaLinkedin, FaYoutube } from 'react-icons/fa';

const Home = () => {
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const user = useSelector(state => state.user)
  
  const fetchBlogs = async () => {
    try {
      setLoading(true)
      const response = await Axios({ ...SummaryApi.getAllBlogs })
      if (response.data.success) {
        setBlogs(response.data.data)
      }
    } catch (error) {
      console.error("Error fetching blogs:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBlogs()
  }, [])

  // Blog Skeleton Loader Component
  const BlogSkeleton = () => (
    <div className="border border-gray-100 rounded-2xl overflow-hidden bg-white">
      <div className="relative h-48 bg-gray-100 animate-pulse"></div>
      <div className="p-6 space-y-3">
        <div className="flex space-x-3">
          <div className="h-4 bg-gray-100 rounded-full w-24 animate-pulse"></div>
          <div className="h-4 bg-gray-100 rounded-full w-24 animate-pulse"></div>
        </div>
        <div className="h-6 bg-gray-100 rounded-full w-full animate-pulse"></div>
        <div className="h-4 bg-gray-100 rounded-full w-3/4 animate-pulse"></div>
        <div className="h-12 bg-gray-100 rounded-lg w-full animate-pulse"></div>
        <div className="h-4 bg-gray-100 rounded-full w-20 animate-pulse"></div>
      </div>
    </div>
  )

  const features = [
  {
    title: "Therapy on Your Terms",
    description: "Book sessions when it works for you.",
    img: tool4,
  },
  {
    title: "Self-Help Tools",
    description: "Journals, trackers, and prompts to guide you.",
    img: tool2,
  },
  {
    title: "24/7 AI Support",
    description: "Chat anytime. Vent, reflect, feel heard.",
    img: tool3,
  },
  {
    title: "Trusted Care",
    description: "Real support from trained minds that care.",
    img: tool1,
  }
];


  const works = [
    {
      img: work1,
      description: "Ready to talk? Sign in and let's get started. We are here and ready to listen.",
    },
    {
      img: work2,
      description: "Select a professional whose availability suits you and book your session today.",
    },
    {
      img: work4,
      description: "Start your path to mental wellness with caring support and regular check-ins.",
    }
  ];

  const [activeIndex, setActiveIndex] = useState(null);
  const faqs = [
  {
    question: "What is Sọ̀rọ̀?",
    answer:
      "Sọ̀rọ̀(Speak in Yoruba) is an innovative digital mental health platform designed to support medical students through anonymous peer counseling, AI-powered self-help tools, and thoughtful wellness content. It’s stigma-free, private, and always available."
  },
  {
    question: "Who can use Soro?",
    answer:
      "At this phase, Soro is only available to medical students of the University of Ilorin (UniIlorin). Access is restricted to ensure a focused, secure, and tailored support experience."
  },
  {
    question: "Are the counseling sessions truly anonymous?",
    answer:
      "Yes. Both students and peer counselors remain anonymous during sessions. This design reduces stigma and creates a safe space where students can open up without fear of judgment."
  },
  {
    question: "Who are the peer counselors on Soro?",
    answer:
      "They are recent graduates of ILUMSA’s Mental Health & Counseling Bootcamp, trained in basic peer support and equipped to help fellow students with mental health concerns in a respectful, compassionate manner."
  },
  {
    question: "What kind of help can I get on Soro?",
    answer:
      "You can talk to a peer counselor about stress, anxiety, low mood, burnout, or just to let something off your chest. You can also use Soro’s self-help tools like mood tracking, reflective journaling, and our mental health blog — Soro Drops."
  },
  {
    question: "Is this a replacement for therapy?",
    answer:
      "No. Peer counseling offers emotional support but does not replace professional therapy or psychiatric care. Students in need of clinical intervention are referred to licensed professionals as needed."
  },
  {
    question: "Is there a cost to use Soro?",
    answer:
      "No, all services on Soro are currently free for University of Ilorin medical students, supported by partnerships and grants. We are working towards long-term sustainability through institutional backing."
  },
  {
    question: "How do I book a session?",
    answer:
      "Simply log into the Soro platform, choose a time that suits you, and book a session with an available peer counselor. You will remain anonymous throughout the process."
  }
];


  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    // Handle email submission logic here
    console.log("Email submitted:", email);
    setEmail('');
  };

  const createMarkup = (html) => {
    return { __html: html };
  };


  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-10 px-4 sm:px-6">
        <div className="max-w-6xl bg-white rounded-3xl mx-auto flex flex-col md:flex-row items-center gap-6 md:gap-8 overflow-hidden">
          {/* Text Content - centered on mobile */}
          <div className="w-full md:w-1/2 py-8 md:py-0 px-4 sm:px-6 text-center md:text-left">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium font-Literata  text-[#190D39] mb-4 sm:mb-6"
            >
              Because every <br /> mind deserves <br /> care.
            </motion.h1>
            
            <p className="text-base sm:text-lg text-gray-700 mb-6 sm:mb-8 mx-auto md:mx-0 max-w-md md:max-w-none">
              Start your journey to a healthier mind by connecting with caring professionals and exploring tools that support your emotional well-being.
            </p>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-3 sm:gap-4">
              <Link 
                to="/login" 
                className="bg-[#30459D] hover:bg-[#23367D] text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base"
              >
                Start Journey →
              </Link>
              <Link 
                to="/support" 
                className="border-2 border-[#30459D] text-[#30459D] hover:bg-[#E7F5F7] px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base"
              >
                Support
              </Link>
            </div>
          </div>
          
          {/* Image with padding and rounded corners */}
          <div className="w-full md:w-1/2 p-4 sm:p-6">
            <div className="rounded-3xl md:rounded-r-xl overflow-hidden">
              <img 
                src={hero} 
                alt="Happy diverse group discussing mental health" 
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Feeling Better Section */}
      <section className="py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-block max-w-full">
            <img 
              src={start} 
              alt="Soro start icon" 
              className="w-16 h-16 sm:w-20 sm:h-20 mx-auto" 
            />
          </div>
          <h2 className="text-2xl sm:text-3xl font-semibold font-Literata  italic text-[#190D39] mb-6 sm:mb-8">
            Start feeling better today
          </h2>
        </div>
      </section>

      {/* About Section */}
      <div className="max-w-6xl mb-12 pl-4 sm:pl-6 rounded-3xl mx-auto flex flex-col md:flex-row items-center gap-8">
        <div className="md:w-1/2 w-full order-2 md:order-1">
          <img 
            src={about} 
            alt="About Soro" 
            className="rounded-xl w-full h-auto"
          />
        </div>
        <div className="md:w-1/2 order-1 md:order-2">
          <h2 className="text-2xl sm:text-3xl font-semibold font-Literata  italic text-[#190D39] mb-4 sm:mb-6">
            Your mental wellness journey starts here
          </h2>
          <p className="text-base sm:text-lg text-gray-700 mb-6 sm:mb-8">
            Start your path with quality mental health professionals who understand and give you professional support with just a conversation away.
          </p>
          <Link 
            to="/about" 
            className="inline-flex items-center text-[#30459D] hover:text-[#23367D] font-medium"
          >
            Learn more about us <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-12 px-4 sm:px-6 mb-12 text-center">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-semibold font-Literata  italic text-[#190D39] mb-8 sm:mb-12">
            We provide self-help tools to help you
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-10 sm:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white p-6 sm:p-8 rounded-xl hover:shadow-md transition-shadow"
              >
                <div className="inline-block max-w-full mb-4">
                  <img 
                    src={feature.img} 
                    alt="Feature icon" 
                    className="w-16 h-16 sm:w-20 sm:h-20 mx-auto" 
                  />
                </div>
           
                <p className="text-gray-600 text-sm sm:text-base mb-4">
                  {feature.description}
                </p>
               
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 px-4 sm:px-6 mb-12">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-semibold font-Literata italic text-[#190D39] text-center mb-8 sm:mb-12">
            How it Works
          </h2>
          <div className="relative">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {works.map((work, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="p-6 sm:p-8 rounded-xl text-center"
                >
                  {/* Centered Image */}
                  <div className="flex justify-center mb-6">
                    <img 
                      src={work.img || start} // Fallback to start image if work.img is undefined
                      alt={`Step ${index + 1}`} 
                      className="w-16 h-16 sm:w-20 sm:h-20 object-contain" 
                    />
                  </div>
                  
                  {/* Description - now properly centered */}
                  <p className="text-gray-600 text-sm sm:text-base">
                    {work.description}
                  </p>
                </motion.div>
              ))}
            </div>

          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-3xl overflow-hidden shadow-sm">
            <div className="flex flex-col md:flex-row">
              {/* Image container with tighter size constraints */}
              <div className="md:w-1/2 p-4 sm:p-6 flex items-center justify-center">
                <img 
                  src={mock} 
                  alt="App mockup" 
                  className="w-full h-auto max-w-[280px] sm:max-w-[320px] md:max-w-[240px] lg:max-w-[280px] xl:max-w-[320px] object-contain" 
                />
              </div>
              
              {/* Text content */}
              <div className="md:w-1/2 p-8 sm:p-8 md:pl-6 flex flex-col text-center justify-center">
              <h2 className="text-2xl sm:text-3xl font-semibold font-Literata italic text-gray-800 mb-4 sm:mb-6">
                Ready to explore the SafeSpace?
              </h2>
                <p className="text-gray-600 text-base sm:text-lg mb-6 sm:mb-8">
                  Your feelings are valid, and we're here to support you—no judgment, just real care. 
                  SafeSpace is your always-on AI buddy, built to listen, guide, and help you feel better, one step at a time.
                  You don’t have to figure it all out alone—we’ve got you.
                </p>
                <div className="text-center ">
                  <Link 
                    to="/register" 
                    className="bg-[#30459D] hover:bg-[#23367D] text-white px-6 py-3 rounded-lg font-medium transition-colors inline-block"
                  >
                    Start Journey →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section className="py-12 px-4 sm:px-6 mb-12">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-semibold font-Literata  italic text-[#190D39] text-center mb-8 sm:mb-12">
            Soro drops!
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {loading ? (
              [...Array(3)].map((_, index) => <BlogSkeleton key={index} />)
            ) : blogs.length > 0 ? (
              blogs.slice(0, 3).map((post) => (
                <motion.div
                  key={post._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  whileHover={{ y: -5 }}
                  className="border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 bg-white group"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={post.featuredImage || '/images/blog-placeholder.jpg'} 
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent flex flex-col justify-end p-4">
                      <div className="flex flex-wrap gap-2">
                        {post.categories?.slice(0, 2).map(category => (
                          <span 
                            key={category._id} 
                            className="bg-[#30459D] text-white text-xs px-3 py-1 rounded-full font-medium"
                          >
                            {category.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center text-sm text-gray-500 mb-3 space-x-3">
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {post.readTime || 5} min read
                      </span>
                      <span className="flex items-center ml-auto">
                        <Heart className="w-4 h-4 mr-1 text-[#30459D]" />
                        {post.likes || 0}
                      </span>
                    </div>
                    
                    <h3 className="font-bold text-lg sm:text-xl mb-3 text-gray-800 group-hover:text-[#30459D] transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    
                    <p 
                      className="text-gray-600 text-sm sm:text-base mb-5 line-clamp-3"
                      dangerouslySetInnerHTML={createMarkup(post.excerpt || post.content.substring(0, 150) + '...')}
                    />
                    
                    <Link 
                      to={`/drops/${post.slug || post._id}`} 
                      className="inline-flex items-center text-[#30459D] hover:text-[#263685] font-medium text-sm sm:text-base group-hover:underline"
                    >
                      Continue reading 
                      <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="inline-block p-6 bg-white rounded-2xl shadow-sm">
                  <h3 className="text-xl sm:text-2xl font-medium text-gray-700 mb-3">No articles yet</h3>
                  <p className="text-gray-500 text-sm sm:text-base mb-4">We're brewing some fresh content for you</p>
                  <div className="w-24 h-1 bg-gradient-to-r from-[#30459D] to-[#ff85a2] rounded-full mx-auto"></div>
                </div>
              </div>
            )}
          </div>
          
          {blogs.length > 0 && (
            <div className="text-center mt-8">
              <Link 
                to="/drops" 
                className="inline-flex items-center text-[#30459D] hover:text-[#263685] font-medium text-lg"
              >
                View all articles <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 px-4 sm:px-6 mb-12 sm:mb-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8 sm:gap-12">
            {/* Left Half - Image */}
            <div className="lg:w-1/2">
            <h2 className="text-2xl sm:text-3xl font-semibold font-Literata italic text-[#190D39] text-center mb-3 sm:mb-5">
                Frequently Asked Questions
              </h2>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className=" p-12 rounded-2xl  h-full flex items-center"
              >
                <img 
                  src={faqImage} 
                  alt="FAQ illustration" 
                  className="w-full h-auto rounded-lg object-cover"
                />
              </motion.div>
            </div>
            
            {/* Right Half - Accordion */}
            <div className="lg:w-1/2">
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className={`overflow-hidden transition-all duration-300  rounded-xl ${
                      activeIndex === index ? '' : ''
                    }`}
                  >
                    <button
                      className="w-full flex justify-between items-center p-4 sm:p-6 text-left focus:outline-none"
                      onClick={() => toggleAccordion(index)}
                    >
                      <h3 className="text-base sm:text-lg font-medium text-gray-900 pr-4">
                        {faq.question}
                      </h3>
                      <span className="text-[#190D39]">
                        {activeIndex === index ? (
                          <Minus className="w-5 h-5 sm:w-6 sm:h-6" />
                        ) : (
                          <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
                        )}
                      </span>
                    </button>
                    
                    <div
                      className={`transition-all duration-300 overflow-hidden ${
                        activeIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                      }`}
                    >
                      <div className="px-4 sm:px-6 pb-6 pt-0 text-gray-600 text-sm sm:text-base">
                        <p>{faq.answer}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-8 sm:px-6 bg-[#190D39] rounded-3xl">
        <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
          {/* Logo and Description - now spans 2 columns on desktop */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start mb-4">
              <img 
                src={logo2} 
                alt="Soro logo" 
                className="h-12"
              />
            </div>
            <p className="text-gray-400 text-sm sm:text-base mb-6">
              Your mental wellness companion, providing professional support and self-help tools for your journey.
            </p>
            
            {/* Email Subscription */}
            <form onSubmit={handleEmailSubmit} className="mb-6">
              <label htmlFor="email" className="block text-white text-sm font-medium mb-2 text-center md:text-left">
                Stay updated
              </label>
              <div className="flex max-w-xs mx-auto md:mx-0">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email"
                  className="bg-white text-gray-800 rounded-l-lg px-4 py-2 w-full focus:outline-none text-sm sm:text-base"
                  required
                />
                <button 
                  type="submit" 
                  className="bg-[#30459D] hover:bg-[#23367D] text-white px-4 rounded-r-lg flex items-center justify-center"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </div>

          {/* Company Links - centered */}
          <div className="space-y-4 text-center md:text-left">
            <h4 className="text-white text-lg font-semibold mb-2 uppercase tracking-wider">
              Company
            </h4>
            <ul className="space-y-3">
              <li><a href="/" className="text-gray-400 hover:text-white transition block">
                Home
              </a></li>
              <li><a href="/about" className="text-gray-400 hover:text-white transition block">
                About
              </a></li>
              <li><a href="/drops" className="text-gray-400 hover:text-white transition block">
                Soro Drops
              </a></li>
              <li><a href="/support" className="text-gray-400 hover:text-white transition block">
                Support
              </a></li>
            </ul>
          </div>

          {/* Resources Links - centered */}
          <div className="space-y-4 text-center md:text-left">
            <h4 className="text-white text-lg font-semibold mb-2 uppercase tracking-wider">
              Resources
            </h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-400 hover:text-white transition block">
                FAQs
              </a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition block">
                Help Center
              </a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition block">
                Privacy Policy
              </a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition block">
                Terms of Service
              </a></li>
            </ul>
          </div>
        </div>

          {/* Bottom Copyright with Social Icons */}
          <div className="mt-12 pt-6 border-t border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm order-2 sm:order-1">
              © {new Date().getFullYear()} Soro. All rights reserved.
            </p>
            <div className="order-1 sm:order-2">
              <div className="flex space-x-4">
                <a href="#" className="bg-[#30459D] hover:bg-[#23367D] text-white w-10 h-10 rounded-full flex items-center justify-center transition">
                  <FaTwitter className="w-5 h-5" />
                </a>
                <a href="#" className="bg-[#30459D] hover:bg-[#23367D] text-white w-10 h-10 rounded-full flex items-center justify-center transition">
                  <FaInstagram className="w-5 h-5" />
                </a>
                <a href="#" className="bg-[#30459D] hover:bg-[#23367D] text-white w-10 h-10 rounded-full flex items-center justify-center transition">
                  <FaLinkedin className="w-5 h-5" />
                </a>
                <a href="#" className="bg-[#30459D] hover:bg-[#23367D] text-white w-10 h-10 rounded-full flex items-center justify-center transition">
                  <FaYoutube className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;