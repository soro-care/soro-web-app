import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Calendar, Heart, Plus, Minus, ArrowRightCircle, Send } from 'lucide-react'
import aboutHero from '../assets/about.jpeg';
import faqImage from '../assets/faq2.png'


import values from '../assets/hero.png';

const About = () => {
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
  
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-10 px-4 sm:px-6">
        <div className="max-w-6xl bg-white rounded-3xl mx-auto flex flex-col md:flex-row items-center gap-6 md:gap-8 overflow-hidden">
          <div className="w-full md:w-1/2 py-8 md:py-0 px-4 sm:px-6 text-center md:text-left">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium  font-Literata  italic text-[#190D39] mb-4 sm:mb-6"
            >
              Your mental wellness buddy
            </motion.h1>
            
            <p className="text-base sm:text-lg text-gray-700 mb-6 sm:mb-8 mx-auto md:mx-0 max-w-md md:max-w-none">
              Becaue every mind deserves care.
            </p>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-3 sm:gap-4">
              <Link 
                to="/support" 
                className="bg-[#30459D] hover:bg-[#23367D] text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base"
              >
                Get in touch →
              </Link>
            </div>
          </div>
          
          <div className="w-full md:w-1/2 p-4 sm:p-6">
            <div className="rounded-3xl md:rounded-r-xl overflow-hidden">
              <img 
                src={aboutHero} 
                alt="Team collaborating" 
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-8 mb-16">
            <div className="md:w-1/2">
              <h2 className="text-2xl sm:text-3xl font-semibold font-Literata  italic text-[#190D39] mb-4 sm:mb-6">
                Our story begins with a shared vision
              </h2>
              <p className="text-base sm:text-lg text-gray-700 mb-4">
                Soro started as a small team of mental health advocates who believed there had to be a better way to deliver mental health support to students with mental health needs.
              </p>
              <p className="text-base sm:text-lg text-gray-700 mb-4">
                What began as a simple idea—to make mental health care more accessible and stigma-free—quickly evolved into a platform built for students, by people who understand their struggles. We knew that long wait times, lack of anonymity, and limited access to professional help were major barriers for many. So, we created Soro to break those barriers 
              </p>
              <p className="text-base sm:text-lg text-gray-700 mb-4">
                We designed our platform to meet students where they are—with AI-powered tools like mood tracking, journaling, and chatbots, combined with access to real peer counselors and licensed professionals.
              </p>
              <p className="text-base sm:text-lg text-gray-700 mb-4">
                Today, we've grown into a diverse team serving various users, but our core belief remains the same: every mind deserves care.
              </p>
              <p className="text-base sm:text-lg text-gray-700 mb-4">
                At Soro, we don’t just provide support—we create a safe space for you to express, explore, and heal. Because mental wellness isn't a luxury. It's a right.
              </p>
            </div>
            <div className="md:w-1/2 grid grid-cols-2 gap-4">
              <div className="bg-[#E7F5F7] rounded-xl p-6 flex flex-col items-center justify-center h-full">
                <span className="text-4xl font-bold text-[#30459D]">-K+</span>
                <span className="text-gray-600">Active Users</span>
              </div>
              <div className="bg-[#F0E7F5] rounded-xl p-6 flex flex-col items-center justify-center h-full">
                <span className="text-4xl font-bold text-[#30459D]">-+</span>
                <span className="text-gray-600">Experts</span>
              </div>
              <div className="bg-[#E7F5E8] rounded-xl p-6 flex flex-col items-center justify-center h-full">
                <span className="text-4xl font-bold text-[#30459D]">24/7</span>
                <span className="text-gray-600">Support</span>
              </div>
              <div className="bg-[#F5E7E7] rounded-xl p-6 flex flex-col items-center justify-center h-full">
                <span className="text-4xl font-bold text-[#30459D]">-%</span>
                <span className="text-gray-600">Satisfaction</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      {/* <section className="py-12 px-4 sm:px-6 bg-[#F9FAFF] rounded-3xl mx-4 sm:mx-6 mb-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="md:w-1/2">
              <img 
                src={values} 
                alt="Our values" 
                className="rounded-xl w-full h-auto"
              />
            </div>
            <div className="md:w-1/2">
              <h2 className="text-2xl sm:text-3xl font-semibold font-Literata  italic text-[#190D39] mb-4 sm:mb-6">
                What we stand for
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-[#30459D] text-white p-2 rounded-lg">
                    <Heart className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg text-gray-900 mb-1">Compassion First</h3>
                    <p className="text-gray-600">We approach every interaction with empathy and understanding.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="bg-[#30459D] text-white p-2 rounded-lg">
                    <Heart className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg text-gray-900 mb-1">Evidence-Based</h3>
                    <p className="text-gray-600">Our tools and recommendations are grounded in scientific research.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="bg-[#30459D] text-white p-2 rounded-lg">
                    <Heart className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg text-gray-900 mb-1">User-Centered</h3>
                    <p className="text-gray-600">We design with real people's needs at the core of every decision.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="bg-[#30459D] text-white p-2 rounded-lg">
                    <Heart className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg text-gray-900 mb-1">Continuous Growth</h3>
                    <p className="text-gray-600">We're always learning and improving to serve you better.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section> */}
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

      {/* CTA Section */}
      <section className="py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto bg-gradient-to-l from-[#30459D] to-[#190D39] rounded-3xl p-8 sm:p-12 text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold font-Literata  italic text-white mb-4 sm:mb-6">
            Ready to start your mental wellness journey?
          </h2>
          <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of others who've found support through Soro.
          </p>
          <Link 
            to="/register" 
            className="bg-white hover:bg-gray-100 text-[#30459D] px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center"
          >
            Get Started <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>
      
    </div>
  );
};

export default About;