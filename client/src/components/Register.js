import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import avatar from '../assets/profile.png';
import eye from '../assets/eye.png';
import hide from '../assets/hide.png';
import toast, { Toaster } from 'react-hot-toast';
import { useFormik } from 'formik';
import { registerValidation } from '../helper/validate'
import convertToBase64 from '../helper/convert';
import { registerUser } from '../helper/helper'

import styles from '../styles/Username.module.css';

const Eye = ({ visible, toggleVisibility }) => (
  <button type='button' onClick={toggleVisibility} style={{ right: '28px', position: 'relative', top: '3px' }}>
    {visible ? (
      <img src={hide} alt="Hide password" style={{ width: '20px', height: '20px' }} />
    ) : (
      <img src={eye} alt="Show password" style={{ width: '20px', height: '20px' }} />
    )}
  </button>
);

export default function Register() {


  const navigate = useNavigate()
  const [file, setFile] = useState()
  const [passwordVisible, setPasswordVisible] = useState(false);

  const removePhoto = () => {
    setFile(null);
  };


  const togglePasswordVisibility = () => {
    setPasswordVisible((prev) => !prev);
  };


  const formik = useFormik({
    initialValues: {
      email: '',
      username: '',
      password: ''
    },
    validate: registerValidation,
    validateOnBlur: false,
    validateOnChange: false,
    onSubmit: async values => {
      values = await Object.assign(values, { profile: file || '' })
      let registerPromise = registerUser(values)
      toast.promise(registerPromise, {
        loading: 'Creating...',
        success: <b>Register Successfully...!</b>,
        error: <b>Could not Register.</b>
      });

      registerPromise.then(function () { navigate('/') });
    }
  })

  const onUpload = async e => {
    const base64 = await convertToBase64(e.target.files[0]);
    setFile(base64);
  }

  return (
    <div className="container mx-auto">

      <Toaster position='top-center' reverseOrder={false}></Toaster>

      <div className='flex justify-center items-center h-screen'>
        <div className={styles.glass} style={{ height: '41.5rem', width: "45%", paddingTop: '1em' }}>

          <div className="title flex flex-col items-center">
            <h4 className='text-5xl font-bold'>Register</h4>
            <span className='py-4 text-xl w-2/3 text-center text-gray-500'>
              Happy to join you!
            </span>
          </div>

          <form className='py-1' onSubmit={formik.handleSubmit}>
            <div className='profile flex justify-center py-4'>
              <label htmlFor="profile">
                <img
                  src={file || avatar}
                  className={styles.profile_img}
                  alt="avatar"

                />

              </label>

              <input
                onChange={onUpload}
                type="file"
                id='profile'
                name='profile'
              />

              {file && (
                <button onClick={removePhoto} className={styles.removePhotoButton}>
                  Remove Photo
                </button>
              )}
            </div>

            <div className="textbox flex flex-col items-center gap-6">
              <div className={styles.divContainer}>
                <input {...formik.getFieldProps('email')} className={styles.textbox} type="text" placeholder='Email*' />
              </div>
              <div className={styles.divContainer}>
                <input {...formik.getFieldProps('username')} className={styles.textbox} type="text" placeholder='Username*' />
              </div>
              <div>
                <input
                  {...formik.getFieldProps('password')}
                  type={passwordVisible ? 'text' : 'password'}
                  className={styles.textbox}
                  placeholder="Password*"
                />
                <Eye visible={passwordVisible} toggleVisibility={togglePasswordVisibility} />
              </div>
              <button className={styles.btn} type='submit'>Register</button>
            </div>

            <div className="text-center py-4">
              <span className='text-gray-500'>Already Register? <Link className='text-red-500' to="/">Login Now</Link></span>
            </div>

          </form>

        </div>
      </div>
    </div>
  )
}
