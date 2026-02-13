import React from 'react';

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  activeSection: string;
  setActiveSection: (section: string) => void;
  onSignOut: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  open,
  setOpen,
  activeSection,
  setActiveSection,
  onSignOut
}) => {
  const navigation = [
    { name: 'Home', id: 'home', icon: '🏠' },
    { name: 'Health Chat', id: 'chat', icon: '💬' },
    { name: 'Devices', id: 'devices', icon: '⌚' },
    { name: 'History', id: 'history', icon: '📋' },
    { name: 'Profile', id: 'profile', icon: '👤' },
  ];

  return (
    <>
      {open && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setOpen(false)}
        >
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75"></div>
        </div>
      )}

      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${open ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-brand-blue">Hodie Labs</h1>
            <button
              onClick={() => setOpen(false)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500"
            >
              ✕
            </button>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  setOpen(false);
                }}
                className={`
                  w-full flex items-center px-4 py-2 text-left rounded-lg transition-colors
                  ${activeSection === item.id
                    ? 'bg-brand-blue text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                {item.name}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-gray-200">
            <button
              onClick={onSignOut}
              className="w-full flex items-center px-4 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <span className="mr-3 text-lg">🚪</span>
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;