import React, { useEffect, useState, useRef } from 'react';
import './Main.css';
import io from "socket.io-client";
import Peer from "simple-peer";
import styled from "styled-components";
import vid from "./KnockEffect.mp4"
import endCall from './images/end-call.svg'
import img from './images/Knock.png'
import audio from './KnockSound.mp3'
import { faLessThan } from '@fortawesome/free-solid-svg-icons';

const Container = styled.div`
  ${'' /* height: 100vh;
  width: 100%; */}
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: fixed;
`;

const Row = styled.div`
  ${'' /* display: flex; */}
`;

const Video = styled.video`
  ${'' /* border: 1px solid blue; */}
  width: 400px;
  height: auto;
  border-radius: 10px;
`;

function Main({setUser, user, username, mouseEnter, mouseLeave, userInfo}) {
    const [yourID, setYourID] = useState("");
    const [yourName, setYourName] = useState("");
    const [allusers, setAllusers] = useState([]);
    const [stream, setStream] = useState();
    const [receivingCall, setReceivingCall] = useState(false);
    const [caller, setCaller] = useState("");
    const [receiver, setReceiver] = useState("");
    const [callerSignal, setCallerSignal] = useState();
    const [callAccepted, setCallAccepted] = useState(false);
    const [calling, setCalling] = useState(false)
    const [callEnded, setCallEnded] = useState (false)
    const [callRejected, setCallRejected] = useState(false)
    const [active, setActive] = useState (true)
    const [knock, setKnock] = useState (false)
    const [peerID, setPeerID] = useState (true)
    const [userid, setUserid] = useState('')
    const [incoming, setIncoming] = useState(false)

  
    const userVideo = useRef();
    const partnerVideo = useRef();
    const socket = useRef();
    const peerRef = useRef();
    const prevPeerID = useRef();

    useEffect(() => {
      if(incoming) {
      setTimeout(() => {
        rejectCall()
      }, 5000);   
    }
    }, [incoming]);


    useEffect(() => {
      setTimeout(function () {
        setCallRejected(false);
      }, 2000);
    }, [callRejected]);


    useEffect(() => {
      setTimeout(function () {
        setKnock(false);
      }, 2000);
    }, [knock]);
    
    useEffect(() => {
        socket.current = io.connect('http://localhost:8000/');
        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
          setStream(stream);
          if (userVideo.current) {
            userVideo.current.srcObject = stream;
          }
        })
    
        socket.current.emit('newUser', userInfo.name, userInfo.id);
      
        socket.current.on("onlineUsers", onlineUsers => {
          setAllusers(onlineUsers);
          
        })

        socket.current.on("remainingUsers", onlineUsers => {
          setAllusers(onlineUsers);
        })
      

        socket.current.on("yourID", (id) => {
          setYourID(id);
          })
 
    
        socket.current.on("hey", (data) => {
          setIncoming(true)
          setReceivingCall(true);
          setKnock(true)
          setCaller(data.from);
          setCallerSignal(data.signal);
          setYourName(data.name)
        })

        socket.current.on('callEnded', () => {
          setCallAccepted(false);
          setActive(true);
          setPeerID(true)
          peerRef.current.destroy()
    
        })
        
        
      },[peerID]);

        function callPeer (id, lucky) {
            
          const peer = new Peer({
            initiator: true,
            trickle: false,
            stream: stream,
            channelName: lucky
          });

          peer.on("signal", data => {
            socket.current.emit("callUser", { userToCall: id, signalData: data, from: yourID, name: user })
          })

          peer.on("stream", stream => {
            if (partnerVideo.current) {
              partnerVideo.current.srcObject = stream;
            }
            });

          socket.current.on("callAccepted", signal => {
            setCallAccepted(true);
            setCalling(false)
            peer.signal(signal);
            })

          socket.current.on('rejected', () => {
            setCalling(false);
            setCallRejected(true);
            setTimeout(function () {
              setActive(true);
            }, 2000);
            })
          
          peerRef.current= peer
        }
 
  
    function acceptCall() {
        setCallAccepted(true);
        setCalling(false);
        setReceivingCall(false)
        const peer = new Peer({
          initiator: false,
          trickle: false,
          stream: stream,
        });
        peer.on("signal", data => {
          socket.current.emit("acceptCall", { signal: data, to: caller })
        })
    
        peer.on("stream", stream => {
          partnerVideo.current.srcObject = stream;
        });
    
        peer.signal(callerSignal);

        peerRef.current= peer
      
    }

    function leaveCall() {      
      setCallAccepted(false);
      setCallEnded (true);
      setPeerID(true)
      setActive(true)
      socket.current.emit("endCall")
      peerRef.current.destroy()
    }

    function rejectCall() {
      setActive(true);
      setReceiver(true)
      setReceivingCall(false)
      setIncoming(false)
      socket.current.emit("rejectCall")
    }

    let UserVideo;
    if (stream && !calling) {
      UserVideo = (
        <Video playsInline muted ref={userVideo} autoPlay />
      );
    }

  
    let PartnerVideo;
    if (callAccepted) {
      PartnerVideo = (
        <Video playsInline ref={partnerVideo} autoPlay />
      );
    }
  
    let incomingCall;
    if (receivingCall && !callAccepted && !knock) {
      incomingCall = (
        <div className='incoming-call-wrapper'> 
        <div className='incoming-call'>
          <h2>{yourName}</h2>
          <button className='btn-answer btn' 
              onClick={() =>{
                acceptCall();
                setActive(false)
                }}>
          </button>
          <button className='btn-ignore btn'
                // onMouseEnter={mouseEnter}
                // onMouseLeave={mouseLeave}
              onClick={() =>{
                rejectCall();
                setActive(true);
                setReceiver(true)
                }}></button>
        </div>
        </div>
      )
    }

    return (

      <div className='main-div'>
      
      <Container className='main-container'>

        {calling? (<div className='calling'>wait for an answer..</div> ): 
        ( <Row className='video'>
          {/* {UserVideo} */}
          {PartnerVideo}
        </Row>)
        }

        {callRejected && !receiver? (<div className='call-rejected'>Busy</div>): null}

        {receivingCall? (
        <Row className='incoming'>
          
          <div className='knock-wrapper'>

          {knock ? (
            <div>
            <img className='test' src={img}  />
                      <audio  
                      autoPlay
                      > <source src= {audio}/> 
                      </audio>
            </div>
                    ) 
          : null}

          </div>

          <div>
          {incomingCall}
          </div>
          
        </Row>) : null
        }

        <Row>
          {callAccepted? (<button className='btn-end' onClick = {leaveCall}
          // onMouseEnter={mouseEnter}
          // onMouseLeave={mouseLeave}
          ></button>): null }
        </Row>
      </Container>


      {!receivingCall? (
          <Row className='btn-row'>
          
          {allusers.map(key => {
            if (key.userID === userInfo.id) 
            {
              return null
            }

            return (
              
              <button key={key.socketId} className={active? 'knock-btn-active' : 'knock-btn'}
                // onMouseEnter={mouseEnter}
                // onMouseLeave={mouseLeave}
                onClick={() => {
                setPeerID(false)
                callPeer(key.socketId)
                setUser(username)
                setCalling(true);
                setActive(false);
                setReceiver(false)
                }
                }
              >
              {key.username}
              </button>
           
            );
          })}
          
          </Row>
      ):null}

        </div>
    );
  }
  
  export default Main;