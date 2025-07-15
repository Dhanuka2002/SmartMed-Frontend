import React from 'react';

function Login() {
  return (
    <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>
      <form style={{border: '1px solid #ccc', padding: '20px', borderRadius: '8px', width: '300px'}}>
        <h2>Login</h2>
        <input type="email" placeholder="Email" style={{width: '100%', marginBottom: '10px'}} />
        <input type="password" placeholder="Password" style={{width: '100%', marginBottom: '10px'}} />
        <button style={{width: '100%'}}>Login</button>
      </form>
    </div>
  );
}

export default Login;
