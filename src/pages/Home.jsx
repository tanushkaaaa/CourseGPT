// src/pages/Home.jsx
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import ContentArea from "../components/ContentArea";

export default function Home() {
  return (
    <div className="flex flex-col h-screen">
      {/* <Header /> */}
      <div className="flex flex-1">
        {/* <Sidebar /> */}
        <ContentArea />
      </div>
    </div>
  );
}
