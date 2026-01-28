import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { Upload, MapPin, Calendar, Clock, DollarSign, CheckCircle } from 'lucide-react';

interface BloodTestWorkflowProps {
  user: User;
  onClose: () => void;
}

const BloodTestWorkflow: React.FC<BloodTestWorkflowProps> = ({ user, onClose }) => {
  const [step, setStep] = useState<'choose' | 'location' | 'booking' | 'confirmation'>('choose');
  const [selectedOption, setSelectedOption] = useState<'lab' | 'home' | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const bloodTestPanels = [
    {
      name: 'Essential Health Panel',
      price: 180,
      tests: ['Full Blood Count', 'Lipid Profile', 'Liver Function', 'Kidney Function', 'Diabetes Screen']
    },
    {
      name: 'Comprehensive Wellness Panel', 
      price: 320,
      tests: ['Essential Panel +', 'Thyroid Function', 'Vitamin D', 'B12 & Folate', 'Iron Studies', 'Inflammation Markers']
    },
    {
      name: 'Complete Longevity Panel',
      price: 450,
      tests: ['Comprehensive Panel +', 'Advanced Lipids', 'Hormone Panel', 'Tumour Markers', 'Cardiac Risk', 'Metabolic Health']
    }
  ];

  const availableTimes = ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM'];

  const renderChooseOption = () => (
    <div className="space-y-6">
      <div className="text-centre">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Blood Test Option</h2>
        <p className="text-gray-600">Select how you'd like to complete your blood test</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div 
          onClick={() => setSelectedOption('lab')}
          className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${
            selectedOption === 'lab' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="text-centre">
            <MapPin className="w-12 h-12 mx-auto mb-4 text-blue-600" />
            <h3 className="text-lg font-semibold mb-2">Visit Pathology Lab</h3>
            <p className="text-gray-600 mb-4">Visit one of our partner labs near you</p>
            <div className="text-sm text-gray-500">
              <p>• 50+ locations across Australia</p>
              <p>• No appointment needed</p>
              <p>• Results in 24-48 hours</p>
            </div>
            <div className="mt-4 font-semibold text-blue-600">From $180</div>
          </div>
        </div>

        <div 
          onClick={() => setSelectedOption('home')}
          className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${
            selectedOption === 'home' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="text-centre">
            <Clock className="w-12 h-12 mx-auto mb-4 text-green-600" />
            <h3 className="text-lg font-semibold mb-2">Home Collection</h3>
            <p className="text-gray-600 mb-4">Qualified nurse visits your home/office</p>
            <div className="text-sm text-gray-500">
              <p>• Professional nurse collection</p>
              <p>• Book convenient time slot</p>
              <p>• Same-day service available</p>
            </div>
            <div className="mt-4 font-semibold text-green-600">From $280 (+$100)</div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Available Test Panels</h3>
        {bloodTestPanels.map((panel, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-semibold">{panel.name}</h4>
                <div className="text-sm text-gray-600 mt-1">
                  {panel.tests.join(' • ')}
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-blue-600">${panel.price}</div>
                {selectedOption === 'home' && (
                  <div className="text-sm text-gray-500">+$100 collection</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between">
        <button onClick={onClose} className="px-6 py-2 text-gray-600 hover:text-gray-800">
          Cancel
        </button>
        <button 
          onClick={() => setStep('location')}
          disabled={!selectedOption}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </div>
    </div>
  );

  const renderLocation = () => (
    <div className="space-y-6">
      <div className="text-centre">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {selectedOption === 'lab' ? 'Find Nearest Lab' : 'Schedule Home Collection'}
        </h2>
        <p className="text-gray-600">
          {selectedOption === 'lab' 
            ? 'Choose from our partner pathology labs' 
            : 'Book a convenient time for nurse collection'
          }
        </p>
      </div>

      {selectedOption === 'lab' ? (
        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold">Sullivan Nicolaides Pathology</h3>
            <p className="text-gray-600">123 Collins Street, Melbourne VIC 3000</p>
            <p className="text-sm text-gray-500">Open: Mon-Fri 7:00 AM - 4:00 PM</p>
            <p className="text-sm text-blue-600">2.3 km away</p>
          </div>
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold">Australian Clinical Labs</h3>
            <p className="text-gray-600">456 Bourke Street, Melbourne VIC 3000</p>
            <p className="text-sm text-gray-500">Open: Mon-Fri 7:30 AM - 5:00 PM</p>
            <p className="text-sm text-blue-600">3.1 km away</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Collection Address</label>
            <input 
              type="text" 
              placeholder="Enter your address"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Date</label>
              <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time Slot</label>
              <select 
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select time</option>
                {availableTimes.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between">
        <button onClick={() => setStep('choose')} className="px-6 py-2 text-gray-600 hover:text-gray-800">
          Back
        </button>
        <button 
          onClick={() => setStep('booking')}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Continue to Payment
        </button>
      </div>
    </div>
  );

  const renderBooking = () => (
    <div className="space-y-6">
      <div className="text-centre">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Confirm Your Booking</h2>
        <p className="text-gray-600">Review your selection and complete payment</p>
      </div>

      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="font-semibold mb-4">Booking Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Test Panel:</span>
            <span>Comprehensive Wellness Panel</span>
          </div>
          <div className="flex justify-between">
            <span>Collection Method:</span>
            <span>{selectedOption === 'lab' ? 'Lab Visit' : 'Home Collection'}</span>
          </div>
          {selectedOption === 'home' && (
            <>
              <div className="flex justify-between">
                <span>Date:</span>
                <span>{selectedDate}</span>
              </div>
              <div className="flex justify-between">
                <span>Time:</span>
                <span>{selectedTime}</span>
              </div>
            </>
          )}
          <hr className="my-2" />
          <div className="flex justify-between font-semibold">
            <span>Total:</span>
            <span>${selectedOption === 'home' ? '420' : '320'}</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold">Payment Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" placeholder="Card Number" className="p-3 border border-gray-300 rounded-lg" />
          <input type="text" placeholder="MM/YY" className="p-3 border border-gray-300 rounded-lg" />
          <input type="text" placeholder="CVV" className="p-3 border border-gray-300 rounded-lg" />
          <input type="text" placeholder="Name on Card" className="p-3 border border-gray-300 rounded-lg" />
        </div>
      </div>

      <div className="flex justify-between">
        <button onClick={() => setStep('location')} className="px-6 py-2 text-gray-600 hover:text-gray-800">
          Back
        </button>
        <button 
          onClick={() => setStep('confirmation')}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Complete Booking
        </button>
      </div>
    </div>
  );

  const renderConfirmation = () => (
    <div className="text-centre space-y-6">
      <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
        <p className="text-gray-600">Your blood test has been successfully booked</p>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h3 className="font-semibold text-green-800 mb-2">What's Next?</h3>
        <div className="text-sm text-green-700 space-y-1">
          {selectedOption === 'lab' ? (
            <>
              <p>• Visit your chosen lab with valid ID</p>
              <p>• No fasting required for most tests</p>
              <p>• Results will be available in 24-48 hours</p>
            </>
          ) : (
            <>
              <p>• Our nurse will contact you 30 minutes before arrival</p>
              <p>• Ensure you're available at the scheduled time</p>
              <p>• Results will be available in 24-48 hours</p>
            </>
          )}
          <p>• You'll receive an email when results are ready</p>
          <p>• Results will automatically integrate with your health profile</p>
        </div>
      </div>

      <button 
        onClick={onClose}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Close
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-centre justify-centre z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {step === 'choose' && renderChooseOption()}
          {step === 'location' && renderLocation()}
          {step === 'booking' && renderBooking()}
          {step === 'confirmation' && renderConfirmation()}
        </div>
      </div>
    </div>
  );
};

export default BloodTestWorkflow;