import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { 
  ChevronDown, 
  ChevronUp, 
  HelpCircle, 
  MessageCircle, 
  ExternalLink,
  Shield,
  Activity,
  Dna,
  Stethoscope,
  Camera
} from 'lucide-react';

interface FAQScreenProps {
  user: User;
}

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  icon: React.ElementType;
}

const FAQScreen: React.FC<FAQScreenProps> = ({ user }) => {
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('General');

  const faqData: FAQItem[] = [
    // General Questions
    {
      id: '1',
      category: 'General',
      question: 'What is HodieLabs and how does it work?',
      answer: 'HodieLabs is a precision health platform that combines AI, genetic analysis, and biomarker testing to provide personalized health insights. We analyze your DNA, blood tests, and lifestyle data to create customized recommendations for optimal health.',
      icon: HelpCircle
    },
    {
      id: '2',
      category: 'General',
      question: 'How do I get started with HodieLabs?',
      answer: 'Getting started is simple: 1) Complete your comprehensive health profile, 2) Upload your existing blood test results or book new tests, 3) Optionally take our DNA test, 4) Receive personalized recommendations and insights through your dashboard.',
      icon: Activity
    },
    {
      id: '3',
      category: 'General',
      question: 'Is my health data secure and private?',
      answer: 'Yes, absolutely. We use enterprise-grade encryption, comply with healthcare privacy regulations, and never share your personal health data with third parties without your explicit consent. Your data is stored securely and you maintain full control over it.',
      icon: Shield
    },
    
    // Blood Tests
    {
      id: '4',
      category: 'Blood Tests',
      question: 'What blood markers do you analyze?',
      answer: 'We analyze over 50 biomarkers including lipid profiles, inflammation markers (CRP, ESR), metabolic markers (glucose, HbA1c), hormone levels, nutrient status (vitamins, minerals), liver function, kidney function, and cancer markers like PSA.',
      icon: Stethoscope
    },
    {
      id: '5',
      category: 'Blood Tests',
      question: 'Can I upload existing blood test results?',
      answer: 'Yes! You can upload blood test results from any accredited laboratory. Our AI system will analyze the results and integrate them into your health profile. We accept PDF reports, images, or you can manually enter the values.',
      icon: Stethoscope
    },
    {
      id: '6',
      category: 'Blood Tests',
      question: 'How often should I get blood tests done?',
      answer: 'We recommend comprehensive blood tests every 3-6 months for optimal health tracking. However, the frequency may vary based on your age, health status, and specific conditions. Our system will recommend the ideal testing schedule for you.',
      icon: Stethoscope
    },

    // DNA Testing
    {
      id: '7',
      category: 'DNA Testing',
      question: 'What can I learn from DNA testing?',
      answer: 'Our DNA analysis covers nutrition genetics (how you process different nutrients), fitness genetics (optimal exercise types), health predispositions (disease risks), pharmacogenomics (drug responses), and trait analysis (sleep patterns, caffeine sensitivity).',
      icon: Dna
    },
    {
      id: '8',
      category: 'DNA Testing',
      question: 'How accurate is genetic testing?',
      answer: 'Our DNA testing uses clinical-grade sequencing with >99.9% accuracy. We analyze proven genetic variants with strong scientific evidence. Results are interpreted by geneticists and include confidence levels for each finding.',
      icon: Dna
    },

    // Body Scans
    {
      id: '9',
      category: 'Body Scans',
      question: 'What types of body scans do you offer?',
      answer: 'We offer DEXA scans for body composition, coronary calcium scoring for heart health, full-body MRI for comprehensive screening, and specialized scans based on your risk profile and health goals.',
      icon: Camera
    },
    {
      id: '10',
      category: 'Body Scans',
      question: 'How do I book a body scan?',
      answer: 'You can book scans directly through your dashboard. We have partnerships with imaging centers across Australia. Simply select your preferred location and time slot, and we\'ll handle the rest.',
      icon: Camera
    },

    // Health Insights
    {
      id: '11',
      category: 'Health Insights',
      question: 'How are my health recommendations generated?',
      answer: 'Recommendations are generated using AI algorithms that analyze your genetic profile, biomarker results, lifestyle data, and health goals. They\'re reviewed by our medical team and updated as new data becomes available.',
      icon: Activity
    },
    {
      id: '12',
      category: 'Health Insights',
      question: 'Can I speak with a healthcare professional?',
      answer: 'Yes, all HodieLabs members have access to consultations with our network of doctors, nutritionists, and genetic counselors. You can book consultations through your dashboard or contact our support team.',
      icon: MessageCircle
    }
  ];

  const categories = ['General', 'Blood Tests', 'DNA Testing', 'Body Scans', 'Health Insights'];

  const filteredFAQs = selectedCategory === 'All' ? faqData : faqData.filter(faq => faq.category === selectedCategory);

  const toggleExpanded = (itemId: string) => {
    setExpandedItem(expandedItem === itemId ? null : itemId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-4 text-white">Frequently Asked Questions</h1>
          <p className="text-white/70 text-lg">Find answers to common questions about HodieLabs health platform</p>
        </div>

        {/* Quick Help Links */}
        <div className="mb-8 bg-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4 text-white">Need Additional Help?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a 
              href="https://hodielabs.com/contact/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center space-x-3 bg-hodie-primary hover:bg-blue-600 transition-colors p-4 rounded-lg"
            >
              <ExternalLink className="w-5 h-5" />
              <span>Contact Support</span>
            </a>
            <a 
              href="mailto:hello@hodielabs.com"
              className="flex items-center space-x-3 bg-purple-600 hover:bg-purple-700 transition-colors p-4 rounded-lg"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Email Us</span>
            </a>
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-white">Browse by Category</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-hodie-primary text-white'
                    : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {filteredFAQs.map((faq) => (
            <div key={faq.id} className="bg-white/10 rounded-xl overflow-hidden">
              <button
                onClick={() => toggleExpanded(faq.id)}
                className="w-full p-6 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <faq.icon className="w-6 h-6 text-hodie-primary" />
                  <div>
                    <h4 className="text-lg font-semibold text-white">{faq.question}</h4>
                    <p className="text-sm text-white/60">{faq.category}</p>
                  </div>
                </div>
                {expandedItem === faq.id ? (
                  <ChevronUp className="w-5 h-5 text-white/60" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-white/60" />
                )}
              </button>
              
              {expandedItem === faq.id && (
                <div className="px-6 pb-6">
                  <div className="pl-10">
                    <p className="text-white/80 leading-relaxed">{faq.answer}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-12 text-center bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl p-8">
          <h3 className="text-xl font-semibold mb-4 text-white">Still have questions?</h3>
          <p className="text-white/70 mb-6">Our support team is here to help you with any questions about your health journey.</p>
          <div className="flex justify-center space-x-4">
            <a 
              href="https://hodielabs.com/contact/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-hodie-primary hover:bg-blue-600 rounded-lg font-medium transition-colors"
            >
              Contact Support
            </a>
            <a 
              href="tel:+61390287231"
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors"
            >
              Call +61 3 9028 7231
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQScreen;