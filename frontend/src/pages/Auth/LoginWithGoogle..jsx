import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { getUser } from '@/Redux/Auth/Action';

const LoginWithGoogle = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getUser()).then(() => navigate('/'));
  }, []);

  return (
    <div className='flex h-screen justify-center items-center'>
      <p>Completing Google login…</p>
    </div>
  );
};

export default LoginWithGoogle;
