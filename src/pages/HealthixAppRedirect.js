import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ANDROID_URL = 'https://play.google.com/store/apps/details?id=com.healthnwealth.app';
const IOS_URL = 'https://apps.apple.com/us/app/healthix/id6757195357';

const getDeviceType = () => {
  const ua = navigator.userAgent || navigator.vendor || window.opera || '';
  if (/android/i.test(ua)) return 'android';
  if (/iPad|iPhone|iPod/.test(ua) && !window.MSStream) return 'ios';
  return 'other';
};

const HealthixAppRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const device = getDeviceType();
    if (device === 'android') {
      window.location.href = ANDROID_URL;
    } else if (device === 'ios') {
      window.location.href = IOS_URL;
    } else {
      navigate('/healthix', { replace: true });
    }
  }, [navigate]);

  return null;
};

export default HealthixAppRedirect;
