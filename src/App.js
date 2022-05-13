import React from 'react';
import {useState, useEffect, useRef} from 'react'
import Main from './Main'
import './App.css';
import { v4 as uuidv4} from 'uuid'
// const {ipcRenderer} = window.require('electron');



function App() {
  const [username, setUsername] = useState('')
  const [user, setUser] = useState('')
  const [userid, setUserid] = useState()
  
  const formRef = useRef();

  const handleSubmit = (e) => {
    e.preventDefault();
    setUserid(uuidv4());
    setUser(username)
    console.log(userInfo.id)
  };
  // function mouseEnter() {
  //   ipcRenderer.send('enter')
  // }
  
  // function mouseLeave() {
  //   ipcRenderer.send('leave')
  // }
  
  const userInfo = {
    name: username,
    id: userid
  }


  return (
   
    <div className='container'>

        {!user? (<div className='login'
        // onMouseEnter={mouseEnter}
        // onMouseLeave={mouseLeave}
        
        >
        <form onSubmit={handleSubmit}>
            <input 
                className='input'
                type="text" 
                placeholder='username' 
                onChange={(e) => {
                setUsername(e.target.value) 
                }}
            />
            <button 
                className='btn-login' 
                type="submit"
                >Login
            </button>
        </form>

        </div>  ) : 
        <Main 
          // mouseEnter={mouseEnter}
          // mouseLeave={mouseLeave}
          user={user}
          setUser={setUser}
          username={username}
          userInfo={userInfo}
          />
        }

        
  
    </div>

  
  );
}

export default App;





