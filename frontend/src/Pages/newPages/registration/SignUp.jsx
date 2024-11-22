import React, { useState, useEffect } from "react";
import { MdOutlineVisibility, MdOutlineVisibilityOff } from "react-icons/md";
import { CgDanger } from "react-icons/cg";
import { useNavigate } from "react-router-dom";
import { FaGoogle } from "react-icons/fa";
import axios from "axios";
import SpinnerLoader from "../../../components/loaders/SpinnerLoader";
import { useDispatch } from "react-redux";
import { setUser } from "../../../redux/slice/user/userSlice";
import { useGoogleLogin } from "@react-oauth/google";

import styles from "../../../Styles";
import { BsQuestionCircleFill } from "react-icons/bs";

import saveUserOnCookies from "../../../BackendProxy/cookiesProxy/saveUserCookies";
import OnHoverExtraHud from "../../../components/OnHoverExtraHud";
import enrollStudentByInstitution from "../../../BackendProxy/courseProxy/enrollStudentByInstituition";
const SignUp = ({ type = 'student' }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [invitationCode, setInvitationCode] = useState('')
  const [haveInvitationCode, setHaveInvitationCode] = useState(false)
  const [invitatioCodeErr, setInvitatioCodeErr] = useState(false);
  const [email, setEmail] = useState('');
  const [invalidEmail, setInvalidEmail] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [accountType, setAccountType] = useState(type);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [samePassword, setSamePassword] = useState(false);
  const [missingData, setMissingData] = useState(false);
  const [loading, setLoading] = useState(false);
  const [usernameTaken, setUsernameTaken] = useState(false);
  const [passwordVisibility, setPasswordVisibility] = useState(false);
  const [confirmPasswordVisibility, setConfirmPasswordVisibility] = useState(false);
  const [matchingInstitCode, setInstitCode] = useState('');
  const [invitationCodeMismatch, setInvitationCodeMismatch] = useState(false); 
  const [pendingStatus, setStatus] = useState(false);



  const navigateTo = () => {
    navigate('/registration');
  };

  const [emailExists, setEmailExists] = useState(null); // To track if email exists
  const [emailError, setEmailError] = useState('');

  // Function to check email existence
  const checkEmailExists = async (email) => {
    if (!email) {
      setEmailExists(null);
      setEmailError('');
      return;
    }
  
    try {
      const { data } = await axios.get(`${process.env.REACT_APP_API_URL}api/students/verify-email/${email}`);
      console.log(data);
      setEmailExists(data.success);
      console.log(emailExists);
      console.log(data.student.status);
      setInstitCode(data.student.institutionCode);
     
      if (data.student.status === "accepted") {
        setStatus(true);
        setEmailError('This email is already registered.');
      } else {
        setEmailError('');
      }
    } catch (error) {
      console.error('Error checking email existence:', error);
      setEmailExists(null);
      setEmailError('Unable to verify email. Please try again later.');
    }
  };


  const createAccount = async () => {
    if (loading) return;
    setLoading(true);
    setInvalidEmail(false); // Reset email error state
    setUsernameTaken(false); // Reset username error state
    setInvitatioCodeErr(false);
    setInvitationCodeMismatch(false);

    if (!validateFormData()) {
      setLoading(false);
      return;
    }

    if (haveInvitationCode) {
      if (!matchingInstitCode) {
        setInvitatioCodeErr(true); 
        setLoading(false);
        return;
      }
      if (invitationCode !== matchingInstitCode) {
        setInvitationCodeMismatch(true); 
        setLoading(false);
        return;
      }
    }

    try {
      const response = await axios.post(process.env.REACT_APP_API_URL + 'user/create-user', {
        firstName,
        lastName,
        email,
        accountType,
        code: invitationCode,
        linkedCode: haveInvitationCode,
        username,
        password,
      });

      if (response.data.success) {
        const savedUser = await saveUserOnCookies({ ...response.data.user })
        await dispatch(setUser(savedUser));

        
        //  if(response.data.user.accountType === 'student' ||  response.data.user.accountType === 'teacher')
        if (response.data.user.accountType === 'student') {
          console.log(response.data.user._id);
          const enrollResponse = await enrollStudentByInstitution(response.data.user._id);

          if (enrollResponse.success) {
            console.log('User successfully enrolled in institution courses');
          } else {
            console.error('Enrollment failed:', enrollResponse.data.message);
          }

          //Updating student status here
        const statusResponse = await axios.post(
          'http://localhost:5000/api/students/update-status',
           { email: email }
        );

        if (statusResponse.data.success) {
          console.log(`Status updated to 'accepted' for ${email}`, statusResponse.data);
        } else {
          console.error(`Failed to update status for ${email}:`, statusResponse.data.error);
        }

        }
        navigate('/');

      } else {
        // Handle errors related to email or username
        if (response.data.message === 'The email is already in use') {
          setInvalidEmail(true);
        } else if (response.data.message === 'The username is already taken') {
          setUsernameTaken(true);
        } else if (response.data.message === 'Institution not found') {
          setInvitatioCodeErr(true)
        }
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const googleSignUp = useGoogleLogin({
    onSuccess: async (credentialResponse) => {
      console.log(credentialResponse);

      // Get user info
      const userInfo = await axios.post(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${credentialResponse.access_token}`);
      console.log(userInfo);

      const user = {
        firstName: userInfo.data.given_name,
        lastName: userInfo.data.last_name || '',
        email: userInfo.data.email,
        password: credentialResponse.access_token,
        username: userInfo.data.email,
        accountType: 'student',
        googleAuth: 1,
        enrolledCourses: [],
        createdCourses: [],
        accomplishments: []
      };

      // Check if user exists in the db
      const response = await axios.post(process.env.REACT_APP_API_URL + 'user/google-login', {
        ...user
      });

      console.log(response);

      // Set loggedin cookie with access token and email
      if (response.data.success) {
        const saveOnCookies = await axios.post(process.env.REACT_APP_API_URL + 'cookies/save-user', {
          ...user
        }, {
          withCredentials: true, // Include cookies in the request
          headers: {
            'Content-Type': 'application/json',
          },
        });

        console.log(saveOnCookies);

        if (saveOnCookies.status === 200) {
          await dispatch(setUser(saveOnCookies.data.data));
          navigate('/');
        }
      }
    },
    onError: (credentialResponse) => {
      console.log(credentialResponse);
    }
  });

  const validateFormData = async () => {
    setMissingData(false);
    setInvalidEmail(false);
    setSamePassword(false);
    setEmailError('');

    if (!email || !username || !password || !confirmPassword) {
      setMissingData(true);
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setInvalidEmail(true);
      setEmailError('Please enter a valid email address.');
      return false;
    }

    try {
      // Wait for email check to complete
      await checkEmailExists(email);

      // After email check, check the result
      if (emailExists && pendingStatus ) {
        setInvalidEmail(true);
        setEmailError('This email is already registered.');
        return false;
      }
    } catch (error) {
      setEmailError('Unable to verify email. Please try again later.');
      return false;
    }

    if (password.length < 8) {
      return false;
    }

    if (password !== confirmPassword) {
      setSamePassword(true);
      return false;
    }

    return true;
  };

  useEffect(() => {
    if (!emailExists) {
      setHaveInvitationCode(false);
      setInvitationCode('');
    }
  }, [emailExists]);

  useEffect(() => {
    setSamePassword(false); // Reset samePassword state when password or confirmPassword changes
  }, [password, confirmPassword]);
  useEffect(() => {
    if (!haveInvitationCode) {
      setInvitationCode('')
    }
  }, [haveInvitationCode])
  return (
    <div className="space-y-3 w-[400px]  md:p-0 p-2">
      <div>
        <p className="text-start font-bold text-3xl">Create Account</p>
      </div>
      <div className="flex flex-col">
        <div>
          {missingData &&
            <div className="flex items-center justify-between text-red-400">
              <p>
                Please fill all the data
              </p>
              <CgDanger className="ml-1" />
            </div>
          }
        </div>
        <label htmlFor="firstName" className="font-bold cursor-pointer pl-2 pt-2">
          First Name
        </label>
        <input
          id="firstName"
          placeholder="First Name"
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className={`${styles.simple_text_input}`}
        />
        <label htmlFor="lastName" className="font-bold cursor-pointer pl-2 pt-2">
          Last Name
        </label>
        <input
          id="lastName"
          placeholder="Last Name"
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className={`${styles.simple_text_input}`}
        />
        <label htmlFor="email" className="font-bold cursor-pointer pl-2 pt-2 flex justify-between">
          <span>Email</span>
          <span>{invalidEmail && <CgDanger className="text-red-400" />}</span>
        </label>
        <input
          id="email"
          placeholder="Email"
          type="text"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            checkEmailExists(e.target.value); //checking email here
          }}
          className={`${styles.simple_text_input}`}
        />
        {emailError && <p className="text-red-500 text-sm">{emailError}</p>}
        {invalidEmail && <p className="text-red-500 text-sm">Please use your official student email</p>}
        {/* {invalidEmail && <p className="text-red-500 text-sm">Email already exists, please login  </p>} */}
        {/* {invalidEmail && <p className="text-red-500 text-sm">Invalid Email type, or Email already being used   </p>} */}
        <label htmlFor="username" className="font-bold cursor-pointer pl-2 pt-2">
          Username
        </label>
        <input
          id="username"
          placeholder="Username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className={`${styles.simple_text_input}`}
        />
        {usernameTaken && <p className="text-red-500 text-sm">Username is already taken, please try different username</p>}
        <label htmlFor="invcode" className="font-bold cursor-pointer pl-2 pt-2">
          Are you linked to an institution?
        </label>
        <div
          onClick={() => emailExists && setHaveInvitationCode(!haveInvitationCode)}
          className={`cursor-pointer ml-3 slider-cointainer h-[20px] w-[35px] relative rounded-full ${haveInvitationCode ? 'linearGradient_ver1' : 'bg-stone-300'
            } ${!emailExists ? 'cursor-not-allowed opacity-50' : ''}`}
        >
          <div
            className={`slider h-[25px] w-[25px] bg-white rounded-full border ${haveInvitationCode ? 'slider-on' : 'slider-off'
              } transition-all`}
          ></div>
        </div>
        {haveInvitationCode && emailExists && (
  <>
    <label htmlFor="invcode" className="font-bold cursor-pointer pl-2 pt-2">
      Institution Code
    </label>
    <div className={`w-full ${styles.simple_text_input} flex justify-between items-center`}>
      <input
        id="invcode"
        placeholder="#000000"
        value={invitationCode}
        onChange={(e) => setInvitationCode(e.target.value)}
        className={`focus:outline-none w-full`}
      />
      <div className="hover-parent">
        <OnHoverExtraHud name={'Invitation Code?'} />
        <BsQuestionCircleFill
          onClick={() => console.log('add a navigate to FAQ')}
          className="mx-1 text-black cursor-pointer"
        />
      </div>
    </div>
    {/* Display only one error based on priority */}
    {invitatioCodeErr && <p className="text-red-500 text-sm">Institution code not found</p>}
    {!invitatioCodeErr && invitationCodeMismatch && (
      <p className="text-red-500 text-sm">Institution code does not match</p>
    )}
  </>
)}



        {/* <label className="font-bold cursor-pointer pl-2 pt-2">
          Account Type
        </label>
        <div className="flex items-center">
          <input
            id="student"
            name="accountType"
            type="radio"
            value="student"
            checked={accountType === 'student'}
            onChange={(e) => setAccountType(e.target.value)}
            className="hidden"
          />
          <label htmlFor="student" className={`font-semibold text-sm px-3 py-2 rounded-full flex items-center justify-center transition-all border hover:bg-stone-50 cursor-pointer mr-4 ${accountType === 'student' ? 'text-white linearGradient_ver1' : 'text-gray-400 font-normal'}`}>
            Learner
          </label>
          <span className="mx-2 pr-4">or</span>
          <input
            id="instructor"
            name="accountType"
            type="radio"
            value="instructor"
            checked={accountType === 'instructor'}
            onChange={(e) => setAccountType(e.target.value)}
            className="hidden"
          />
          <label htmlFor="instructor" className={`font-semibold text-sm px-3 py-2 rounded-full flex items-center justify-center transition-all border hover:bg-stone-50 cursor-pointer ${accountType === 'instructor' ? 'text-white linearGradient_ver1' : 'text-gray-400 font-normal'}`}>
            Instructor
          </label>
        </div> */}
        <label htmlFor="password" className="font-bold cursor-pointer pl-2 pt-2">
          Password
        </label>
        <div className={`w-full ${styles.simple_text_input} flex justify-between items-center`}>
          <input
            id="password"
            placeholder="Password"
            value={password}
            type={passwordVisibility ? "text" : "password"}
            onChange={(e) => setPassword(e.target.value)}
            className={`focus:outline-none w-full`}
          />
          {passwordVisibility ? (
            <MdOutlineVisibility onClick={() => setPasswordVisibility(false)} className="mx-1 text-black cursor-pointer" />
          ) : (
            <MdOutlineVisibilityOff onClick={() => setPasswordVisibility(true)} className="mx-1 text-black cursor-pointer" />
          )}
        </div>
        {password.length > 0 && password.length < 8 && <p className="text-red-500 text-sm">Password must be at least 8 characters long</p>}
        <label htmlFor="confirm-password" className="font-bold cursor-pointer flex justify-between pl-2 pt-3">
          <span>Confirm Password</span>
          <span>{samePassword && <CgDanger className="text-red-400" />}</span>
        </label>
        <div className={`w-full ${styles.simple_text_input} flex justify-between items-center`}>
          <input
            id="confirm-password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            type={confirmPasswordVisibility ? "text" : "password"}
            className={`focus:outline-none w-full`}
          />
          {confirmPasswordVisibility ? (
            <MdOutlineVisibility onClick={() => setConfirmPasswordVisibility(false)} className="mx-1 text-black cursor-pointer" />
          ) : (
            <MdOutlineVisibilityOff onClick={() => setConfirmPasswordVisibility(true)} className="mx-1 text-black cursor-pointer" />
          )}
        </div>
        {samePassword && <p className="text-red-500 text-sm">Passwords don't match</p>}
        <p className="text-start font-light text-sm pt-2 pl-2">
          Already have an account? <span onClick={navigateTo} className="text-pink-600 cursor-pointer font-bold mt-1">Login</span>
        </p>
      </div>
      <button onClick={() => createAccount()} className="font-semibold text-white linearGradient_ver1 text-sm px-3 py-2 rounded-full w-full">
        {loading ? <SpinnerLoader /> : "Create account"}
      </button>
      <button className="font-semibold text-stone-600 text-sm px-3 py-2 rounded-full flex items-center justify-center transition-all w-full border hover:bg-stone-50">
        <FaGoogle className="text-xl mx-2" />
        Sign with Google
      </button>
    </div>
  );
};
export default SignUp;