import SideBar from "./Bars/SideBar";
import NavBar from "./Bars/NavBar";
import ScrollableContainer from "./emails/ScrollableContainer";
function Sent({ API_KEY, emailAddress, name }) {
   return (
      <div>
         <NavBar name={name}/>
         <div className="scrollable_flex">
         <SideBar/>
         <ScrollableContainer API_KEY={API_KEY} Address={emailAddress} type={"sent"}/>
       </div>
      </div>
     );
  }
  
  export default Sent;