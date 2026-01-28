import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { MapPin, Calendar, Clock, DollarSign, CheckCircle, Camera, Activity } from 'lucide-react';

interface BodyScanWorkflowProps {
  user: User;
  onClose: () => void;
}

const BodyScanWorkflow: React.FC<BodyScanWorkflowProps> = ({ user, onClose }) => {
  const [step, setStep] = useState<'choose' | 'location' | 'booking' | 'confirmation'>('choose');
  const [selectedScan, setScanScan] = useState<string | null>(null);
  const [selectedGym, setSelectedGym] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const scanOptions = [
    {
      id: 'dexa',
      name: 'DEXA Body Composition Scan',
      price: 120,
      duration: '15 minutes',
      description: 'Gold standard for body composition analysis',
      features: ['Bone density', 'Muscle mass', 'Body fat %', 'Visceral fat analysis'],
      recommended: true
    },
    {
      id: 'bodpod',
      name: 'BodPod Air Displacement',
      price: 80,
      duration: '10 minutes',
      description: 'Quick and accurate body composition measurement',
      features: ['Body fat %', 'Lean mass', 'Metabolic rate', 'Body volume'],
      recommended: false
    },
    {
      id: 'inbody',
      name: 'InBody Bioelectrical Analysis',
      price: 60,
      duration: '5 minutes',
      description: 'Comprehensive body composition via bioelectrical impedance',
      features: ['Muscle mass', 'Body fat %', 'Body water', 'Segmental analysis'],
      recommended: false
    }
  ];

  const partnerGyms = [
    {
      id: '1',
      name: 'Fitness First Melbourne Central',
      address: '211 La Trobe Street, Melbourne VIC 3000',
      distance: '1.2 km',
      scanTypes: ['dexa', 'inbody'],
      rating: 4.8,
      features: ['Parking available', 'Wheelchair accessible', 'Professional staff']
    },
    {
      id: '2', 
      name: 'Virgin Active Collins Street',
      address: '567 Collins Street, Melbourne VIC 3000',
      distance: '2.1 km',
      scanTypes: ['bodpod', 'inbody'],
      rating: 4.6,
      features: ['City location', 'Premium facilities', 'Expert technicians']
    },
    {
      id: '3',
      name: 'Anytime Fitness South Yarra',
      address: '123 Toorak Road, South Yarra VIC 3141',
      distance: '3.8 km',
      scanTypes: ['dexa', 'bodpod', 'inbody'],
      rating: 4.9,
      features: ['All scan types', '24/7 access', 'Premium service']
    }
  ];

  const availableTimes = ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'];

  const renderChooseOption = () => (
    <div className="space-y-6">
      <div className="text-centre">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Body Scan</h2>
        <p className="text-gray-600">Select the type of body composition analysis you'd like</p>
      </div>

      <div className="space-y-4">
        {scanOptions.map((scan) => (
          <div 
            key={scan.id}
            onClick={() => setScanScan(scan.id)}
            className={`p-6 border-2 rounded-xl cursor-pointer transition-all relative ${
              selectedScan === scan.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            {scan.recommended && (
              <div className="absolute -top-2 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                Recommended
              </div>
            )}
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-centre space-x-3 mb-2">
                  <Camera className="w-6 h-6 text-blue-600" />
                  <h3 className="text-lg font-semibold">{scan.name}</h3>
                </div>
                <p className="text-gray-600 mb-3">{scan.description}</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {scan.features.map((feature, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                      {feature}
                    </span>
                  ))}
                </div>
                <div className="text-sm text-gray-500">
                  <span className="flex items-centre">
                    <Clock className="w-4 h-4 mr-1" />
                    {scan.duration}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">${scan.price}</div>
                <div className="text-sm text-gray-500">per scan</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800 mb-2">What You'll Get:</h3>
        <div className="text-sm text-blue-700 space-y-1">
          <p>• Detailed body composition report</p>
          <p>• Progress tracking and historical comparisons</p>
          <p>• Personalised recommendations based on results</p>
          <p>• Integration with your health dashboard</p>
          <p>• Follow-up consultation with health coach</p>
        </div>
      </div>

      <div className="flex justify-between">
        <button onClick={onClose} className="px-6 py-2 text-gray-600 hover:text-gray-800">
          Cancel
        </button>
        <button 
          onClick={() => setStep('location')}
          disabled={!selectedScan}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Find Locations
        </button>
      </div>
    </div>
  );

  const renderLocation = () => {
    const availableGyms = partnerGyms.filter(gym => 
      selectedScan && gym.scanTypes.includes(selectedScan)
    );

    return (
      <div className="space-y-6">
        <div className="text-centre">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Partner Gym</h2>
          <p className="text-gray-600">Select a convenient location for your {scanOptions.find(s => s.id === selectedScan)?.name}</p>
        </div>

        <div className="space-y-4">
          {availableGyms.map((gym) => (
            <div 
              key={gym.id}
              onClick={() => setSelectedGym(gym.id)}
              className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${
                selectedGym === gym.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-centre space-x-3 mb-2">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold">{gym.name}</h3>
                    <div className="flex items-centre text-yellow-500">
                      <span className="text-sm">★ {gym.rating}</span>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-2">{gym.address}</p>
                  <p className="text-sm text-blue-600 mb-3">{gym.distance} away</p>
                  <div className="flex flex-wrap gap-2">
                    {gym.features.map((feature, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-blue-600">
                    ${scanOptions.find(s => s.id === selectedScan)?.price}
                  </div>
                  <div className="text-sm text-gray-500">Available today</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between">
          <button onClick={() => setStep('choose')} className="px-6 py-2 text-gray-600 hover:text-gray-800">
            Back
          </button>
          <button 
            onClick={() => setStep('booking')}
            disabled={!selectedGym}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Book Appointment
          </button>
        </div>
      </div>
    );
  };

  const renderBooking = () => {
    const selectedScanData = scanOptions.find(s => s.id === selectedScan);
    const selectedGymData = partnerGyms.find(g => g.id === selectedGym);

    return (
      <div className="space-y-6">
        <div className="text-centre">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Book Your Appointment</h2>
          <p className="text-gray-600">Select your preferred date and time</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="font-semibold mb-4">Booking Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Scan Type:</span>
              <span>{selectedScanData?.name}</span>
            </div>
            <div className="flex justify-between">
              <span>Location:</span>
              <span>{selectedGymData?.name}</span>
            </div>
            <div className="flex justify-between">
              <span>Duration:</span>
              <span>{selectedScanData?.duration}</span>
            </div>
            <hr className="my-2" />
            <div className="flex justify-between font-semibold">
              <span>Total:</span>
              <span>${selectedScanData?.price}</span>
            </div>
          </div>
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

        <div className="space-y-4">
          <h3 className="font-semibold">Preparation Instructions</h3>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="text-sm text-yellow-800 space-y-1">
              <p>• Wear comfortable, light clothing</p>
              <p>• Remove all metal objects (jewelry, belt, etc.)</p>
              <p>• Stay hydrated but avoid large meals 2 hours before</p>
              <p>• Arrive 10 minutes early for check-in</p>
              <p>• Bring valid ID and confirmation email</p>
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
            disabled={!selectedDate || !selectedTime}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirm Booking
          </button>
        </div>
      </div>
    );
  };

  const renderConfirmation = () => {
    const selectedScanData = scanOptions.find(s => s.id === selectedScan);
    const selectedGymData = partnerGyms.find(g => g.id === selectedGym);

    return (
      <div className="text-centre space-y-6">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
          <p className="text-gray-600">Your body scan appointment has been successfully booked</p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-left">
          <h3 className="font-semibold text-blue-800 mb-3">Appointment Details</h3>
          <div className="space-y-2 text-sm text-blue-700">
            <p><strong>Scan:</strong> {selectedScanData?.name}</p>
            <p><strong>Location:</strong> {selectedGymData?.name}</p>
            <p><strong>Date:</strong> {selectedDate}</p>
            <p><strong>Time:</strong> {selectedTime}</p>
            <p><strong>Duration:</strong> {selectedScanData?.duration}</p>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="font-semibold text-green-800 mb-2">What's Next?</h3>
          <div className="text-sm text-green-700 space-y-1">
            <p>• You'll receive a confirmation email with QR code</p>
            <p>• Arrive 10 minutes early for check-in</p>
            <p>• Scan results will be available within 24 hours</p>
            <p>• Results will automatically integrate with your dashboard</p>
            <p>• You'll get a free consultation to review your results</p>
          </div>
        </div>

        <div className="flex space-x-4 justify-centre">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            View Dashboard
          </button>
          <button 
            onClick={() => {/* Add to calendar */}}
            className="px-6 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50"
          >
            Add to Calendar
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-centre justify-centre z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-centre mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Body Scan Booking</h1>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-xl"
            >
              ✕
            </button>
          </div>
          
          {step === 'choose' && renderChooseOption()}
          {step === 'location' && renderLocation()}
          {step === 'booking' && renderBooking()}
          {step === 'confirmation' && renderConfirmation()}
        </div>
      </div>
    </div>
  );
};

export default BodyScanWorkflow;