import React, { useState, useRef, useEffect } from "react";
import Modal from "components/Modal";


const TabList = ({ tabs, activeTab, setActiveTab, removeTab, removeAllTab}) => {
  const modalRef = useRef();  
  
  const [isHovered, setIsHovered] = useState(false);

  const boxStyle = {
    border: isHovered ? "1px solid red" : "", // hover 시 색상 변경
  };


  return (
    <div className="tabs">
      <Modal ref={modalRef} />

      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={`tab ${activeTab === tab.id ? 'active' : ''} overflow-hidden`}
          onClick={() => setActiveTab(tab.id)}
        >
          <span>{tab.title}</span>
          {tab.id === 'Home' && (
            <button
              className="close-btn rounded px-1 ms-3"
              onClick={(e) => {
                e.stopPropagation(); // 부모 탭 클릭 이벤트 차단
                
                if( tabs.length <= 1) return;
                
                modalRef.current.open({
                  title: "알림",
                  message: "전체 탭을 닫으시겠습니까??",
                  confirmText:"닫기",
                  confirmClass:"btn btn-primary",
                  onCancel: ()=>{
                    modalRef.current.close();
                  },
                  onConfirm: (res) => {
                    
                    removeAllTab();
                    modalRef.current.close();
                  }, 
                });
              }}
            >
              <i className="bi bi-arrow-clockwise"></i>
            </button>
          )}
          {tab.id !== 'Home' && (
            <button
              className="close-btn p-0"
              onClick={(e) => {
                e.stopPropagation(); // 부모 탭 클릭 이벤트 차단
                removeTab(tab.id);
              }}
            >
              <i className="bi bi-x-lg"></i>
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default TabList;
