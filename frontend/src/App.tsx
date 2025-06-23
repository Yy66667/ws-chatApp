import { useEffect, useRef, useState } from 'react';
import './App.css'; // Ensure this includes Tailwind base/components/utilities

console.log("started")
console.log(import.meta.env.VITE_wsURL)


function App() {
  const [messages, setMessages] = useState<
    { type: string; payload: { message: string }; ip: string }[]
  >([]);
  const [roomId, setRoomId] = useState<string | boolean>(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const roomRef = useRef<HTMLInputElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

   useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

 
  function JoinRoom(){
     
                  wsRef.current?.send(
                    JSON.stringify({
                      type: 'join',
                      payload: {
                        room: roomRef.current?.value,
                      },
                      ip: localStorage.getItem('ip'),
                    })
                  )
                console.log("joined successfully")
                }
  

  useEffect(() => {
     fetch('https://api.ipify.org?format=json')
          .then((res) => res.json())
          .then((data) => localStorage.setItem('ip', data.ip));
  },[]);
  
  useEffect(() => {
    const ws = new WebSocket(import.meta.env.VITE_wsURL||"");
    wsRef.current = ws;
    ws.onmessage = (event) => {
      console.log(event.data)
      setMessages((prev) => [...prev, JSON.parse(event.data)]);
    };
    return () => ws.close();
  },[]);

  function sendMessage (e: React.FormEvent<HTMLFormElement>){
    e.preventDefault();
              const message = inputRef.current?.value || '';
              if(!message.trim())return;

              wsRef.current?.send(
                JSON.stringify({
                  type: 'chat',
                  payload: { message },
                  ip: localStorage.getItem('ip'),
                })
              );

              inputRef.current!.value = '';
            }


  return (
    <div className='bg-[#0a0a0a] h-screen flex items-center justify-center'>
     <div id='mainDiv' className='border-2 h-160 border-[#242424] py-4 px-5 text-white rounded-xl w-160'>
            <div id='platform_top_div'>
              <div className='flex gap-2  items-center text-[#dddddd]'>
               <svg className='h-8' viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M20.9996 11.5C20.9996 16.1944 17.194 20 12.4996 20C11.4228 20 10.3928 19.7998 9.44478 19.4345C9.27145 19.3678 9.18478 19.3344 9.11586 19.3185C9.04807 19.3029 8.999 19.2963 8.92949 19.2937C8.85881 19.291 8.78127 19.299 8.62619 19.315L3.50517 19.8444C3.01692 19.8948 2.7728 19.9201 2.6288 19.8322C2.50337 19.7557 2.41794 19.6279 2.3952 19.4828C2.36909 19.3161 2.48575 19.1002 2.71906 18.6684L4.35472 15.6408C4.48942 15.3915 4.55677 15.2668 4.58728 15.1469C4.6174 15.0286 4.62469 14.9432 4.61505 14.8214C4.60529 14.6981 4.55119 14.5376 4.443 14.2166C4.15547 13.3636 3.99962 12.45 3.99962 11.5C3.99962 6.80558 7.8052 3 12.4996 3C17.194 3 20.9996 6.80558 20.9996 11.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
                <h1 className='text-3xl font-spMono'>Real Time Chat</h1>
              </div>
              <div>
                <p className='font-msono text-xs  text-zinc-500'>
                  temporary room that expires after all users exit
                </p>
              </div>
            </div>

            <div className='flex  bg-[#202020] rounded-xl px-5 py-3 my-4  text-zinc-500' id='Users-&-roomid'>
              <div  className='flex  items-center justify-start '>
                <span className='font-spMono font-bold'>Room Code: </span>
                {roomId?<span className='font-press text-2xl text-center uppercase tracking-[5px] ml-4 font-extrabold rounded-md ' onClick={()=>setRoomId(false)}>{roomId}</span>:<>
                <input
                  ref={roomRef}
                  type="text"
                  className="font-press focus:outline-none text-2xl text-center uppercase tracking-[5px] mr-4 px-3 w-44 font-extrabold rounded-md"
                  placeholder="_____"
               /> 
               <button className='py-1 m-0 px-3  bg-white text-black rounded-md cursor-pointer' onClick={async ()=>{
                  if(!roomRef.current?.value)return;
                  JoinRoom();
                  setRoomId(roomRef.current?.value);
                  }

               }>join</button>
               </>}
              </div>
              
            </div>

            <div className='overflow-y-auto h-108' ref={scrollRef} id='messages'>
             
              {messages.map((m, i) => (
              <div key={i}  className={` flex text-wrap 50 mb-4 max-h-64 ${m.ip==localStorage.getItem('ip')?"justify-end":"justify-start"}`}>
              <span className={` break-words max-w-40 p-4 rounded-md  ${m.ip==localStorage.getItem('ip')?"bg-white text-black":"bg-[#252525] text-white"} `}>
              {m.payload.message}
              </span>
       
              </div>
          ))}

            </div>

          <form onSubmit={sendMessage} id='send-text' className="abos flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            className="flex-1 focus:outline-none p-2 rounded-md text-white border-1 border-zinc-700"
            placeholder="Type a message..."
            
          />
         
          <button 
            className="bg-slate-50 text-black px-4 py-2 rounded-md transition"
            type='submit'
          >
            Send
          </button>
        </form>

    </div>

    </div>
   
  );
}

export default App;
