import React, { useState } from 'react'
// import { Link } from 'react-router-dom'
import toast, { Toaster } from 'react-hot-toast';
import eye from '../assets/eye.png';
import hide from '../assets/hide.png';
import { useFormik } from 'formik';
import { resetPasswordValidation } from '../helper/validate'
import { resetPassword } from '../helper/helper'
import { useAuthStore } from '../store/store';
import { useNavigate} from 'react-router-dom';
// import useFetch from '../hooks/fetch.hook'

import styles from '../styles/Username.module.css';

const Eye = ({ visible, toggleVisibility }) => (
  <button type='button' onClick={toggleVisibility}
    style={{ left: '5px', position: 'relative', top: '3px' }}
  >
    {visible ? (
      <img src={hide} alt="Hide password" style={{ width: '20px', height: '20px' }} />
    ) : (
      <img src={eye} alt="Show password" style={{ width: '20px', height: '20px' }} />
    )}
  </button>
);

export default function Reset() {

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setPasswordVisible((prev) => !prev);
  };

  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordVisible((prev) => !prev);
  };

  const { username } = useAuthStore(state => state.auth);
  const navigate = useNavigate();
  // const [{ isLoading, apiData, status, serverError }] = useFetch('createResetSession')


  const formik = useFormik({
    initialValues: {
      password: '',
      confirm_pwd: ''
    },
    validate: resetPasswordValidation,
    validateOnBlur: false,
    validateOnChange: false,
    onSubmit: async values => {

      let resetPromise = resetPassword({ username, password: values.password })

      toast.promise(resetPromise, {
        loading: 'Updating...',
        success: <b>Reset Successfully...!</b>,
        error: <b>Could not Reset!</b>
      });

      resetPromise.then(function () { navigate('/password') })

    }
  })


  // if (isLoading) return <h1 className='text-2xl font-bold'>isLoading</h1>;
  // if (serverError) return <h1 className='text-xl text-red-500'>{serverError.message}</h1>
  // if (status && status !== 201) return <Navigate to={'/password'} replace={true}></Navigate>


  return (
    <div className="container mx-auto">

      <Toaster position='top-center' reverseOrder={false}></Toaster>

      <div className='flex justify-center items-center h-screen'>
        <div className={styles.glass}
          style={{ width: "50%" }}
        >

          <div className="title flex flex-col items-center">
            <h4 className='text-5xl font-bold'>Reset</h4>
            <span className='py-4 text-xl w-2/3 text-center text-gray-500'>
              Enter new password.
            </span>
          </div>

          <form className='py-20' onSubmit={formik.handleSubmit}>
            <div className="textbox flex flex-col items-center gap-6">
              <div className={styles.passwordContainer}>
                <input
                  {...formik.getFieldProps('password')}
                  type={passwordVisible ? 'text' : 'password'}
                  className={styles.textbox}
                  placeholder='New Password'
                />
                <Eye visible={passwordVisible} toggleVisibility={togglePasswordVisibility} />
              </div>

              <div className={styles.passwordContainer}>
                <input
                  {...formik.getFieldProps('confirm_pwd')}
                  type={confirmPasswordVisible ? 'text' : 'password'}
                  className={styles.textbox}
                  placeholder='Repeat Password'
                />
                <Eye visible={confirmPasswordVisible} toggleVisibility={toggleConfirmPasswordVisibility} />
              </div>

              <button className={styles.btn} type='submit'>
                Reset
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  )
}
