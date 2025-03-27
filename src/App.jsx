import { useEffect, useRef, useState } from "react";
import ChatbotIcon from "./components/ChatbotIcon";
import ChatForm from "./components/ChatForm";
import ChatMessage from "./components/ChatMessage";




const App = () => {

  const [chatHistory,setChatHistory] = useState([]);
  const [showChatbot,setshowChatbot] = useState(false);
  const chatBodyRef = useRef();

   const generateBotResponse= async (history)=> {
    //helper function to update chat history
    const updateHistory = (text) =>{
      setChatHistory(prev=> [...prev.filter(msg=> msg.text !== "Thinking..."), {role:"model", text}]);
    }



    //format chat history for API requests
    history = history.map(({role, text}) => ({role, parts:[{text}]}));

    const requestOptions={
    method:"POST",
    headers:{"Content-Type": "application/json"},
    body: JSON.stringify({contents: history})
   }
   
   try{
    //make the api call to get the bots response
    const response = await fetch(import.meta.env.VITE_API_URL, requestOptions);
    const data = await response.json();
    if(!response.ok) throw new Error(data.error.message || "Something went wrong!");

    //clean and update chat history with bots response
    const apiResponseText = data.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, "$1").trim();
    updateHistory(apiResponseText);
   }

   catch (error){
    console.log(error);
   }
  };

  //autoscroll whenever chat history updates
  useEffect(()=>{
    chatBodyRef.current.scrollTo({top: chatBodyRef.current.scrollHeight, behavior:"smooth"});
  },[chatHistory]);

  return (
    <div className={`container ${showChatbot ? 'show-chatbot' : ""}`}>
      <button onClick={()=> setshowChatbot(prev => !prev)} id="chatbot-toggler">
        <span className="material-symbols-outlined">
        mode_comment</span>
        <span className="material-symbols-outlined">
        close</span>
      </button>

      <div className="chatbot-popup">
        {/* Chatbot Header */}
        <div className="chat-header">
          <div className="header-info">
          <ChatbotIcon/>
          <h3 className="logo-text">Chatbot</h3>
          </div>
          <button  onClick={()=> setshowChatbot(prev => !prev)} className="material-symbols-outlined">
            keyboard_arrow_down</button>
        </div>

        {/* Chatbot Body */}
        <div ref={chatBodyRef} className="chat-body">
          <div className="message bot-message">
            <ChatbotIcon/>
            <p className="message-text">
              Hey there 👋 <br/>How can I help you today?
            </p>
          </div>

          {/* Render chat history dynamically*/}
          {chatHistory.map((chat, index) =>(
            <ChatMessage key={index} chat={chat}/>
          ))}
          
        </div>


        {/*Chatbot Footer*/}
        <div className="chat-footer">
          <ChatForm chatHistory={chatHistory} setChatHistory={setChatHistory} generateBotResponse={generateBotResponse}/>
        </div>

      </div>
    </div>
  )
}

export default App
