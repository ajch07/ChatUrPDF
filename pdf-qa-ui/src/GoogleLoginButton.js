import { GoogleLogin } from '@react-oauth/google';

function GoogleLoginButton({ onSuccess }) {
  return (
    <GoogleLogin
      onSuccess={credentialResponse => {
        // Send credentialResponse.credential (JWT) to your backend
        onSuccess(credentialResponse.credential);
      }}
      onError={() => {
        alert('Login Failed');
      }}
    />
  );
}

export default GoogleLoginButton;