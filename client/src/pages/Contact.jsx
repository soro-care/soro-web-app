import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { Send, Phone, Mail, ArrowRight, AlertTriangle, MessageCircle, Zap } from 'lucide-react';
import office from '../assets/contact.png';
import { Link } from 'react-router-dom';
import Axios from '../utils/Axios';

const Contact = () => {
  const user = useSelector(state => state.user);
  const [formData, setFormData] = useState({
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    if (user?._id) {
      setFormData(prev => ({
        ...prev,
        name: user.name,
        email: user.email
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const requestData = {
        message: formData.message,
        name: formData.name,
        email: formData.email
      };

      const response = await Axios.post('/api/user/contact', requestData);

      if (response.data.success) {
        setSubmitSuccess(true);
        setFormData({ message: '' });
      } else {
        setSubmitError(response.data.message || "Failed to send message");
      }
    } catch (err) {
      setSubmitError(err.response?.data?.message || "An error occurred");
      console.error("Contact form error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Emergency hotlines data - More subtle design
  const emergencyHotlines = [
    {
      icon: <Zap className="w-5 h-5" />,
      title: "Unilorin Behavioral Science",
      number: "+234 706 296 1307",
      call: "+2347062961307",
      description: "Campus mental health support",
      type: "campus"
    },
    {
      icon: <AlertTriangle className="w-5 h-5" />,
      title: "SURPIN Crisis Line",
      numbers: ["+234-903-440-0009", "+234-814-224-1007"],
      calls: ["+2349034400009", "+2348142241007"],
      description: "24/7 suicide prevention",
      type: "crisis"
    },
    {
      icon: <MessageCircle className="w-5 h-5" />,
      title: "MANI Mental Health",
      number: "0809-111-6264",
      call: "08091116264",
      description: "Mental health awareness support",
      type: "support"
    }
  ];


  return (
    <div className={`${user?._id ? 'p-4 py-8 md:ml-64 md:px-8 md:py-12' : ''} min-h-screen bg-gray-50/50`}>
      
      {/* Modern Header Section */}
      <div className='py-6'>
        <section className="relative overflow-hidden bg-gradient-to-br from-[#30459D] via-[#190D39] to-[#0A0420] text-white py-12 lg:py-20 rounded-3xl mx-4 lg:mx-8 mb-12">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative max-w-6xl mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                Let's Talk 💬
              </h1>
              <p className="text-xl lg:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
                We're here for you. Reach out anytime – your mental wellness journey matters to us.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm">
                  ⚡ Quick Response
                </div>
                <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm">
                  💙 Compassionate Support
                </div>
                <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm">
                  🔒 100% Confidential
                </div>
              </div>
            </motion.div>
          </div>
          
          {/* Background decorative elements */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-blue-300/10 rounded-full -translate-y-36 translate-x-36"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-300/10 rounded-full translate-y-48 -translate-x-48"></div>
        </section>
      </div>

      {/* Emergency Support Section - More Subtle */}
      <section className="mb-12 px-4 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-2xl p-6 lg:p-8 shadow-sm"
          >
            <div className="flex flex-col lg:flex-row items-start gap-6">
              <div className="flex items-center gap-4">
                <div className="bg-orange-100 p-3 rounded-2xl">
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-orange-900 mb-1">Urgent Support</h2>
                  <p className="text-orange-800 text-sm">Available 24/7 • Immediate Help</p>
                </div>
              </div>
              
              <div className="flex-1">
                <p className="text-orange-800 mb-4 text-sm lg:text-base">
                  If you're in crisis or need immediate support, these services are here for you right now.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {emergencyHotlines.map((hotline, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.02 }}
                      className="bg-white rounded-xl p-4 border border-orange-100 shadow-xs hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-lg ${
                          hotline.type === 'crisis' ? 'bg-red-50 text-red-600' :
                          hotline.type === 'campus' ? 'bg-blue-50 text-blue-600' :
                          'bg-green-50 text-green-600'
                        }`}>
                          {hotline.icon}
                        </div>
                        <h3 className="font-semibold text-gray-800 text-sm">{hotline.title}</h3>
                      </div>
                      
                      <div className="space-y-1">
                        {hotline.calls ? (
                          hotline.calls.map((call, numIndex) => (
                            <a
                              key={numIndex}
                              href={`tel:${call}`}
                              className="block text-sm font-semibold text-orange-600 hover:text-orange-700 transition-colors"
                            >
                              {call}
                            </a>
                          ))
                        ) : (
                          <a
                            href={`tel:${hotline.call}`}
                            className="block text-sm font-semibold text-orange-600 hover:text-orange-700 transition-colors"
                          >
                            {hotline.number}
                          </a>
                        )}
                        <p className="text-xs text-gray-600">{hotline.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="px-4 lg:px-8">
        <div className="max-w-6xl mx-auto">
          
         

          {/* Contact Form Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Left Side - Visual */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              className="relative"
            >
             <div className="rounded-2xl overflow-hidden shadow-sm h-full">
                  <img 
                    src={office} 
                    alt="Soro office location" 
                    className="w-full h-full object-cover"
                  />
                  {/* <div className="bg-white p-4 text-center">
                    <p className="text-gray-600">Our headquarters in Mindful City</p>
                  </div> */}
                </div>
            </motion.div>

            {/* Right Side - Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm border border-gray-100"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                {!user?._id && (
                  <>
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Your Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#30459D] focus:border-transparent transition-all"
                        required
                        placeholder="Enter your name"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#30459D] focus:border-transparent transition-all"
                        required
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </>
                )}
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Your Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows="6"
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#30459D] focus:border-transparent transition-all resize-none"
                    required
                    placeholder="Tell us how we can help you today..."
                  ></textarea>
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-[#30459D] to-[#190D39] text-white py-3 px-6 rounded-xl font-medium transition-all duration-300 hover:shadow-lg disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Message <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Status messages */}
              {submitSuccess && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700"
                >
                  ✅ Message sent! We'll get back to you within 24 hours.
                </motion.div>
              )}
              
              {submitError && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700"
                >
                  ❌ {submitError}
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section for non-signed-in users */}
      {!user?._id && (
        <section className="px-4 py-8 lg:px-8 mt-16">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="bg-gradient-to-r from-[#30459D] to-[#190D39] rounded-2xl p-8 lg:p-12 text-white relative overflow-hidden"
            >
              <div className="relative z-10">
                <h2 className="text-2xl lg:text-3xl font-bold mb-4">
                  Ready to prioritize your mental wellness? 🌱
                </h2>
                <p className="text-blue-100 text-lg mb-6 max-w-2xl mx-auto">
                  Join our community and start your journey towards better mental health today.
                </p>
                <Link 
                  to="/register" 
                  className="inline-flex items-center gap-2 bg-white text-[#30459D] px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  Get Started Free <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-32 translate-x-32"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-24 -translate-x-24"></div>
              </div>
            </motion.div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Contact;