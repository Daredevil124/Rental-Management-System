import { useEffect, useState } from 'react';
import { PackageSearch } from 'lucide-react';
import './SplashScreen.css';

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen = ({ onFinish }: SplashScreenProps) => {
  const [fade, setFade] = useState(false);

  useEffect(() => {
    // Start fade out after 1.5 seconds
    const fadeTimer = setTimeout(() => {
      setFade(true);
    }, 1500);

    // Unmount after 2 seconds
    const finishTimer = setTimeout(() => {
      onFinish();
    }, 2000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div className={`splash-screen ${fade ? 'fade-out' : ''}`}>
      <div className="splash-content">
        <PackageSearch size={80} className="splash-icon animate-bounce" />
        <h1 className="text-gradient font-outfit font-bold text-4xl mt-4 tracking-wider">
          RentOps
        </h1>
        <p className="splash-subtitle mt-2 text-gray-400">
          Smart Rental Management
        </p>
        <div className="loading-bar mt-8">
          <div className="loading-progress"></div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
